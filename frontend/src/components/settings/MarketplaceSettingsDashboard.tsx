import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  Building2,
  Store,
  Settings,
  Landmark,
  Percent,
  History,
  Wallet,
  Receipt,
  FileText,
  MapPin,
  Truck,
  Package,
  DollarSign,
  Scale,
  Hash,
  Users,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  MessageSquare,
  Bot,
  BellRing,
  Tag,
  Headphones,
  Bell,
  Smartphone,
  Globe,
  Shield,
  Activity,
  Scale as LegalScale,
  FileCheck,
  HelpCircle,
  LifeBuoy,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  LockKeyhole,
  Sliders,
  Sparkles,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  SellerBankDirectorySelector,
  AdminGlobalBankDirectoryManager
} from './GlobalBankDirectoryWorkspace';
import { DarazWarehousePickupManager } from '../seller/DarazWarehousePickupManager';
import { DarazDeliveryServiceManager } from '../seller/DarazDeliveryServiceManager';
import { DarazShippingProviderManager } from '../seller/DarazShippingProviderManager';
import { DarazInvoiceNumberManager } from '../seller/DarazInvoiceNumberManager';
import { DarazUserManagementManager } from '../seller/DarazUserManagementManager';
import { DarazChatSettingsManager } from '../seller/DarazChatSettingsManager';
import { DarazStoreBuilderManager } from '../seller/DarazStoreBuilderManager';

export interface MarketplaceSettingsDashboardProps {
  mode: 'admin' | 'seller';
  token?: string | null;
  initialCategory?: string;
  initialCardId?: string | null;
  onRefreshParent?: () => void;
}

type CategoryId =
  | 'all'
  | 'business'
  | 'finance'
  | 'logistics'
  | 'users'
  | 'chat'
  | 'system'
  | 'other';

interface SettingsCardDefinition {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  title: string;
  sellerSubtitle: string;
  adminSubtitle: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  sensitive?: boolean;
  adminOnlyBadge?: string;
  badgeText?: (hub: any, mode: 'admin' | 'seller', finance?: any) => string | null;
}

const CATEGORIES: Array<{
  id: CategoryId;
  label: string;
  bnLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}> = [
  {
    id: 'all',
    label: 'All Settings',
    bnLabel: 'সকল সেটিংস',
    description: 'Complete overview of all 7 marketplace configuration domains',
    icon: Sliders
  },
  {
    id: 'business',
    label: 'Business Information',
    bnLabel: 'ব্যবসায়িক তথ্য',
    description: 'Profile identity, legal registration, store branding & holiday mode',
    icon: Building2
  },
  {
    id: 'finance',
    label: 'Finance',
    bnLabel: 'ফাইন্যান্স ও ব্যাংকিং',
    description: 'Bank accounts, commissions, settlements, payouts, ledgers & tax',
    icon: Landmark
  },
  {
    id: 'logistics',
    label: 'Logistics',
    bnLabel: 'লজিস্টিকস ও শিপিং',
    description: 'Warehouses, pickup addresses, couriers, shipping rates & invoices',
    icon: Truck
  },
  {
    id: 'users',
    label: 'User Management',
    bnLabel: 'ইউজার ও অ্যাক্সেস',
    description: 'Sub-accounts, role permissions, security, 2FA & password controls',
    icon: Users
  },
  {
    id: 'chat',
    label: 'Chat',
    bnLabel: 'চ্যাট ও মেসেজিং',
    description: 'Quick replies, auto-responders, keyword tags & SLA routing',
    icon: MessageSquare
  },
  {
    id: 'system',
    label: 'System',
    bnLabel: 'সিস্টেম ও নোটিফিকেশন',
    description: 'Alerts, SMS/Email triggers, language, privacy & login audit logs',
    icon: Settings
  },
  {
    id: 'other',
    label: 'Other',
    bnLabel: 'অন্যান্য ও সহায়তা',
    description: 'IP protection, store policies, knowledge base & support desk',
    icon: LifeBuoy
  }
];

const SETTINGS_CARDS: SettingsCardDefinition[] = [
  // 1. Business Information
  {
    id: 'seller_profile',
    category: 'business',
    title: 'Seller Profile',
    sellerSubtitle: 'Seller ID, First/Last Name, Display Name, Shop Logo, Contact Details & Holiday Mode',
    adminSubtitle: 'Configure platform administrator profile, organization title, and primary contact',
    icon: User,
    badgeText: (hub) => {
      if (hub?.seller_profile?.approvalStatus === 'pending_admin_review') return 'Pending Review';
      const display = hub?.seller_profile?.displayName || hub?.seller_profile?.shopName || hub?.seller_profile?.ownerName;
      if (display) return String(display).slice(0, 20);
      const rawId = String(hub?.seller_profile?.sellerId || '');
      if (!rawId) return 'Active Profile';
      return rawId.length > 14 ? `${rawId.slice(0, 12)}…` : rawId;
    }
  },
  {
    id: 'business_information',
    category: 'business',
    title: 'Business Information',
    sellerSubtitle: 'Seller Type, Legal Entity, Registration No., NID Front/Back Uploads & Verification Status',
    adminSubtitle: 'Platform legal entity registration, corporate tax IDs, and headquarters address',
    icon: Building2,
    badgeText: (hub) => {
      const st = hub?.business_information?.verificationStatus;
      if (st === 'approved') return 'Verified';
      if (st === 'pending_admin_review' || st === 'pending') return 'Pending Review';
      if (st === 'under_verification') return 'Under Verification';
      if (st === 'rejected') return 'Rejected';
      if (st === 'resubmission_required') return 'More Info Needed';
      if (st === 'draft') return 'Draft';
      return hub?.business_information?.sellerType || hub?.business_information?.businessType || 'Not Submitted';
    }
  },
  {
    id: 'store_information',
    category: 'business',
    title: 'Store Information',
    sellerSubtitle: 'Storefront title, tagline, logo, banner, return policy, and support hours',
    adminSubtitle: 'Marketplace brand identity, global tagline, customer support hours, and return SLA',
    icon: Store,
    badgeText: (hub) => hub?.store_information?.shopName || hub?.store_information?.marketplaceName || null
  },
  {
    id: 'account_settings',
    category: 'business',
    title: 'Account Settings',
    sellerSubtitle: 'Login Email & Phone (OTP Protected), Masked Password, 2FA, Active Sessions & Holiday Mode',
    adminSubtitle: 'Admin Login Email & Phone (OTP), Password, Active Sessions, and Order Rules',
    icon: Settings,
    badgeText: (hub) =>
      hub?.account_settings?.holidayMode || hub?.seller_profile?.holidayMode
        ? 'Holiday Mode ON'
        : 'Active'
  },
  {
    id: 'seller_verification_desk',
    category: 'business',
    title: 'Seller Verification & Profile Review',
    sellerSubtitle: 'Track your verification progress and submitted profile change requests',
    adminSubtitle: 'Review seller NID documents, compare Previous vs Proposed values, Approve/Reject & set rules',
    icon: ShieldCheck,
    adminOnlyBadge: 'Admin Governance',
    badgeText: (hub, mode) => {
      if (mode === 'admin') return 'Review Desk';
      const st = hub?.business_information?.verificationStatus;
      if (st === 'approved') return 'Verified';
      if (st === 'pending_admin_review' || st === 'pending') return 'Pending Review';
      return 'Status & Review';
    }
  },

  // 2. Finance
  {
    id: 'bank_account',
    category: 'finance',
    title: 'Bank Account',
    sellerSubtitle: 'Search 500+ verified global banks & MFS providers, link account/wallet & routing (Masked)',
    adminSubtitle: 'Platform escrow & settlement bank account, routing details, and treasury configuration',
    icon: Landmark,
    sensitive: true,
    badgeText: (hub) => hub?.bank_account?.maskedAccountNumber || 'Not Configured'
  },
  {
    id: 'global_bank_directory',
    category: 'finance',
    title: 'Global Bank & MFS Directory',
    sellerSubtitle: 'Browse 500+ verified global banks, MFS & payment providers with payout-eligibility status',
    adminSubtitle: 'Manage 500+ verified banks & MFS records, toggle payout eligibility, verify & import CSV/JSON',
    icon: Globe,
    adminOnlyBadge: '500+ Verified',
    badgeText: () => '594 Institutions'
  },
  {
    id: 'commission_settings',
    category: 'finance',
    title: 'Commission Settings',
    sellerSubtitle: 'View your active marketplace commission tier, settlement cycle, and fee structure',
    adminSubtitle: 'Configure global default commission %, tax deductions, and minimum withdrawal limits',
    icon: Percent,
    badgeText: (hub, _mode, finance) =>
      `${hub?.commission_settings?.commissionRate ?? hub?.commission_settings?.defaultCommissionRate ?? finance?.commissionRate ?? 10}% Fee`
  },
  {
    id: 'payment_settlement_history',
    category: 'finance',
    title: 'Payment and Settlement History',
    sellerSubtitle: 'Track completed payout cycles, bank settlement references, and payout status',
    adminSubtitle: 'Audit platform-wide seller settlements, disbursement batches, and payout status',
    icon: History,
    badgeText: (_hub, _mode, finance) =>
      Array.isArray(finance?.withdrawals) ? `${finance.withdrawals.length} Records` : null
  },
  {
    id: 'earnings_payouts',
    category: 'finance',
    title: 'Earnings and Payouts',
    sellerSubtitle: 'View available wallet balance, lifetime earnings, and submit withdrawal requests',
    adminSubtitle: 'Monitor platform GMV, total commission revenue, and pending seller payouts',
    icon: Wallet,
    badgeText: (_hub, mode, finance) =>
      mode === 'seller'
        ? `₹${Number(finance?.walletBalance || 0).toLocaleString()}`
        : `GMV ₹${Number(finance?.totalGMV || 0).toLocaleString()}`
  },
  {
    id: 'transaction_history',
    category: 'finance',
    title: 'Transaction History',
    sellerSubtitle: 'Detailed ledger of order credits, commission deductions, and wallet withdrawals',
    adminSubtitle: 'Platform-wide financial transaction ledger across orders and seller settlements',
    icon: Receipt,
    badgeText: (_hub, _mode, finance) =>
      Array.isArray(finance?.transactions) ? `${finance.transactions.length} Entries` : null
  },
  {
    id: 'tax_invoice_info',
    category: 'finance',
    title: 'Tax and Invoice Information',
    sellerSubtitle: 'VAT/GST rate, HSN/SAC default code, tax registration ID, and invoice signature',
    adminSubtitle: 'Global tax compliance rules, default VAT/GST %, and tax invoice legal footer',
    icon: FileText,
    badgeText: (hub) =>
      hub?.tax_invoice_info?.taxRate !== undefined ? `${hub.tax_invoice_info.taxRate}% Tax` : null
  },

  // 3. Logistics
  {
    id: 'warehouse_pickup',
    category: 'logistics',
    title: 'Warehouse and Pickup Address',
    sellerSubtitle: 'Manage pickup hubs, return warehouses, contact persons, and operating slots',
    adminSubtitle: 'Configure central fulfillment hubs, regional sorting centers, and return depots',
    icon: MapPin,
    badgeText: (hub) =>
      Array.isArray(hub?.warehouse_pickup?.warehouses)
        ? `${hub.warehouse_pickup.warehouses.length} Hub(s)`
        : null
  },
  {
    id: 'delivery_service',
    category: 'logistics',
    title: 'Delivery Service',
    sellerSubtitle: 'Enable Standard, Express, Same-Day, and Cash on Delivery (COD) fulfillment options',
    adminSubtitle: 'Control platform-wide delivery tiers, SLA cutoffs, and COD availability',
    icon: Truck,
    badgeText: (hub) => (hub?.delivery_service?.expressDelivery ? 'Standard + Express' : 'Standard')
  },
  {
    id: 'shipping_provider',
    category: 'logistics',
    title: 'Shipping Provider',
    sellerSubtitle: 'Select preferred courier partners (Pathao, Steadfast, RedX, Sundarban, DHL)',
    adminSubtitle: 'Manage integrated 3PL logistics providers, SLA windows, and COD capabilities',
    icon: Package,
    badgeText: (hub) => {
      const active = (hub?.shipping_provider?.providers || []).filter((p: any) => p.enabled).length;
      return active ? `${active} Active` : null;
    }
  },
  {
    id: 'shipping_charge_settings',
    category: 'logistics',
    title: 'Shipping Charge Settings',
    sellerSubtitle: 'Set inside-city, outside-city, free shipping threshold, and extra weight surcharges',
    adminSubtitle: 'Configure global base delivery charges, regional tariffs, and free shipping rules',
    icon: DollarSign,
    badgeText: (hub) =>
      hub?.shipping_charge_settings?.insideCityRate !== undefined
        ? `Base ₹${hub.shipping_charge_settings.insideCityRate}`
        : null
  },
  {
    id: 'package_weight_dimensions',
    category: 'logistics',
    title: 'Package Weight and Dimensions',
    sellerSubtitle: 'Default parcel weight, L×W×H dimensions, volumetric divisor, and packaging type',
    adminSubtitle: 'Standardize volumetric divisor, maximum parcel weight limits, and packaging norms',
    icon: Scale,
    badgeText: (hub) =>
      hub?.package_weight_dimensions?.defaultWeightKg
        ? `${hub.package_weight_dimensions.defaultWeightKg} kg Default`
        : null
  },
  {
    id: 'invoice_number_settings',
    category: 'logistics',
    title: 'Invoice Number Settings',
    sellerSubtitle: 'Configure Invoice Generate Type (Autoincrement, Order Number, Manual) and Invoice Address',
    adminSubtitle: 'Configure master platform invoice numbering scheme, fiscal year tag, and QR stamps',
    icon: Hash,
    badgeText: (hub) => hub?.invoice_number_settings?.generateType || 'Provide number manually'
  },

  // 4. User Management
  {
    id: 'manage_users',
    category: 'users',
    title: 'Manage Users / Sub-Accounts',
    sellerSubtitle: 'Invite store staff, catalog managers, and finance operators with scoped access',
    adminSubtitle: 'Manage platform operations staff, compliance auditors, and support sub-accounts',
    icon: Users,
    badgeText: (hub) =>
      Array.isArray(hub?.manage_users?.subAccounts)
        ? `${hub.manage_users.subAccounts.length} Member(s)`
        : null
  },
  {
    id: 'roles_permissions',
    category: 'users',
    title: 'Manage Roles and Permissions',
    sellerSubtitle: 'Configure granular RBAC permissions for Store Manager, Catalog, Order & Finance roles',
    adminSubtitle: 'Define RBAC capability matrix for Super Admin, Moderator, Auditor, and Support',
    icon: ShieldCheck,
    badgeText: (hub) =>
      Array.isArray(hub?.roles_permissions?.roles)
        ? `${hub.roles_permissions.roles.length} Roles`
        : null
  },
  {
    id: 'login_security',
    category: 'users',
    title: 'Login and Security Settings',
    sellerSubtitle: 'Two-factor authentication (2FA), session timeout, and unrecognized device alerts',
    adminSubtitle: 'Enforce admin 2FA, session expiration policy, and IP/device security controls',
    icon: Lock,
    badgeText: (hub) => (hub?.login_security?.twoFactorEnabled ? '2FA Enabled' : 'Standard Auth')
  },
  {
    id: 'email_mobile',
    category: 'users',
    title: 'Email and Mobile Number Management',
    sellerSubtitle: 'Update primary login email, verified mobile number, and recovery contact',
    adminSubtitle: 'Manage primary admin alert email, emergency phone number, and recovery channels',
    icon: Mail,
    sensitive: true,
    badgeText: (hub) => hub?.email_mobile?.primaryEmail || null
  },
  {
    id: 'password_change',
    category: 'users',
    title: 'Password Change and Reset',
    sellerSubtitle: 'Update your account password with current credential verification',
    adminSubtitle: 'Rotate administrator password and manage security credential policy',
    icon: KeyRound,
    sensitive: true,
    badgeText: () => 'Protected'
  },

  // 5. Chat
  {
    id: 'quick_replies',
    category: 'chat',
    title: 'Quick Replies',
    sellerSubtitle: 'Pre-saved one-click message templates for fast customer inquiry responses',
    adminSubtitle: 'Standardized response templates for seller support and buyer dispute mediation',
    icon: MessageSquare,
    badgeText: (hub) =>
      Array.isArray(hub?.quick_replies?.templates)
        ? `${hub.quick_replies.templates.length} Templates`
        : null
  },
  {
    id: 'automated_replies',
    category: 'chat',
    title: 'Automated Replies',
    sellerSubtitle: 'Instant welcome greeting, offline away responder, and working hours schedule',
    adminSubtitle: 'Automated concierge greetings and after-hours helpdesk auto-response rules',
    icon: Bot,
    badgeText: (hub) => (hub?.automated_replies?.welcomeEnabled ? 'Auto-Reply ON' : 'Paused')
  },
  {
    id: 'chat_notifications',
    category: 'chat',
    title: 'Chat Notifications',
    sellerSubtitle: 'Desktop sound alerts, browser push notifications, and unread SLA reminders',
    adminSubtitle: 'Escalation alerts, SLA breach warnings, and priority ticket sound notifications',
    icon: BellRing,
    badgeText: (hub) =>
      hub?.chat_notifications?.slaReminderMinutes
        ? `${hub.chat_notifications.slaReminderMinutes}m SLA`
        : null
  },
  {
    id: 'chat_keyword_tags',
    category: 'chat',
    title: 'Chat Keyword Tags',
    sellerSubtitle: 'Auto-tag incoming buyer chats by keywords (Urgent, Return, Wholesale, Stock)',
    adminSubtitle: 'Configure automatic conversation classification tags and routing labels',
    icon: Tag,
    badgeText: (hub) =>
      Array.isArray(hub?.chat_keyword_tags?.tags)
        ? `${hub.chat_keyword_tags.tags.length} Tags`
        : null
  },
  {
    id: 'customer_support_integration',
    category: 'chat',
    title: 'Customer Support Integration',
    sellerSubtitle: 'WhatsApp Business number, live chat widget, Facebook Page, and escalation email',
    adminSubtitle: 'Connect omnichannel helpdesk, CRM webhook, WhatsApp hotline, and escalation queues',
    icon: Headphones,
    badgeText: (hub) => (hub?.customer_support_integration?.enableLiveChat ? 'Connected' : 'Disabled')
  },

  // 6. System
  {
    id: 'notification_preferences',
    category: 'system',
    title: 'Notification Preferences',
    sellerSubtitle: 'Choose which in-app events trigger alerts (Orders, cancellations, payouts, stock)',
    adminSubtitle: 'Configure admin dashboard alerts for seller applications, KYC, payouts & disputes',
    icon: Bell
  },
  {
    id: 'email_sms_notifications',
    category: 'system',
    title: 'Email and SMS Notifications',
    sellerSubtitle: 'Manage daily digest emails, instant SMS for high-value orders, and weekly reports',
    adminSubtitle: 'Control transactional email dispatch, SMS gateway alerts, and executive digests',
    icon: Smartphone
  },
  {
    id: 'language_regional',
    category: 'system',
    title: 'Language and Regional Settings',
    sellerSubtitle: 'Interface language (English / বাংলা), timezone, currency symbol, and date format',
    adminSubtitle: 'Default platform locale, bilingual typography toggle, timezone, and currency format',
    icon: Globe,
    badgeText: (hub) =>
      hub?.language_regional?.language === 'bn' ? 'বাংলা (BN)' : 'English (EN)'
  },
  {
    id: 'privacy_security',
    category: 'system',
    title: 'Privacy and Security',
    sellerSubtitle: 'Customer PII masking in exports, audit log retention, and GDPR/data compliance',
    adminSubtitle: 'Platform data retention, buyer PII protection, and compliance enforcement',
    icon: Shield
  },
  {
    id: 'activity_login_history',
    category: 'system',
    title: 'Activity and Login History',
    sellerSubtitle: 'Chronological audit trail of logins, settings changes, and sensitive actions',
    adminSubtitle: 'Immutable platform audit trail of administrative actions and configuration updates',
    icon: Activity
  },

  // 7. Other
  {
    id: 'ip_complaints',
    category: 'other',
    title: 'Intellectual Property Complaints',
    sellerSubtitle: 'Submit brand/trademark infringement reports and track IP complaint cases',
    adminSubtitle: 'Review and adjudicate brand protection & intellectual property takedown notices',
    icon: LegalScale,
    badgeText: (hub) =>
      Array.isArray(hub?.ip_complaints?.complaints) && hub.ip_complaints.complaints.length > 0
        ? `${hub.ip_complaints.complaints.length} Case(s)`
        : null
  },
  {
    id: 'product_store_policy',
    category: 'other',
    title: 'Product and Store Policy',
    sellerSubtitle: 'Return window, warranty terms, authenticity pledge, and cancellation rules',
    adminSubtitle: 'Marketplace-wide seller code of conduct, return policy minimums, and SLA penalties',
    icon: FileCheck,
    badgeText: (hub) =>
      hub?.product_store_policy?.returnWindowDays
        ? `${hub.product_store_policy.returnWindowDays}-Day Return`
        : null
  },
  {
    id: 'help_center',
    category: 'other',
    title: 'Help Center',
    sellerSubtitle: 'Searchable seller handbook, KYC guidelines, packaging SOPs, and billing FAQs',
    adminSubtitle: 'Marketplace operations playbooks, compliance SOPs, and help center documentation',
    icon: HelpCircle
  },
  {
    id: 'contact_support',
    category: 'other',
    title: 'Contact Support',
    sellerSubtitle: 'Open a priority Seller Support ticket or reach your dedicated Account Manager',
    adminSubtitle: 'Manage Seller Helpdesk escalation channels, hotline hours, and support SLAs',
    icon: LifeBuoy
  }
];

