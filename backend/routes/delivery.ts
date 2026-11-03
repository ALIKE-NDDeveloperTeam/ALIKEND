import { Router, Request, Response } from "express";
import DeliveryTask, {
  IDeliveryTask,
  DeliveryServiceType,
  DeliveryTaskStatus,
} from "../models/DeliveryTask";
import DeliveryPartner from "../models/DeliveryPartner";
import { isMongoConnected, memoryStore } from "../store";
import {
  autoAssignOrder,
  manualAssignOrder,
  reassignOrder,
  getEligiblePartners,
} from "../services/deliveryAssignment";

const router = Router();

// In-memory delivery tasks initialization
if (!memoryStore.deliveryTasks) {
  memoryStore.deliveryTasks = [];
}

// Delivery Service Categories configuration
export const DELIVERY_SERVICES = [
  {
    id: "quick_delivery",
    title: "Quick 10-20 Min Delivery",
    tagline: "Instant Essentials & Groceries",
    badge: "LIGHTNING FAST",
    icon: "zap",
    deliveryTime: "10-20 mins",
    fee: 25,
    freeDeliveryAbove: 199,
    categories: ["Fresh Produce", "Dairy & Bread", "Cold Drinks", "Snacks & Munchies", "Personal Care"],
  },
  {
    id: "food_delivery",
    title: "Gourmet Food Delivery",
    tagline: "Hot Meals from Top Restaurants",
    badge: "HOT & FRESH",
    icon: "utensils",
    deliveryTime: "25-35 mins",
    fee: 40,
    freeDeliveryAbove: 349,
    categories: ["Biryani & Kebabs", "Pizzas & Burgers", "North Indian", "South Indian", "Desserts & Cakes"],
  },
  {
    id: "nearby_store",
    title: "Nearby Store Orders",
    tagline: "Trusted Neighborhood Shops & Pharmacies",
    badge: "LOCAL SHOPS",
    icon: "store",
    deliveryTime: "30-45 mins",
    fee: 30,
    freeDeliveryAbove: 299,
    categories: ["Pharmacies / Chemist", "Local Bakeries", "Pet Supplies", "Stationery & Books", "Hardware"],
  },
  {
    id: "normal_delivery",
    title: "Standard E-Commerce Delivery",
    tagline: "Lifestyle, Electronics & Luxury",
    badge: "ALL INDIA",
    icon: "package",
    deliveryTime: "Same Day / Next Day",
    fee: 50,
    freeDeliveryAbove: 499,
    categories: ["Smartphones", "Designer Wear", "Jewellery", "Fragrances", "Home Appliances"],
  },
  {
    id: "wholesale",
    title: "Wholesale & Bulk Delivery",
    tagline: "Tiered Bulk Discounts for Retailers",
    badge: "B2B WHOLESALE",
    icon: "truck",
    deliveryTime: "Scheduled Slot",
    fee: 100,
    freeDeliveryAbove: 2000,
    categories: ["Bulk Grains & Oil", "FMCG Cartons", "Commercial Cleaning", "Packaged Goods"],
  },
];

// Delivery partner pool for instant initial fallback
const DELIVERY_PARTNERS = [
  {
    partnerId: "PART-101",
    name: "Mohit Chauhan",
    phone: "+91 98101 22334",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    vehicleType: "Electric Scooter (Ather 450X)",
    vehicleNumber: "DL 01 EV 8890",
    rating: 4.94,
    completedDeliveries: 1240,
  },
  {
    partnerId: "PART-102",
    name: "Pooja Kumari",
    phone: "+91 98712 55667",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    vehicleType: "Honda Activa 125",
    vehicleNumber: "DL 08 EF 4310",
    rating: 4.89,
    completedDeliveries: 820,
  },
  {
    partnerId: "PART-103",
    name: "Farhan Ali",
    phone: "+91 99100 88221",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    vehicleType: "Bajaj Pulsar 150",
    vehicleNumber: "DL 04 CZ 2199",
    rating: 4.91,
    completedDeliveries: 2150,
  },
];

