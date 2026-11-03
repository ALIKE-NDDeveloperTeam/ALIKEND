import DeliveryTask, { IDeliveryTask } from "../models/DeliveryTask";
import DeliveryPartner, { IDeliveryPartner } from "../models/DeliveryPartner";
import { isMongoConnected, memoryStore } from "../store";

/**
 * Haversine formula to calculate approximate distance in KM
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Gets all eligible online delivery partners
 */
export async function getEligiblePartners(
  task?: Partial<IDeliveryTask>
): Promise<any[]> {
  let partners: any[] = [];

  if (isMongoConnected()) {
    try {
      partners = await DeliveryPartner.find({
        isOnline: true,
        isOnBreak: false,
        verificationStatus: "approved",
      }).lean();
    } catch (e) {
      console.warn("MongoDB eligible partners lookup fallback:", e);
    }
  }

  if (!partners || partners.length === 0) {
    partners = (memoryStore.deliveryPartners || []).filter(
      (p: any) =>
        p.isOnline === true &&
        !p.isOnBreak &&
        (p.verificationStatus === "approved" || p.status === "active")
    );
  }

  // Filter out partners already carrying active order (unless multi-order capable)
  const availablePartners = partners.filter((p: any) => !p.activeTaskId);

  // If task has vehicle requirements (e.g. bulk wholesale requires van/three_wheeler)
  if (task?.packageDetails?.requiresVan) {
    const vanPartners = availablePartners.filter((p: any) =>
      ["van", "three_wheeler", "truck"].includes(p.vehicle?.type)
    );
    if (vanPartners.length > 0) return vanPartners;
  }

  return availablePartners;
}

/**
 * Automatically assigns a delivery order to the optimal available delivery partner
 */
export async function autoAssignOrder(
  taskId: string
): Promise<{ success: boolean; message: string; partner?: any; task?: any }> {
  // 1. Fetch Task
  let task: any = null;
  if (isMongoConnected()) {
    try {
      task = await DeliveryTask.findOne({ taskId });
    } catch (e) {
      console.warn("Mongo task lookup in autoAssignOrder:", e);
    }
  }
  if (!task) {
    task = memoryStore.deliveryTasks.find((t: any) => t.taskId === taskId);
  }

  if (!task) {
    return { success: false, message: `Task ${taskId} not found.` };
  }

  // 2. Fetch Eligible Online Partners
  const eligiblePartners = await getEligiblePartners(task);
  if (eligiblePartners.length === 0) {
    return {
      success: false,
      message:
        "No online delivery partners currently available in this service area. Order remains queued.",
      task,
    };
  }

  // Filter out partners who previously rejected this task
  const rejectedPartnerIds = new Set(
    (task.rejectionHistory || []).map((r: any) => r.partnerId)
  );
  const candidatePartners = eligiblePartners.filter(
    (p: any) => !rejectedPartnerIds.has(p.partnerId)
  );

  const pool = candidatePartners.length > 0 ? candidatePartners : eligiblePartners;

  // Store coordinates (Saket, New Delhi as benchmark default)
  const storeLat = 28.5244;
  const storeLng = 77.2167;

  // Rank partners by distance from store and rating
  pool.sort((a, b) => {
    const distA = calculateDistanceKm(
      storeLat,
      storeLng,
      a.currentLocation?.lat || storeLat,
      a.currentLocation?.lng || storeLng
    );
    const distB = calculateDistanceKm(
      storeLat,
      storeLng,
      b.currentLocation?.lat || storeLat,
      b.currentLocation?.lng || storeLng
    );
    // Lower distance first, then higher rating
    if (Math.abs(distA - distB) > 1) {
      return distA - distB;
    }
    return (b.rating || 4.5) - (a.rating || 4.5);
  });

  const selectedPartner = pool[0];

  // 3. Assign task to selected partner
  task.status = "partner_assigned";
  task.deliveryPartner = {
    partnerId: selectedPartner.partnerId,
    name: selectedPartner.name,
    phone: selectedPartner.phone,
    avatar: selectedPartner.avatar,
    vehicleType: selectedPartner.vehicle?.type || "scooter",
    vehicleNumber: selectedPartner.vehicle?.registrationNumber,
    rating: selectedPartner.rating || 4.9,
    completedDeliveries: selectedPartner.totalDeliveries || 0,
    currentLocation: selectedPartner.currentLocation,
  };

  if (!task.timeline) task.timeline = [];
  task.timeline.push({
    status: "partner_assigned",
    timestamp: new Date(),
    description: `Auto-assigned to partner ${selectedPartner.name} (${selectedPartner.vehicle?.type || "scooter"}) based on proximity & availability.`,
  });

  if (isMongoConnected() && task.save) {
    await task.save();
  }

  // Update in memory store
  const memIdx = memoryStore.deliveryTasks.findIndex(
    (t: any) => t.taskId === taskId
  );
  if (memIdx !== -1) {
    memoryStore.deliveryTasks[memIdx] = task;
  }

  // Mark partner active task
  selectedPartner.activeTaskId = taskId;
  if (isMongoConnected()) {
    try {
      await DeliveryPartner.updateOne(
        { partnerId: selectedPartner.partnerId },
        { activeTaskId: taskId, updatedAt: new Date() }
      );
    } catch (e) {
      console.warn("Mongo partner update error in autoAssignOrder:", e);
    }
  }

  const memPartner = (memoryStore.deliveryPartners || []).find(
    (p: any) => p.partnerId === selectedPartner.partnerId
  );
  if (memPartner) {
    memPartner.activeTaskId = taskId;
  }

  return {
    success: true,
    message: `Order assigned to ${selectedPartner.name}. Estimated pickup in 8-12 mins.`,
    partner: selectedPartner,
    task,
  };
}