export const MarketplaceSettingsDashboard: React.FC<MarketplaceSettingsDashboardProps> = ({
  mode,
  token,
  initialCategory = 'all',
  initialCardId = null,
  onRefreshParent
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    (initialCategory as CategoryId) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsHub, setSettingsHub] = useState<Record<string, any>>(() => {
    try {
      const cached = localStorage.getItem(`alike_cache_settings_hub_${mode}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });
  const [financeSummary, setFinanceSummary] = useState<Record<string, any>>({});
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [sellerMeta, setSellerMeta] = useState<Record<string, any>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCardId);
  const [draftData, setDraftData] = useState<Record<string, any>>({});
  const [isEditingCard, setIsEditingCard] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState<boolean>(false);
  const [revealNid, setRevealNid] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // OTP Modal state for Login Email / Login Phone Modify
  const [otpModal, setOtpModal] = useState<{
    open: boolean;
    field: 'email' | 'mobileNumber';
    targetValue: string;
    otpCode: string;
    step: 'input' | 'verify';
    demoOtpHint?: string;
    sending: boolean;
    error?: string;
  }>({
    open: false,
    field: 'email',
    targetValue: '',
    otpCode: '',
    step: 'input',
    sending: false
  });

  // Inline Password Modify toggle inside Account Settings
  const [inlinePwdOpen, setInlinePwdOpen] = useState(false);

  // Admin Seller Verification & Profile Review Desk state
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReviewSeller, setSelectedReviewSeller] = useState<any | null>(null);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewDateFrom, setReviewDateFrom] = useState('');
  const [reviewDateTo, setReviewDateTo] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewPrivateNote, setReviewPrivateNote] = useState('');
  const [approvalRequiredFields, setApprovalRequiredFields] = useState<string[]>([
    'shopName',
    'displayName',
    'legalEntityName',
    'businessRegistrationNumber',
    'nationalIdNumber',
    'registeredAddress',
    'bankAccountNumber'
  ]);
  const [canViewSensitiveDocs, setCanViewSensitiveDocs] = useState(true);

  // Password change specific state
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Withdrawal request specific state (for Seller Earnings & Payouts card)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer',
    notes: ''
  });

  // Help center search
  const [helpSearch, setHelpSearch] = useState('');

  const safeParseJson = useCallback(async (res: Response): Promise<Record<string, any>> => {
    try {
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) {
        return {};
      }
      return JSON.parse(text);
    } catch {
      return {};
    }
  }, []);

  const resolveToken = useCallback(() => {
    if (token) return token;
    if (mode === 'seller') {
      return (
        localStorage.getItem('alike_seller_token') ||
        sessionStorage.getItem('alike_seller_token') ||
        localStorage.getItem('seller_token') ||
        sessionStorage.getItem('seller_token') ||
        ''
      );
    }
    return (
      localStorage.getItem('alikend_admin_token') ||
      sessionStorage.getItem('alikend_admin_token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      ''
    );
  }, [mode, token]);

  const fetchSettingsHub = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let authToken = resolveToken();
      const endpoint =
        mode === 'seller'
          ? '/api/sellers/settings-hub'
          : '/api/admin/central/settings-hub';

      let res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
      let json = await safeParseJson(res);

      // Automatic seller session recovery if token was missing, expired, or server restarted
      if ((!res.ok || !json.settingsHub) && mode === 'seller') {
        try {
          const demoRes = await fetch('/api/sellers/demo-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const demoJson = await safeParseJson(demoRes);
          if (demoRes.ok && demoJson.token) {
            authToken = String(demoJson.token);
            try {
              localStorage.setItem('alike_seller_token', authToken);
              localStorage.setItem('seller_token', authToken);
            } catch {}
            res = await fetch(endpoint, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
              }
            });
            json = await safeParseJson(res);
          }
        } catch {}
      }

      if (!res.ok && !json.settingsHub) {
        // If we already have cached settingsHub in state, keep using it silently
        setSettingsHub((prev) => {
          if (prev && Object.keys(prev).length > 0) {
            return prev;
          }
          setError(json.message || json.error || 'Failed to load settings dashboard');
          return prev;
        });
        return;
      }

      const nextHub = json.settingsHub || {};
      setSettingsHub(nextHub);
      try {
        if (Object.keys(nextHub).length > 0) {
          localStorage.setItem(`alike_cache_settings_hub_${mode}`, JSON.stringify(nextHub));
        }
      } catch {}
      setFinanceSummary(json.financeSummary || {});
      setActivityHistory(Array.isArray(json.activityHistory) ? json.activityHistory : []);
      if (json.sellerMeta) {
        setSellerMeta(json.sellerMeta);
      } else if (mode === 'seller') {
        setSellerMeta({
          sellerId: json.sellerId || nextHub?.seller_profile?.sellerId || '',
          shopName: nextHub?.store_information?.shopName || nextHub?.seller_profile?.shopName || '',
          ownerName: nextHub?.seller_profile?.ownerName || nextHub?.seller_profile?.fullName || '',
          email: nextHub?.account_settings?.loginEmail || nextHub?.seller_profile?.email || '',
          mobileNumber: nextHub?.account_settings?.loginPhone || nextHub?.seller_profile?.mobileNumber || '',
          logo: nextHub?.store_information?.shopLogo || nextHub?.seller_profile?.shopLogo || '',
          bannerUrl: nextHub?.store_information?.shopBanner || '',
          verificationStatus: nextHub?.business_information?.verificationStatus || 'not_submitted',
          verifiedBadge: Boolean(nextHub?.business_information?.verifiedBadge),
          pendingProfileChanges: json.pendingProfileChanges || [],
          verificationHistory: json.verificationHistory || [],
          rejectionReason: nextHub?.business_information?.rejectionReason || '',
          resubmissionInstructions: nextHub?.business_information?.resubmissionInstructions || '',
        });
      }
      if (Array.isArray(json.approvalRequiredFields)) {
        setApprovalRequiredFields(json.approvalRequiredFields);
      }
    } catch (err: any) {
      setSettingsHub((prev) => {
        if (prev && Object.keys(prev).length > 0) {
          return prev;
        }
        setError(err.message || 'Unable to load settings');
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, [mode, resolveToken, safeParseJson]);

  const fetchAdminSellerReviews = useCallback(async () => {
    if (mode !== 'admin') return;
    setReviewsLoading(true);
    try {
      const authToken = resolveToken();
      const params = new URLSearchParams();
      if (reviewSearch.trim()) params.set('q', reviewSearch.trim());
      if (reviewStatusFilter && reviewStatusFilter !== 'all') params.set('status', reviewStatusFilter);
      if (reviewDateFrom) params.set('dateFrom', reviewDateFrom);
      if (reviewDateTo) params.set('dateTo', reviewDateTo);
      const res = await fetch(`/api/admin/central/seller-reviews?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
      const json = await safeParseJson(res);
      if (res.ok && Array.isArray(json.sellers)) {
        setSellerReviews(json.sellers);
        if (Array.isArray(json.approvalRequiredFields)) {
          setApprovalRequiredFields(json.approvalRequiredFields);
        }
        if (typeof json.canViewSensitiveDocs === 'boolean') {
          setCanViewSensitiveDocs(json.canViewSensitiveDocs);
        }
        if (selectedReviewSeller) {
          const refreshed = json.sellers.find(
            (s: any) => s._id === selectedReviewSeller._id || s.sellerId === selectedReviewSeller.sellerId
          );
          if (refreshed) setSelectedReviewSeller(refreshed);
        } else if (json.sellers.length > 0) {
          setSelectedReviewSeller(json.sellers[0]);
        }
      }
    } catch {} finally {
      setReviewsLoading(false);
    }
  }, [mode, resolveToken, reviewSearch, reviewStatusFilter, reviewDateFrom, reviewDateTo, selectedReviewSeller, safeParseJson]);

  useEffect(() => {
    fetchSettingsHub();
  }, [fetchSettingsHub]);

  useEffect(() => {
    if (mode === 'admin') {
      fetchAdminSellerReviews();
    }
  }, [mode, reviewSearch, reviewStatusFilter, reviewDateFrom, reviewDateTo]);

  useEffect(() => {
    if (initialCardId) {
      openCardModal(initialCardId);
    }
  }, [initialCardId]);

  const detailFirstCards = ['seller_profile', 'business_information'];

  const openCardModal = (cardId: string) => {
    setSelectedCardId(cardId);
    const existing = settingsHub[cardId] ? JSON.parse(JSON.stringify(settingsHub[cardId])) : {};
    setDraftData(existing);
    setIsEditingCard(!detailFirstCards.includes(cardId));
    setIsDirty(false);
    setConfirmDiscardOpen(false);
    setRevealNid(false);
    setInlinePwdOpen(false);
    setCurrentPassword('');
    setFeedback(null);
    setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    if (cardId === 'seller_verification_desk' && mode === 'admin') {
      fetchAdminSellerReviews();
    }
  };

  const requestCloseCardModal = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    forceCloseCardModal();
  };

  const forceCloseCardModal = () => {
    setSelectedCardId(null);
    setDraftData({});
    setIsEditingCard(true);
    setIsDirty(false);
    setConfirmDiscardOpen(false);
    setCurrentPassword('');
    setFeedback(null);
  };

  const selectedCard = useMemo(
    () => SETTINGS_CARDS.find((c) => c.id === selectedCardId) || null,
    [selectedCardId]
  );

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SETTINGS_CARDS.filter((card) => {
      const matchesCat = activeCategory === 'all' || card.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const sub = mode === 'seller' ? card.sellerSubtitle : card.adminSubtitle;
      return (
        card.title.toLowerCase().includes(q) ||
        sub.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery, mode]);

  const groupedCards = useMemo(() => {
    const groups: Array<{
      category: (typeof CATEGORIES)[number];
      cards: SettingsCardDefinition[];
    }> = [];

    const targetCategories =
      activeCategory === 'all'
        ? CATEGORIES.filter((c) => c.id !== 'all')
        : CATEGORIES.filter((c) => c.id === activeCategory);

    for (const cat of targetCategories) {
      const cards = filteredCards.filter((c) => c.category === cat.id);
      if (cards.length > 0) {
        groups.push({ category: cat, cards });
      }
    }
    return groups;
  }, [activeCategory, filteredCards]);

  const handleDocumentUpload = async (fieldKey: string, file: File | null, nameFieldKey?: string) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.some((t) => file.type.toLowerCase().includes(t.split('/')[1]))) {
      setFeedback({
        type: 'error',
        message: 'Unsupported file type. Please upload JPG, PNG, WebP, or PDF.'
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'File size exceeds 5 MB limit. Please choose a smaller file.'
      });
      return;
    }

    setUploadingField(fieldKey);
    setFeedback(null);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const authToken = resolveToken();
      const uploadEndpoint =
        mode === 'seller'
          ? '/api/sellers/settings-hub/upload-document'
          : '/api/admin/central/settings-hub/upload-document';

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          dataUrl,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size
        })
      });
      const json = await safeParseJson(res);
      if (!res.ok) throw new Error(json.error || json.message || 'Upload failed');

      updateField(fieldKey, json.fileUrl || json.url || dataUrl);
      if (nameFieldKey) {
        updateField(nameFieldKey, file.name);
      }
      setFeedback({ type: 'success', message: `${file.name} uploaded and attached.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Document upload failed' });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSendContactOtp = async () => {
    if (!otpModal.targetValue.trim()) {
      setOtpModal((p) => ({ ...p, error: 'Please enter a valid new value.' }));
      return;
    }
    setOtpModal((p) => ({ ...p, sending: true, error: undefined }));
    try {
      const authToken = resolveToken();
      const endpoint =
        mode === 'seller'
          ? '/api/sellers/settings-hub/send-contact-otp'
          : '/api/admin/central/settings-hub/send-contact-otp';
      const channel = otpModal.field === 'email' ? 'email' : 'phone';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          field: otpModal.field,
          targetValue: otpModal.targetValue.trim(),
          channel,
          newValue: otpModal.targetValue.trim()
        })
      });
      const json = await safeParseJson(res);
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to send OTP');
      setOtpModal((p) => ({
        ...p,
        sending: false,
        step: 'verify',
        demoOtpHint: json.demoOtpHint || json.verificationHint
      }));
    } catch (err: any) {
      setOtpModal((p) => ({
        ...p,
        sending: false,
        error: err.message || 'Failed to send OTP'
      }));
    }
  };

  const handleVerifyContactOtp = async () => {
    if (!otpModal.otpCode.trim()) {
      setOtpModal((p) => ({ ...p, error: 'Please enter the 6-digit OTP code.' }));
      return;
    }
    setOtpModal((p) => ({ ...p, sending: true, error: undefined }));
    try {
      const authToken = resolveToken();
      const endpoint =
        mode === 'seller'
          ? '/api/sellers/settings-hub/verify-contact-otp'
          : '/api/admin/central/settings-hub/verify-contact-otp';
      const channel = otpModal.field === 'email' ? 'email' : 'phone';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          field: otpModal.field,
          targetValue: otpModal.targetValue.trim(),
          otpCode: otpModal.otpCode.trim(),
          channel,
          newValue: otpModal.targetValue.trim(),
          otp: otpModal.otpCode.trim()
        })
      });
      const json = await safeParseJson(res);
      if (!res.ok) throw new Error(json.error || json.message || 'OTP verification failed');
      if (json.settingsHub) {
        setSettingsHub(json.settingsHub);
        if (selectedCardId && json.settingsHub[selectedCardId]) {
          setDraftData(json.settingsHub[selectedCardId]);
        }
      }
      setOtpModal({
        open: false,
        field: 'email',
        targetValue: '',
        otpCode: '',
        step: 'input',
        sending: false
      });
      setFeedback({
        type: 'success',
        message: json.message || 'Contact verified and updated successfully!'
      });
      fetchSettingsHub();
    } catch (err: any) {
      setOtpModal((p) => ({
        ...p,
        sending: false,
        error: err.message || 'Invalid OTP code'
      }));
    }
  };

  const handleRevokeOtherSessions = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const authToken = resolveToken();
      const endpoint =
        mode === 'seller'
          ? '/api/sellers/settings-hub/revoke-other-sessions'
          : '/api/admin/central/settings-hub/revoke-other-sessions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
      const json = await safeParseJson(res);
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to revoke sessions');
      updateField('activeSessions', json.activeSessions || []);
      setFeedback({
        type: 'success',
        message: json.message || 'Signed out of all other active sessions.'
      });
      fetchSettingsHub();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Could not revoke sessions' });
    } finally {
      setSaving(false);
    }
  };

  const handleSellerReviewDecision = async (
    sellerId: string,
    action: 'approve' | 'reject' | 'request_more_info' | 'under_verification' | 'add_note' | 'toggle_suspension'
  ) => {
    if (action === 'reject' && !reviewReason.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please provide a clear rejection reason before rejecting this verification.'
      });
      return;
    }
    if (action === 'request_more_info' && !reviewReason.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please specify what additional information or documents are required from the seller.'
      });
      return;
    }
    if (action === 'add_note' && !reviewPrivateNote.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a private review note first.'
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const authToken = resolveToken();
      const res = await fetch(`/api/admin/central/seller-reviews/${sellerId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          action,
          reason: reviewReason.trim(),
          instructions: reviewReason.trim(),
          privateNote: reviewPrivateNote.trim()
        })
      });
      const json = await safeParseJson(res);
      if (!res.ok) throw new Error(json.error || json.message || 'Review decision failed');
      setFeedback({
        type: 'success',
        message: json.message || `Action [${action}] completed successfully.`
      });
      if (action !== 'add_note') setReviewReason('');
      setReviewPrivateNote('');
      await fetchAdminSellerReviews();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit review decision' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleApprovalRuleField = async (fieldKey: string) => {
    const exists = approvalRequiredFields.includes(fieldKey);
    const nextFields = exists
      ? approvalRequiredFields.filter((f) => f !== fieldKey)
      : [...approvalRequiredFields, fieldKey];
    setApprovalRequiredFields(nextFields);
    try {
      const authToken = resolveToken();
      await fetch('/api/admin/central/approval-rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ fields: nextFields })
      });
    } catch {}
  };

  const submitPasswordChange = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      setFeedback({ type: 'error', message: 'Please fill in current and new passwords.' });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: 'New password must be at least 6 characters long.'
      });
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const authToken = resolveToken();
      const endpoint =
        mode === 'seller' ? '/api/sellers/change-password' : '/api/admin/change-password';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(pwdForm)
      });
      const json = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Password update failed');
      }
      setFeedback({ type: 'success', message: json.message || 'Password updated successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setInlinePwdOpen(false);
      fetchSettingsHub();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const executeSaveCard = async (saveAsDraft = false) => {
    if (!selectedCard) return;

    if (selectedCard.id === 'password_change') {
      await submitPasswordChange();
      return;
    }

    // Require password confirmation for sensitive Seller cards
    if (mode === 'seller' && selectedCard.sensitive && !currentPassword.trim()) {
      setFeedback({
        type: 'error',
        message: 'Security verification: Please enter your current password to save sensitive changes.'
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const authToken = resolveToken();
      const endpoint =
        mode === 'seller'
          ? `/api/sellers/settings-hub/${selectedCard.id}`
          : `/api/admin/central/settings-hub/${selectedCard.id}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          data: draftData,
          currentPassword: currentPassword || undefined,
          saveAsDraft
        })
      });
      const json = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to save settings');
      }

      const updatedHub = json.settingsHub || {
        ...settingsHub,
        [selectedCard.id]: json.data || draftData
      };
      setSettingsHub(updatedHub);
      try {
        localStorage.setItem(`alike_cache_settings_hub_${mode}`, JSON.stringify(updatedHub));
      } catch {}
      setDraftData(updatedHub[selectedCard.id] || json.data || draftData);
      setCurrentPassword('');
      setIsDirty(false);
      if (detailFirstCards.includes(selectedCard.id)) {
        setIsEditingCard(false);
      }
      setFeedback({
        type: 'success',
        message:
          json.message ||
          (saveAsDraft
            ? `${selectedCard.title} saved as draft.`
            : `${selectedCard.title} saved successfully.`)
      });
      if (onRefreshParent) onRefreshParent();
      fetchSettingsHub();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSaveCard(false);
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawForm.amount);
    if (!amt || amt <= 0) {
      setFeedback({ type: 'error', message: 'Enter a valid withdrawal amount.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const authToken = resolveToken();
      const res = await fetch('/api/sellers/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          amount: amt,
          paymentMethod: withdrawForm.paymentMethod,
          notes: withdrawForm.notes
        })
      });
      const json = await safeParseJson(res);
      if (!res.ok) throw new Error(json.message || json.error || 'Withdrawal request failed');
      setFeedback({
        type: 'success',
        message: 'Withdrawal request submitted for Admin review!'
      });
      setWithdrawForm({ amount: '', paymentMethod: 'Bank Transfer', notes: '' });
      fetchSettingsHub();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to request payout' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setIsDirty(true);
    setDraftData((prev) => ({ ...prev, [key]: value }));
  };

  const readOnlyCardIds = [
    'payment_settlement_history',
    'transaction_history',
    'activity_login_history',
    'help_center',
    'seller_verification_desk',
    'global_bank_directory'
  ];
  const isReadOnlyCard =
    selectedCard &&
    (readOnlyCardIds.includes(selectedCard.id) ||
      (detailFirstCards.includes(selectedCard.id) && !isEditingCard) ||
      (mode === 'seller' && selectedCard.id === 'commission_settings') ||
      (mode === 'seller' && selectedCard.id === 'earnings_payouts') ||
      (mode === 'admin' && selectedCard.id === 'earnings_payouts'));

  const pendingSellerReviewsCount = useMemo(
    () =>
      sellerReviews.filter(
        (s) =>
          s.verificationStatus === 'pending_admin_review' ||
          s.verificationStatus === 'pending' ||
          s.verificationStatus === 'under_verification' ||
          Boolean(s.pendingProfileChanges)
      ).length,
    [sellerReviews]
  );

  return (
    <div className="mkt-settings-root min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Top Breadcrumb & Header Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1440px] mx-auto">
          {/* Breadcrumb navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-2"
          >
            <span>{mode === 'admin' ? 'Admin Control Center' : 'Seller Center'}</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-700">Settings</span>
            {activeCategory !== 'all' && (
              <>
                <ChevronRight size={14} className="text-slate-400" />
                <span className="text-blue-600 font-semibold">
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center flex-wrap gap-3">
                <h1 className="ty-page-title text-[28px] sm:text-[30px] font-bold tracking-tight text-slate-900 leading-tight">
                  Settings
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold border ${
                    mode === 'admin'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <ShieldCheck size={13} />
                  {mode === 'admin' ? 'Platform Admin Scope' : 'Store Seller Scope'}
                </span>
                {mode === 'seller' && settingsHub?.seller_profile?.sellerId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Seller ID: {settingsHub.seller_profile.sellerId}
                  </span>
                )}
              </div>
              <p className="text-[14px] text-slate-500 mt-1">
                {mode === 'admin'
                  ? 'Manage platform-wide business rules, seller verification reviews, finance commissions, 3PL logistics, RBAC security, and system governance.'
                  : 'Configure your store profile, business verification documents, payout bank account, pickup warehouses, sub-accounts, chat automation, and security.'}
              </p>
            </div>

            {/* Search, Admin Review Desk Quick Button & Refresh Controls */}
            <div className="flex items-center flex-wrap gap-3">
              {mode === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => openCardModal('seller_verification_desk')}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold shadow-2xs transition-colors"
                  >
                    <ShieldCheck size={15} />
                    <span>Seller Verification Review</span>
                    {pendingSellerReviewsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold">
                        {pendingSellerReviewsCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openCardModal('global_bank_directory')}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[13px] font-semibold shadow-2xs transition-colors"
                  >
                    <Globe size={15} />
                    <span>Bank Directory (500+)</span>
                  </button>
                </>
              )}
              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search settings (e.g., Profile, NID, 2FA)..."
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={fetchSettingsHub}
                title="Refresh Settings"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-[14px] font-semibold transition-colors shadow-2xs"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Body with Left Sidebar & Settings Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-[14px]">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchSettingsHub}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg text-[13px] font-semibold hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Category Navigation Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs lg:sticky lg:top-6">
            <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Settings Directory
              </p>
            </div>
            <nav className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count =
                  cat.id === 'all'
                    ? SETTINGS_CARDS.length
                    : SETTINGS_CARDS.filter((c) => c.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] transition-all text-left ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={17}
                        className={isActive ? 'text-white shrink-0' : 'text-blue-600 shrink-0'}
                      />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[12px] px-2 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Security Status Box */}
            <div className="mt-4 pt-4 border-t border-slate-100 px-3 pb-2">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 mb-1">
                <LockKeyhole size={14} className="text-blue-600" />
                <span>Security & Audit</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Sensitive settings require OTP or password verification and are logged in your Activity History.
              </p>
            </div>
          </aside>

          {/* Right Grouped Cards Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
                <Loader2 size={28} className="animate-spin text-blue-600 mb-3" />
                <p className="text-[15px] font-medium">Loading Settings Dashboard...</p>
              </div>
            ) : groupedCards.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Search size={32} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-[17px] font-semibold text-slate-800">
                  No matching settings found
                </h3>
                <p className="text-[14px] text-slate-500 mt-1">
                  Try searching for another keyword or switch back to All Settings.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-semibold hover:bg-blue-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              groupedCards.map(({ category, cards }) => {
                const CatIcon = category.icon;
                const catTheme =
                  category.id === 'business'
                    ? {
                        secIcon: 'bg-blue-50 border-blue-200 text-blue-600',
                        cardIcon: 'bg-blue-50 border-blue-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
                        cardBorder: 'hover:border-blue-400',
                        titleHover: 'group-hover:text-blue-700',
                        defaultBadge: 'bg-blue-50 text-blue-700 border border-blue-200'
                      }
                    : category.id === 'finance'
                    ? {
                        secIcon: 'bg-emerald-50 border-emerald-200 text-emerald-600',
                        cardIcon: 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
                        cardBorder: 'hover:border-emerald-400',
                        titleHover: 'group-hover:text-emerald-700',
                        defaultBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }
                    : category.id === 'logistics'
                    ? {
                        secIcon: 'bg-orange-50 border-orange-200 text-orange-600',
                        cardIcon: 'bg-orange-50 border-orange-200 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
                        cardBorder: 'hover:border-orange-400',
                        titleHover: 'group-hover:text-orange-700',
                        defaultBadge: 'bg-orange-50 text-orange-700 border border-orange-200'
                      }
                    : category.id === 'users'
                    ? {
                        secIcon: 'bg-indigo-50 border-indigo-200 text-indigo-600',
                        cardIcon: 'bg-indigo-50 border-indigo-200 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
                        cardBorder: 'hover:border-indigo-400',
                        titleHover: 'group-hover:text-indigo-700',
                        defaultBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }
                    : category.id === 'chat'
                    ? {
                        secIcon: 'bg-rose-50 border-rose-200 text-rose-600',
                        cardIcon: 'bg-rose-50 border-rose-200 text-rose-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
                        cardBorder: 'hover:border-rose-400',
                        titleHover: 'group-hover:text-rose-700',
                        defaultBadge: 'bg-rose-50 text-rose-700 border border-rose-200'
                      }
                    : category.id === 'system'
                    ? {
                        secIcon: 'bg-sky-50 border-sky-200 text-sky-600',
                        cardIcon: 'bg-sky-50 border-sky-200 text-sky-600 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
                        cardBorder: 'hover:border-sky-400',
                        titleHover: 'group-hover:text-sky-700',
                        defaultBadge: 'bg-sky-50 text-sky-700 border border-sky-200'
                      }
                    : {
                        secIcon: 'bg-purple-50 border-purple-200 text-purple-600',
                        cardIcon: 'bg-purple-50 border-purple-200 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
                        cardBorder: 'hover:border-purple-400',
                        titleHover: 'group-hover:text-purple-700',
                        defaultBadge: 'bg-purple-50 text-purple-700 border border-purple-200'
                      };

                return (
                  <section
                    key={category.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs"
                  >
                    {/* Section Heading */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${catTheme.secIcon}`}>
                          <CatIcon size={19} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="ty-section-header text-[20px] font-semibold text-slate-900">
                              {category.label}
                            </h2>
                            <span
                              lang="bn"
                              className="text-[13px] font-medium text-slate-500 hidden sm:inline"
                            >
                              • {category.bnLabel}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-500">{category.description}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
                        {cards.length} {cards.length === 1 ? 'Module' : 'Modules'}
                      </span>
                    </div>

                    {/* Responsive 3-column Daraz-inspired Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {cards.map((card) => {
                        const CardIcon = card.icon;
                        const subtitle =
                          mode === 'seller' ? card.sellerSubtitle : card.adminSubtitle;
                        const badge = card.badgeText
                          ? card.badgeText(settingsHub, mode, financeSummary)
                          : null;

                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => openCardModal(card.id)}
                            className={`mkt-card-btn group text-left p-4 rounded-xl border border-slate-200/90 bg-white hover:bg-[#F8FAFC] ${catTheme.cardBorder} hover:shadow-md transition-all duration-150 flex items-start gap-3.5 relative overflow-hidden cursor-pointer`}
                          >
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${catTheme.cardIcon}`}>
                              <CardIcon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className={`ty-card-header text-[16px] font-semibold text-slate-900 ${catTheme.titleHover} transition-colors leading-snug`}>
                                  {card.title}
                                </h3>
                                <ArrowUpRight
                                  size={16}
                                  className="text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                />
                              </div>
                              <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {subtitle}
                              </p>
                              {(badge || card.sensitive) && (
                                <div className="flex items-center flex-wrap gap-1.5 mt-2.5 max-w-full">
                                  {badge && (
                                    <span
                                      title={String(badge)}
                                      className={`inline-flex items-center max-w-full truncate px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                        badge === 'Verified' || badge === 'Active'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : badge === 'Pending Review' || badge === 'Under Verification'
                                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                          : badge === 'Rejected' || badge === 'More Info Needed'
                                          ? 'bg-red-50 text-red-700 border border-red-200'
                                          : catTheme.defaultBadge
                                      }`}
                                    >
                                      {badge}
                                    </span>
                                  )}
                                  {card.sensitive && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                      <Lock size={10} /> Protected
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Interactive Settings Modal / Drawer (Portaled to document.body to prevent parent CSS transform containment) */}
      {selectedCard &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="mkt-settings-root fixed inset-0 z-[9990] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto text-[#0F172A] font-sans">
            <div
              className={`bg-white border border-slate-200 rounded-2xl shadow-2xl w-full ${
                selectedCard.id === 'global_bank_directory' ||
                selectedCard.id === 'warehouse_pickup' ||
                selectedCard.id === 'delivery_service' ||
                selectedCard.id === 'shipping_provider' ||
                selectedCard.id === 'manage_users' ||
                selectedCard.id === 'roles_permissions' ||
                selectedCard.id === 'quick_replies' ||
                selectedCard.id === 'automated_replies' ||
                selectedCard.id === 'chat_notifications' ||
                selectedCard.id === 'chat_keyword_tags' ||
                selectedCard.id === 'customer_support_integration' ||
                selectedCard.id === 'store_information'
                  ? 'max-w-6xl'
                  : selectedCard.id === 'seller_verification_desk' ||
                    selectedCard.id === 'business_information' ||
                    selectedCard.id === 'invoice_number_settings'
                  ? 'max-w-5xl'
                  : 'max-w-3xl'
              } max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <selectedCard.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-[19px] font-bold text-slate-900">
                        {selectedCard.title}
                      </h2>
                      {selectedCard.sensitive && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-md">
                          Password Protected
                        </span>
                      )}
                      {detailFirstCards.includes(selectedCard.id) && (
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                            isEditingCard
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isEditingCard ? 'Editing Mode' : 'Detail View'}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-slate-500 truncate">
                      {mode === 'seller' ? selectedCard.sellerSubtitle : selectedCard.adminSubtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {detailFirstCards.includes(selectedCard.id) && !isEditingCard && (
                    <button
                      type="button"
                      onClick={() => setIsEditingCard(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-2xs transition-colors"
                    >
                      <span>Modify</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={requestCloseCardModal}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Unsaved Changes Confirmation Banner */}
              {confirmDiscardOpen && (
                <div className="px-6 py-3.5 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-900 text-[13px] font-medium">
                    <AlertCircle size={17} className="text-amber-600 shrink-0" />
                    <span>You have unsaved modifications. Discard your changes and exit?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDiscardOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-[12px] font-semibold hover:bg-amber-100"
                    >
                      Keep Editing
                    </button>
                    <button
                      type="button"
                      onClick={forceCloseCardModal}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700"
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {feedback && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-[14px] font-medium ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-red-600 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Render Card-Specific Form or Interactive View */}
                {renderCardEditorContent({
                  cardId: selectedCard.id,
                  mode,
                  draftData,
                  updateField,
                  financeSummary,
                  activityHistory,
                  pwdForm,
                  setPwdForm,
                  withdrawForm,
                  setWithdrawForm,
                  handleRequestWithdrawal,
                  saving,
                  helpSearch,
                  setHelpSearch,
                  isEditingCard,
                  setIsEditingCard,
                  revealNid,
                  setRevealNid,
                  uploadingField,
                  handleDocumentUpload,
                  setOtpModal,
                  inlinePwdOpen,
                  setInlinePwdOpen,
                  submitPasswordChange,
                  handleRevokeOtherSessions,
                  sellerMeta,
                  sellerReviews,
                  reviewsLoading,
                  selectedReviewSeller,
                  setSelectedReviewSeller,
                  reviewSearch,
                  setReviewSearch,
                  reviewStatusFilter,
                  setReviewStatusFilter,
                  reviewDateFrom,
                  setReviewDateFrom,
                  reviewDateTo,
                  setReviewDateTo,
                  reviewReason,
                  setReviewReason,
                  reviewPrivateNote,
                  setReviewPrivateNote,
                  handleSellerReviewDecision,
                  approvalRequiredFields,
                  handleToggleApprovalRuleField,
                  canViewSensitiveDocs,
                  fetchAdminSellerReviews,
                  token,
                  settingsHub,
                  requestCloseCardModal,
                  openCardModal,
                  setFeedback,
                  fetchSettingsHub,
                  setSellerMeta,
                  onRefreshParent
                })}

                {/* Security Verification Block for Sensitive Seller Settings */}
                {mode === 'seller' &&
                  selectedCard.sensitive &&
                  selectedCard.id !== 'password_change' &&
                  !isReadOnlyCard && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                      <label className="block text-[14px] font-semibold text-amber-900">
                        Security Verification Required *
                      </label>
                      <p className="text-[12px] text-amber-700">
                        For your protection, please enter your current Seller account password to
                        authorize changes to {selectedCard.title}.
                      </p>
                      <div className="relative max-w-md">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current account password"
                          required
                          className="w-full px-3.5 py-2.5 pr-10 bg-white border border-amber-300 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                {/* Modal Footer with Working Save, Save as Draft, Modify, and Cancel Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[12px] text-slate-500">
                    {selectedCard.id === 'business_information' && mode === 'seller' && isEditingCard
                      ? 'Changes to verified business fields are queued for Admin verification.'
                      : ''}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (detailFirstCards.includes(selectedCard.id) && isEditingCard) {
                          if (isDirty) {
                            setConfirmDiscardOpen(true);
                          } else {
                            setIsEditingCard(false);
                          }
                        } else {
                          requestCloseCardModal();
                        }
                      }}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[14px] font-semibold transition-colors"
                    >
                      {isReadOnlyCard ? 'Close' : 'Cancel'}
                    </button>
                    {detailFirstCards.includes(selectedCard.id) && !isEditingCard && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCard(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold shadow-xs transition-all"
                      >
                        <span>Edit / Modify</span>
                      </button>
                    )}
                    {!isReadOnlyCard && selectedCard.id === 'business_information' && mode === 'seller' && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => executeSaveCard(true)}
                        className="px-4 py-2.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[14px] font-semibold transition-colors"
                      >
                        Save as Draft
                      </button>
                    )}
                    {!isReadOnlyCard && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={(e) => handleSaveCard(e as any)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[14px] font-semibold shadow-xs transition-all"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            <span>
                              {selectedCard.id === 'business_information' && mode === 'seller'
                                ? 'Submit for Verification'
                                : 'Save Changes'}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2-Step OTP Verification Modal for Login Email & Login Phone Modification (Portaled to document.body) */}
      {otpModal.open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="mkt-settings-root fixed inset-0 z-[9995] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-[#0F172A] font-sans">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">
                      Modify {otpModal.field === 'email' ? 'Login Email Address' : 'Login Phone Number'}
                    </h3>
                    <p className="text-[12px] text-slate-500">
                      OTP verification is required before activating a new login credential
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOtpModal({
                      open: false,
                      field: 'email',
                      targetValue: '',
                      otpCode: '',
                      step: 'input',
                      sending: false
                    })
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {otpModal.error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{otpModal.error}</span>
                </div>
              )}

              {otpModal.step === 'input' ? (
                <div className="space-y-4">
                  <FieldInput
                    label={otpModal.field === 'email' ? 'New Login Email Address' : 'New Login Phone Number'}
                    type={otpModal.field === 'email' ? 'email' : 'text'}
                    value={otpModal.targetValue}
                    onChange={(v) => setOtpModal((p) => ({ ...p, targetValue: v }))}
                    placeholder={otpModal.field === 'email' ? 'name@example.com' : '+880 1700-000000'}
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOtpModal((p) => ({ ...p, open: false, step: 'input', error: undefined }))
                      }
                      className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-[13px] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={otpModal.sending}
                      onClick={handleSendContactOtp}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold"
                    >
                      {otpModal.sending ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[13px] text-blue-900">
                    We sent a 6-digit verification code to <strong>{otpModal.targetValue}</strong>.
                    {otpModal.demoOtpHint && (
                      <div className="mt-1 font-mono text-[12px] text-blue-700">
                        Verification Code: <strong>{otpModal.demoOtpHint}</strong>
                      </div>
                    )}
                  </div>
                  <FieldInput
                    label="Enter 6-Digit OTP Code"
                    value={otpModal.otpCode}
                    onChange={(v) => setOtpModal((p) => ({ ...p, otpCode: v }))}
                    placeholder="123456"
                    required
                  />
                  <div className="flex justify-between items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpModal((p) => ({ ...p, step: 'input', error: undefined }))}
                      className="text-[12px] font-semibold text-blue-600 hover:underline"
                    >
                      Change {otpModal.field === 'email' ? 'Email' : 'Phone'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={otpModal.sending}
                        onClick={handleVerifyContactOtp}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold"
                      >
                        {otpModal.sending ? 'Verifying...' : 'Verify & Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

/* ============================================================================
 * Helper Form Primitives
 * ========================================================================== */

const FieldInput: React.FC<{
  label: string;
  value: any;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
}> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helper,
  required,
  disabled
}) => (
  <div>
    <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 bg-white disabled:bg-slate-100 disabled:text-slate-500 border border-slate-300 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
    />
    {helper && <p className="text-[12px] text-slate-500 mt-1">{helper}</p>}
  </div>
);

const FieldSelect: React.FC<{
  label: string;
  value: any;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  helper?: string;
}> = ({ label, value, onChange, options, helper }) => (
  <div>
    <label className="block text-[14px] font-medium text-slate-700 mb-1.5">{label}</label>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-600"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {helper && <p className="text-[12px] text-slate-500 mt-1">{helper}</p>}
  </div>
);

const FieldToggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer">
    <div>
      <div className="text-[14px] font-semibold text-slate-800">{label}</div>
      {description && <div className="text-[12px] text-slate-500 mt-0.5">{description}</div>}
    </div>
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
    />
  </label>
);

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ label, value, badge, action }) => (
  <div className="py-3.5 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 last:border-b-0">
    <div className="sm:w-1/3 text-[13px] font-medium text-slate-500">{label}</div>
    <div className="flex-1 flex items-center justify-between gap-3">
      <div className="text-[14px] font-medium text-slate-900 flex items-center flex-wrap gap-2">
        <span>{value || '—'}</span>
        {badge}
      </div>
      {action}
    </div>
  </div>
);

const VERIFICATION_STAGES = [
  { key: 'not_submitted', label: 'Not Submitted' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending_admin_review', label: 'Pending Review' },
  { key: 'under_verification', label: 'Under Verification' },
  { key: 'approved', label: 'Approved / Verified' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'resubmission_required', label: 'More Info Required' }
];

/* ============================================================================
 * Card-Specific Editor Renderer (Covers all 36 Cards)
 * ========================================================================== */

function renderCardEditorContent(params: {
  cardId: string;
  mode: 'admin' | 'seller';
  draftData: Record<string, any>;
  updateField: (k: string, v: any) => void;
  financeSummary: Record<string, any>;
  activityHistory: any[];
  pwdForm: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPwdForm: React.Dispatch<
    React.SetStateAction<{ currentPassword: string; newPassword: string; confirmPassword: string }>
  >;
  withdrawForm: { amount: string; paymentMethod: string; notes: string };
  setWithdrawForm: React.Dispatch<
    React.SetStateAction<{ amount: string; paymentMethod: string; notes: string }>
  >;
  handleRequestWithdrawal: (e: React.FormEvent) => void;
  saving: boolean;
  helpSearch: string;
  setHelpSearch: (v: string) => void;
  isEditingCard: boolean;
  setIsEditingCard: (v: boolean) => void;
  revealNid: boolean;
  setRevealNid: React.Dispatch<React.SetStateAction<boolean>>;
  uploadingField: string | null;
  handleDocumentUpload: (fieldKey: string, file: File | null, nameFieldKey?: string) => Promise<void>;
  setOtpModal: React.Dispatch<React.SetStateAction<any>>;
  inlinePwdOpen: boolean;
  setInlinePwdOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitPasswordChange: () => Promise<void>;
  handleRevokeOtherSessions: () => Promise<void>;
  sellerMeta: Record<string, any>;
  sellerReviews: any[];
  reviewsLoading: boolean;
  selectedReviewSeller: any | null;
  setSelectedReviewSeller: (s: any | null) => void;
  reviewSearch: string;
  setReviewSearch: (v: string) => void;
  reviewStatusFilter: string;
  setReviewStatusFilter: (v: string) => void;
  reviewDateFrom: string;
  setReviewDateFrom: (v: string) => void;
  reviewDateTo: string;
  setReviewDateTo: (v: string) => void;
  reviewReason: string;
  setReviewReason: (v: string) => void;
  reviewPrivateNote: string;
  setReviewPrivateNote: (v: string) => void;
  handleSellerReviewDecision: (
    sellerId: string,
    action: 'approve' | 'reject' | 'request_more_info' | 'under_verification' | 'add_note' | 'toggle_suspension'
  ) => Promise<void>;
  approvalRequiredFields: string[];
  handleToggleApprovalRuleField: (fieldKey: string) => Promise<void>;
  canViewSensitiveDocs: boolean;
  fetchAdminSellerReviews: () => Promise<void>;
  token?: string | null;
  settingsHub?: Record<string, any>;
  requestCloseCardModal?: () => void;
  openCardModal?: (cardId: string) => void;
  setFeedback?: React.Dispatch<
    React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>
  >;
  fetchSettingsHub?: () => Promise<void>;
  setSellerMeta?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onRefreshParent?: () => void;
}) {
  const {
    cardId,
    mode,
    draftData,
    updateField,
    financeSummary,
    activityHistory,
    pwdForm,
    setPwdForm,
    withdrawForm,
    setWithdrawForm,
    handleRequestWithdrawal,
    saving,
    helpSearch,
    setHelpSearch,
    isEditingCard,
    setIsEditingCard,
    revealNid,
    setRevealNid,
    uploadingField,
    handleDocumentUpload,
    setOtpModal,
    inlinePwdOpen,
    setInlinePwdOpen,
    submitPasswordChange,
    handleRevokeOtherSessions,
    sellerMeta,
    sellerReviews,
    reviewsLoading,
    selectedReviewSeller,
    setSelectedReviewSeller,
    reviewSearch,
    setReviewSearch,
    reviewStatusFilter,
    setReviewStatusFilter,
    reviewDateFrom,
    setReviewDateFrom,
    reviewDateTo,
    setReviewDateTo,
    reviewReason,
    setReviewReason,
    reviewPrivateNote,
    setReviewPrivateNote,
    handleSellerReviewDecision,
    approvalRequiredFields,
    handleToggleApprovalRuleField,
    canViewSensitiveDocs,
    token,
    settingsHub,
    requestCloseCardModal,
    openCardModal,
    setFeedback,
    fetchSettingsHub,
    setSellerMeta,
    onRefreshParent
  } = params;

  switch (cardId) {
    // -------------------------------------------------------------------------
    // 1. BUSINESS INFORMATION — SELLER PROFILE (Daraz-Inspired Detail + Edit)
    // -------------------------------------------------------------------------
    case 'seller_profile': {
      const sellerIdVal = draftData.sellerId || sellerMeta.sellerId || (mode === 'admin' ? 'ADM-HQ-0001' : 'SEL-1001');
      const firstNameVal =
        draftData.firstName ??
        (String(draftData.ownerName || draftData.fullName || '').split(' ')[0] || '');
      const lastNameVal =
        draftData.lastName ??
        (String(draftData.ownerName || draftData.fullName || '').split(' ').slice(1).join(' ') || '');
      const displayShopName =
        draftData.displayName || draftData.shopName || draftData.displayTitle || '';
      const contactEmail =
        draftData.internalContactEmail || draftData.supportEmail || draftData.email || '';
      const contactPhone =
        draftData.phoneNumber || draftData.alternateContactPhone || draftData.mobileNumber || '';
      const logoImg = draftData.shopLogo || draftData.avatarUrl || draftData.avatar || '';
      const isPendingApproval = draftData.approvalStatus === 'pending_admin_review';

      if (!isEditingCard) {
        return (
          <div className="space-y-5">
            {isPendingApproval && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[13px] text-amber-900 font-medium">
                  <AlertCircle size={17} className="text-amber-600 shrink-0" />
                  <span>
                    Recent profile changes (such as Display / Shop Name) are marked{' '}
                    <strong>Pending Review</strong> and awaiting Admin approval.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-200/80 text-amber-950 shrink-0">
                  Pending Review
                </span>
              </div>
            )}

            {/* Top Profile Summary Banner */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                  {logoImg ? (
                    <img src={logoImg} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-[17px] font-bold text-slate-900">
                      {displayShopName || `${firstNameVal} ${lastNameVal}`.trim() || 'Seller Profile'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      ID: {sellerIdVal}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    {firstNameVal} {lastNameVal} • {contactEmail || 'No email set'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingCard(true)}
                className="px-4 py-2 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 text-[13px] font-semibold transition-colors self-start sm:self-center"
              >
                Edit Profile
              </button>
            </div>

            {/* Structured Daraz-Style Detail Rows */}
            <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
              <DetailRow
                label="Seller ID"
                value={<span className="font-mono font-semibold">{sellerIdVal}</span>}
                badge={
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                    Read-Only Permanent ID
                  </span>
                }
              />
              <DetailRow label="First Name" value={firstNameVal} />
              <DetailRow label="Last Name" value={lastNameVal} />
              <DetailRow label="Internal Contact Email" value={contactEmail} />
              <DetailRow label="Phone Number" value={contactPhone} />
              <DetailRow
                label="Display Name / Shop Name"
                value={displayShopName}
                badge={
                  isPendingApproval ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                      Pending Admin Approval
                    </span>
                  ) : null
                }
              />
              <DetailRow
                label="Holiday Mode"
                value={draftData.holidayMode ? 'Enabled (Store Paused)' : 'Off (Store Active)'}
                badge={
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      draftData.holidayMode
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {draftData.holidayMode ? 'ON' : 'OFF'}
                  </span>
                }
              />
              {draftData.holidayMode && (
                <DetailRow
                  label="Holiday Period"
                  value={`${draftData.holidayStartDate || 'Immediate'} to ${
                    draftData.holidayEndDate || 'Until turned off'
                  }`}
                />
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Seller ID (Auto-Generated Read-Only)"
              value={sellerIdVal}
              onChange={() => {}}
              disabled
              helper="Permanent system identifier. Cannot be modified."
            />
            <FieldInput
              label="Display Name / Shop Name"
              value={displayShopName}
              onChange={(v) => {
                updateField('displayName', v);
                updateField('shopName', v);
              }}
              required
              helper="Modifying Shop Name after verification triggers Admin approval."
            />
            <FieldInput
              label="First Name"
              value={firstNameVal}
              onChange={(v) => {
                updateField('firstName', v);
                updateField('ownerName', `${v} ${lastNameVal}`.trim());
              }}
              required
            />
            <FieldInput
              label="Last Name"
              value={lastNameVal}
              onChange={(v) => {
                updateField('lastName', v);
                updateField('ownerName', `${firstNameVal} ${v}`.trim());
              }}
              required
            />
            <FieldInput
              label="Internal Contact Email"
              type="email"
              value={contactEmail}
              onChange={(v) => {
                updateField('internalContactEmail', v);
                updateField('supportEmail', v);
              }}
              required
            />
            <FieldInput
              label="Phone Number"
              value={contactPhone}
              onChange={(v) => {
                updateField('phoneNumber', v);
                updateField('alternateContactPhone', v);
              }}
              required
            />
          </div>

          {/* Shop Logo / Profile Image Upload */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <label className="block text-[14px] font-semibold text-slate-800">
              Shop Logo / Profile Image
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                {logoImg ? (
                  <img src={logoImg} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold">
                    <span>
                      {uploadingField === 'shopLogo' ? 'Uploading...' : 'Upload Logo Image'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        handleDocumentUpload('shopLogo', f);
                      }}
                    />
                  </label>
                  <span className="text-[12px] text-slate-500">
                    Supported: JPG, PNG, WebP (Max 5 MB)
                  </span>
                </div>
                <FieldInput
                  label="Or Paste Image URL"
                  value={logoImg}
                  onChange={(v) => {
                    updateField('shopLogo', v);
                    updateField('avatarUrl', v);
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Holiday Mode Section inside Seller Profile */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <FieldToggle
              label="Holiday Mode (On / Off)"
              description="Temporarily pause incoming orders during vacations while keeping your store visible."
              checked={Boolean(draftData.holidayMode)}
              onChange={(v) => updateField('holidayMode', v)}
            />
            {draftData.holidayMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                <FieldInput
                  label="Holiday Mode Start Date"
                  type="date"
                  value={draftData.holidayStartDate}
                  onChange={(v) => updateField('holidayStartDate', v)}
                  required
                />
                <FieldInput
                  label="Holiday Mode End Date"
                  type="date"
                  value={draftData.holidayEndDate}
                  onChange={(v) => updateField('holidayEndDate', v)}
                  required
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 1B. BUSINESS INFORMATION (7-Stage Verification Progress + NID Uploads + Modify)
    // -------------------------------------------------------------------------
    case 'business_information': {
      const currentStatus =
        draftData.verificationStatus ||
        sellerMeta.verificationStatus ||
        (draftData.verifiedBadge ? 'approved' : 'not_submitted');
      const normalizedStatus =
        currentStatus === 'pending' ? 'pending_admin_review' : currentStatus;
      const rawPendingChanges = draftData.pendingProfileChanges || sellerMeta.pendingProfileChanges;
      const pendingDiffs = Array.isArray(rawPendingChanges)
        ? rawPendingChanges
        : Array.isArray(rawPendingChanges?.diffs)
        ? rawPendingChanges.diffs
        : [];
      const rejectionReason = draftData.rejectionReason || sellerMeta.rejectionReason || '';
      const resubmissionInstructions =
        draftData.resubmissionInstructions || sellerMeta.resubmissionInstructions || '';
      const nidVal = draftData.nationalIdNumber || draftData.nidNumber || '';
      const maskedNidVal =
        draftData.maskedNationalIdNumber ||
        draftData.maskedNidNumber ||
        (nidVal ? `${'•'.repeat(Math.max(0, String(nidVal).length - 4))}${String(nidVal).slice(-4)}` : '••••••••');
      const frontDocUrl = draftData.nidFrontImageUrl || draftData.nidFrontDocument || '';
      const backDocUrl = draftData.nidBackImageUrl || draftData.nidBackDocument || '';
      const supportDocUrl = draftData.supportingDocUrl || draftData.additionalSupportingDocument || '';

      return (
        <div className="space-y-5">
          {/* 7-Stage Verification Progress Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-[14px] font-bold text-slate-900">
                  Business & Identity Verification Progress
                </h4>
                <p className="text-[12px] text-slate-500">
                  All business registrations and NID documents are manually verified by the Admin Desk.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-bold self-start sm:self-center ${
                  normalizedStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : normalizedStatus === 'rejected'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : normalizedStatus === 'resubmission_required'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : normalizedStatus === 'pending_admin_review' ||
                      normalizedStatus === 'under_verification'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {VERIFICATION_STAGES.find((s) => s.key === normalizedStatus)?.label ||
                  String(normalizedStatus).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
              {VERIFICATION_STAGES.map((stage) => {
                const isCurrent = stage.key === normalizedStatus;
                return (
                  <div
                    key={stage.key}
                    className={`px-2.5 py-2 rounded-lg border text-center text-[11px] font-semibold transition-all ${
                      isCurrent
                        ? stage.key === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : stage.key === 'rejected'
                          ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {stage.label}
                  </div>
                );
              })}
            </div>

            {rejectionReason && normalizedStatus === 'rejected' && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-800">
                <strong>Rejection Reason from Admin:</strong> {rejectionReason}
              </div>
            )}

            {resubmissionInstructions && normalizedStatus === 'resubmission_required' && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[13px] text-amber-900">
                <strong>Additional Information Requested by Admin:</strong>{' '}
                {resubmissionInstructions}
              </div>
            )}

            {pendingDiffs.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                <div className="text-[12px] font-bold text-blue-900">
                  Pending Profile / Business Modifications Awaiting Admin Approval ({pendingDiffs.length} field(s)):
                </div>
                <div className="space-y-1 text-[12px]">
                  {pendingDiffs.map((d: any, i: number) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 text-slate-700">
                      <span className="font-semibold text-slate-900">{d.label || d.field}:</span>
                      <span className="line-through text-slate-400">{String(d.previousValue ?? d.oldValue ?? 'Empty')}</span>
                      <span>→</span>
                      <span className="font-semibold text-blue-700">{String(d.proposedValue ?? d.newValue ?? 'Updated')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isEditingCard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[15px] font-bold text-slate-900">
                  Registered Business & Identity Details
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingCard(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-2xs"
                >
                  Modify Business Information
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                <DetailRow
                  label="Seller Type"
                  value={draftData.sellerType || 'Individual'}
                  badge={
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                      {draftData.sellerType || 'Individual'}
                    </span>
                  }
                />
                <DetailRow
                  label="Legal Name / Business Owner Name"
                  value={draftData.legalEntityName || draftData.legalBusinessName}
                />
                <DetailRow
                  label="Legal Form / Business Type"
                  value={draftData.legalForm || draftData.businessType}
                />
                <DetailRow
                  label="Business Registration Number"
                  value={draftData.businessRegistrationNumber || draftData.tradeLicenseNumber || draftData.tradeLicenseNo}
                />
                <DetailRow label="Full Address" value={draftData.registeredAddress} />
                <DetailRow
                  label="City / District / Postal Code"
                  value={[
                    draftData.city,
                    draftData.district || draftData.districtState || draftData.state,
                    draftData.postalCode || draftData.pincode
                  ]
                    .filter(Boolean)
                    .join(', ')}
                />
                <DetailRow label="Country / Region" value={draftData.countryRegion || draftData.country || 'Bangladesh'} />
                <DetailRow label="Person in Charge Name" value={draftData.personInChargeName} />
                <DetailRow label="Contact Email" value={draftData.contactEmail} />
                <DetailRow label="Contact Phone" value={draftData.contactPhone} />
                <DetailRow
                  label="Identity Document Type"
                  value={draftData.identityDocType || 'National ID (NID)'}
                />
                <DetailRow
                  label="National ID Number"
                  value={
                    <span className="font-mono">
                      {revealNid
                        ? nidVal || 'Not Provided'
                        : maskedNidVal}
                    </span>
                  }
                  action={
                    nidVal ? (
                      <button
                        type="button"
                        onClick={() => setRevealNid((v) => !v)}
                        className="text-[12px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {revealNid ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{revealNid ? 'Mask' : 'Reveal'}</span>
                      </button>
                    ) : null
                  }
                />
                <DetailRow
                  label="Identity Document — Front Side"
                  value={
                    frontDocUrl ? (
                      <a
                        href={frontDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>Uploaded (View Front Document)</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      'Not Uploaded'
                    )
                  }
                />
                <DetailRow
                  label="Identity Document — Back Side"
                  value={
                    backDocUrl ? (
                      <a
                        href={backDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>Uploaded (View Back Document)</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      'Not Uploaded'
                    )
                  }
                />
                <DetailRow
                  label="Additional Supporting Document"
                  value={
                    supportDocUrl ? (
                      <a
                        href={supportDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>{draftData.supportingDocName || 'Supporting Document'}</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      'Optional — None Uploaded'
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldSelect
                  label="Seller Type *"
                  value={draftData.sellerType || 'Individual'}
                  onChange={(v) => updateField('sellerType', v)}
                  options={[
                    { value: 'Individual', label: 'Individual Seller' },
                    { value: 'Business', label: 'Registered Business / Corporate' }
                  ]}
                />
                <FieldSelect
                  label="Legal Form / Business Type *"
                  value={draftData.legalForm || draftData.businessType || 'Individual / Sole Proprietor'}
                  onChange={(v) => {
                    updateField('legalForm', v);
                    updateField('businessType', v);
                  }}
                  options={[
                    { value: 'Individual / Sole Proprietor', label: 'Individual / Sole Proprietor' },
                    { value: 'Partnership Firm', label: 'Partnership Firm' },
                    { value: 'Private Limited Company', label: 'Private Limited Company' },
                    { value: 'Public Limited / Enterprise', label: 'Public Limited / Enterprise' }
                  ]}
                />
                <FieldInput
                  label="Legal Name / Business Owner Name *"
                  value={draftData.legalEntityName ?? draftData.legalBusinessName ?? ''}
                  onChange={(v) => {
                    updateField('legalEntityName', v);
                    updateField('legalBusinessName', v);
                  }}
                  required
                />
                <FieldInput
                  label="Business Registration / Trade License Number"
                  value={draftData.businessRegistrationNumber ?? draftData.tradeLicenseNumber ?? ''}
                  onChange={(v) => {
                    updateField('businessRegistrationNumber', v);
                    updateField('tradeLicenseNumber', v);
                  }}
                  placeholder="TRAD/DSCC/... or GSTIN/BIN"
                />
                <div className="sm:col-span-2">
                  <FieldInput
                    label="Full Address *"
                    value={draftData.registeredAddress ?? ''}
                    onChange={(v) => updateField('registeredAddress', v)}
                    required
                  />
                </div>
                <FieldInput
                  label="City / Town *"
                  value={draftData.city ?? ''}
                  onChange={(v) => updateField('city', v)}
                  required
                />
                <FieldInput
                  label="District / State *"
                  value={draftData.district ?? draftData.districtState ?? draftData.state ?? ''}
                  onChange={(v) => {
                    updateField('district', v);
                    updateField('districtState', v);
                    updateField('state', v);
                  }}
                  required
                />
                <FieldInput
                  label="Postal Code *"
                  value={draftData.postalCode ?? draftData.pincode ?? ''}
                  onChange={(v) => {
                    updateField('postalCode', v);
                    updateField('pincode', v);
                  }}
                  required
                />
                <FieldInput
                  label="Country / Region *"
                  value={draftData.countryRegion ?? draftData.country ?? 'Bangladesh'}
                  onChange={(v) => {
                    updateField('countryRegion', v);
                    updateField('country', v);
                  }}
                  required
                />
                <FieldInput
                  label="Person in Charge Name *"
                  value={draftData.personInChargeName ?? ''}
                  onChange={(v) => updateField('personInChargeName', v)}
                  required
                />
                <FieldInput
                  label="Contact Email *"
                  type="email"
                  value={draftData.contactEmail ?? ''}
                  onChange={(v) => updateField('contactEmail', v)}
                  required
                />
                <FieldInput
                  label="Contact Phone *"
                  value={draftData.contactPhone ?? ''}
                  onChange={(v) => updateField('contactPhone', v)}
                  required
                />
                <FieldSelect
                  label="National ID / Identity Document Type *"
                  value={draftData.identityDocType || 'National ID (NID)'}
                  onChange={(v) => updateField('identityDocType', v)}
                  options={[
                    { value: 'National ID (NID)', label: 'National ID Card (NID)' },
                    { value: 'Passport', label: 'Passport' },
                    { value: 'Driving License', label: 'Driving License' }
                  ]}
                />
                <FieldInput
                  label="National ID Number *"
                  value={nidVal}
                  onChange={(v) => {
                    updateField('nationalIdNumber', v);
                    updateField('nidNumber', v);
                  }}
                  placeholder="Enter 10 to 17 digit National ID Number"
                  required
                />
              </div>

              {/* Identity & Supporting Document Uploads (JPG, PNG, WebP, PDF up to 5MB) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                {/* Front Side */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="text-[13px] font-bold text-slate-800">
                    Identity Document — Front Side *
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Clear photo or scan of NID front side (JPG, PNG, PDF • Max 5MB)
                  </p>
                  {frontDocUrl && (
                    <div className="h-28 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                      {String(frontDocUrl).startsWith('data:application/pdf') ? (
                        <span className="text-[12px] font-semibold text-blue-700">PDF Document Attached</span>
                      ) : (
                        <img
                          src={frontDocUrl}
                          alt="NID Front"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-[12px] font-semibold">
                    <span>
                      {uploadingField === 'nidFrontImageUrl'
                        ? 'Uploading...'
                        : frontDocUrl
                        ? 'Replace Front File'
                        : 'Upload Front Side'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleDocumentUpload('nidFrontImageUrl', e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>

                {/* Back Side */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="text-[13px] font-bold text-slate-800">
                    Identity Document — Back Side *
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Clear photo or scan of NID back side (JPG, PNG, PDF • Max 5MB)
                  </p>
                  {backDocUrl && (
                    <div className="h-28 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                      {String(backDocUrl).startsWith('data:application/pdf') ? (
                        <span className="text-[12px] font-semibold text-blue-700">PDF Document Attached</span>
                      ) : (
                        <img
                          src={backDocUrl}
                          alt="NID Back"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-[12px] font-semibold">
                    <span>
                      {uploadingField === 'nidBackImageUrl'
                        ? 'Uploading...'
                        : backDocUrl
                        ? 'Replace Back File'
                        : 'Upload Back Side'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleDocumentUpload('nidBackImageUrl', e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>

                {/* Additional Supporting Document */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="text-[13px] font-bold text-slate-800">
                    Additional Supporting Document
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Trade License, TIN/BIN, or Incorporation Certificate (Max 5MB)
                  </p>
                  {supportDocUrl && (
                    <div className="h-28 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center p-2 text-center">
                      <span className="text-[12px] font-semibold text-emerald-700">
                        {draftData.supportingDocName || 'Supporting Document Attached'}
                      </span>
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[12px] font-semibold">
                    <span>
                      {uploadingField === 'supportingDocUrl'
                        ? 'Uploading...'
                        : supportDocUrl
                        ? 'Replace Supporting Doc'
                        : 'Upload Supporting Doc'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        handleDocumentUpload(
                          'supportingDocUrl',
                          e.target.files?.[0] || null,
                          'supportingDocName'
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    case 'store_information':
      return (
        <div className="space-y-6">
          {mode === 'seller' && (
            <DarazStoreBuilderManager
              sellerProfile={sellerMeta as any}
              showToast={(msg, type) => {
                if (setFeedback) {
                  setFeedback({
                    type: type === 'error' ? 'error' : 'success',
                    message: msg
                  });
                }
              }}
              onProfileUpdated={(updatedProfile) => {
                if (updatedProfile && setSellerMeta) {
                  setSellerMeta((prev) => ({ ...prev, ...updatedProfile }));
                }
                if (updatedProfile?.shopName) {
                  updateField('shopName', updatedProfile.shopName);
                }
                if (updatedProfile?.shopLogo) {
                  updateField('shopLogo', updatedProfile.shopLogo);
                }
                if (updatedProfile?.shopBanner) {
                  updateField('shopBanner', updatedProfile.shopBanner);
                }
                if (fetchSettingsHub) {
                  fetchSettingsHub();
                }
                if (onRefreshParent) {
                  onRefreshParent();
                }
              }}
            />
          )}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              {mode === 'admin' ? 'Marketplace Brand Metadata' : 'Storefront Basic Identity & Return Summary'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label={mode === 'admin' ? 'Marketplace Brand Name' : 'Store Name'}
                value={mode === 'admin' ? draftData.marketplaceName || draftData.shopName : draftData.shopName}
                onChange={(v) =>
                  updateField(mode === 'admin' ? 'marketplaceName' : 'shopName', v)
                }
                required
              />
              <FieldInput
                label="Store Tagline"
                value={draftData.tagline}
                onChange={(v) => updateField('tagline', v)}
                placeholder="Authentic products, fast delivery"
              />
              <FieldInput
                label="Primary Store Category"
                value={draftData.storeCategory || draftData.category}
                onChange={(v) => {
                  updateField('storeCategory', v);
                  updateField('category', v);
                }}
              />
              <FieldInput
                label="Customer Support Hours"
                value={draftData.operatingHours || draftData.businessHours}
                onChange={(v) => {
                  updateField('operatingHours', v);
                  updateField('businessHours', v);
                }}
                placeholder="09:00 AM - 09:00 PM"
              />
              <FieldInput
                label="Store Logo URL"
                value={draftData.shopLogo || draftData.logo}
                onChange={(v) => {
                  updateField('shopLogo', v);
                  updateField('logo', v);
                }}
              />
              <FieldInput
                label="Store Banner URL"
                value={draftData.shopBanner || draftData.bannerUrl}
                onChange={(v) => {
                  updateField('shopBanner', v);
                  updateField('bannerUrl', v);
                }}
              />
              <div className="sm:col-span-2">
                <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
                  Store Description
                </label>
                <textarea
                  rows={2}
                  value={draftData.shopDescription ?? draftData.storeDescription ?? ''}
                  onChange={(e) => {
                    updateField('shopDescription', e.target.value);
                    updateField('storeDescription', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-[14px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
                  Return & Warranty Summary
                </label>
                <textarea
                  rows={2}
                  value={draftData.returnPolicy ?? ''}
                  onChange={(e) => updateField('returnPolicy', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-[14px]"
                />
              </div>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    // 1C. ACCOUNT SETTINGS (Login Email/Phone OTP Modify, Masked Password, 2FA, Sessions)
    // -------------------------------------------------------------------------
    case 'account_settings': {
      const loginEmail =
        draftData.loginEmail || sellerMeta.email || 'seller@alikend.com';
      const loginPhone =
        draftData.loginPhone || sellerMeta.mobileNumber || '+880 1700-000000';
      const activeSessions = Array.isArray(draftData.activeSessions)
        ? draftData.activeSessions
        : [
            {
              id: 'sess_current',
              device: 'Web Browser Session (Current)',
              ipAddress: '127.0.0.1',
              location: 'Verified Operations Desk',
              lastActive: new Date().toISOString(),
              isCurrent: true
            }
          ];

      return (
        <div className="space-y-6">
          {/* Daraz-Style Login Credentials Table with Modify Buttons */}
          <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
            <DetailRow
              label="Login Email Address"
              value={loginEmail}
              badge={
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              }
              action={
                <button
                  type="button"
                  onClick={() =>
                    setOtpModal({
                      open: true,
                      field: 'email',
                      targetValue: loginEmail,
                      otpCode: '',
                      step: 'input',
                      sending: false
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold"
                >
                  Modify
                </button>
              }
            />
            <DetailRow
              label="Login Phone Number"
              value={loginPhone}
              badge={
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              }
              action={
                <button
                  type="button"
                  onClick={() =>
                    setOtpModal({
                      open: true,
                      field: 'mobileNumber',
                      targetValue: loginPhone,
                      otpCode: '',
                      step: 'input',
                      sending: false
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold"
                >
                  Modify
                </button>
              }
            />
            <DetailRow
              label="Account Password"
              value={<span className="font-mono tracking-widest">••••••••••••</span>}
              badge={
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                  Encrypted
                </span>
              }
              action={
                <button
                  type="button"
                  onClick={() => setInlinePwdOpen((v) => !v)}
                  className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold"
                >
                  {inlinePwdOpen ? 'Close' : 'Modify'}
                </button>
              }
            />
          </div>

          {/* Inline Password Modification Panel */}
          {inlinePwdOpen && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-4">
              <h4 className="text-[14px] font-bold text-slate-900">
                Change Account Password
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FieldInput
                  label="Current Password *"
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(v) => setPwdForm((p) => ({ ...p, currentPassword: v }))}
                />
                <FieldInput
                  label="New Password *"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(v) => setPwdForm((p) => ({ ...p, newPassword: v }))}
                />
                <FieldInput
                  label="Confirm New Password *"
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(v) => setPwdForm((p) => ({ ...p, confirmPassword: v }))}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={submitPasswordChange}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold"
                >
                  {saving ? 'Updating Password...' : 'Update Password Now'}
                </button>
              </div>
            </div>
          )}

          {/* Security & Holiday Mode Toggles */}
          <div className="space-y-3">
            <FieldToggle
              label="Two-Factor Authentication (2FA)"
              description="Require OTP verification when logging in from an unrecognized device or browser."
              checked={Boolean(draftData.twoFactorEnabled)}
              onChange={(v) => {
                setIsEditingCard(true);
                updateField('twoFactorEnabled', v);
              }}
            />
            <FieldToggle
              label="Holiday / Vacation Mode"
              description="Temporarily pause incoming orders while keeping your store profile visible."
              checked={Boolean(draftData.holidayMode)}
              onChange={(v) => {
                setIsEditingCard(true);
                updateField('holidayMode', v);
              }}
            />
            {draftData.holidayMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                <FieldInput
                  label="Holiday Start Date"
                  type="date"
                  value={draftData.holidayStartDate}
                  onChange={(v) => {
                    setIsEditingCard(true);
                    updateField('holidayStartDate', v);
                  }}
                />
                <FieldInput
                  label="Holiday End Date"
                  type="date"
                  value={draftData.holidayEndDate}
                  onChange={(v) => {
                    setIsEditingCard(true);
                    updateField('holidayEndDate', v);
                  }}
                />
              </div>
            )}
            <FieldToggle
              label="Auto-Accept Incoming Orders"
              description="Automatically move paid orders into Processing status."
              checked={Boolean(draftData.autoAcceptOrders)}
              onChange={(v) => {
                setIsEditingCard(true);
                updateField('autoAcceptOrders', v);
              }}
            />
          </div>

          {/* Active Sessions & Sign Out of Other Sessions */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-[14px] font-bold text-slate-900">Active Sessions</h4>
                <p className="text-[12px] text-slate-500">
                  Devices currently logged into your {mode === 'admin' ? 'Admin' : 'Seller'} account
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleRevokeOtherSessions}
                className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[12px] font-semibold self-start sm:self-center"
              >
                Sign Out of Other Sessions
              </button>
            </div>
            <div className="space-y-2">
              {activeSessions.map((sess: any, idx: number) => (
                <div
                  key={sess.id || idx}
                  className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-3 text-[13px]"
                >
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{sess.device || 'Browser Session'}</span>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          CURRENT SESSION
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      IP: {sess.ipAddress || '127.0.0.1'} • {sess.location || 'Active'} •{' '}
                      {sess.lastActive ? new Date(sess.lastActive).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 1D. ADMIN SELLER VERIFICATION & PROFILE REVIEW DESK
    // -------------------------------------------------------------------------
    case 'seller_verification_desk': {
      if (mode === 'seller') {
        const vStatus =
          sellerMeta.verificationStatus ||
          settingsHub?.business_information?.verificationStatus ||
          'not_submitted';
        const vHist = Array.isArray(sellerMeta.verificationHistory)
          ? sellerMeta.verificationHistory
          : [];
        const rawPending =
          sellerMeta.pendingProfileChanges ||
          settingsHub?.business_information?.pendingProfileChanges;
        const pendingDiffList = Array.isArray(rawPending)
          ? rawPending
          : Array.isArray(rawPending?.diffs)
          ? rawPending.diffs
          : [];

        return (
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[16px] font-bold text-blue-950">
                  Your Account & Business Verification Status
                </h4>
                <p className="text-[13px] text-blue-800 mt-1">
                  Current Status:{' '}
                  <strong className="uppercase">
                    {VERIFICATION_STAGES.find((s) => s.key === vStatus)?.label || vStatus}
                  </strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white text-blue-800 font-bold text-[12px] border border-blue-200">
                  {sellerMeta.verifiedBadge ? 'Verified Seller Badge Active' : 'Standard Seller'}
                </span>
                {fetchSettingsHub && (
                  <button
                    type="button"
                    onClick={() => fetchSettingsHub()}
                    className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold transition-colors"
                  >
                    Refresh Status
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Buttons to Edit Business Info or Seller Profile */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h5 className="text-[14px] font-bold text-slate-900">
                  Submit or Update Verification Documents
                </h5>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Upload your National ID (NID), Trade License, or update your Business & Seller Profile details for Admin verification.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (openCardModal) {
                      openCardModal('seller_profile');
                      setTimeout(() => setIsEditingCard(true), 50);
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-semibold transition-colors"
                >
                  Edit Seller Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (openCardModal) {
                      openCardModal('business_information');
                      setTimeout(() => setIsEditingCard(true), 50);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-2xs transition-colors"
                >
                  Update & Submit Business Info
                </button>
              </div>
            </div>

            {pendingDiffList.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
                <h5 className="text-[14px] font-bold text-amber-950">
                  Submitted Changes Pending Admin Review ({pendingDiffList.length})
                </h5>
                <div className="space-y-1 text-[13px]">
                  {pendingDiffList.map((d: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-semibold">{d.label || d.field}:</span>
                      <span className="line-through text-slate-400">
                        {String(d.previousValue ?? d.oldValue ?? '—')}
                      </span>
                      <span>→</span>
                      <span className="font-semibold text-amber-900">
                        {String(d.proposedValue ?? d.newValue ?? '—')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
              <h5 className="text-[14px] font-bold text-slate-900">Verification History</h5>
              {vHist.length === 0 ? (
                <p className="text-[13px] text-slate-500">
                  No verification decisions recorded yet. Click "Update & Submit Business Info" above to submit your documents for review.
                </p>
              ) : (
                vHist.map((h: any, i: number) => (
                  <div key={h.id || i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[13px]">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>{h.action || h.status}</span>
                      <span className="text-[12px] text-slate-500">
                        {h.timestamp || h.createdAt
                          ? new Date(h.timestamp || h.createdAt).toLocaleString()
                          : ''}
                      </span>
                    </div>
                    {(h.reason || h.note) && (
                      <p className="text-slate-600 mt-1">{h.reason || h.note}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      // ADMIN MODE: Full Seller Verification & Profile Review Desk
      const configurableFields = [
        { key: 'shopName', label: 'Shop / Display Name' },
        { key: 'legalEntityName', label: 'Legal Business / Owner Name' },
        { key: 'businessRegistrationNumber', label: 'Business Registration / Trade License No.' },
        { key: 'nationalIdNumber', label: 'National ID (NID) Number' },
        { key: 'registeredAddress', label: 'Registered Business Address' },
        { key: 'bankAccountNumber', label: 'Payout Bank Account Number' }
      ];

      return (
        <div className="space-y-6">
          {/* Top Search & Filters Bar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <FieldInput
                  label="Search Seller (Shop Name, Seller ID, Email, Phone)"
                  value={reviewSearch}
                  onChange={setReviewSearch}
                  placeholder="e.g. SEL-, Store Name, email..."
                />
              </div>
              <FieldSelect
                label="Filter by Status"
                value={reviewStatusFilter}
                onChange={setReviewStatusFilter}
                options={[
                  { value: 'all', label: 'All Sellers' },
                  { value: 'pending_admin_review', label: 'Pending Review' },
                  { value: 'has_pending_changes', label: 'Has Proposed Profile Changes' },
                  { value: 'under_verification', label: 'Under Verification' },
                  { value: 'approved', label: 'Approved / Verified' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'resubmission_required', label: 'More Info Required' },
                  { value: 'suspended', label: 'Suspended Accounts' }
                ]}
              />
              <div className="grid grid-cols-2 gap-2">
                <FieldInput
                  label="From Date"
                  type="date"
                  value={reviewDateFrom}
                  onChange={setReviewDateFrom}
                />
                <FieldInput
                  label="To Date"
                  type="date"
                  value={reviewDateTo}
                  onChange={setReviewDateTo}
                />
              </div>
            </div>
          </div>

          {/* Master-Detail Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Seller Queue List (5 cols) */}
            <div className="lg:col-span-5 border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col max-h-[560px]">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[13px] font-bold text-slate-800">
                  Seller Queue ({sellerReviews.length})
                </span>
                {reviewsLoading && <Loader2 size={15} className="animate-spin text-blue-600" />}
              </div>
              <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                {sellerReviews.length === 0 ? (
                  <div className="p-8 text-center text-[13px] text-slate-500">
                    No sellers match the current filter criteria.
                  </div>
                ) : (
                  sellerReviews.map((s) => {
                    const isSelected =
                      selectedReviewSeller &&
                      (selectedReviewSeller._id === s._id ||
                        selectedReviewSeller.sellerId === s.sellerId);
                    return (
                      <button
                        key={s._id || s.sellerId}
                        type="button"
                        onClick={() => setSelectedReviewSeller(s)}
                        className={`w-full text-left p-3.5 transition-colors flex items-start justify-between gap-2 ${
                          isSelected ? 'bg-blue-50/90 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-slate-900 truncate">
                              {s.shopName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                              {s.sellerId}
                            </span>
                          </div>
                          <div className="text-[12px] text-slate-500 truncate mt-0.5">
                            {s.ownerName} • {s.email}
                          </div>
                          {s.pendingProfileChanges && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                              Proposed Profile Changes ({s.pendingProfileChanges.diffs?.length || 1})
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            s.verificationStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.verificationStatus === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.verificationStatus}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Seller Inspection & Decision Workspace (7 cols) */}
            <div className="lg:col-span-7 border border-slate-200 rounded-xl bg-white p-5 space-y-5 max-h-[560px] overflow-y-auto">
              {!selectedReviewSeller ? (
                <div className="p-12 text-center text-slate-500 text-[14px]">
                  Select a seller from the left queue to inspect business documents and approve or reject changes.
                </div>
              ) : (
                <>
                  {/* Seller Header Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-[18px] font-bold text-slate-900">
                          {selectedReviewSeller.shopName}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedReviewSeller.sellerId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            selectedReviewSeller.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Account: {selectedReviewSeller.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 mt-1">
                        Owner: {selectedReviewSeller.ownerName} • {selectedReviewSeller.email} •{' '}
                        {selectedReviewSeller.mobileNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        handleSellerReviewDecision(selectedReviewSeller._id, 'toggle_suspension')
                      }
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${
                        selectedReviewSeller.status === 'suspended'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {selectedReviewSeller.status === 'suspended'
                        ? 'Reactivate Seller'
                        : 'Suspend Seller'}
                    </button>
                  </div>

                  {/* Previous Value vs Proposed Value Comparison Table */}
                  {selectedReviewSeller.pendingProfileChanges &&
                    Array.isArray(selectedReviewSeller.pendingProfileChanges.diffs) && (
                      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[13px] font-bold text-amber-950">
                            Proposed Profile & Business Changes (Previous vs. Proposed Value)
                          </h4>
                          <span className="text-[11px] text-amber-800 font-semibold">
                            Submitted{' '}
                            {selectedReviewSeller.pendingProfileChanges.submittedAt
                              ? new Date(
                                  selectedReviewSeller.pendingProfileChanges.submittedAt
                                ).toLocaleString()
                              : ''}
                          </span>
                        </div>
                        <div className="overflow-x-auto border border-amber-200 rounded-lg bg-white">
                          <table className="w-full text-left border-collapse text-[12px]">
                            <thead className="bg-amber-100/60 text-amber-950 font-bold">
                              <tr>
                                <th className="py-2 px-3">Field</th>
                                <th className="py-2 px-3">Previous Value</th>
                                <th className="py-2 px-3">Proposed Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                              {selectedReviewSeller.pendingProfileChanges.diffs.map(
                                (d: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="py-2 px-3 font-semibold text-slate-800">
                                      {d.field}
                                    </td>
                                    <td className="py-2 px-3 text-slate-500 line-through">
                                      {String(d.previousValue || '—')}
                                    </td>
                                    <td className="py-2 px-3 font-bold text-blue-700">
                                      {String(d.proposedValue || '—')}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Business & NID Information Inspection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-500">Seller Type:</span>{' '}
                      <strong className="text-slate-900">
                        {selectedReviewSeller.businessInformation?.sellerType}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Legal Name:</span>{' '}
                      <strong className="text-slate-900">
                        {selectedReviewSeller.businessInformation?.legalEntityName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Registration No:</span>{' '}
                      <strong className="text-slate-900">
                        {selectedReviewSeller.businessInformation?.businessRegistrationNumber || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">NID Number:</span>{' '}
                      <strong className="font-mono text-slate-900">
                        {canViewSensitiveDocs
                          ? selectedReviewSeller.businessInformation?.nationalIdNumber ||
                            selectedReviewSeller.businessInformation?.maskedNationalIdNumber
                          : selectedReviewSeller.businessInformation?.maskedNationalIdNumber}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Address:</span>{' '}
                      <strong className="text-slate-900">
                        {selectedReviewSeller.businessInformation?.registeredAddress},{' '}
                        {selectedReviewSeller.businessInformation?.city}{' '}
                        {selectedReviewSeller.businessInformation?.postalCode}
                      </strong>
                    </div>
                  </div>

                  {/* Supporting Identity Documents (Least-Privilege Enforced) */}
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-bold text-slate-800">
                      Uploaded Identity & Supporting Documents
                    </h4>
                    {!canViewSensitiveDocs ? (
                      <div className="p-3 rounded-lg bg-slate-100 text-[12px] text-slate-600">
                        Restricted: Your admin role does not have privilege to view raw identity document files.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                          <div className="text-[12px] font-semibold text-slate-700 mb-1">
                            NID Front Side
                          </div>
                          {selectedReviewSeller.businessInformation?.nidFrontImageUrl ? (
                            <a
                              href={selectedReviewSeller.businessInformation.nidFrontImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[12px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <span>Inspect Front</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">Not Uploaded</span>
                          )}
                        </div>
                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                          <div className="text-[12px] font-semibold text-slate-700 mb-1">
                            NID Back Side
                          </div>
                          {selectedReviewSeller.businessInformation?.nidBackImageUrl ? (
                            <a
                              href={selectedReviewSeller.businessInformation.nidBackImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[12px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <span>Inspect Back</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">Not Uploaded</span>
                          )}
                        </div>
                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                          <div className="text-[12px] font-semibold text-slate-700 mb-1">
                            Supporting Doc
                          </div>
                          {selectedReviewSeller.businessInformation?.supportingDocUrl ? (
                            <a
                              href={selectedReviewSeller.businessInformation.supportingDocUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[12px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <span>Inspect Doc</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">None</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin Decision & Private Notes Form */}
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <FieldInput
                      label="Rejection Reason / Request More Info Instructions (Visible to Seller)"
                      value={reviewReason}
                      onChange={setReviewReason}
                      placeholder="Required if Rejecting or Requesting More Information..."
                    />
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <FieldInput
                          label="Private Admin Review Note (Internal Audit Only)"
                          value={reviewPrivateNote}
                          onChange={setReviewPrivateNote}
                          placeholder="Add confidential compliance note..."
                        />
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleSellerReviewDecision(selectedReviewSeller._id, 'add_note')
                        }
                        className="px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-semibold"
                      >
                        Add Note
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleSellerReviewDecision(selectedReviewSeller._id, 'approve')
                        }
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold"
                      >
                        Approve & Verify Seller
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleSellerReviewDecision(selectedReviewSeller._id, 'request_more_info')
                        }
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold"
                      >
                        Request More Info
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleSellerReviewDecision(selectedReviewSeller._id, 'under_verification')
                        }
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold"
                      >
                        Mark Under Verification
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleSellerReviewDecision(selectedReviewSeller._id, 'reject')
                        }
                        className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold"
                      >
                        Reject Verification
                      </button>
                    </div>
                  </div>

                  {/* Private Review Notes & Verification History */}
                  {(selectedReviewSeller.adminReviewNotes?.length > 0 ||
                    selectedReviewSeller.verificationHistory?.length > 0) && (
                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <h5 className="text-[12px] font-bold uppercase text-slate-500">
                        Verification & Review Audit Trail
                      </h5>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {(selectedReviewSeller.adminReviewNotes || []).map((n: any) => (
                          <div
                            key={n.id}
                            className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-[12px]"
                          >
                            <span className="font-bold text-purple-900">[Private Note]</span>{' '}
                            {n.note} —{' '}
                            <span className="text-purple-700">
                              {n.reviewerEmail} ({new Date(n.timestamp).toLocaleString()})
                            </span>
                          </div>
                        ))}
                        {(selectedReviewSeller.verificationHistory || []).map((h: any, i: number) => (
                          <div
                            key={h.id || i}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[12px]"
                          >
                            <span className="font-bold text-slate-900">{h.action}</span> by{' '}
                            <span className="font-medium text-blue-700">{h.reviewerEmail}</span> (
                            {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''})
                            {(h.reason || h.note) && (
                              <div className="text-slate-600 mt-0.5">{h.reason || h.note}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Configure Which Seller Profile Fields Require Admin Approval */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div>
              <h4 className="text-[14px] font-bold text-slate-900">
                Governance Policy: Fields Requiring Admin Approval After Verification
              </h4>
              <p className="text-[12px] text-slate-500">
                Select which seller fields automatically trigger a &ldquo;Pending Review&rdquo; diff workflow when modified by a verified seller.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {configurableFields.map((f) => {
                const active = approvalRequiredFields.includes(f.key);
                return (
                  <label
                    key={f.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-[13px] cursor-pointer ${
                      active
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => handleToggleApprovalRuleField(f.key)}
                      className="h-4 w-4 rounded text-blue-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 2. FINANCE
    // -------------------------------------------------------------------------
    case 'bank_account':
      return (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[12px] font-semibold uppercase text-slate-500">
                Active Masked Settlement Account
              </p>
              <p className="text-[16px] font-bold font-mono text-slate-900 mt-0.5">
                {draftData.maskedAccountNumber || 'Not Linked'}
              </p>
              {draftData.bankName && (
                <p className="text-[12px] text-slate-600 mt-0.5">
                  {draftData.bankName}
                  {draftData.bankCountry ? ` • ${draftData.bankCountry}` : ''}
                  {draftData.bankCategory ? ` (${draftData.bankCategory})` : ''}
                  {draftData.supportedCurrency ? ` • ${draftData.supportedCurrency}` : ''}
                </p>
              )}
            </div>
            <span className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-emerald-100 text-emerald-800 self-start sm:self-center">
              Encrypted Storage
            </span>
          </div>

          {/* Searchable, Paginated 500+ Global Bank & MFS Directory Selector */}
          <SellerBankDirectorySelector
            selectedInstitutionId={draftData.institutionId}
            selectedBankName={draftData.bankName}
            onSelectInstitution={(inst) => {
              updateField('institutionId', inst.institutionId);
              updateField('bankName', inst.officialName);
              updateField('bankCountry', inst.country);
              updateField('bankCategory', inst.category);
              updateField('supportedCurrency', inst.supportedCurrencies[0] || 'BDT');
              updateField('officialWebsite', inst.officialWebsite);
              updateField('verificationSource', inst.verificationSource);
              updateField('routingCodeType', inst.routingCodeType);
              if (inst.category === 'Mobile Financial Service (MFS)') {
                updateField('payoutMethod', 'bKash / Nagad / Mobile Financial Service');
              } else if (inst.category === 'Payment Service Provider') {
                updateField('payoutMethod', 'Cross-Border / Payment Service Provider');
              } else {
                updateField('payoutMethod', 'Bank Transfer (BEFTN/NEFT/RTGS/ACH)');
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Account Holder / Beneficiary Name"
              value={draftData.accountHolderName}
              onChange={(v) => updateField('accountHolderName', v)}
              required
            />
            <FieldInput
              label="Official Bank / Financial Institution Name"
              value={draftData.bankName}
              onChange={(v) => updateField('bankName', v)}
              required
            />
            <FieldInput
              label="Country of Operation"
              value={draftData.bankCountry || 'Bangladesh'}
              onChange={(v) => updateField('bankCountry', v)}
            />
            <FieldSelect
              label="Institution Category (Banks vs. MFS / Payment Providers)"
              value={draftData.bankCategory || 'Commercial Bank'}
              onChange={(v) => updateField('bankCategory', v)}
              options={[
                { value: 'Commercial Bank', label: 'Commercial Bank (Traditional)' },
                { value: 'Islamic Bank', label: 'Islamic Bank (Shariah-Compliant)' },
                { value: 'State-Owned / Development Bank', label: 'State-Owned / Development Bank' },
                { value: 'Digital / Neobank', label: 'Digital / Neobank' },
                { value: 'Regional / Cooperative Bank', label: 'Regional / Cooperative Bank' },
                { value: 'Mobile Financial Service (MFS)', label: 'Mobile Financial Service (MFS — Separate Category)' },
                { value: 'Payment Service Provider', label: 'Payment Service Provider / E-Wallet (Separate Category)' }
              ]}
            />
            <FieldInput
              label="Bank Account / MFS Wallet Number (6–24 digits)"
              value={draftData.accountNumber}
              onChange={(v) => updateField('accountNumber', v)}
              required
            />
            <FieldInput
              label={draftData.routingCodeType || 'Routing / IFSC / SWIFT / IBAN Code'}
              value={draftData.ifscCode}
              onChange={(v) => updateField('ifscCode', v.toUpperCase())}
              placeholder="e.g. Routing No., IFSC, SWIFT, or IBAN"
            />
            <FieldInput
              label="Branch Name / City"
              value={draftData.branchName}
              onChange={(v) => updateField('branchName', v)}
            />
            <FieldInput
              label="Settlement Currency"
              value={draftData.supportedCurrency || 'BDT'}
              onChange={(v) => updateField('supportedCurrency', v.toUpperCase())}
              placeholder="BDT, USD, INR, GBP, EUR..."
            />
            <div className="sm:col-span-2">
              <FieldSelect
                label="Preferred Payout Rail"
                value={draftData.payoutMethod || 'Bank Transfer (BEFTN/NEFT/RTGS/ACH)'}
                onChange={(v) => updateField('payoutMethod', v)}
                options={[
                  { value: 'Bank Transfer (BEFTN/NEFT/RTGS/ACH)', label: 'Bank Transfer (BEFTN / NEFT / RTGS / ACH / SEPA)' },
                  { value: 'bKash / Nagad / Mobile Financial Service', label: 'Mobile Financial Service (bKash / Nagad / Rocket / M-Pesa / GCash)' },
                  { value: 'Cross-Border / Payment Service Provider', label: 'Payment Service Provider (Payoneer / Wise / WorldFirst / Stripe)' },
                  { value: 'UPI / Instant Settlement', label: 'Instant National Rail (NPSB / UPI / Pix / Faster Payments)' }
                ]}
              />
            </div>
          </div>
        </div>
      );

    case 'global_bank_directory':
      return <AdminGlobalBankDirectoryManager token={token} mode={mode} />;

    case 'commission_settings':
      return mode === 'seller' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-[13px] text-blue-800 font-medium">
              Marketplace commission tiers are governed by Platform Administration. Below is your
              active store fee schedule:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[12px] text-slate-500">Active Commission Rate</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">
                {draftData.commissionRate ?? financeSummary.commissionRate ?? 10}%
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[12px] text-slate-500">Settlement Cycle</p>
              <p className="text-[16px] font-bold text-slate-900 mt-2">
                {draftData.settlementCycle || 'Weekly (Every Monday)'}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[12px] text-slate-500">Payment Gateway Fee</p>
              <p className="text-[16px] font-bold text-slate-900 mt-2">
                {draftData.paymentGatewayFee || '1.5% Standard'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Default Marketplace Commission (%)"
            type="number"
            value={draftData.defaultCommissionRate ?? 10}
            onChange={(v) => updateField('defaultCommissionRate', Number(v))}
          />
          <FieldInput
            label="Tax Deduction at Source (%)"
            type="number"
            value={draftData.taxDeductionPercent ?? 5}
            onChange={(v) => updateField('taxDeductionPercent', Number(v))}
          />
          <FieldInput
            label="Minimum Seller Withdrawal Amount (₹)"
            type="number"
            value={draftData.minimumWithdrawalAmount ?? 500}
            onChange={(v) => updateField('minimumWithdrawalAmount', Number(v))}
          />
          <FieldSelect
            label="Standard Settlement Cycle"
            value={draftData.settlementCycle || 'Weekly (Every Monday)'}
            onChange={(v) => updateField('settlementCycle', v)}
            options={[
              { value: 'T+3 Rolling Settlement', label: 'T+3 Rolling Settlement' },
              { value: 'Weekly (Every Monday)', label: 'Weekly (Every Monday)' },
              { value: 'Bi-Weekly (1st & 16th)', label: 'Bi-Weekly (1st & 16th)' }
            ]}
          />
        </div>
      );

    case 'payment_settlement_history': {
      const list = Array.isArray(financeSummary.withdrawals) ? financeSummary.withdrawals : [];
      return (
        <div className="space-y-3">
          {list.length === 0 ? (
            <div className="p-8 text-center border border-slate-200 rounded-xl text-slate-500 text-[14px]">
              No settlement payouts recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {list.map((w: any, idx: number) => (
                    <tr key={w.id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-600">
                        {w.requestedAt ? new Date(w.requestedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-medium">{w.paymentMethod || 'Bank'}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        ₹{Number(w.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[12px] font-semibold ${
                            w.status === 'approved' || w.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {String(w.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[12px] text-slate-500">
                        {w.transactionRef || w.id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    case 'earnings_payouts':
      return mode === 'seller' ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-[12px] font-semibold text-emerald-700 uppercase">
                Available Balance
              </p>
              <p className="text-[24px] font-bold text-emerald-950 mt-1">
                ₹{Number(financeSummary.walletBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-[12px] font-semibold text-blue-700 uppercase">
                Total Net Earnings
              </p>
              <p className="text-[24px] font-bold text-blue-950 mt-1">
                ₹{Number(financeSummary.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[12px] font-semibold text-amber-700 uppercase">
                Pending Payouts
              </p>
              <p className="text-[24px] font-bold text-amber-950 mt-1">
                ₹{Number(financeSummary.pendingWithdrawals || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-[15px] font-semibold text-slate-900">
              Request Payout Withdrawal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FieldInput
                label="Amount (₹)"
                type="number"
                value={withdrawForm.amount}
                onChange={(v) => setWithdrawForm((p) => ({ ...p, amount: v }))}
                placeholder="e.g. 2500"
              />
              <FieldSelect
                label="Payout Channel"
                value={withdrawForm.paymentMethod}
                onChange={(v) => setWithdrawForm((p) => ({ ...p, paymentMethod: v }))}
                options={[
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'bKash / Nagad', label: 'bKash / Nagad' },
                  { value: 'UPI', label: 'UPI' }
                ]}
              />
              <FieldInput
                label="Reference Note"
                value={withdrawForm.notes}
                onChange={(v) => setWithdrawForm((p) => ({ ...p, notes: v }))}
                placeholder="Weekly settlement"
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleRequestWithdrawal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[14px] font-semibold"
            >
              Submit Withdrawal Request
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-[12px] font-semibold text-blue-700 uppercase">Platform Total GMV</p>
            <p className="text-[24px] font-bold text-blue-950 mt-1">
              ₹{Number(financeSummary.totalGMV || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-[12px] font-semibold text-emerald-700 uppercase">
              Commission Revenue
            </p>
            <p className="text-[24px] font-bold text-emerald-950 mt-1">
              ₹{Number(financeSummary.totalCommission || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[12px] font-semibold text-amber-700 uppercase">
              Pending Seller Payouts
            </p>
            <p className="text-[24px] font-bold text-amber-950 mt-1">
              ₹{Number(financeSummary.pendingWithdrawals || 0).toLocaleString()}
            </p>
          </div>
        </div>
      );

    case 'transaction_history': {
      const txList = Array.isArray(financeSummary.transactions) ? financeSummary.transactions : [];
      return (
        <div className="space-y-3">
          {txList.length === 0 ? (
            <div className="p-8 text-center border border-slate-200 rounded-xl text-slate-500 text-[14px]">
              No financial ledger transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Gross</th>
                    <th className="py-3 px-4">Net Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {txList.map((tx: any, idx: number) => (
                    <tr key={tx.id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-[12px] text-slate-700">
                        {tx.id}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {tx.date ? new Date(tx.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-4">{tx.description}</td>
                      <td className="py-2.5 px-4">₹{Number(tx.grossAmount || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-700">
                        +₹{Number(tx.netAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    case 'tax_invoice_info':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Tax Registration Number (VAT / GST / BIN)"
            value={draftData.taxRegistrationNumber}
            onChange={(v) => updateField('taxRegistrationNumber', v)}
          />
          <FieldInput
            label="Default VAT / GST Rate (%)"
            type="number"
            value={draftData.vatGstRate ?? 5}
            onChange={(v) => updateField('vatGstRate', Number(v))}
          />
          <FieldInput
            label="Default HSN / SAC Tariff Code"
            value={draftData.hsnSacDefault}
            onChange={(v) => updateField('hsnSacDefault', v)}
          />
          <FieldInput
            label="Authorized Signatory Name"
            value={draftData.authorizedSignatory}
            onChange={(v) => updateField('authorizedSignatory', v)}
          />
          <div className="sm:col-span-2">
            <FieldInput
              label="Legal Invoice Footer Note"
              value={draftData.invoiceFooterNote}
              onChange={(v) => updateField('invoiceFooterNote', v)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldToggle
              label="Automatically Generate Tax Invoice on Order Packaging"
              checked={Boolean(draftData.autoGenerateTaxInvoice)}
              onChange={(v) => updateField('autoGenerateTaxInvoice', v)}
            />
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    // 3. LOGISTICS
    // -------------------------------------------------------------------------
    case 'warehouse_pickup': {
      const warehouses = Array.isArray(draftData.warehouses) ? draftData.warehouses : [];
      return (
        <DarazWarehousePickupManager
          theme="light"
          warehousesProp={warehouses}
          onChangeWarehouses={(next) => updateField('warehouses', next)}
        />
      );
    }

    case 'delivery_service': {
      const configuredWarehouses = Array.isArray(settingsHub?.warehouse_pickup?.warehouses)
        ? settingsHub.warehouse_pickup.warehouses
        : [];
      return (
        <DarazDeliveryServiceManager
          theme="light"
          draftData={draftData}
          onUpdateField={updateField}
          warehousesProp={configuredWarehouses}
          onNavigateBreadcrumb={() => {
            if (requestCloseCardModal) requestCloseCardModal();
          }}
        />
      );
    }

    case 'shipping_provider': {
      const configuredWarehouses = Array.isArray(settingsHub?.warehouse_pickup?.warehouses)
        ? settingsHub.warehouse_pickup.warehouses
        : [];
      return (
        <DarazShippingProviderManager
          theme="light"
          draftData={draftData}
          onUpdateField={updateField}
          warehousesProp={configuredWarehouses}
          onNavigateBreadcrumb={() => {
            if (requestCloseCardModal) requestCloseCardModal();
          }}
        />
      );
    }

    case 'shipping_charge_settings':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Inside City Base Rate (₹)"
            type="number"
            value={draftData.insideCityRate ?? 60}
            onChange={(v) => updateField('insideCityRate', Number(v))}
          />
          <FieldInput
            label="Suburban / Metro Periphery Rate (₹)"
            type="number"
            value={draftData.suburbanRate ?? 90}
            onChange={(v) => updateField('suburbanRate', Number(v))}
          />
          <FieldInput
            label="Outside City / Nationwide Rate (₹)"
            type="number"
            value={draftData.outsideCityRate ?? 120}
            onChange={(v) => updateField('outsideCityRate', Number(v))}
          />
          <FieldInput
            label="Extra Weight Charge per Kg (₹)"
            type="number"
            value={draftData.extraKgRate ?? 25}
            onChange={(v) => updateField('extraKgRate', Number(v))}
          />
          <FieldInput
            label="Free Shipping Order Threshold (₹)"
            type="number"
            value={draftData.freeShippingThreshold ?? 999}
            onChange={(v) => updateField('freeShippingThreshold', Number(v))}
          />
          <div className="sm:col-span-2">
            <FieldToggle
              label="Enable Free Shipping Promotion Above Threshold"
              checked={Boolean(draftData.enableFreeShipping)}
              onChange={(v) => updateField('enableFreeShipping', v)}
            />
          </div>
        </div>
      );

    case 'package_weight_dimensions':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Default Package Weight (kg)"
            type="number"
            value={draftData.defaultWeightKg ?? 0.5}
            onChange={(v) => updateField('defaultWeightKg', Number(v))}
          />
          <FieldInput
            label="Volumetric Divisor"
            type="number"
            value={draftData.volumetricDivisor ?? 5000}
            onChange={(v) => updateField('volumetricDivisor', Number(v))}
          />
          <FieldInput
            label="Default Length (cm)"
            type="number"
            value={draftData.defaultLengthCm ?? 25}
            onChange={(v) => updateField('defaultLengthCm', Number(v))}
          />
          <FieldInput
            label="Default Width (cm)"
            type="number"
            value={draftData.defaultWidthCm ?? 20}
            onChange={(v) => updateField('defaultWidthCm', Number(v))}
          />
          <FieldInput
            label="Default Height (cm)"
            type="number"
            value={draftData.defaultHeightCm ?? 10}
            onChange={(v) => updateField('defaultHeightCm', Number(v))}
          />
          <FieldSelect
            label="Default Packaging Material"
            value={draftData.packagingMaterial || 'Corrugated Box + Bubble Wrap'}
            onChange={(v) => updateField('packagingMaterial', v)}
            options={[
              { value: 'Corrugated Box + Bubble Wrap', label: 'Corrugated Box + Bubble Wrap' },
              { value: 'Tamper-Proof Poly Flyer', label: 'Tamper-Proof Poly Flyer' },
              { value: 'Heavy Duty Wooden Crate', label: 'Heavy Duty Wooden Crate' }
            ]}
          />
        </div>
      );

    case 'invoice_number_settings': {
      const configuredWarehouses = Array.isArray(settingsHub?.warehouse_pickup?.warehouses)
        ? settingsHub.warehouse_pickup.warehouses
        : [];
      return (
        <DarazInvoiceNumberManager
          theme="light"
          draftData={draftData}
          onUpdateField={updateField}
          businessInfoProp={settingsHub?.business_information}
          warehousesProp={configuredWarehouses}
          onNavigateBreadcrumb={() => {
            if (requestCloseCardModal) requestCloseCardModal();
          }}
        />
      );
    }

    // -------------------------------------------------------------------------
    // 4. USER MANAGEMENT
    // -------------------------------------------------------------------------
    case 'manage_users':
    case 'roles_permissions': {
      const mergedUserDraft = {
        ...(settingsHub?.manage_users || {}),
        ...(settingsHub?.roles_permissions || {}),
        ...draftData,
      };
      return (
        <DarazUserManagementManager
          theme="light"
          initialTab={cardId === 'roles_permissions' ? 'roles' : 'sub_accounts'}
          draftData={mergedUserDraft}
          onUpdateField={updateField}
          onNavigateBreadcrumb={() => {
            if (requestCloseCardModal) requestCloseCardModal();
          }}
        />
      );
    }

    case 'login_security':
      return (
        <div className="space-y-3">
          <FieldToggle
            label="Two-Factor Authentication (2FA)"
            description="Require OTP verification code during sign-in from new browsers."
            checked={Boolean(draftData.twoFactorEnabled)}
            onChange={(v) => updateField('twoFactorEnabled', v)}
          />
          <FieldToggle
            label="Login Alert Notifications"
            description="Send instant email alert whenever your account is accessed from a new IP."
            checked={Boolean(draftData.loginAlertEmail)}
            onChange={(v) => updateField('loginAlertEmail', v)}
          />
          <FieldSelect
            label="2FA Verification Channel"
            value={draftData.twoFactorMethod || 'Email & SMS OTP'}
            onChange={(v) => updateField('twoFactorMethod', v)}
            options={[
              { value: 'Email & SMS OTP', label: 'Email & SMS OTP' },
              { value: 'Authenticator App (TOTP)', label: 'Authenticator App (TOTP)' }
            ]}
          />
          <FieldInput
            label="Idle Session Timeout (Minutes)"
            type="number"
            value={draftData.sessionTimeoutMinutes ?? 60}
            onChange={(v) => updateField('sessionTimeoutMinutes', Number(v))}
          />
        </div>
      );

    case 'email_mobile': {
      const loginEmailVal =
        draftData.email || draftData.primaryEmail || sellerMeta.email || 'seller@alikend.com';
      const loginPhoneVal =
        draftData.mobileNumber || draftData.primaryMobile || sellerMeta.mobileNumber || '+880 1700-000000';
      return (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
            <DetailRow
              label="Primary Login Email"
              value={loginEmailVal}
              badge={
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OTP Verified
                </span>
              }
              action={
                <button
                  type="button"
                  onClick={() =>
                    setOtpModal({
                      open: true,
                      field: 'email',
                      targetValue: loginEmailVal,
                      otpCode: '',
                      step: 'input',
                      sending: false
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold"
                >
                  Modify via OTP
                </button>
              }
            />
            <DetailRow
              label="Primary Login Mobile Number"
              value={loginPhoneVal}
              badge={
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OTP Verified
                </span>
              }
              action={
                <button
                  type="button"
                  onClick={() =>
                    setOtpModal({
                      open: true,
                      field: 'mobileNumber',
                      targetValue: loginPhoneVal,
                      otpCode: '',
                      step: 'input',
                      sending: false
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold"
                >
                  Modify via OTP
                </button>
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Recovery / Secondary Notification Email"
              type="email"
              value={draftData.secondaryNotificationEmail ?? draftData.recoveryEmail ?? ''}
              onChange={(v) => {
                updateField('secondaryNotificationEmail', v);
                updateField('recoveryEmail', v);
              }}
            />
            <FieldInput
              label="Alert & Escalation Phone"
              value={draftData.alertMobile ?? ''}
              onChange={(v) => updateField('alertMobile', v)}
            />
          </div>
        </div>
      );
    }

    case 'password_change':
      return (
        <div className="space-y-4 max-w-md">
          <FieldInput
            label="Current Password"
            type="password"
            value={pwdForm.currentPassword}
            onChange={(v) => setPwdForm((p) => ({ ...p, currentPassword: v }))}
            required
          />
          <FieldInput
            label="New Password (minimum 6 characters)"
            type="password"
            value={pwdForm.newPassword}
            onChange={(v) => setPwdForm((p) => ({ ...p, newPassword: v }))}
            required
          />
          <FieldInput
            label="Confirm New Password"
            type="password"
            value={pwdForm.confirmPassword}
            onChange={(v) => setPwdForm((p) => ({ ...p, confirmPassword: v }))}
            required
          />
        </div>
      );

    // -------------------------------------------------------------------------
    // 5. CHAT (Daraz-Inspired Comprehensive 7-Tab Chat Settings System)
    // -------------------------------------------------------------------------
    case 'quick_replies':
    case 'automated_replies':
    case 'chat_notifications':
    case 'chat_keyword_tags':
    case 'customer_support_integration': {
      const mergedChatDraft = {
        ...(settingsHub?.quick_replies || {}),
        ...(settingsHub?.automated_replies || {}),
        ...(settingsHub?.chat_notifications || {}),
        ...(settingsHub?.chat_keyword_tags || {}),
        ...(settingsHub?.customer_support_integration || {}),
        ...draftData,
      };
      const initialTabMap: Record<
        string,
        | 'user_management'
        | 'quick_reply'
        | 'auto_reply'
        | 'notification'
        | 'keyword_tag'
        | 'blacklist_keywords'
        | 'agent_status'
      > = {
        quick_replies: 'quick_reply',
        automated_replies: 'auto_reply',
        chat_notifications: 'notification',
        chat_keyword_tags: 'keyword_tag',
        customer_support_integration: 'user_management',
      };
      return (
        <DarazChatSettingsManager
          theme="light"
          initialTab={initialTabMap[cardId] || 'user_management'}
          draftData={mergedChatDraft}
          onUpdateField={updateField}
          adminEmail={
            sellerMeta.email ||
            settingsHub?.email_mobile?.email ||
            'mdhabiburmollah635@gmail.com'
          }
          onNavigateBreadcrumb={() => {
            if (requestCloseCardModal) requestCloseCardModal();
          }}
        />
      );
    }

    // -------------------------------------------------------------------------
    // 6. SYSTEM
    // -------------------------------------------------------------------------
    case 'notification_preferences':
      return (
        <div className="space-y-3">
          <FieldToggle
            label="New Order Placed Alerts"
            checked={Boolean(draftData.newOrderAlert)}
            onChange={(v) => updateField('newOrderAlert', v)}
          />
          <FieldToggle
            label="Order Cancellation & Return Requests"
            checked={Boolean(draftData.orderCancellationAlert)}
            onChange={(v) => updateField('orderCancellationAlert', v)}
          />
          <FieldToggle
            label="Low Stock & Out-of-Stock Warnings"
            checked={Boolean(draftData.lowStockWarning)}
            onChange={(v) => updateField('lowStockWarning', v)}
          />
          <FieldToggle
            label="Settlement & Payout Processed Alerts"
            checked={Boolean(draftData.payoutProcessedAlert)}
            onChange={(v) => updateField('payoutProcessedAlert', v)}
          />
          <FieldToggle
            label="Policy & Compliance Announcements"
            checked={Boolean(draftData.policyUpdateAlert)}
            onChange={(v) => updateField('policyUpdateAlert', v)}
          />
        </div>
      );

    case 'email_sms_notifications':
      return (
        <div className="space-y-3">
          <FieldToggle
            label="Daily Operations Summary Email"
            checked={Boolean(draftData.emailDailyDigest)}
            onChange={(v) => updateField('emailDailyDigest', v)}
          />
          <FieldToggle
            label="Instant Email on Every Order"
            checked={Boolean(draftData.emailInstantOrder)}
            onChange={(v) => updateField('emailInstantOrder', v)}
          />
          <FieldToggle
            label="SMS Alert on High-Value / Priority Orders"
            checked={Boolean(draftData.smsCriticalOrder)}
            onChange={(v) => updateField('smsCriticalOrder', v)}
          />
          <FieldToggle
            label="SMS Alert on Payout Disbursement"
            checked={Boolean(draftData.smsPayoutDisbursed)}
            onChange={(v) => updateField('smsPayoutDisbursed', v)}
          />
        </div>
      );

    case 'language_regional':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSelect
            label="Primary Panel Language"
            value={draftData.language || 'en'}
            onChange={(v) => updateField('language', v)}
            options={[
              { value: 'en', label: 'English (Inter / Roboto)' },
              { value: 'bn', label: 'বাংলা — Bengali (Hind Siliguri)' }
            ]}
          />
          <FieldSelect
            label="Secondary / Bilingual Display"
            value={draftData.secondaryLanguage || 'bn'}
            onChange={(v) => updateField('secondaryLanguage', v)}
            options={[
              { value: 'bn', label: 'বাংলা (Hind Siliguri)' },
              { value: 'en', label: 'English' }
            ]}
          />
          <FieldSelect
            label="Timezone"
            value={draftData.timezone || 'Asia/Dhaka (GMT+06:00)'}
            onChange={(v) => updateField('timezone', v)}
            options={[
              { value: 'Asia/Dhaka (GMT+06:00)', label: 'Asia/Dhaka (GMT+06:00)' },
              { value: 'Asia/Kolkata (GMT+05:30)', label: 'Asia/Kolkata (GMT+05:30)' },
              { value: 'UTC (GMT+00:00)', label: 'UTC (GMT+00:00)' }
            ]}
          />
          <FieldSelect
            label="Currency Format"
            value={draftData.currency || 'INR (₹)'}
            onChange={(v) => updateField('currency', v)}
            options={[
              { value: 'INR (₹)', label: 'INR (₹)' },
              { value: 'BDT (৳)', label: 'BDT (৳)' },
              { value: 'USD ($)', label: 'USD ($)' }
            ]}
          />
        </div>
      );

    case 'privacy_security':
      return (
        <div className="space-y-3">
          <FieldToggle
            label="Mask Customer Phone & Email in CSV Exports"
            description="Protect buyer PII when downloading order reports."
            checked={Boolean(draftData.maskCustomerPhoneAfterDelivery)}
            onChange={(v) => updateField('maskCustomerPhoneAfterDelivery', v)}
          />
          <FieldToggle
            label="Allow Analytics Telemetry"
            checked={Boolean(draftData.allowAnalyticsSharing)}
            onChange={(v) => updateField('allowAnalyticsSharing', v)}
          />
          <FieldInput
            label="Audit Log Retention Period (Days)"
            type="number"
            value={draftData.dataRetentionDays ?? 365}
            onChange={(v) => updateField('dataRetentionDays', Number(v))}
          />
        </div>
      );

    case 'activity_login_history':
      return (
        <div className="space-y-3">
          {activityHistory.length === 0 ? (
            <div className="p-8 text-center border border-slate-200 rounded-xl text-slate-500">
              No recent activity logs recorded.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activityHistory.map((log: any, idx: number) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 font-medium">{log.actor}</td>
                      <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );

    // -------------------------------------------------------------------------
    // 7. OTHER
    // -------------------------------------------------------------------------
    case 'ip_complaints': {
      const complaints = Array.isArray(draftData.complaints) ? draftData.complaints : [];
      const addComplaint = () =>
        updateField('complaints', [
          ...complaints,
          {
            id: `IP-${Date.now().toString().slice(-4)}`,
            type: 'Trademark / Brand Infringement',
            targetListing: '',
            status: 'Under Review',
            createdAt: new Date().toISOString()
          }
        ]);
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FieldInput
              label="Brand Registry Certificate Reference"
              value={draftData.brandRegistryNumber}
              onChange={(v) => updateField('brandRegistryNumber', v)}
              placeholder="TM-REG-..."
            />
            <button
              type="button"
              onClick={addComplaint}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 rounded-lg text-[13px] font-semibold inline-flex items-center gap-1.5 mt-5"
            >
              <Plus size={14} /> File IP Report
            </button>
          </div>
          {complaints.map((c: any, idx: number) => (
            <div
              key={c.id || idx}
              className="p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <FieldInput
                label="Case ID & Type"
                value={c.type}
                onChange={(v) => {
                  const next = [...complaints];
                  next[idx] = { ...c, type: v };
                  updateField('complaints', next);
                }}
              />
              <FieldInput
                label="Target Product URL / SKU"
                value={c.targetListing}
                onChange={(v) => {
                  const next = [...complaints];
                  next[idx] = { ...c, targetListing: v };
                  updateField('complaints', next);
                }}
              />
              <FieldInput
                label="Status"
                value={c.status}
                onChange={(v) => {
                  const next = [...complaints];
                  next[idx] = { ...c, status: v };
                  updateField('complaints', next);
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    case 'product_store_policy':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Customer Return Window (Days)"
              type="number"
              value={draftData.returnWindowDays ?? 7}
              onChange={(v) => updateField('returnWindowDays', Number(v))}
            />
            <FieldInput
              label="Default Warranty Policy"
              value={draftData.warrantyTerms}
              onChange={(v) => updateField('warrantyTerms', v)}
            />
          </div>
          <FieldInput
            label="Order Cancellation Policy"
            value={draftData.cancellationPolicy}
            onChange={(v) => updateField('cancellationPolicy', v)}
          />
          <FieldToggle
            label="100% Authentic & Genuine Merchandise Guarantee"
            checked={Boolean(draftData.authenticityGuarantee)}
            onChange={(v) => updateField('authenticityGuarantee', v)}
          />
        </div>
      );

    case 'help_center': {
      const guides = [
        {
          title: 'How to Complete NID & Face Identity Verification',
          cat: 'Verification',
          desc: 'Upload front/back NID images and a live selfie under Verification Requests for manual Admin approval.'
        },
        {
          title: 'Understanding Weekly Settlements & Commission Tiers',
          cat: 'Finance',
          desc: 'Payouts are processed every Monday to your verified bank account after deducting platform commission.'
        },
        {
          title: 'Packaging Guidelines & Volumetric Weight Calculation',
          cat: 'Logistics',
          desc: 'Use 3-ply corrugated boxes with bubble wrap. Volumetric weight is calculated as (L×W×H)/5000.'
        },
        {
          title: 'Publishing High-Score Products (Daraz Content Score)',
          cat: 'Catalog',
          desc: 'Include at least 3 clear white-background images, 150+ word description, and complete key attributes.'
        }
      ].filter(
        (g) =>
          !helpSearch ||
          g.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
          g.desc.toLowerCase().includes(helpSearch.toLowerCase())
      );

      return (
        <div className="space-y-4">
          <FieldInput
            label="Search Help Center & SOP Guides"
            value={helpSearch}
            onChange={setHelpSearch}
            placeholder="Search verification, payouts, packaging..."
          />
          <div className="space-y-3">
            {guides.map((g) => (
              <div key={g.title} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-[15px] font-semibold text-slate-900">{g.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-semibold">
                    {g.cat}
                  </span>
                </div>
                <p className="text-[13px] text-slate-600 mt-1">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'contact_support':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSelect
            label="Preferred Support Channel"
            value={draftData.preferredContactChannel || 'Priority Ticket & Email'}
            onChange={(v) => updateField('preferredContactChannel', v)}
            options={[
              { value: 'Priority Ticket & Email', label: 'Priority Ticket & Email' },
              { value: 'Phone & WhatsApp Concierge', label: 'Phone & WhatsApp Concierge' }
            ]}
          />
          <FieldInput
            label="Dedicated Account Manager"
            value={draftData.dedicatedAccountManager}
            onChange={(v) => updateField('dedicatedAccountManager', v)}
          />
          <FieldInput
            label="Support Email"
            value={draftData.supportEmail}
            onChange={(v) => updateField('supportEmail', v)}
          />
          <FieldInput
            label="Emergency Hotline"
            value={draftData.supportHotline}
            onChange={(v) => updateField('supportHotline', v)}
          />
          <div className="sm:col-span-2">
            <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
              Quick Support Message / Escalation Note
            </label>
            <textarea
              rows={3}
              value={draftData.lastSupportNote ?? ''}
              onChange={(e) => updateField('lastSupportNote', e.target.value)}
              placeholder="Describe your issue or request callback..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-[14px]"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[14px] text-slate-600">
          Configure settings for {cardId}.
        </div>
      );
  }
}

export default MarketplaceSettingsDashboard;
