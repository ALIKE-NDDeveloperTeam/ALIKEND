import { FareEstimate, RideBooking, RideServiceType, SavedRidePlace, DigitalReceipt } from '../types';

export interface EstimateRequestParams {
  pickup: {
    address: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  distanceKm?: number;
  promoCode?: string;
}

export interface BookRideParams {
  serviceType: RideServiceType;
  pickup: {
    address: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  distanceKm: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: 'cash' | 'wallet' | 'upi' | 'card';
  promoCode?: string;
  isScheduled?: boolean;
  scheduledFor?: string | Date;
  idempotencyKey?: string;
}

export const rideApi = {
  /**
   * Fetches real-time fare estimates for all approved vehicle categories
   */
  async getEstimates(params: EstimateRequestParams): Promise<{
    estimates: FareEstimate[];
    distanceKm: number;
    isRushHour: boolean;
    surgeMultiplier: number;
  }> {
    const res = await fetch('/api/rides/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to calculate fare estimate');
    }

    const data = await res.json();
    return {
      estimates: data.estimates || [],
      distanceKm: data.distanceKm || 5.0,
      isRushHour: Boolean(data.isRushHour),
      surgeMultiplier: data.surgeMultiplier || 1.0,
    };
  },

  /**
   * Validates promotional coupon codes
   */
  async validatePromo(code: string, fareAmount: number, serviceType?: string): Promise<{
    valid: boolean;
    code: string;
    discountType: 'flat' | 'percentage';
    amount: number;
    estimatedDiscount: number;
    description: string;
  }> {
    const res = await fetch('/api/rides/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, fareAmount, serviceType }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid coupon code');
    }
    return data;
  },

  /**
   * Fetches active vehicle categories with capacity and pricing
   */
  async getCategories(lat?: number, lng?: number) {
    const query = new URLSearchParams();
    if (lat) query.set('lat', String(lat));
    if (lng) query.set('lng', String(lng));

    const res = await fetch(`/api/rides/categories?${query.toString()}`);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.categories || [];
  },

