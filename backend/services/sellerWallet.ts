import mongoose from "mongoose";
import Order, { IOrder } from "../models/Order";
import Product from "../models/Product";
import Seller from "../models/Seller";
import { isMongoConnected, memoryStore } from "../store";

/**
 * Automatically credits individual seller wallets when an order transitions to "delivered".
 *
 * Requirements & Behavior:
 * - Idempotency: Immediately returns if order.walletCredited is already true.
 * - Looks up each item's product to retrieve the associated sellerId.
 * - Computes seller payout after deducting the order's commissionRate (default 5%).
 * - Groups and sums payouts by sellerId.
 * - Excludes platform/admin products (sellerId === "admin" | "platform").
 * - Atomically increments walletBalance and totalEarnings using MongoDB's $inc operator.
 * - Updates in-memory store for dev/fallback mode.
 * - Marks order.walletCredited = true and persists the order.
 * - Safely catches and logs errors so order progression is never broken.
 */
export async function creditSellerWalletsForOrder(order: IOrder | any): Promise<void> {
  if (!order) return;

  // 1. Idempotency Check
  if (order.walletCredited) {
    return;
  }

  // Only delivered orders qualify for wallet payout crediting
  if (order.status !== "delivered") {
    return;
  }

  try {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
      order.walletCredited = true;
      if (typeof order.save === "function") {
        await order.save().catch(() => {});
      } else if (order._id && isMongoConnected()) {
        await Order.findByIdAndUpdate(order._id, { walletCredited: true }).catch(() => {});
      }
      return;
    }

    // 2. Determine commission rate for this order (defaults to 5% if unspecified)
    const commissionRate = typeof order.commissionRate === "number" ? order.commissionRate : 5;
    const commissionPercent = Math.max(0, Math.min(100, commissionRate));

    // 3. Collect product IDs from items
    const productIds = items
      .map((it: any) => it.productId)
      .filter((id: any) => id !== undefined && id !== null && id !== "");

    // Look up products in MongoDB
    let dbProducts: any[] = [];
    if (isMongoConnected() && productIds.length > 0) {
      try {
        const validObjectIds = productIds.filter((id: any) => mongoose.isValidObjectId(id));
        const validNumericIds = productIds
          .map((id: any) => Number(id))
          .filter((n: number) => !isNaN(n));

        const orConditions: any[] = [];
        if (validObjectIds.length > 0) orConditions.push({ _id: { $in: validObjectIds } });
        if (validNumericIds.length > 0) orConditions.push({ id: { $in: validNumericIds } });

        if (orConditions.length > 0) {
          dbProducts = await Product.find({ $or: orConditions }).lean();
        }
      } catch (err) {
        console.warn("MongoDB product lookup notice during seller wallet crediting:", err);
      }
    }

    // Build product lookup map matching both String(_id) and String(id)
    const productMap = new Map<string, any>();
    for (const p of dbProducts) {
      if (p._id) productMap.set(String(p._id), p);
      if (p.id !== undefined && p.id !== null) productMap.set(String(p.id), p);
    }
    for (const p of memoryStore.products || []) {
      if (p._id && !productMap.has(String(p._id))) productMap.set(String(p._id), p);
      if (p.id !== undefined && p.id !== null && !productMap.has(String(p.id))) productMap.set(String(p.id), p);
    }

    // 4. Compute payout per item and group by sellerId
    const sellerPayoutMap: Record<string, number> = {};

    for (const item of items) {
      const product = productMap.get(String(item.productId));
      const sellerId = product?.sellerId ? String(product.sellerId) : null;

      // Skip platform / admin own products
      if (!sellerId || sellerId === "admin" || sellerId === "platform") {
        continue;
      }

      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.qty) || 1;
      const itemTotal = itemPrice * itemQty;
      const itemCommission = Math.round((itemTotal * commissionPercent) / 100);
      const itemPayout = Math.max(0, itemTotal - itemCommission);

      if (itemPayout > 0) {
        sellerPayoutMap[sellerId] = (sellerPayoutMap[sellerId] || 0) + itemPayout;
      }
    }

    // 5. Increment each seller's walletBalance and totalEarnings atomically
    for (const [sellerId, payout] of Object.entries(sellerPayoutMap)) {
      if (payout <= 0) continue;

      if (isMongoConnected()) {
        try {
          if (mongoose.isValidObjectId(sellerId)) {
            await Seller.findByIdAndUpdate(sellerId, {
              $inc: { walletBalance: payout, totalEarnings: payout },
            });
          } else {
            await Seller.updateOne(
              { $or: [{ _id: sellerId }, { email: sellerId }] },
              { $inc: { walletBalance: payout, totalEarnings: payout } }
            );
          }
        } catch (dbErr: any) {
          console.warn(`MongoDB wallet crediting failed for seller ${sellerId}:`, dbErr?.message || dbErr);
        }
      }

      // Dev / Memory fallback
      const memSeller = (memoryStore.sellers || []).find(
        (s) => s._id === sellerId || (s.email && s.email.toLowerCase() === sellerId.toLowerCase())
      );
      if (memSeller) {
        (memSeller as any).walletBalance = ((memSeller as any).walletBalance || 0) + payout;
        (memSeller as any).totalEarnings = ((memSeller as any).totalEarnings || 0) + payout;
      }

      console.log(
        `💰 [SELLER WALLET CREDITED] Seller ${sellerId} received ₹${payout} payout for Order ${order.orderNumber || order._id}`
      );
    }

    // 6. Set walletCredited = true and save order to guarantee single execution
    order.walletCredited = true;

    if (typeof order.save === "function") {
      await order.save();
    } else if (order._id) {
      if (isMongoConnected()) {
        try {
          await Order.findByIdAndUpdate(order._id, { walletCredited: true });
        } catch (saveErr) {
          console.warn("MongoDB order walletCredited update notice:", saveErr);
        }
      }
      const memOrder = (memoryStore.orders || []).find(
        (o) => o._id === order._id || o.orderNumber === order.orderNumber
      );
      if (memOrder) {
        (memOrder as any).walletCredited = true;
      }
    }
  } catch (err: any) {
    console.warn("creditSellerWalletsForOrder helper error:", err?.message || err);
  }
}
