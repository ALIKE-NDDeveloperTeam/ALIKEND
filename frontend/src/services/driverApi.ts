export interface DocumentExpiryAlert {
  docType: string;
  expiryDate: string;
  status: "expired" | "expiring_soon" | "valid";
  daysRemaining: number;
  message: string;
}

export interface DriverProfile {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel?: string;
  seatingCapacity?: number;
  licenseNumberMasked?: string;
  licenseStatus?: "pending" | "verified" | "rejected";
  licenseExpiryDate?: string;
  aadhaarNumberMasked?: string;
  identityStatus?: "pending" | "verified" | "rejected";
  rcNumber?: string;
  rcStatus?: "pending" | "verified" | "rejected";
  insurancePolicyNumber?: string;
  insuranceStatus?: "pending" | "verified" | "rejected";
  permitStatus?: "pending" | "verified" | "rejected";
  bankDetails?: {
    accountNumberMasked?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  status: "pending" | "approved" | "suspended" | "rejected";
  isOnline: boolean;
  dutyStartTime?: string;
  rating: number;
  totalRides: number;
  earningsToday: number;
  totalEarnings: number;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  documentExpiryAlerts?: DocumentExpiryAlert[];
}

export interface RideOffer {
  bookingId: string;
  _id: string;
  serviceType: string;
  pickup: { address: string; landmark?: string; lat?: number; lng?: number };
  destination: { address: string; landmark?: string; lat?: number; lng?: number };
  distanceKm: number;
  fare: {
    baseFare: number;
    distanceFare: number;
    surgeMultiplier: number;
    tax?: number;
    totalFare: number;
  };
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  secondsRemaining: number;
}

export const driverApi = {
  async register(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    vehicleType: string;
    vehicleNumber: string;
    vehicleModel?: string;
    seatingCapacity?: number;
    licenseNumber: string;
    licenseExpiryDate?: string;
    licenseDocUrl?: string;
    aadhaarNumber?: string;
    aadhaarDocUrl?: string;
    rcNumber?: string;
    rcDocUrl?: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: string;
    permitNumber?: string;
    permitExpiryDate?: string;
    photoUrl?: string;
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      upiId?: string;
    };
  }): Promise<{ success: boolean; message: string; driver: DriverProfile }> {
    const res = await fetch("/api/driver/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Driver registration failed.");
    }
    return result;
  },

  async login(phone: string, password: string): Promise<{ success: boolean; token: string; driver: DriverProfile }> {
    const res = await fetch("/api/driver/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Login failed. Check your phone and password.");
    }
    return result;
  },

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
    const res = await fetch("/api/driver/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to send OTP.");
    }
    return result;
  },

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; token: string; driver: DriverProfile }> {
    const res = await fetch("/api/driver/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "OTP verification failed.");
    }
    return result;
  },

  async getMe(token: string): Promise<{ driver: DriverProfile; activeRide?: any }> {
    const res = await fetch("/api/driver/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to load driver profile.");
    }
    return result;
  },

  async updateProfile(data: any, token: string): Promise<{ success: boolean; driver: DriverProfile }> {
    const res = await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to update profile.");
    }
    return result;
  },

  async updateStatus(isOnline: boolean, token: string): Promise<{ isOnline: boolean; message: string }> {
    const res = await fetch("/api/driver/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isOnline }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to update online status.");
    }
    return result;
  },

  async updateLocation(lat: number, lng: number, token: string): Promise<void> {
    const res = await fetch("/api/driver/location", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lng }),
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result.error || "Failed to update location.");
    }
  },

  async getOffers(token: string): Promise<{ hasOffer: boolean; offer: RideOffer | null; activeRide?: any; secondsRemaining: number }> {
    const res = await fetch("/api/driver/offers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { hasOffer: false, offer: null, secondsRemaining: 0 };
    }
    return await res.json();
  },

  async acceptRide(rideId: string, token: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to accept ride offer.");
    }
    return result.ride;
  },

  async rejectRide(rideId: string, token: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to decline ride offer.");
    }
    return result;
  },

  async markArrived(rideId: string, token: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/arrived`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to mark arrival.");
    }
    return result.ride;
  },

  async startRide(rideId: string, otp: string, token: string, lat?: number, lng?: number): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp, lat, lng }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to start ride with OTP.");
    }
    return result.ride;
  },

  async completeRide(rideId: string, token: string, actualDistanceKm?: number, actualDurationMinutes?: number): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ actualDistanceKm, actualDurationMinutes }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to complete trip.");
    }
    return result;
  },

  async cancelRide(rideId: string, reason: string, token: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to cancel ride.");
    }
    return result;
  },

  async triggerSos(rideId: string, token: string, lat?: number, lng?: number, notes?: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/sos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lng, notes }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to trigger SOS.");
    }
    return result;
  },

  async reportAccident(rideId: string, severity: string, description: string, token: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/accident`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ severity, description }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to file accident report.");
    }
    return result;
  },

  async ratePassenger(rideId: string, rating: number, feedback?: string, tags?: string[], token?: string): Promise<any> {
    const res = await fetch(`/api/driver/rides/${rideId}/rate-passenger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ rating, feedback, tags }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to rate passenger.");
    }
    return result;
  },

  async getHistory(token: string): Promise<any[]> {
    const res = await fetch("/api/driver/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.rides || [];
  },
};
