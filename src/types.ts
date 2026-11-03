/**
 * Types & Interfaces for Alike-ND E-Commerce Platform
 */

export interface Product {
  id: number;
  _id?: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  reviewsCount: number;
  stock?: number;
  stockStatus?: string;
  image: string;
  images?: string[];
  category: string;
  subCategory?: string;
  audience?: 'men' | 'women' | 'boys' | 'girls' | 'kids' | 'unisex' | string;
  eligibleFor20MinDelivery?: boolean;
  badge?: 'SALE' | 'HOT' | 'NEW' | 'TRENDING' | 'LIMITED' | string;
  isFlashSale?: boolean;
  flashEndsAt?: string;
  description: string;
  specifications: Record<string, string>;
  isWholesale?: boolean;
  wholesaleMinQty?: number;
  wholesalePrice?: number;
  colors?: string[];
  sizes?: string[];
  emoji?: string;
  sellerId?: string;
  sellerShopName?: string;
<<<<<<< HEAD
  sellerVerified?: boolean;
=======
<<<<<<< HEAD
  sellerVerified?: boolean;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  hsnCode?: string;
  gstRate?: number;
  countryOfOrigin?: string;
  manufacturerDetails?: string;
  packInfo?: string;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  isHidden?: boolean;
  isPublished?: boolean;
  isVisible?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected' | 'archived' | string;
  moderationStatus?: 'approved' | 'pending' | 'rejected' | 'archived' | string;
  rejectionReason?: string;
  moderationNote?: string;
  deliveryCharge?: number;
  sku?: string;
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  packageWeightKg?: number;
  packageLengthCm?: number;
  packageWidthCm?: number;
  packageHeightCm?: number;
  localizedName?: string;
  nestedCategory?: string;
  productType?: 'physical' | 'digital' | 'service' | string;
  condition?: 'new' | 'used' | 'refurbished' | string;
  modelNumber?: string;
  internalProductId?: string;
  internalSearchTags?: string[];
  projectReference?: string;
  seoKeywords?: string[];
  whiteBgImage?: string;
  promoBannerImage?: string;
  costPrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  minOrderQty?: number;
  maxOrderQty?: number;
  bundleInfo?: string;
  lowStockThreshold?: number;
  variants?: Array<{
    id: string;
    name: string;
    options: Record<string, string>;
    sku: string;
    price: number;
    specialPrice?: number;
    stock: number;
    lowStockThreshold?: number;
    available: boolean;
    image?: string;
    barcode?: string;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  }>;
  variantOptionGroups?: Array<{
    name: string;
    values: string[];
  }>;
  customSpecifications?: Array<{
    id: string;
    key: string;
    value: string;
    fieldType: 'text' | 'number' | 'dropdown' | 'checkbox' | 'multi-select' | string;
    options?: string[];
    required?: boolean;
  }>;
  highlights?: string[];
  benefitsUseCases?: string;
  technicalSummary?: string;
  whatsInTheBox?: string;
  careInstructions?: string;
  comparisonTable?: Array<{
    feature: string;
    thisProduct: string;
    standardProduct: string;
  }>;
  manualUrl?: string;
  badgesConfig?: {
    fastDelivery?: boolean;
    flashSale?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    featuredProduct?: boolean;
    verifiedSeller?: boolean;
    limitedStock?: boolean;
  };
  flashSaleConfig?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    discountType?: 'percentage' | 'flat' | string;
    discountValue?: number;
    stockLimit?: number;
  };
  shippingConfig?: {
    unit?: 'cm_kg' | 'in_lb' | string;
    volumetricWeightKg?: number;
    chargeMode?: 'auto' | 'manual' | string;
    customShippingFee?: number;
    chargeScope?: 'per_order' | 'per_product' | 'per_quantity' | string;
    freeShipping?: boolean;
    handlingTimeDays?: string;
    estimatedDeliveryRange?: string;
    shippingRestrictions?: string;
    returnEligible?: boolean;
    returnWindowDays?: number;
    dangerousGoods?: 'none' | 'battery' | 'flammable' | 'liquid' | 'fragile' | string;
  };
  warrantyConfig?: {
    warrantyType?: 'manufacturer' | 'seller' | 'no_warranty' | string;
    warrantyDuration?: string;
    warrantyTerms?: string;
  };
  fulfilmentConfig?: {
    fulfilmentMethod?: 'seller_fulfilled' | 'platform_fulfilled' | string;
    warehouseId?: string;
    warehouseName?: string;
    dispatchPrepHours?: number;
    pickupOriginAddress?: string;
    handlingInstructions?: string;
    sellerSku?: string;
    returnDestinationAddress?: string;
  };
  inventoryHistory?: Array<{
    id: string;
    timestamp: string;
    adjustment: number;
    previousStock: number;
    newStock: number;
    reason: string;
    actor: string;
  }>;
  isDraft?: boolean;
  contentScore?: number;
  lastDraftSavedAt?: string;
  distanceKm?: number;
  quickDelivery?: boolean;
  etaMin?: number;
  etaMax?: number;
  deliveryEtaText?: string;
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
}