  /**
   * Books a ride (Now or Scheduled)
   */
  async bookRide(params: BookRideParams): Promise<RideBooking> {
    const res = await fetch('/api/rides/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to book ride');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Polls live ride status (driver location, ride OTP, trip progress)
   */
  async getRideStatus(bookingIdOrId: string): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch ride status');
    }
    const data = await res.json();
    return data.ride;
  },

  /**
   * Interactive simulation helper for testing ride transitions
   */
  async progressRide(bookingIdOrId: string, targetStatus?: string): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStatus }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to progress ride');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Driver accepts ride
   */
  async driverAccept(bookingIdOrId: string, driverInfo?: any): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/driver-accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverInfo || {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to accept ride');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Driver marks arrival at pickup spot
   */
  async driverArrive(bookingIdOrId: string): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/driver-arrive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to mark arrival');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Verifies Ride OTP (Passenger provides 4-digit code to driver)
   */
  async verifyRideOtp(bookingIdOrId: string, otp: string): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify OTP');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Completes the trip, generates final fare & tax breakdown
   */
  async completeRide(
    bookingIdOrId: string,
    actualDistanceKm?: number,
    actualDurationMin?: number,
    waitingMinutes?: number
  ): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualDistanceKm, actualDurationMin, waitingMinutes }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete trip');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Settle payment (Cash, UPI with UTR, Wallet, or Card)
   */
  async payRide(bookingIdOrId: string, paymentMethod: 'cash' | 'upi' | 'wallet' | 'card', upiId?: string): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, upiId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Payment processing failed');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Generates formatted digital tax receipt / invoice
   */
  async getReceipt(bookingIdOrId: string): Promise<DigitalReceipt> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/receipt`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch receipt');
    }
    const data = await res.json();
    return data.receipt;
  },

  /**
   * Cancels an active ride booking
   */
  async cancelRide(bookingIdOrId: string, reason: string): Promise<RideBooking> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel ride');
    }

    const data = await res.json();
    return data.ride;
  },

  /**
   * Submits a fare dispute for overcharge / route mismatch
   */
  async submitDispute(bookingIdOrId: string, reason: string, claimedRefund: number, notes?: string) {
    const res = await fetch(`/api/rides/${bookingIdOrId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, claimedRefund, notes }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit dispute');
    }
    return data;
  },

  /**
   * Requests support escalation
   */
  async requestSupport(bookingIdOrId: string, issue: string) {
    const res = await fetch(`/api/rides/${bookingIdOrId}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request support');
    }
    return data;
  },

  /**
   * Rates the driver and submits customer feedback
   */
  async rateRide(bookingIdOrId: string, rating: number, feedback?: string): Promise<void> {
    const res = await fetch(`/api/rides/${bookingIdOrId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit rating');
    }
  },

  /**
   * Fetches saved favourite places for customer
   */
  async getSavedPlaces(phone?: string): Promise<SavedRidePlace[]> {
    try {
      const res = await fetch(`/api/rides/saved-places${phone ? `?phone=${phone}` : ''}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.places || [];
    } catch {
      return [];
    }
  },

  /**
   * Saves a new favourite address
   */
  async addSavedPlace(place: {
    customName: string;
    address: string;
    label?: string;
    lat?: number;
    lng?: number;
    phone?: string;
  }): Promise<SavedRidePlace> {
    const res = await fetch('/api/rides/saved-places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(place),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save place');
    return data.place;
  },

  /**
   * Deletes a saved place
   */
  async deleteSavedPlace(placeId: string): Promise<void> {
    await fetch(`/api/rides/saved-places/${placeId}`, { method: 'DELETE' });
  },

  /**
   * Fetches past ride history for customer
   */
  async getUserRides(phone?: string, email?: string): Promise<RideBooking[]> {
    const params = new URLSearchParams();
    if (phone) params.set('phone', phone);
    if (email) params.set('email', email);

    const qs = params.toString();
    const res = await fetch(`/api/rides/history/user${qs ? `?${qs}` : ''}`);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.rides || [];
  },

  /**
   * Fetches online driver categories for the storefront top banner
   */
  async getOnlineTypes(): Promise<{ availableTypes: string[]; totalOnline: number; bannerText: string }> {
    try {
      const res = await fetch('/api/rides/online-types');
      if (!res.ok) {
        return { availableTypes: [], totalOnline: 0, bannerText: 'BIKE • AUTO • CAB' };
      }
      return await res.json();
    } catch {
      return { availableTypes: [], totalOnline: 0, bannerText: 'BIKE • AUTO • CAB' };
    }
  },

  /**
   * Passenger triggers Emergency SOS
   */
  async triggerSos(rideId: string, lat?: number, lng?: number, notes?: string) {
    const res = await fetch(`/api/rides/${rideId}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to trigger SOS');
    }
    return data;
  },

  /**
   * Generates secure shareable trip link for trusted contacts
   */
  async shareTrip(rideId: string) {
    const res = await fetch(`/api/rides/${rideId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate share link');
    }
    return data;
  },

  /**
   * Public live trip tracking for trusted contacts
   */
  async trackSharedTrip(token: string) {
    const res = await fetch(`/api/rides/track/${token}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Trip tracking link is invalid or expired');
    }
    return data.trip;
  },

  /**
   * Passenger files a ride complaint
   */
  async fileComplaint(rideId: string, category: string, description: string) {
    const res = await fetch(`/api/rides/${rideId}/complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit complaint');
    }
    return data;
  },

  /**
   * Passenger reports a lost item left behind in the vehicle
   */
  async reportLostItem(rideId: string, itemCategory: string, description: string, contactPhone?: string) {
    const res = await fetch(`/api/rides/${rideId}/lost-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemCategory, description, contactPhone }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit lost item report');
    }
    return data;
  },
};