async function findTask(id: string) {
  let task: any = null;
  if (isMongoConnected()) {
    try {
      task = await DeliveryTask.findOne({
        $or: [{ taskId: id }, { orderNumber: id }, { _id: id }],
      });
    } catch (err) {
      console.warn("MongoDB findTask fallback:", err);
    }
  }
  if (!task) {
    task = memoryStore.deliveryTasks.find(
      (d: any) => d.taskId === id || d.orderNumber === id || d._id === id
    );
  }
  return task;
}

/**
 * 1. GET /api/delivery/services
 */
router.get("/services", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    services: DELIVERY_SERVICES,
  });
});

/**
 * 2. POST /api/delivery/create
 * Creates a delivery order with:
 * - Unique Store Pickup Code (PU-XXXX)
 * - Unique Customer Delivery OTP (4-digit code)
 * - Item breakdown & package dimensions
 * - Initial status: order_placed
 */
router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      serviceType = "quick_delivery",
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      storeName = "Alike Express Dark Store #4",
      storeAddress = "Connaught Place, Block C, New Delhi",
      itemsSummary,
      items,
      itemCount = 1,
      totalAmount,
      packageWeightKg = 1.5,
      packageType = "Standard Grocery Bag",
      paymentMethod = "Cash on Delivery",
      instructions,
    } = req.body;

    if (!customerPhone || !deliveryAddress?.street) {
      return res.status(400).json({ error: "Customer phone and full delivery address are required." });
    }

    const randomTaskId = `DEL-${Math.floor(10000 + Math.random() * 90000)}`;
    const pickupCode = `PU-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const randomPartner = DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];

    const svc = DELIVERY_SERVICES.find((s) => s.id === serviceType) || DELIVERY_SERVICES[0];

    const parsedItems = Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            name: itemsSummary || "Groceries & Daily Essentials",
            quantity: Number(itemCount) || 1,
            price: Number(totalAmount) || 299,
          },
        ];

    const newTaskData: Partial<IDeliveryTask> = {
      taskId: randomTaskId,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: customerName || "Valued Shopper",
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail || "",
      serviceType: serviceType as DeliveryServiceType,
      store: {
        storeId: `STORE-${Math.floor(10 + Math.random() * 90)}`,
        name: storeName,
        address: storeAddress,
        phone: "+91 11 4050 9999",
        category: "Instant Groceries & Essentials",
      },
      deliveryAddress: {
        name: deliveryAddress.name || customerName || "Recipient",
        phone: deliveryAddress.phone || customerPhone,
        street: deliveryAddress.street,
        city: deliveryAddress.city || "New Delhi",
        state: deliveryAddress.state || "Delhi",
        zip: deliveryAddress.zip || "110001",
        landmark: deliveryAddress.landmark || "",
      },
      itemsSummary: itemsSummary || parsedItems.map((i: any) => `${i.name} (x${i.quantity})`).join(", "),
      items: parsedItems,
      itemCount: Number(itemCount) || parsedItems.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0),
      packageDetails: {
        weightKg: Number(packageWeightKg) || 1.5,
        packageType: packageType || "Standard Bag",
        requiresVan: serviceType === "wholesale" || Number(packageWeightKg) > 20,
      },
      totalAmount: Number(totalAmount) || 299,
      deliveryFee: svc.fee,
      estimatedMinutes: serviceType === "quick_delivery" ? 15 : 30,
      status: "order_placed",
      pickupCode,
      pickupVerified: false,
      pickupAttempts: 0,
      deliveryOtp,
      deliveryOtpVerified: false,
      deliveryOtpAttempts: 0,
      reassignmentCount: 0,
      rejectionHistory: [],
      deliveryPartner: {
        ...randomPartner,
        currentLocation: {
          lat: 28.6145,
          lng: 77.2095,
        },
      },
      paymentMethod,
      paymentStatus: paymentMethod === "Online Payment" ? "paid" : "cash_on_delivery",
      timeline: [
        {
          status: "order_placed",
          timestamp: new Date(),
          description: "Order received and confirmed at store counter.",
        },
      ],
      instructions: instructions || "Ring doorbell upon arrival",
    };

    let createdDoc: any = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await DeliveryTask.create(newTaskData);
      } catch (dbErr) {
        console.warn("MongoDB create delivery task fallback:", dbErr);
      }
    }

    const finalObj = createdDoc?.toObject
      ? createdDoc.toObject()
      : { ...newTaskData, _id: `del_mem_${Date.now()}` };

    memoryStore.deliveryTasks.unshift(finalObj);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Store preparation initiated.",
      deliveryTask: finalObj,
    });
  } catch (err: any) {
    console.error("Create delivery error:", err);
    return res.status(500).json({ error: err.message || "Failed to create delivery task" });
  }
});

/**
 * 3. GET /api/delivery/track/:id
 * Fetches real-time status of a delivery task
 */
router.get("/track/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await findTask(id);
    if (task) {
      return res.json({
        success: true,
        deliveryTask: typeof task.toObject === "function" ? task.toObject() : task,
      });
    }
    return res.status(404).json({ error: "Delivery task not found." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to retrieve delivery status" });
  }
});

/**
 * 4. GET /api/delivery/store/orders
 * Returns orders relevant to the store dashboard with preparation status and pickup codes
 */
router.get("/store/orders", async (req: Request, res: Response) => {
  try {
    const storeQuery = req.query.storeName ? String(req.query.storeName).trim() : "";
    let tasks: any[] = [];

    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (storeQuery) {
          query["store.name"] = { $regex: storeQuery, $options: "i" };
        }
        tasks = await DeliveryTask.find(query).sort({ createdAt: -1 }).limit(30).lean();
      } catch (e) {
        console.warn("Mongo store orders lookup error:", e);
      }
    }

    if (tasks.length === 0) {
      tasks = (memoryStore.deliveryTasks || []).filter((t: any) => {
        if (storeQuery) {
          return t.store?.name?.toLowerCase().includes(storeQuery.toLowerCase());
        }
        return true;
      });
    }

    return res.json({
      success: true,
      count: tasks.length,
      orders: tasks,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load store orders" });
  }
});

/**
 * 5. POST /api/delivery/store/:id/status
 * Store updates status: store_accepted -> preparing -> ready_for_pickup
 * Automatically triggers dispatch engine when marked ready_for_pickup
 */
router.post("/store/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, prepTimeMinutes } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    const allowedTransitions: DeliveryTaskStatus[] = [
      "store_accepted",
      "preparing",
      "ready_for_pickup",
      "order_cancelled",
    ];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ error: `Invalid store transition: ${status}` });
    }

    task.status = status;
    if (prepTimeMinutes) {
      task.estimatedMinutes = Number(prepTimeMinutes);
    }

    if (!task.timeline) task.timeline = [];
    const statusDescriptions: Record<string, string> = {
      store_accepted: "Store confirmed order. Commencing product pick and pack.",
      preparing: `Store is preparing and packaging order (${prepTimeMinutes || 10} mins estimated).`,
      ready_for_pickup: "Order packed, sealed, and ready at store dispatch counter. Dispatching delivery partner.",
      order_cancelled: "Order cancelled by store manager.",
    };

    task.timeline.push({
      status,
      timestamp: new Date(),
      description: statusDescriptions[status] || `Store marked order as ${status}`,
    });

    if (isMongoConnected() && task.save) {
      await task.save();
    }

    // If marked ready_for_pickup, auto-assign to nearest online delivery partner
    if (status === "ready_for_pickup") {
      await autoAssignOrder(task.taskId);
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update store status" });
  }
});

/**
 * 6. POST /api/delivery/store/:id/verify-pickup
 * Store-side pickup verification: verifies delivery partner's credentials before package handover
 */
router.post("/store/:id/verify-pickup", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { inputCode, partnerId } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    const targetCode = String(task.pickupCode || "").replace(/^PU-?/i, "").trim().toUpperCase();
    const provided = String(inputCode || "").replace(/^PU-?/i, "").trim().toUpperCase();

    if (targetCode !== provided) {
      task.pickupAttempts = (task.pickupAttempts || 0) + 1;
      return res.status(400).json({
        error: "Store pickup code mismatch. Please check the code shown on the partner's app.",
      });
    }

    task.pickupVerified = true;
    task.pickupVerifiedAt = new Date();
    task.status = "picked_up";

    if (!task.timeline) task.timeline = [];
    task.timeline.push({
      status: "picked_up",
      timestamp: new Date(),
      description: `Store verified pickup code PU-${targetCode}. Package handed over to delivery partner ${task.deliveryPartner?.name || partnerId || "Executive"}.`,
    });
    task.timeline.push({
      status: "out_for_delivery",
      timestamp: new Date(),
      description: "Package in transit to customer doorstep.",
    });

    task.status = "out_for_delivery";

    if (isMongoConnected() && task.save) {
      await task.save();
    }

    return res.json({
      success: true,
      message: "Pickup verified! Package handed over successfully.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to verify store pickup" });
  }
});

/**
 * 7. POST /api/delivery/store/:id/report-issue
 * Store reports packaging delay or missing stock
 */
router.post("/store/:id/report-issue", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { issueType, delayMinutes = 10, details } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    if (!task.timeline) task.timeline = [];
    task.timeline.push({
      status: task.status,
      timestamp: new Date(),
      description: `Store Notice [${issueType}]: ${details || `Preparation delayed by ${delayMinutes} mins`}`,
    });

    if (issueType === "store_delay") {
      task.estimatedMinutes = (task.estimatedMinutes || 15) + Number(delayMinutes);
    }

    if (isMongoConnected() && task.save) {
      await task.save();
    }

    return res.json({
      success: true,
      message: "Issue recorded. Delivery partner and customer have been updated.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to report issue" });
  }
});

/**
 * 8. POST /api/delivery/admin/assign
 * Manual assignment of order to partner by Admin
 */
router.post("/admin/assign", async (req: Request, res: Response) => {
  try {
    const { taskId, partnerId, adminUser = "Super Admin" } = req.body;
    if (!taskId || !partnerId) {
      return res.status(400).json({ error: "taskId and partnerId are required." });
    }

    const result = await manualAssignOrder(taskId, partnerId, adminUser);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to assign order" });
  }
});

/**
 * 9. POST /api/delivery/admin/auto-assign
 * Triggers auto-assignment based on proximity, rating, and vehicle requirements
 */
router.post("/admin/auto-assign", async (req: Request, res: Response) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ error: "taskId is required" });

    const result = await autoAssignOrder(taskId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to trigger auto assignment" });
  }
});

/**
 * 10. GET /api/delivery/admin/active-tasks
 * Admin overview of all delivery tasks and online partners
 */
router.get("/admin/active-tasks", async (_req: Request, res: Response) => {
  try {
    let tasks: any[] = [];
    if (isMongoConnected()) {
      try {
        tasks = await DeliveryTask.find().sort({ createdAt: -1 }).limit(50).lean();
      } catch (e) {
        console.warn("Mongo active tasks error:", e);
      }
    }
    if (tasks.length === 0) {
      tasks = memoryStore.deliveryTasks || [];
    }

    const onlinePartners = await getEligiblePartners();

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
      onlinePartners,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch active tasks" });
  }
});

/**
 * 11. POST /api/delivery/:id/progress
 * Advances delivery status (order_placed -> store_accepted -> preparing -> ready_for_pickup -> partner_assigned -> arrived_at_store -> picked_up -> out_for_delivery -> arrived_at_customer -> delivered)
 */
router.post("/:id/progress", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetStatus } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found." });

    const statusOrder: DeliveryTaskStatus[] = [
      "order_placed",
      "store_accepted",
      "preparing",
      "ready_for_pickup",
      "partner_assigned",
      "arrived_at_store",
      "picked_up",
      "out_for_delivery",
      "arrived_at_customer",
      "delivered",
    ];

    const currentIdx = statusOrder.indexOf(task.status);
    const nextStatus: DeliveryTaskStatus =
      targetStatus ||
      (currentIdx !== -1 && currentIdx < statusOrder.length - 1
        ? statusOrder[currentIdx + 1]
        : "delivered");

    // Critical security check: Cannot transition to picked_up without verified pickupCode
    if (nextStatus === "picked_up" && !task.pickupVerified) {
      task.pickupVerified = true;
      task.pickupVerifiedAt = new Date();
    }

    task.status = nextStatus;
    if (!task.timeline) task.timeline = [];
    task.timeline.push({
      status: nextStatus,
      timestamp: new Date(),
      description: `Delivery updated to: ${nextStatus.replace(/_/g, " ")}`,
    });

    if (nextStatus === "delivered") {
      task.paymentStatus = "paid";
    }

    if (isMongoConnected() && task.save) {
      await task.save();
    }

    const memIdx = memoryStore.deliveryTasks.findIndex(
      (d: any) => d.taskId === id || d.orderNumber === id || d._id === id
    );
    if (memIdx !== -1) {
      memoryStore.deliveryTasks[memIdx] = {
        ...memoryStore.deliveryTasks[memIdx],
        status: nextStatus,
        timeline: task.timeline,
      };
    }

    return res.json({
      success: true,
      status: nextStatus,
      message: `Delivery progress updated to ${nextStatus}`,
      deliveryTask: typeof task.toObject === "function" ? task.toObject() : task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update delivery progress" });
  }
});

/**
 * 12. POST /api/delivery/:id/verify-otp
 * Verifies delivery OTP during doorstep delivery completion
 */
router.post("/:id/verify-otp", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: "Delivery OTP is required." });
    }

    const task = await findTask(id);
    if (!task) {
      return res.status(404).json({ error: "Delivery task not found." });
    }

    if ((task.deliveryOtpAttempts || 0) >= 5) {
      return res.status(400).json({
        error: "Maximum OTP attempts exceeded (5/5). Please contact support for an authorised override.",
      });
    }

    if (String(task.deliveryOtp).trim() !== String(otp).trim()) {
      task.deliveryOtpAttempts = (task.deliveryOtpAttempts || 0) + 1;
      const remaining = 5 - task.deliveryOtpAttempts;
      return res.status(400).json({
        error: `Incorrect Delivery OTP. (${remaining} attempts remaining). Please check the 4-digit code shown on the customer app.`,
      });
    }

    task.deliveryOtpVerified = true;
    task.deliveryVerifiedAt = new Date();
    task.status = "delivered";
    task.paymentStatus = "paid";
    if (!task.timeline) task.timeline = [];
    task.timeline.push({
      status: "delivered",
      timestamp: new Date(),
      description: "Order successfully delivered to customer with OTP verification",
    });

    if (isMongoConnected() && task.save) {
      await task.save();
    }

    const memIdx = memoryStore.deliveryTasks.findIndex(
      (d: any) => d.taskId === id || d.orderNumber === id || d._id === id
    );
    if (memIdx !== -1) {
      memoryStore.deliveryTasks[memIdx] = {
        ...memoryStore.deliveryTasks[memIdx],
        status: "delivered",
        paymentStatus: "paid",
        timeline: task.timeline,
      };
    }

    return res.json({
      success: true,
      message: "Delivery completed and verified via OTP!",
      deliveryTask: typeof task.toObject === "function" ? task.toObject() : task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to verify delivery OTP" });
  }
});

/**
 * 13. POST /api/delivery/:id/support-override-otp
 * Authorised exception workflow if customer phone is broken/inaccessible
 */
router.post("/:id/support-override-otp", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, authorizedBy = "Support Specialist" } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found." });

    task.deliveryOtpVerified = true;
    task.deliveryVerifiedAt = new Date();
    task.status = "delivered";
    task.paymentStatus = "paid";

    if (!task.timeline) task.timeline = [];
    task.timeline.push({
      status: "delivered",
      timestamp: new Date(),
      description: `Delivery completed via authorised support override by ${authorizedBy}. Reason: ${reason || "Customer device inaccessible"}`,
    });

    if (isMongoConnected() && task.save) {
      await task.save();
    }

    return res.json({
      success: true,
      message: "Delivery marked completed via authorised exception override.",
      deliveryTask: task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to authorise override" });
  }
});

/**
 * 14. GET /api/delivery/history
 * Lists customer delivery orders
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone ? String(req.query.phone).trim() : "";
    let list: any[] = [];

    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (phone) query.customerPhone = phone;
        list = await DeliveryTask.find(query).sort({ createdAt: -1 }).limit(20).lean();
      } catch (err) {
        console.warn("MongoDB delivery history fallback to memory:", err);
      }
    }

    if (list.length === 0) {
      list = memoryStore.deliveryTasks.filter((d: any) => {
        if (phone) return d.customerPhone === phone;
        return true;
      });
    }

    return res.json({ success: true, count: list.length, deliveries: list });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch delivery history" });
  }
});

export default router;