export interface CategoryItem {
  id: string;
  label: string;
  labelBn?: string;
  icon: string;
  image?: string;
  badge?: {
    text: string;
    color: string;
  };
  eligibleFor20MinDelivery?: boolean;
  subCategories?: string[];
}

export interface DynamicCategory {
  _id: string;
  id?: string;
  titleEn: string;
  titleBn: string;
  imageUrl: string;
  badgeText?: string;
  badgeColor?: string;
  redirectUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
export type SellerVerificationStatus =
  | 'not_submitted'
  | 'pending_admin_review'
  | 'under_review'
  | 'resubmission_required'
  | 'approved'
  | 'rejected';

export interface SellerIdentityVerification {
  status: SellerVerificationStatus;
  verifiedBadge: boolean;
  nidNumber?: string;
  nidFullName?: string;
  nidDateOfBirth?: string;
  nidAddress?: string;
  nidFrontImage?: string;
  nidBackImage?: string;
  facePhotoImage?: string;
  consentGiven?: boolean;
  consentTimestamp?: string | Date;
  consentPolicyVersion?: string;
  submittedAt?: string | Date;
  reviewedAt?: string | Date;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedByAdminEmail?: string;
  decisionReason?: string;
  retentionExpiresAt?: string | Date;
  history?: Array<{
    status: SellerVerificationStatus;
    action: string;
    note?: string;
    actedBy: string;
    actedByAdminId?: string;
    createdAt: string | Date;
  }>;
}

export interface SellerNotificationEntry {
  id: string;
  type: 'verification' | 'account' | 'order' | 'payout' | 'system';
  title: string;
  message: string;
  status?: string;
  read: boolean;
  createdAt: string | Date;
}

export interface SellerCoupon {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string | Date;
}

export interface SellerBundleOffer {
  id: string;
  title: string;
  minQty: number;
  discountPercent: number;
  isActive: boolean;
  createdAt: string | Date;
}

export interface SellerWarehouseNode {
  id: string;
  warehouseCode?: string;
  name: string;
  contactPerson?: string;
  countryCode?: string;
  phone?: string;
  contactPhone: string;
  email?: string;
  countryRegion?: string;
  city: string;
  address: string;
  addressLine?: string;
  pincode: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  mapPinLabel?: string;
  isPrimary: boolean;
  isDefaultPickup?: boolean;
  isReturnAddress?: boolean;
  holidayMode?: boolean;
  holidayStartDate?: string;
  holidayEndDate?: string;
  holidayDateStatus?: string;
}

export interface SellerStaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Store Manager' | 'Catalog Editor' | 'Order Fulfillment' | 'Finance Viewer';
  status: 'active' | 'invited' | 'revoked';
  invitedAt: string | Date;
}

export interface SellerReviewReply {
  id: string;
  productId: string;
  productName?: string;
  reviewerName: string;
  replyText: string;
  createdAt: string | Date;
}

export interface SellerCampaignNomination {
  id: string;
  campaignName: string;
  campaignType: 'campaign' | 'flash_deal' | 'featured_product';
  productId: string;
  productName: string;
  proposedPrice: number;
  mrp: number;
  status: 'pending_admin_approval' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string | Date;
}