/**
 * Manually assigns an order to a specified partner by Admin
 */
export async function manualAssignOrder(
  taskId: string,
  partnerId: string,
  adminUser = "Admin"
): Promise<{ success: boolean; message: string; partner?: any; task?: any }> {
  // 1. Find Task
  let task: any = null;
  if (isMongoConnected()) {
    try {
      task = await DeliveryTask.findOne({ taskId });
    } catch (e) {
      console.warn("Mongo task lookup in manualAssignOrder:", e);
    }
  }
  if (!task) {
    task = memoryStore.deliveryTasks.find((t: any) => t.taskId === taskId);
  }
  if (!task) {
    return { success: false, message: `Task ${taskId} not found.` };
  }

  // 2. Find Partner
  let partner: any = null;
  if (isMongoConnected()) {
    try {
      partner = await DeliveryPartner.findOne({ partnerId });
    } catch (e) {
      console.warn("Mongo partner lookup in manualAssignOrder:", e);
    }
  }
  if (!partner) {
    partner = (memoryStore.deliveryPartners || []).find(
      (p: any) => p.partnerId === partnerId
    );
  }
  if (!partner) {
    return { success: false, message: `Partner ${partnerId} not found.` };
  }

  // 3. Assign
  task.status = "partner_assigned";
  task.deliveryPartner = {
    partnerId: partner.partnerId,
    name: partner.name,
    phone: partner.phone,
    avatar: partner.avatar,
    vehicleType: partner.vehicle?.type || "scooter",
    vehicleNumber: partner.vehicle?.registrationNumber,
    rating: partner.rating || 4.9,
    completedDeliveries: partner.totalDeliveries || 0,
    currentLocation: partner.currentLocation,
  };

  if (!task.timeline) task.timeline = [];
  task.timeline.push({
    status: "partner_assigned",
    timestamp: new Date(),
    description: `Manual assignment by ${adminUser}: Assigned to partner ${partner.name}.`,
  });

  if (isMongoConnected() && task.save) {
    await task.save();
  }

  // Update in memory store
  const memIdx = memoryStore.deliveryTasks.findIndex(
    (t: any) => t.taskId === taskId
  );
  if (memIdx !== -1) {
    memoryStore.deliveryTasks[memIdx] = task;
  }

  partner.activeTaskId = taskId;
  if (isMongoConnected()) {
    try {
      await DeliveryPartner.updateOne(
        { partnerId },
        { activeTaskId: taskId, updatedAt: new Date() }
      );
    } catch (e) {
      console.warn("Mongo partner update in manualAssignOrder:", e);
    }
  }

  const memPartner = (memoryStore.deliveryPartners || []).find(
    (p: any) => p.partnerId === partnerId
  );
  if (memPartner) {
    memPartner.activeTaskId = taskId;
  }

  return {
    success: true,
    message: `Order manually assigned to ${partner.name}.`,
    partner,
    task,
  };
}

/**
 * Reassigns order when a delivery partner rejects or times out
 */
export async function reassignOrder(
  taskId: string,
  rejectedPartnerId: string,
  reason = "Partner rejected / timed out"
): Promise<{ success: boolean; message: string; partner?: any; task?: any }> {
  let task: any = null;
  if (isMongoConnected()) {
    try {
      task = await DeliveryTask.findOne({ taskId });
    } catch (e) {
      console.warn("Mongo task lookup in reassignOrder:", e);
    }
  }
  if (!task) {
    task = memoryStore.deliveryTasks.find((t: any) => t.taskId === taskId);
  }
  if (!task) {
    return { success: false, message: `Task ${taskId} not found.` };
  }

  if (!task.rejectionHistory) task.rejectionHistory = [];
  task.rejectionHistory.push({
    partnerId: rejectedPartnerId,
    rejectedAt: new Date(),
    reason,
  });
  task.reassignmentCount = (task.reassignmentCount || 0) + 1;

  // Clear previous partner's active task
  if (isMongoConnected()) {
    try {
      await DeliveryPartner.updateOne(
        { partnerId: rejectedPartnerId },
        { $unset: { activeTaskId: 1 }, updatedAt: new Date() }
      );
    } catch (e) {
      console.warn("Clear activeTaskId error:", e);
    }
  }
  const memPrevPartner = (memoryStore.deliveryPartners || []).find(
    (p: any) => p.partnerId === rejectedPartnerId
  );
  if (memPrevPartner) {
    delete memPrevPartner.activeTaskId;
  }

  // Trigger auto-assign to next best partner
  return await autoAssignOrder(taskId);
}
