/**
 * Better Auth Client Helper (Works in both React / Vite & Next.js Client Components)
 * Connects directly to `/api/better-auth/*` backed by MongoDB.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
}

export interface AuthSessionResponse {
  token?: string;
  user: AuthUser | null;
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string;
  } | null;
  error?: {
    message: string;
    code?: string;
  };
}

const BASE_AUTH_URL = "/api/better-auth";

export const authClient = {
  signUp: {
    email: async (params: {
      email: string;
      password: string;
      name: string;
      image?: string;
    }): Promise<AuthSessionResponse> => {
      const res = await fetch(`${BASE_AUTH_URL}/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      return res.json();
    },
  },

  signIn: {
    email: async (params: {
      email: string;
      password: string;
    }): Promise<AuthSessionResponse> => {
      const res = await fetch(`${BASE_AUTH_URL}/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      return res.json();
    },
  },

  getSession: async (): Promise<AuthSessionResponse> => {
    const res = await fetch(`${BASE_AUTH_URL}/get-session`, {
      method: "GET",
      credentials: "include",
    });
    return res.json();
  },

  signOut: async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_AUTH_URL}/sign-out`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },
};

export default authClient;