export interface SellerStoreDecoration {
  heroHeadline?: string;
  heroSubtext?: string;
  highlightColor?: string;
  themeColor?: string;
  announcementText?: string;
  featuredHeadline?: string;
  layoutStyle?: 'editorial' | 'grid' | 'boutique' | 'luxury_grid' | 'minimal_editorial' | 'boutique_showcase';
  showVerifiedBanner?: boolean;
  showVerifiedHighlight?: boolean;
}

export interface SellerNotificationPreferences {
  orderAlerts: boolean;
  payoutAlerts: boolean;
  verificationAlerts: boolean;
  lowStockAlerts: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
export interface SellerProfile {
  _id: string;
  shopName: string;
  storefront?: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  businessAddress: string;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  shopAddress?: string;
  category?: string;
  logo?: string;
  bannerUrl?: string;
  tagline?: string;
  storeDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  freeShippingThreshold?: number;
  fulfillmentMode?: 'seller_managed' | 'marketplace_fulfilled';
  affiliateEnabled?: boolean;
  affiliateCommissionRate?: number;
  commissionRate?: number;
  rating?: number;
  storeDecoration?: SellerStoreDecoration;
  shippingPolicy?: string;
  returnPolicyText?: string;
  coupons?: SellerCoupon[];
  bundleOffers?: SellerBundleOffer[];
  campaignNominations?: SellerCampaignNomination[];
  warehouses?: SellerWarehouseNode[];
  staffMembers?: SellerStaffMember[];
  reviewReplies?: SellerReviewReply[];
  closureRequest?: {
    requested: boolean;
    reason?: string;
    requestedAt?: string | Date;
    status?: 'pending_admin_review' | 'approved' | 'rejected';
  };
  notificationPreferences?: SellerNotificationPreferences;
  location?: {
    type: string;
    coordinates: [number, number];
  } | null;
  isOpen?: boolean;
  quickDeliveryEnabled?: boolean;
  prepTimeMin?: number;
  deliveryRadiusKm?: number;
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  panNumber?: string;
  gstin?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  bankName?: string;
  kycVerified?: boolean;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  emailVerified?: boolean;
  verificationStatus?: SellerVerificationStatus;
  verifiedBadge?: boolean;
  identityVerification?: SellerIdentityVerification;
  notifications?: SellerNotificationEntry[];
  agreedToTerms?: boolean;
  permissions?: {
    canAddProducts: boolean;
    canEditProducts: boolean;
    canManageOrders: boolean;
    canWithdrawPayouts: boolean;
    canMakeNewSales?: boolean;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'review';
  storeStatus?: 'active' | 'temporarily_disabled' | 'closed';
  storePolicy?: string;
  rejectionReason?: string;
  infoRequestMessage?: string;
  listingsCount?: number;
  walletBalance?: number;
  totalEarnings?: number;
  pendingWithdrawals?: number;
  lastLoginAt?: string | Date;
  lastPasswordResetAt?: string | Date;
  createdAt?: string | Date;
<<<<<<< HEAD
=======
=======
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'review';
  listingsCount?: number;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Remote';
  logo: string;
  description: string;
  requirements: string[];
  category?: string;
  dateAdded?: string;
  shortDesc?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  delivery: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  address: Address;
  paymentMethod: string;
  trackingStep: number; // 1: Order Placed, 2: Processing, 3: Shipped, 4: Delivered
  memberEmail?: string;
  userId?: string;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  deliveryLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  deliveryType?: 'quick' | 'standard';
  deliveryEtaText?: string;
  liveTracking?: {
    customer?: { lat: number; lng: number; accuracy?: number; updatedAt: string | Date; sharing: boolean };
    seller?: { lat: number; lng: number; updatedAt: string | Date; sharing: boolean };
  };
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  attachment?: {
    name: string;
    url: string;
  };
  image?: string;
  isSending?: boolean;
  isDelivered?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  replyToText?: string;
  replyToSender?: 'user' | 'contact';
  isStarred?: boolean;
  isVoice?: boolean;
  voiceDuration?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  reactions?: { emoji: string; }[];
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
  isBlocked?: boolean;
  isMuted?: boolean;
}

export interface Notification {
  id: string | number;
  type: 'order' | 'promotion' | 'system' | 'shipping' | 'promo' | 'warning' | 'security' | 'message';
  title: string;
  description?: string;
  message?: string;
  timestamp: string;
  isRead?: boolean;
  isUnread?: boolean;
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  mobileNumber?: string;
  tier?: 'Silver' | 'Gold' | 'Platinum' | string;
  avatar?: string;
}

export interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  link?: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  isActive?: boolean;
  isCenterFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ALIKE ND Rides (Passenger Ride Booking System inspired by Ola / Uber)
// ---------------------------------------------------------------------
export type RideServiceType =
  | 'bike'
  | 'auto'
  | 'cab'
  | 'car_mini'
  | 'car_sedan'
  | 'car_suv'
  | 'car_premium'
  | 'car_xl'
  | 'car_green';

export type RideStatus =
  | 'requested'
  | 'searching'
  | 'driver_assigned'
  | 'accepted'
  | 'arriving'
  | 'arrived'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_driver_found'
  | 'driver_unavailable'
  | 'passenger_no_show'
  | 'payment_pending'
  | 'payment_completed'
  | 'support_required';

export interface FareEstimate {
  serviceType: RideServiceType;
  name: string;
  category: string;
  capacity: number;
  description: string;
  icon: string;
  badge?: string;
  enabled?: boolean;
  distanceKm: number;
  estimatedDurationMin: number;
  etaArrivalMin: number;
  fare: {
    baseFare: number;
    distanceFare: number;
    timeFare?: number;
    waitingFare?: number;
    surgeMultiplier: number;
    tollCharges?: number;
    airportCharges?: number;
    discountAmount?: number;
    promoCodeApplied?: string;
    tax: number;
    safetyFee?: number;
    totalFare: number;
    driverEarnings?: number;
    platformCommission?: number;
  };
}

export interface RideDriver {
  driverId: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleType?: string;
  rating: number;
  totalRides: number;
  lat?: number;
  lng?: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface SavedRidePlace {
  placeId: string;
  label: 'home' | 'work' | 'airport' | 'metro' | 'favorite' | 'other';
  customName: string;
  address: string;
  landmark?: string;
  lat: number;
  lng: number;
}

export interface DigitalReceipt {
  invoiceNumber: string;
  bookingId: string;
  date: string | Date;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  driver: {
    name: string;
    vehicleNumber: string;
    vehicleModel: string;
    serviceType: string;
  };
  trip: {
    pickup: string;
    destination: string;
    distanceKm: number;
    durationMinutes: number;
    waitingMinutes: number;
  };
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    waitingFare: number;
    surgeMultiplier: number;
    tollCharges: number;
    airportCharges: number;
    discountAmount: number;
    promoCode?: string;
    gstRate: string;
    gstAmount: number;
    safetyFee: number;
    totalFare: number;
  };
  payment: {
    method: string;
    status: string;
    reference?: string;
    paidAt?: string | Date;
  };
  platform: {
    name: string;
    gstin: string;
    supportHelpline: string;
    website: string;
  };
}

export interface RideBooking {
  _id?: string;
  bookingId: string;
  invoiceNumber?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: RideServiceType;
  pickup: {
    address: string;
    landmark?: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    landmark?: string;
    lat: number;
    lng: number;
  };
  distanceKm: number;
  actualDistanceKm?: number;
  estimatedDurationMin: number;
  actualDurationMin?: number;
  waitingMinutes?: number;
  isScheduled?: boolean;
  scheduledFor?: string | Date;
  fare: {
    baseFare: number;
    distanceFare: number;
    timeFare?: number;
    waitingFare?: number;
    surgeMultiplier: number;
    tollCharges?: number;
    airportCharges?: number;
    discountAmount?: number;
    promoCode?: string;
    tax: number;
    totalFare: number;
    driverEarnings?: number;
    platformCommission?: number;
  };
  status: RideStatus;
  rideOtp: string; // 4-digit passenger OTP
  driver?: RideDriver;
  paymentMethod: 'cash' | 'wallet' | 'upi' | 'card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  upiReference?: string;
  paidAt?: string | Date;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'driver' | 'system';
  passengerNoShowTime?: string | Date;
  rating?: number;
  feedback?: string;
  dispute?: {
    status: 'none' | 'submitted' | 'under_review' | 'resolved' | 'rejected';
    reason: string;
    claimedRefund: number;
    actualRefund?: number;
    notes?: string;
    submittedAt?: string | Date;
    resolvedAt?: string | Date;
  };
  supportTicket?: {
    id: string;
    issue: string;
    status: 'open' | 'resolved';
    createdAt: string | Date;
  };
  shareableTripToken?: string;
  sosAlert?: {
    active: boolean;
    triggeredBy?: 'customer' | 'driver';
    triggeredAt?: string | Date;
    location?: { lat: number; lng: number };
    resolved?: boolean;
    resolvedAt?: string | Date;
    notes?: string;
  };
  complaint?: {
    category?: string;
    details?: string;
    submittedAt?: string | Date;
  };
  lostItemReport?: {
    category?: string;
    description?: string;
    contactPhone?: string;
    reportedAt?: string | Date;
    status?: 'reported' | 'found' | 'returned' | 'closed';
  };
  accidentReport?: {
    type?: string;
    description?: string;
    reportedAt?: string | Date;
  };
  passengerRating?: {
    score: number;
    feedback?: string;
    ratedAt?: string | Date;
  };
  driverRating?: {
    score: number;
    feedback?: string;
    ratedAt?: string | Date;
  };
  startedAt?: string | Date;
  arrivedAt?: string | Date;
  completedAt?: string | Date;
  createdAt: string | Date;
}

// ---------------------------------------------------------------------
// ALIKE ND Delivery Hub (Quick Delivery, Food & Store Orders inspired by Blinkit / Swiggy)
// ---------------------------------------------------------------------
export type DeliveryServiceType =
  | 'quick_delivery'
  | 'normal_delivery'
  | 'food_delivery'
  | 'nearby_store'
  | 'wholesale';

export type DeliveryTaskStatus =
  | 'order_placed'
  | 'store_accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'partner_assigned'
  | 'arrived_at_store'
  | 'picked_up'
  | 'out_for_delivery'
  | 'arrived_at_customer'
  | 'delivered'
  | 'order_cancelled'
  | 'pickup_failed'
  | 'customer_unavailable'
  | 'delivery_failed'
  | 'return_initiated'
  | 'returned_to_store'
  // Legacy compatibility aliases
  | 'store_packing'
  | 'pickup_pending'
  | 'arriving_soon'
  | 'cancelled';

export interface DeliveryPartner {
  partnerId: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  vehicleNumber?: string;
  rating: number;
  completedDeliveries: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryTask {
  _id?: string;
  taskId: string;
  orderNumber?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: DeliveryServiceType;
  store: {
    storeId?: string;
    name: string;
    address: string;
    phone?: string;
    category?: string;
  };
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    landmark?: string;
  };
  itemsSummary: string;
  itemCount: number;
  totalAmount: number;
  deliveryFee: number;
  estimatedMinutes: number;
  status: DeliveryTaskStatus;
  pickupCode: string; // Unique store pickup verification code
  pickupVerified?: boolean;
  pickupVerifiedAt?: string | Date;
  deliveryOtp: string; // 4-digit doorstep delivery OTP
  deliveryOtpVerified?: boolean;
  deliveryVerifiedAt?: string | Date;
  deliveryPartner?: DeliveryPartner;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'cash_on_delivery';
  timeline: Array<{
    status: DeliveryTaskStatus;
    timestamp: string | Date;
    description: string;
  }>;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  packageDetails?: {
    weightKg?: number;
    packageType?: string;
    requiresVan?: boolean;
    dimensions?: string;
  };
  pickupAttempts?: number;
  deliveryOtpAttempts?: number;
  pickupNotes?: string;
  pickupPhoto?: string;
  deliveryNotes?: string;
  deliveryPhotoProof?: string;
  failureReason?: string;
  createdAt: string | Date;
}


<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
