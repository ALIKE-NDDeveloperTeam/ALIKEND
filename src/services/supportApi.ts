export interface SupportTicketItem {
  _id: string;
  ticketId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status:
    | "New"
    | "Open"
    | "In Progress"
    | "Waiting for Customer"
    | "Escalated"
    | "Resolved"
    | "Closed";
  assignedDepartment: string;
  replies: Array<{
    id: string;
    authorType: "staff" | "customer";
    authorName: string;
    authorEmail: string;
    message: string;
    attachments?: Array<{
      name: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
    createdAt: string | Date;
  }>;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SupportHotlineItem {
  id: string;
  name: string;
  phoneNumber: string;
  extension?: string;
  department: string;
  description?: string;
  operatingHours: string;
  whatsappNumber?: string;
  emailAddress?: string;
  isEmergency: boolean;
  isPriority: boolean;
}

export interface SupportArticleItem {
  _id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  status: string;
  viewsCount: number;
  helpfulCount: number;
  tags: string[];
  author?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: string;
  priority?: "Low" | "Normal" | "High" | "Urgent";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  preferredContactMethod?: "Email" | "Phone" | "WhatsApp";
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  troubleshootingContext?: Array<{
    title?: string;
    query?: string;
    attempt?: string;
    advice?: string;
    resolved?: boolean;
  }>;
}

function getUserToken(): string | null {
  try {
    return (
      localStorage.getItem("alike_user_token") ||
      localStorage.getItem("alikend_user_token") ||
      null
    );
  } catch {
    return null;
  }
}

function getAuthHeaders(userEmail?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getUserToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const supportApi = {
  // Fetch user's submitted support requests
  async getMyTickets(userEmail?: string): Promise<SupportTicketItem[]> {
    try {
      const token = getUserToken();
      const params = new URLSearchParams();
      if (userEmail) params.append("email", userEmail);

      const url = `/api/support/my-tickets${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        headers: getAuthHeaders(userEmail),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch tickets (${res.status})`);
      }

      const data = await res.json();
      return data.tickets || [];
    } catch (err: any) {
      console.warn("supportApi.getMyTickets error:", err.message);
      return [];
    }
  },

  // Submit a new support ticket
  async createTicket(payload: CreateTicketPayload): Promise<{
    success: boolean;
    ticketId: string;
    ticket: SupportTicketItem;
    message: string;
  }> {
    const res = await fetch("/api/support/create-ticket", {
      method: "POST",
      headers: getAuthHeaders(payload.customerEmail),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to create support ticket.");
    }
    return data;
  },

  // Get single ticket details
  async getTicket(ticketId: string, userEmail?: string): Promise<SupportTicketItem | null> {
    const params = userEmail ? `?email=${encodeURIComponent(userEmail)}` : "";
    const res = await fetch(`/api/support/user/tickets/${encodeURIComponent(ticketId)}${params}`, {
      headers: getAuthHeaders(userEmail),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load ticket details.");
    }

    const data = await res.json();
    return data.ticket || null;
  },

  // Send reply from user
  async replyTicket(
    ticketId: string,
    message: string,
    attachments: any[] = [],
    userEmail?: string
  ): Promise<{ success: boolean; ticket: SupportTicketItem }> {
    const res = await fetch(`/api/support/user/tickets/${encodeURIComponent(ticketId)}/reply`, {
      method: "POST",
      headers: getAuthHeaders(userEmail),
      body: JSON.stringify({
        message,
        attachments,
        email: userEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to post reply.");
    }
    return data;
  },

  // Reopen resolved ticket
  async reopenTicket(
    ticketId: string,
    reason: string,
    userEmail?: string
  ): Promise<{ success: boolean; ticket: SupportTicketItem; message: string }> {
    const res = await fetch(`/api/support/user/tickets/${encodeURIComponent(ticketId)}/reopen`, {
      method: "POST",
      headers: getAuthHeaders(userEmail),
      body: JSON.stringify({
        reason,
        email: userEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to reopen ticket.");
    }
    return data;
  },

  // Get public published hotlines
  async getHotlines(): Promise<SupportHotlineItem[]> {
    try {
      const res = await fetch("/api/support/public/hotlines");
      if (!res.ok) throw new Error("Failed to load customer care hotlines.");
      return await res.json();
    } catch (err: any) {
      console.warn("supportApi.getHotlines error:", err.message);
      return [];
    }
  },

  // Track telephone call click
  async trackCall(hotlineId: string): Promise<void> {
    try {
      await fetch(`/api/admin/customer-care/hotlines/${hotlineId}/track-call`, {
        method: "POST",
      });
    } catch {}
  },

  // Get knowledge base articles
  async getKnowledgeBase(category?: string, search?: string): Promise<SupportArticleItem[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== "All Categories") params.append("category", category);
      if (search) params.append("search", search);

      const url = `/api/support/knowledge-base${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load knowledge articles.");
      return await res.json();
    } catch (err: any) {
      console.warn("supportApi.getKnowledgeBase error:", err.message);
      return [];
    }
  },

  // Mark article helpful
  async markHelpful(articleId: string): Promise<{ helpfulCount: number }> {
    const res = await fetch(`/api/support/knowledge-base/${articleId}/helpful`, {
      method: "POST",
    });
    return await res.json();
  },

  // Record article view
  async recordArticleView(articleId: string): Promise<void> {
    fetch(`/api/support/knowledge-base/${articleId}/view`, {
      method: "POST",
    }).catch(() => {});
  },
};
