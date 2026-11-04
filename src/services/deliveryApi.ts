import { DeliveryTask, DeliveryServiceType } from '../types';

export interface CreateDeliveryParams {
  serviceType: DeliveryServiceType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: {
    name?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    landmark?: string;
  };
  storeName?: string;
  storeAddress?: string;
  itemsSummary: string;
  itemCount?: number;
  totalAmount: number;
  paymentMethod?: string;
  instructions?: string;
}

export const deliveryApi = {
  /**
   * Fetches available delivery services configuration (Quick, Food, Nearby, Normal, Wholesale)
   */
  async getServices(): Promise<any[]> {
    const res = await fetch('/api/delivery/services');
    if (!res.ok) return [];
    const data = await res.json();
    return data.services || [];
  },

  /**
   * Creates a new delivery task with customer delivery OTP
   */
  async createDeliveryTask(params: CreateDeliveryParams): Promise<DeliveryTask> {
    const res = await fetch('/api/delivery/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch delivery');
    }

    const data = await res.json();
    return data.deliveryTask;
  },

  /**
   * Gets real-time tracking of a delivery task
   */
  async trackDelivery(taskIdOrOrderNumber: string): Promise<DeliveryTask> {
    const res = await fetch(`/api/delivery/track/${taskIdOrOrderNumber}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Delivery not found');
    }
    const data = await res.json();
    return data.deliveryTask;
  },

  /**
   * Simulates/advances delivery status (packing -> out for delivery -> arriving -> delivered)
   */
  async progressDelivery(taskId: string, targetStatus?: string): Promise<DeliveryTask> {
    const res = await fetch(`/api/delivery/${taskId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStatus }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to progress delivery');
    }

    const data = await res.json();
    return data.deliveryTask;
  },

  /**
   * Verifies Doorstep Delivery OTP
   */
  async verifyDeliveryOtp(taskId: string, otp: string): Promise<DeliveryTask> {
    const res = await fetch(`/api/delivery/${taskId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify delivery OTP');
    }

    const data = await res.json();
    return data.deliveryTask;
  },

  /**
   * Fetches customer's past delivery history
   */
  async getDeliveryHistory(phone?: string): Promise<DeliveryTask[]> {
    const qs = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const res = await fetch(`/api/delivery/history${qs}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.deliveries || [];
  },

  /**
   * Fetches store orders for Seller / Merchant Dashboard
   */
  async getStoreOrders(storeName?: string): Promise<any[]> {
    const qs = storeName ? `?storeName=${encodeURIComponent(storeName)}` : '';
    const res = await fetch(`/api/delivery/store/orders${qs}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  },

  /**
   * Updates store preparation status (store_accepted -> preparing -> ready_for_pickup)
   */
  async updateStoreStatus(id: string, status: string, prepTimeMinutes?: number): Promise<any> {
    const res = await fetch(`/api/delivery/store/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, prepTimeMinutes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update store order status');
    }
    return await res.json();
  },

  /**
   * Store verifies delivery partner pickup code before handing over package
   */
  async verifyStorePickup(id: string, inputCode: string, partnerId?: string): Promise<any> {
    const res = await fetch(`/api/delivery/store/${id}/verify-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputCode, partnerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Pickup code verification failed');
    }
    return await res.json();
  },

  /**
   * Store reports packaging delay or missing stock
   */
  async reportStoreIssue(id: string, issueType: string, delayMinutes?: number, details?: string): Promise<any> {
    const res = await fetch(`/api/delivery/store/${id}/report-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueType, delayMinutes, details }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to report store issue');
    }
    return await res.json();
  },

  /**
   * Admin manual assignment of order to partner
   */
  async adminAssignOrder(taskId: string, partnerId: string): Promise<any> {
    const res = await fetch('/api/delivery/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, partnerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to assign order');
    }
    return await res.json();
  },

  /**
   * Admin triggers auto assignment
   */
  async adminAutoAssignOrder(taskId: string): Promise<any> {
    const res = await fetch('/api/delivery/admin/auto-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Auto assignment failed');
    }
    return await res.json();
  },

  /**
   * Admin gets active delivery tasks & online fleet
   */
  async adminGetActiveTasks(): Promise<{ tasks: any[]; onlinePartners: any[] }> {
    const res = await fetch('/api/delivery/admin/active-tasks');
    if (!res.ok) return { tasks: [], onlinePartners: [] };
    const data = await res.json();
    return {
      tasks: data.tasks || [],
      onlinePartners: data.onlinePartners || [],
    };
  },

  /**
   * Authorised support emergency OTP override
   */
  async supportOverrideOtp(id: string, reason: string): Promise<any> {
    const res = await fetch(`/api/delivery/${id}/support-override-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to authorize OTP override');
    }
    return await res.json();
  },
};
