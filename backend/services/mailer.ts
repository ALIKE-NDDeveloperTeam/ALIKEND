import nodemailer from "nodemailer";
import { escapeHtml } from "../utils/escapeHtml";

export function getMailerTransporter(): any {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !pass) {
    return null;
  }

  // In serverless environments (e.g. Vercel), connection pooling (pool: true)
  // causes stale/dead socket reuse and long timeouts when functions unfreeze.
  // Using direct connection with tight socket timeouts ensures rapid delivery.
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 8000,    // 8s greeting timeout
    socketTimeout: 15000,     // 15s socket timeout
  });
}

export interface OrderItemNotification {
  title: string;
  quantity: number;
  price: number | string;
  image?: string;
  sellerId?: string;
  sellerShopName?: string;
}

export interface OrderNotificationDetails {
  orderId: string;
  purchaseTimestamp?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  items: OrderItemNotification[];
  subtotal?: number | string;
  tax?: number | string;
  discount?: number | string;
  delivery?: number | string;
  totalAmount: number | string;
  paymentMethod?: string;
  sellerPayout?: number | string;
  commissionAmount?: number | string;
}

/**
 * Sends a real-time order alert email to the seller/admin
 */
export async function sendSellerOrderNotification(sellerEmail: string, orderDetails: OrderNotificationDetails) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  const recipient = (
    sellerEmail ||
    process.env.SELLER_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.SUPERADMIN_EMAIL ||
    user ||
    "developer.alikend@gmail.com"
  ).trim();

  const timestamp = orderDetails.purchaseTimestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
      .container { max-width: 600px; background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #ddd; }
      .header { font-size: 18px; font-weight: bold; color: #111; margin-bottom: 15px; border-bottom: 2px solid #e0a96d; padding-bottom: 8px; }
      .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #555; margin-top: 20px; }
      .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .item-table th, .item-table td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
      .badge { background: #e0a96d; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        🔔 New Order Received - #${orderDetails.orderId}
      </div>

      <p style="font-size: 14px;">Great news! A new order has been placed on <strong>ALIKE ND</strong>.</p>
      <p style="font-size: 12px; color: #777; margin: 4px 0 14px 0;"><strong>Purchase Timestamp:</strong> ${timestamp}</p>

      <div class="section-title">Customer Details</div>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(orderDetails.customerName || "Valued Customer")}</p>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Email:</strong> ${escapeHtml(orderDetails.customerEmail || "Not specified")}</p>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Phone:</strong> ${escapeHtml(orderDetails.phone || "Not specified")}</p>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(orderDetails.address || "Standard Atelier Destination")}</p>

      <div class="section-title">Purchased Items</div>
      <table class="item-table">
        <thead>
          <tr style="background: #f8f9fa;">
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${(orderDetails.items || []).map((item) => `
            <tr>
              <td>${escapeHtml(item.title || "Luxury Product")}</td>
              <td>${escapeHtml(item.quantity || 1)}</td>
              <td>₹${Number(item.price || 0).toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top: 15px; font-weight: bold; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
        Total Amount: ₹${Number(orderDetails.totalAmount || 0).toLocaleString("en-IN")}
      </div>
      ${orderDetails.paymentMethod ? `<p style="font-size: 12px; color: #555; margin: 4px 0;">Payment Method: <strong>${escapeHtml(orderDetails.paymentMethod)}</strong></p>` : ""}
      ${orderDetails.sellerPayout ? `<p style="font-size: 12px; color: #15803d; margin: 4px 0;">Seller Payout Summary: <strong>₹${Number(orderDetails.sellerPayout).toLocaleString("en-IN")}</strong></p>` : ""}
    </div>
  </body>
  </html>
  `;

  if (!user || !pass) {
    console.log(`🔔 [SELLER ORDER ALERT LOG] Recipient: ${recipient} | Order #${orderDetails.orderId} | Total: ₹${orderDetails.totalAmount} | Time: ${timestamp}`);
    return {
      sent: false,
      mode: "development_logged",
      recipient,
      message: "GMAIL_USER and GMAIL_APP_PASSWORD not configured. Seller alert logged.",
    };
  }

  try {
    const transporter = getMailerTransporter();
    if (!transporter) throw new Error("Could not initialize Gmail SMTP transport");

    const info = await transporter.sendMail({
      from: `"ALIKE ND Order System" <${user}>`,
      to: recipient,
      subject: `🚨 New Order Alert #${orderDetails.orderId}`,
      html: htmlTemplate,
    });

    console.log(`✅ [SELLER ALERT SENT] Order #${orderDetails.orderId} notified to ${recipient} (MessageId: ${info.messageId})`);
    return { sent: true, mode: "gmail_smtp", messageId: info.messageId, recipient };
  } catch (err: any) {
    console.error(`❌ [SELLER ALERT ERROR]:`, err.message || err);
    return { sent: false, mode: "error_logged", error: err.message || err, recipient };
  }
}

/**
 * Sends a real-time order confirmation email to the customer
 */
export async function sendCustomerOrderConfirmation(customerEmail: string, orderDetails: OrderNotificationDetails) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  const recipient = customerEmail?.trim();

  if (!recipient || !recipient.includes("@")) {
    return { sent: false, mode: "skipped", message: "No valid customer email address provided" };
  }

  const timestamp = orderDetails.purchaseTimestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
      .container { max-width: 600px; background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #ddd; }
      .header { font-size: 18px; font-weight: bold; color: #0F1A3C; margin-bottom: 15px; border-bottom: 2px solid #F5A623; padding-bottom: 8px; }
      .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #555; margin-top: 20px; }
      .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .item-table th, .item-table td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
      .thank-you-box { background-color: #fef8ee; border: 1px solid #fde2b4; border-radius: 8px; padding: 12px 16px; margin: 16px 0; color: #92400e; font-size: 13px; font-weight: 500; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        🎉 Order Confirmed! #${escapeHtml(orderDetails.orderId)}
      </div>

      <p style="font-size: 14px; color: #222;">Dear <strong>${escapeHtml(orderDetails.customerName || "Valued Customer")}</strong>,</p>
      <p style="font-size: 13px; color: #444; line-height: 1.6;">
        Thank you for shopping on <strong>ALIKE ND</strong>! Your order has been placed successfully and has entered preparation at our atelier fulfillment terminal.
      </p>

      <div class="thank-you-box">
        ❤️ <em>ALIKE ND te shopping korar jonno Thanks, abar asben shopping korte!</em>
      </div>

      <div class="section-title">Delivery Destination</div>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Recipient:</strong> ${escapeHtml(orderDetails.customerName)}</p>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Phone:</strong> ${escapeHtml(orderDetails.phone || "Registered phone")}</p>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(orderDetails.address)}</p>

      <div class="section-title">Purchased Items</div>
      <table class="item-table">
        <thead>
          <tr style="background: #f8f9fa;">
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${(orderDetails.items || []).map((item) => `
            <tr>
              <td>${escapeHtml(item.title || "Luxury Product")}</td>
              <td>${escapeHtml(item.quantity || 1)}</td>
              <td>₹${Number(item.price || 0).toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top: 15px; font-weight: bold; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px; color: #0F1A3C;">
        Total Amount: ₹${Number(orderDetails.totalAmount || 0).toLocaleString("en-IN")}
      </div>
      ${orderDetails.paymentMethod ? `<p style="font-size: 12px; color: #555; margin: 4px 0;">Payment: <strong>${escapeHtml(orderDetails.paymentMethod)}</strong></p>` : ""}

      <p style="font-size: 11px; color: #888; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; text-align: center;">
        Track live dispatch progress in your ALIKE ND Order Book. Concierge Hotline: +91 1800-254-5363
      </p>
    </div>
  </body>
  </html>
  `;

  if (!user || !pass) {
    console.log(`✉️ [CUSTOMER CONFIRMATION LOG] Recipient: ${recipient} | Order #${orderDetails.orderId} | Total: ₹${orderDetails.totalAmount} | Time: ${timestamp}`);
    return {
      sent: false,
      mode: "development_logged",
      recipient,
      message: "GMAIL_USER and GMAIL_APP_PASSWORD not configured. Customer confirmation logged.",
    };
  }

  try {
    const transporter = getMailerTransporter();
    if (!transporter) throw new Error("Could not initialize Gmail SMTP transport");

    const info = await transporter.sendMail({
      from: `"ALIKE ND Concierge" <${user}>`,
      to: recipient,
      subject: `🎉 Order Confirmed! #${orderDetails.orderId} - ALIKE ND`,
      html: htmlTemplate,
    });

    console.log(`✅ [CUSTOMER CONFIRMATION SENT] Order #${orderDetails.orderId} sent to ${recipient} (MessageId: ${info.messageId})`);
    return { sent: true, mode: "gmail_smtp", messageId: info.messageId, recipient };
  } catch (err: any) {
    console.error(`❌ [CUSTOMER CONFIRMATION ERROR]:`, err.message || err);
    return { sent: false, mode: "error_logged", error: err.message || err, recipient };
  }
}

/**
 * Dispatches both Seller Alert and Customer Confirmation emails simultaneously
 */
export async function dispatchOrderNotificationEmails(orderData: any) {
  try {
    const orderId = orderData.orderNumber || orderData.id || `ALK-${Date.now()}`;
    const timestamp = orderData.purchaseTimestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
    const customerName = orderData.memberName || orderData.address?.name || "Valued Customer";
    const customerEmail = (orderData.memberEmail || orderData.address?.email || orderData.customerEmail || "").trim();
    const phone = orderData.address?.phone || orderData.phone || "";

    let addressStr = "";
    if (typeof orderData.address === "string") {
      addressStr = orderData.address;
    } else if (orderData.address) {
      const parts = [
        orderData.address.street,
        orderData.address.city,
        orderData.address.state,
        orderData.address.zip ? `PIN: ${orderData.address.zip}` : ""
      ].filter(Boolean);
      addressStr = parts.join(", ");
    }
    if (!addressStr) addressStr = "Standard Delivery Address";

    const items: OrderItemNotification[] = (orderData.items || []).map((it: any) => ({
      title: it.name || it.product?.name || it.title || "Luxury Item",
      quantity: Number(it.qty ?? it.quantity ?? 1),
      price: Number(it.price ?? it.product?.price ?? 0),
      image: it.image || it.product?.image || "",
      sellerId: it.sellerId || it.product?.sellerId,
      sellerShopName: it.sellerShopName || it.product?.sellerShopName,
    }));

    const totalAmount = Number(orderData.total ?? orderData.totalAmount ?? 0);
    const paymentMethod = String(orderData.paymentMethod || "CARD").toUpperCase();
    const sellerPayout = orderData.sellerPayout;
    const commissionAmount = orderData.commissionAmount;

    const details: OrderNotificationDetails = {
      orderId,
      purchaseTimestamp: timestamp,
      customerName,
      customerEmail,
      phone,
      address: addressStr,
      items,
      totalAmount,
      paymentMethod,
      sellerPayout,
      commissionAmount,
    };

    const primarySellerEmail = (
      process.env.SELLER_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.SUPERADMIN_EMAIL ||
      process.env.GMAIL_USER ||
      "developer.alikend@gmail.com"
    ).trim();

    const recipientEmails = new Set<string>();
    if (primarySellerEmail) recipientEmails.add(primarySellerEmail);

    // Look up distinct seller emails from MongoDB or memoryStore if present
    const sellerIds = Array.from(new Set(items.map((i) => i.sellerId).filter(Boolean)));
    if (sellerIds.length > 0) {
      try {
        const Seller = (await import("../models/Seller")).default;
        const sellers = await Seller.find({ _id: { $in: sellerIds } }).lean();
        for (const s of sellers) {
          if (s.email) recipientEmails.add(s.email.trim());
          if (s.ownerEmail) recipientEmails.add(s.ownerEmail.trim());
        }
      } catch {
        try {
          const { memoryStore } = await import("../store");
          if (Array.isArray(memoryStore.sellers)) {
            for (const s of memoryStore.sellers) {
              if (sellerIds.includes((s as any)._id) || sellerIds.includes((s as any).id)) {
                if (s.email) recipientEmails.add(s.email.trim());
                if ((s as any).ownerEmail) recipientEmails.add((s as any).ownerEmail.trim());
              }
            }
          }
        } catch {}
      }
    }

    // 1. Dispatch to all unique seller/admin addresses
    const sellerPromises = Array.from(recipientEmails).map((email) =>
      sendSellerOrderNotification(email, details).catch((err) => {
        console.warn(`Seller email failed for ${email}:`, err);
        return null;
      })
    );

    // 2. Dispatch Customer Confirmation email if valid email address
    const customerPromise = customerEmail && customerEmail.includes("@")
      ? sendCustomerOrderConfirmation(customerEmail, details).catch((err) => {
          console.warn(`Customer confirmation failed for ${customerEmail}:`, err);
          return null;
        })
      : Promise.resolve(null);

    await Promise.all([...sellerPromises, customerPromise]);
    return { success: true, recipients: Array.from(recipientEmails), customerNotified: Boolean(customerEmail) };
  } catch (err: any) {
    console.error("dispatchOrderNotificationEmails fatal error:", err);
    return { success: false, error: err.message || err };
  }
}

export async function sendOtpEmail(toEmail: string, otpCode: string, purpose: string = "verification") {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  const startTimestamp = Date.now();
  const startTimeIso = new Date(startTimestamp).toISOString();
  console.log(`⏱️ [OTP GENERATED at ${startTimeIso}] Recipient: ${toEmail} | Purpose: ${purpose} | Code: [REDACTED]`);

  const purposeTitles: Record<string, string> = {
    registration: "Account Registration Verification",
    forgot_password: "Password Reset Authorization",
    login: "Two-Factor Authentication",
    verification: "Identity Verification",
  };

  const subjectTitle = purposeTitles[purpose] || "Verification Code";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #0F1A3C; padding: 24px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">
          ALIKE<span style="color: #F5A623;">-ND</span>
        </h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">
          Luxury Shopping Platform
        </p>
      </div>
      <div style="padding: 28px 24px; color: #1e293b;">
        <h2 style="font-size: 17px; font-weight: 700; color: #0F1A3C; margin-top: 0; margin-bottom: 12px;">
          ${subjectTitle}
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          Use the following 6-digit One-Time Password (OTP) to complete your verification. This code is strictly valid for <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #F5A623; border-radius: 12px; padding: 14px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F1A3C; font-family: monospace;">
              ${otpCode}
            </span>
          </div>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 14px;">
          ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Alike-ND representatives will never ask for your verification code.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          If you did not request this verification code, you can safely ignore this email.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">
          &copy; ${new Date().getFullYear()} Alike-ND Ecommerce Platform. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = `Your Alike-ND verification code is: ${otpCode}. It expires in 10 minutes. Do not share this code with anyone.`;

  if (!user || !pass) {
    console.warn("⚠️ [GMAIL SMTP WARNING] GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment.");
    console.warn(`🔑 [DEV/TEST OTP] Verification code generated for ${toEmail} (Expires in 10 mins) [CODE REDACTED IN LOGS]`);
    return {
      sent: false,
      mode: "development_logged",
      code: otpCode,
      message: "GMAIL_USER and GMAIL_APP_PASSWORD not configured. OTP generated.",
    };
  }

  try {
    const transport = getMailerTransporter();
    if (!transport) {
      throw new Error("Could not initialize Gmail SMTP transport");
    }

    const info = await transport.sendMail({
      from: `"Alike-ND Security" <${user}>`,
      replyTo: user,
      to: toEmail,
      subject: `Your Alike-ND OTP: ${otpCode} (${subjectTitle})`,
      text: textContent,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });

    const elapsedMs = Date.now() - startTimestamp;
    const sentTimeIso = new Date().toISOString();
    console.log(`✅ [GMAIL SMTP SENT at ${sentTimeIso} in ${elapsedMs}ms] Successfully sent email to ${toEmail}. MessageId: ${info.messageId}`);
    return {
      sent: true,
      mode: "gmail_smtp",
      messageId: info.messageId,
      message: "OTP successfully dispatched via Gmail SMTP",
      elapsedMs,
      sentAt: sentTimeIso,
    };
  } catch (err: any) {
    console.error("❌ [GMAIL SMTP ERROR]:", err.message || err);
    console.warn(`🔑 [FALLBACK LOG] Verification code generated for ${toEmail} [CODE REDACTED IN LOGS]`);
    return {
      sent: false,
      mode: "error_logged",
      code: otpCode,
      error: err.message || "Failed to send email via Gmail SMTP",
    };
  }
}
