import { Router } from "express";
import Order, { OrderStatus } from "../models/Order";
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { progressOrderStatuses } from "../services/orderAutomation";
import { creditSellerWalletsForOrder } from "../services/sellerWallet";
import { reconcileOrderCommissionOnStatusChange } from "../services/commissionEngine";

const router = Router();
router.use(requireAdmin);

// GET /api/admin/orders
router.get("/", async (_req, res) => {
  try {
    // Run real-time progression check before listing
    await progressOrderStatuses().catch(() => {});

    if (isMongoConnected()) {
      try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.json(orders);
      } catch (err) {
        console.warn("MongoDB fetch orders failed, using in-memory store:", err);
      }
    }
    return res.json(memoryStore.orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});

// PATCH /api/admin/orders/:id/status (Admin Manual Override)
router.patch("/:id/status", async (req: AuthedRequest, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Must be pending, processing, shipped, delivered, or cancelled." });
    }

    const stepMap: Record<string, number> = {
      pending: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 0,
    };
    const trackingStep = stepMap[status] ?? 2;

    const updateFields: any = {
      status,
      trackingStep,
      manualOverride: true, // Preserve manual admin intervention
    };
    if (status === "processing") updateFields.approvedAt = new Date();
    if (status === "shipped") updateFields.shippedAt = new Date();
    if (status === "delivered") {
      updateFields.deliveredAt = new Date();
      updateFields.commissionStatus = "settled";
    }
    if (status === "delivered" || status === "cancelled") {
      updateFields.liveTracking = null;
    }

    if (isMongoConnected()) {
      try {
        const mongoUpdate: any = { $set: updateFields };
        if (status === "delivered" || status === "cancelled") {
          delete updateFields.liveTracking;
          mongoUpdate.$unset = { liveTracking: 1 };
        }
        const order = await Order.findByIdAndUpdate(id, mongoUpdate, { new: true });
        if (order) {
          if (status === "delivered") {
            await creditSellerWalletsForOrder(order).catch((err) => {
              console.warn("Wallet crediting notice (admin manual route):", err);
            });
          } else if (status === "cancelled") {
            await reconcileOrderCommissionOnStatusChange({
              order,
              newStatus: "cancelled",
              adminOrActorName: req.admin?.name || "Admin",
              adminOrActorEmail: req.admin?.email || "admin@alikend.com",
              reason: "Order cancelled by Admin",
            }).catch(() => {});
          }
          return res.json(order);
        }
      } catch (err) {
        console.warn("MongoDB update order status failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.orders.findIndex((o) => o._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    Object.assign(memoryStore.orders[index], updateFields);
    if (status === "delivered") {
      await creditSellerWalletsForOrder(memoryStore.orders[index]).catch((err) => {
        console.warn("Wallet crediting notice (memory store):", err);
      });
    } else if (status === "cancelled") {
      await reconcileOrderCommissionOnStatusChange({
        order: memoryStore.orders[index],
        newStatus: "cancelled",
        adminOrActorName: req.admin?.name || "Admin",
        adminOrActorEmail: req.admin?.email || "admin@alikend.com",
        reason: "Order cancelled by Admin",
      }).catch(() => {});
    }
    return res.json(memoryStore.orders[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update order status" });
  }
});

export default router;
