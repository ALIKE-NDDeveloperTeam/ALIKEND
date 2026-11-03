import Order, { IOrder } from "../models/Order";
import { isMongoConnected, memoryStore } from "../store";
import { creditSellerWalletsForOrder } from "./sellerWallet";

export const AUTOMATION_INTERVALS = {
  // Interval from Approved/Processing to Shipped: 30 Minutes
  APPROVED_TO_SHIPPED_MINUTES: 30,
  // Interval from Shipped to Delivered: 60 Minutes (1 Hour)
  SHIPPED_TO_DELIVERED_MINUTES: 60,
};

// Throttle in-memory DB scans to at most once every 60 seconds (Problem #8)
let lastProgressionTimestamp = 0;

/**
 * Automatically progresses order statuses based on timeline milestones
 * unless an administrator has manually overridden the order status.
 */
export async function progressOrderStatuses(force: boolean = false): Promise<{ updatedCount: number }> {
  const now = Date.now();
  if (!force && now - lastProgressionTimestamp < 60000) {
    return { updatedCount: 0 };
  }
  lastProgressionTimestamp = now;

  let updatedCount = 0;
  const approvedToShippedMs = AUTOMATION_INTERVALS.APPROVED_TO_SHIPPED_MINUTES * 60 * 1000;
  const shippedToDeliveredMs = AUTOMATION_INTERVALS.SHIPPED_TO_DELIVERED_MINUTES * 60 * 1000;

  // 1. Process MongoDB orders if connected
  if (isMongoConnected()) {
    try {
      const activeOrders = await Order.find({
        status: { $in: ["pending", "processing", "shipped"] },
        manualOverride: { $ne: true },
      });

      for (const order of activeOrders) {
        let changed = false;
        const createdAtTime = order.createdAt ? new Date(order.createdAt).getTime() : now;
        const approvedAtTime = order.approvedAt ? new Date(order.approvedAt).getTime() : createdAtTime;
        const shippedAtTime = order.shippedAt ? new Date(order.shippedAt).getTime() : null;

        // Stage 1: Pending -> Approved / Processing
        if (order.status === "pending") {
          order.status = "processing";
          order.trackingStep = 2;
          order.approvedAt = order.approvedAt || new Date(createdAtTime);
          changed = true;
        }

        // Stage 2: Processing -> Shipped (after 30 mins)
        if (order.status === "processing") {
          const effectiveApprovedTime = order.approvedAt ? new Date(order.approvedAt).getTime() : approvedAtTime;
          if (now - effectiveApprovedTime >= approvedToShippedMs) {
            order.status = "shipped";
            order.trackingStep = 3;
            order.shippedAt = new Date(effectiveApprovedTime + approvedToShippedMs);
            changed = true;
          }
        }

        // Stage 3: Shipped -> Delivered (after 60 mins from shipped)
        if (order.status === "shipped") {
          const effectiveShippedTime = order.shippedAt
            ? new Date(order.shippedAt).getTime()
            : shippedAtTime || (order.approvedAt ? new Date(order.approvedAt).getTime() + approvedToShippedMs : now);
          if (now - effectiveShippedTime >= shippedToDeliveredMs) {
            order.status = "delivered";
            order.trackingStep = 4;
            order.deliveredAt = new Date(effectiveShippedTime + shippedToDeliveredMs);
<<<<<<< HEAD
            order.liveTracking = undefined;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
            changed = true;
          }
        }

        if (changed) {
          await order.save();
          if (order.status === "delivered") {
            await creditSellerWalletsForOrder(order).catch((err) => {
              console.warn("Automation wallet crediting notice (MongoDB):", err);
            });
          }
          updatedCount++;
        }
      }
    } catch (err: any) {
      console.warn("MongoDB order status automation notice:", err?.message || err);
    }
  }

  // 2. Synchronize in-memory store
  if (Array.isArray(memoryStore.orders)) {
    for (const memOrder of memoryStore.orders) {
      const o = memOrder as any;
      if (o.manualOverride === true || o.status === "cancelled" || o.status === "delivered") {
        continue;
      }

      const createdTime = o.createdAt ? new Date(o.createdAt).getTime() : now;
      const approvedTime = o.approvedAt ? new Date(o.approvedAt).getTime() : createdTime;

      // Pending -> Processing
      if (o.status === "pending") {
        o.status = "processing";
        o.trackingStep = 2;
        o.approvedAt = o.approvedAt || new Date(createdTime);
        updatedCount++;
      }

      // Processing -> Shipped
      if (o.status === "processing") {
        const effApproved = o.approvedAt ? new Date(o.approvedAt).getTime() : approvedTime;
        if (now - effApproved >= approvedToShippedMs) {
          o.status = "shipped";
          o.trackingStep = 3;
          o.shippedAt = new Date(effApproved + approvedToShippedMs);
          updatedCount++;
        }
      }

      // Shipped -> Delivered
      if (o.status === "shipped") {
        const effShipped = o.shippedAt
          ? new Date(o.shippedAt).getTime()
          : (o.approvedAt ? new Date(o.approvedAt).getTime() + approvedToShippedMs : now);
        if (now - effShipped >= shippedToDeliveredMs) {
          o.status = "delivered";
          o.trackingStep = 4;
          o.deliveredAt = new Date(effShipped + shippedToDeliveredMs);
<<<<<<< HEAD
          delete o.liveTracking;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
          updatedCount++;
          await creditSellerWalletsForOrder(o).catch((err) => {
            console.warn("Automation wallet crediting notice (Memory):", err);
          });
        }
      }
    }
  }

  return { updatedCount };
}

let automationInterval: NodeJS.Timeout | null = null;

/**
 * Starts periodic background automation for order status progression
 */
export function startOrderAutomationJob(intervalMs = 30000) {
  if (automationInterval) clearInterval(automationInterval);

  // Run immediately on boot
  progressOrderStatuses().catch(() => {});

  automationInterval = setInterval(() => {
    progressOrderStatuses().catch((err) => {
      console.warn("Background order progression job error:", err);
    });
  }, intervalMs);

  console.log(`⏱️ [ORDER AUTOMATION] Background scheduler active (${intervalMs / 1000}s interval, Approved -> Shipped: ${AUTOMATION_INTERVALS.APPROVED_TO_SHIPPED_MINUTES}m, Shipped -> Delivered: ${AUTOMATION_INTERVALS.SHIPPED_TO_DELIVERED_MINUTES}m)`);
}
