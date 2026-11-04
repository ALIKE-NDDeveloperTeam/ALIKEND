/**
 * Next.js App Router: app/api/auth/[...all]/route.ts
 * Handles Better Auth sign-up, sign-in, session, and sign-out backed by MongoDB.
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../../models/User";
import BetterAuthSession from "../../../../../models/BetterAuthSession";

export async function GET(request: Request) {
  try {
    await connectDB();
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";
    let token = "";

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else {
      const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) {
      return Response.json({ session: null, user: null });
    }

    const sessionDoc = await BetterAuthSession.findOne({
      sessionToken: token,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!sessionDoc) {
      return Response.json({ session: null, user: null });
    }

    const userDoc = await User.findById(sessionDoc.userId).select("-passwordHash").lean();
    if (!userDoc) {
      return Response.json({ session: null, user: null });
    }

    return Response.json({
      session: {
        id: String(sessionDoc._id),
        token: sessionDoc.sessionToken,
        userId: String(userDoc._id),
        expiresAt: sessionDoc.expiresAt,
      },
      user: {
        id: String(userDoc._id),
        email: userDoc.email,
        name: userDoc.fullName || userDoc.email.split("@")[0],
        image: userDoc.avatar || null,
        emailVerified: Boolean(userDoc.verified),
      },
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to fetch session" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const pathname = url.pathname;
    const body = await request.json().catch(() => ({}));

    if (pathname.endsWith("/sign-out")) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "better-auth.session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        },
      });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || body.fullName || email.split("@")[0] || "").trim();

    if (!email || !password) {
      return Response.json({ error: { message: "Email and password are required" } }, { status: 400 });
    }

    let userDoc: any = await User.findOne({ email });

    if (pathname.includes("/sign-up")) {
      if (userDoc) {
        return Response.json({ error: { message: "User already exists" } }, { status: 409 });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      userDoc = await User.create({
        fullName: name,
        username: email.split("@")[0],
        email,
        country: body.country || "Bangladesh",
        mobileNumber: body.mobileNumber || "",
        passwordHash,
        tier: "Silver",
        verified: true,
      });
    } else {
      if (!userDoc) {
        return Response.json({ error: { message: "Invalid email or password" } }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, userDoc.passwordHash || "");
      if (!valid) {
        return Response.json({ error: { message: "Invalid email or password" } }, { status: 401 });
      }
    }

    const sessionToken = `ba_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await BetterAuthSession.create({
      sessionToken,
      userId: String(userDoc._id),
      userEmail: email,
      userName: userDoc.fullName || name,
      expiresAt,
    });

    return new Response(
      JSON.stringify({
        token: sessionToken,
        user: {
          id: String(userDoc._id),
          email: userDoc.email,
          name: userDoc.fullName || name,
          emailVerified: true,
        },
        session: {
          token: sessionToken,
          userId: String(userDoc._id),
          expiresAt,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `better-auth.session_token=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
      }
    );
  } catch (err: any) {
    return Response.json({ error: { message: err?.message || "Auth error" } }, { status: 500 });
  }
}
