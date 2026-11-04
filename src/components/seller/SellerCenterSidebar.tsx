import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  Store,
  Wallet,
  BarChart3,
  Headphones,
  ShieldCheck,
  UserCog,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  ExternalLink,
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Settings,
  RefreshCw,
} from 'lucide-react';
import Logo from '../Logo';
import { SellerProfile } from '../../types';

export type SellerMenuSectionId =
  // 1. Dashboard
  | 'overview'
  | 'todo_checklist'
  | 'notifications'
  | 'account_status'
  // 2. Products
  | 'manage_products'
  | 'add_product'
  | 'product_categories'
  | 'product_variants'
  | 'media_center'
  | 'product_approval'
  | 'bulk_products'
  // 3. Orders and Reviews
  | 'all_orders'
  | 'pending_orders'
  | 'confirmed_orders'
  | 'processing_orders'
  | 'ready_shipment'
  | 'shipped_orders'
  | 'delivered_orders'
  | 'cancelled_orders'
  | 'return_requests'
  | 'product_reviews'
  // 4. Growth and Marketing
  | 'campaigns'
  | 'promotions'
  | 'discount_management'
  | 'flash_deals'
  | 'coupons_vouchers'
  | 'featured_requests'
  | 'marketing_performance'
  // 5. Store Management
  | 'store_profile'
  | 'store_branding'
  | 'store_decoration'
  | 'store_settings'
  | 'store_policies'
  | 'shipping_delivery'
  // 6. Finance
  | 'sales_overview'
  | 'earnings'
  | 'pending_balance'
  | 'available_balance'
  | 'platform_commission'
  | 'transaction_history'
  | 'payout_requests'
  | 'refund_deductions'
  | 'financial_reports'
  // 7. Analytics and Reports
  | 'sales_analytics'
  | 'product_performance'
  | 'order_statistics'
  | 'inventory_reports'
  | 'feedback_reports'
  // 8. Customer Care
  | 'customer_messages'
  | 'order_chat'
  | 'support_tickets'
  | 'complaints_disputes'
  | 'contact_admin'
  // 9. Seller Verification
  | 'nid_verification'
  | 'face_verification'
  | 'verification_status'
  | 'admin_review_result'
  | 'resubmission_option'
  | 'verified_badge_status'
  // 10. Account and Security
  | 'personal_info'
  | 'email_mobile'
  | 'change_password'
  | 'security_activity'
  | 'notification_preferences'
  // 11. Daraz-Inspired Settings Dashboard
  | 'settings_hub'
  | 'settings_business'
  | 'settings_finance'
  | 'settings_logistics'
  | 'settings_users'
  | 'settings_chat'
  | 'settings_system'
  | 'settings_other';

export interface SidebarCategoryGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  items: Array<{
    id: SellerMenuSectionId;
    label: string;
    badge?: number | string;
  }>;
}

export const SELLER_SIDEBAR_GROUPS: SidebarCategoryGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'todo_checklist', label: 'To-Do Checklist' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'account_status', label: 'Account Status' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    items: [
      { id: 'manage_products', label: 'Manage Products' },
      { id: 'add_product', label: 'Add Product' },
      { id: 'product_categories', label: 'Product Categories' },
      { id: 'product_variants', label: 'Product Variants & Inventory' },
      { id: 'media_center', label: 'Product Images / Media Center' },
      { id: 'product_approval', label: 'Product Approval Status' },
      { id: 'bulk_products', label: 'Bulk Product Management' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders & Reviews',
    icon: ShoppingBag,
    items: [
      { id: 'all_orders', label: 'All Orders' },
      { id: 'pending_orders', label: 'Pending Orders' },
      { id: 'confirmed_orders', label: 'Confirmed Orders' },
      { id: 'processing_orders', label: 'Processing Orders' },
      { id: 'ready_shipment', label: 'Ready for Shipment' },
      { id: 'shipped_orders', label: 'Shipped / In Transit' },
      { id: 'delivered_orders', label: 'Delivered Orders' },
      { id: 'cancelled_orders', label: 'Cancelled / Rejected Orders' },
      { id: 'return_requests', label: 'Return & Refund Requests' },
      { id: 'product_reviews', label: 'Product Reviews' },
    ],
  },
  {
    id: 'marketing',
    label: 'Growth & Marketing',
    icon: Megaphone,
    items: [
      { id: 'campaigns', label: 'Campaigns' },
      { id: 'promotions', label: 'Promotions' },
      { id: 'discount_management', label: 'Discount Management' },
      { id: 'flash_deals', label: 'Flash Deals' },
      { id: 'coupons_vouchers', label: 'Coupons & Vouchers' },
      { id: 'featured_requests', label: 'Featured Product Requests' },
      { id: 'marketing_performance', label: 'Marketing Performance' },
    ],
  },
  {
    id: 'store',
    label: 'Store Management',
    icon: Store,
    items: [
      { id: 'store_profile', label: 'Store Profile' },
      { id: 'store_branding', label: 'Store Logo & Banner' },
      { id: 'store_decoration', label: 'Store Decoration' },
      { id: 'store_settings', label: 'Store Settings' },
      { id: 'store_policies', label: 'Store Policies' },
      { id: 'shipping_delivery', label: 'Shipping & Delivery Settings' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    items: [
      { id: 'sales_overview', label: 'Sales Overview' },
      { id: 'earnings', label: 'Earnings' },
      { id: 'pending_balance', label: 'Pending Balance' },
      { id: 'available_balance', label: 'Available Balance' },
      { id: 'platform_commission', label: 'Platform Commission' },
      { id: 'transaction_history', label: 'Transaction History' },
      { id: 'payout_requests', label: 'Payout / Withdrawal Requests' },
      { id: 'refund_deductions', label: 'Refund & Deduction History' },
      { id: 'financial_reports', label: 'Download Financial Reports' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: BarChart3,
    items: [
      { id: 'sales_analytics', label: 'Sales Analytics' },
      { id: 'product_performance', label: 'Product Performance' },
      { id: 'order_statistics', label: 'Order Statistics' },
      { id: 'inventory_reports', label: 'Inventory Reports' },
      { id: 'feedback_reports', label: 'Customer Feedback Reports' },
    ],
  },
  {
    id: 'support',
    label: 'Customer Care',
    icon: Headphones,
    items: [
      { id: 'customer_messages', label: 'Customer Messages' },
      { id: 'order_chat', label: 'Order-Related Chat' },
      { id: 'support_tickets', label: 'Support Tickets' },
      { id: 'complaints_disputes', label: 'Complaints & Disputes' },
      { id: 'contact_admin', label: 'Contact Admin / Customer Care' },
    ],
  },
  {
    id: 'verification',
    label: 'Seller Verification',
    icon: ShieldCheck,
    items: [
      { id: 'nid_verification', label: 'NID Verification Request' },
      { id: 'face_verification', label: 'Face Verification Request' },
      { id: 'verification_status', label: 'Verification Status' },
      { id: 'admin_review_result', label: 'Admin Review Result' },
      { id: 'resubmission_option', label: 'Resubmission Option' },
      { id: 'verified_badge_status', label: 'Verified Badge Status' },
    ],
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: UserCog,
    items: [
      { id: 'personal_info', label: 'Personal Information' },
      { id: 'email_mobile', label: 'Email & Mobile Number' },
      { id: 'change_password', label: 'Change Password' },
      { id: 'security_activity', label: 'Login & Security Activity' },
      { id: 'notification_preferences', label: 'Notification Preferences' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { id: 'settings_hub', label: 'All Settings Dashboard' },
      { id: 'settings_business', label: 'Business Information' },
      { id: 'settings_finance', label: 'Finance Settings' },
      { id: 'settings_logistics', label: 'Logistics Settings' },
      { id: 'settings_users', label: 'User Management' },
      { id: 'settings_chat', label: 'Chat Settings' },
      { id: 'settings_system', label: 'System Settings' },
      { id: 'settings_other', label: 'Other & Policies' },
    ],
  },
];

export function findCategoryForSection(sectionId: SellerMenuSectionId): SidebarCategoryGroup {
  return (
    SELLER_SIDEBAR_GROUPS.find((g) => g.items.some((it) => it.id === sectionId)) ||
    SELLER_SIDEBAR_GROUPS[0]
  );
}

interface SellerCenterSidebarProps {
  activeSection: SellerMenuSectionId;
  onSelectSection: (section: SellerMenuSectionId) => void;
  onTriggerAddProduct: () => void;
  onLogout: () => void;
  onReturnStorefront: () => void;
  sellerProfile: SellerProfile | null;
  counts: {
    pendingOrders: number;
    confirmedOrders?: number;
    processingOrders?: number;
    readyForShipmentOrders?: number;
    shippedOrders?: number;
    deliveredOrders?: number;
    cancelledOrders?: number;
    allOrders?: number;
    unreadNotifications: number;
    lowStock: number;
    returnRequests: number;
  };
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isLightMode?: boolean;
}

export const SellerCenterSidebar: React.FC<SellerCenterSidebarProps> = ({
  activeSection,
  onSelectSection,
  onTriggerAddProduct,
  onLogout,
  onReturnStorefront,
  sellerProfile,
  counts,
  mobileOpen,
  setMobileOpen,
  isLightMode = false,
}) => {
  const activeGroup = findCategoryForSection(activeSection);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    products: true,
    orders: true,
    verification: true,
    [activeGroup.id]: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleItemClick = (itemId: SellerMenuSectionId, groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: true }));
    if (itemId === 'add_product') {
      onSelectSection('add_product');
      onTriggerAddProduct();
    } else {
      onSelectSection(itemId);
    }
    setMobileOpen(false);
  };

  const isVerifiedBadge = Boolean(
    sellerProfile?.verifiedBadge && sellerProfile?.verificationStatus === 'approved'
  );

  const sidebarContent = (
    <div
      className={`flex flex-col h-full select-none ${
        isLightMode
          ? 'bg-white border-r border-slate-200 text-slate-800'
          : 'bg-[#090F20] border-r border-neutral-800/90 text-neutral-200'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`px-4 py-4 border-b flex items-center justify-between gap-2 ${
          isLightMode ? 'border-slate-200 bg-slate-50/70' : 'border-neutral-800/80 bg-[#070C1A]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="scale-90 origin-left shrink-0">
            <Logo />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#F5A623]">
              Seller Center
            </span>
            <span
              className={`block text-xs font-bold truncate ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}
              title={sellerProfile?.shopName || 'Merchant Atelier'}
            >
              {sellerProfile?.shopName || 'Merchant Atelier'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Store Status Quick Card */}
      {sellerProfile && (
        <div
          className={`mx-3 mt-3 p-3 rounded-xl border ${
            isLightMode
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-neutral-900/70 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-neutral-400">Account Status</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                sellerProfile.status === 'approved'
                  ? 'text-emerald-500'
                  : sellerProfile.status === 'suspended' || sellerProfile.status === 'rejected'
                  ? 'text-rose-500'
                  : 'text-amber-500'
              }`}
            >
              {sellerProfile.status === 'approved'
                ? 'Approved'
                : sellerProfile.status === 'review'
                ? 'Under Review'
                : sellerProfile.status}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-neutral-800/50">
            <span className="text-[11px] font-semibold text-neutral-400">Identity Badge</span>
            {isVerifiedBadge ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Seller
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleItemClick('nid_verification', 'verification')}
                className="text-[10px] font-bold text-[#F5A623] hover:underline cursor-pointer"
              >
                {sellerProfile.verificationStatus === 'pending_admin_review'
                  ? 'Pending Admin Review'
                  : 'Verify NID & Face →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expandable Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-scrollbar">
        {SELLER_SIDEBAR_GROUPS.map((group) => {
          const Icon = group.icon;
          const isExpanded = Boolean(expandedGroups[group.id]);
          const hasActiveChild = group.items.some((it) => it.id === activeSection);

          let groupBadge: number | undefined;
          if (group.id === 'orders' && counts.pendingOrders > 0) groupBadge = counts.pendingOrders;
          if (group.id === 'dashboard' && counts.unreadNotifications > 0)
            groupBadge = counts.unreadNotifications;

          return (
            <div key={group.id} className="rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`mkt-nav w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  hasActiveChild
                    ? isLightMode
                      ? 'bg-amber-50 text-amber-900'
                      : 'bg-[#F5A623]/15 text-[#F5A623]'
                    : isLightMode
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      hasActiveChild ? 'text-[#F5A623]' : 'text-neutral-400'
                    }`}
                  />
                  <span className="truncate">{group.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {groupBadge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-md bg-[#F5A623] text-black">
                      {groupBadge}
                    </span>
                  ) : null}
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div
                  className={`mt-0.5 ml-4 pl-3 border-l space-y-0.5 py-1 ${
                    isLightMode ? 'border-slate-200' : 'border-neutral-800'
                  }`}
                >
                  {group.items.map((item) => {
                    const isActive = activeSection === item.id;
                    let itemBadge: number | undefined;
                    if (item.id === 'all_orders' && (counts.allOrders ?? 0) > 0)
                      itemBadge = counts.allOrders;
                    if (item.id === 'pending_orders' && counts.pendingOrders > 0)
                      itemBadge = counts.pendingOrders;
                    if (item.id === 'confirmed_orders' && (counts.confirmedOrders ?? 0) > 0)
                      itemBadge = counts.confirmedOrders;
                    if (item.id === 'processing_orders' && (counts.processingOrders ?? 0) > 0)
                      itemBadge = counts.processingOrders;
                    if (item.id === 'ready_shipment' && (counts.readyForShipmentOrders ?? 0) > 0)
                      itemBadge = counts.readyForShipmentOrders;
                    if (item.id === 'shipped_orders' && (counts.shippedOrders ?? 0) > 0)
                      itemBadge = counts.shippedOrders;
                    if (item.id === 'delivered_orders' && (counts.deliveredOrders ?? 0) > 0)
                      itemBadge = counts.deliveredOrders;
                    if (item.id === 'cancelled_orders' && (counts.cancelledOrders ?? 0) > 0)
                      itemBadge = counts.cancelledOrders;
                    if (item.id === 'notifications' && counts.unreadNotifications > 0)
                      itemBadge = counts.unreadNotifications;
                    if (item.id === 'return_requests' && counts.returnRequests > 0)
                      itemBadge = counts.returnRequests;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.id, group.id)}
                        className={`mkt-nav w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#F5A623] text-black font-semibold shadow-xs'
                            : isLightMode
                            ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/70'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {itemBadge ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold ${
                              isActive
                                ? 'bg-black text-[#F5A623]'
                                : isLightMode
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {itemBadge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div
        className={`p-3 border-t space-y-1.5 ${
          isLightMode ? 'border-slate-200 bg-slate-50' : 'border-neutral-800/80 bg-[#070C1A]'
        }`}
      >
        <button
          type="button"
          onClick={onReturnStorefront}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isLightMode
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
          }`}
        >
          <span>View Public Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {sellerProfile && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Seller Center</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block w-68 shrink-0 h-[calc(100vh-0px)] sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

interface SellerCenterTopbarProps {
  activeSection: SellerMenuSectionId;
  onSelectSection: (section: SellerMenuSectionId) => void;
  onTriggerAddProduct: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sellerProfile: SellerProfile | null;
  unreadNotifications: number;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onReturnStorefront?: () => void;
  isLightMode?: boolean;
}

export const SellerCenterTopbar: React.FC<SellerCenterTopbarProps> = ({
  activeSection,
  onSelectSection,
  onTriggerAddProduct,
  onRefresh,
  refreshing,
  searchQuery,
  onSearchChange,
  sellerProfile,
  unreadNotifications,
  onOpenMobileMenu,
  onLogout,
  onReturnStorefront,
  isLightMode = false,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const currentGroup = findCategoryForSection(activeSection);
  const currentItem =
    currentGroup.items.find((i) => i.id === activeSection) || currentGroup.items[0];
  const isVerifiedBadge = Boolean(
    sellerProfile?.verifiedBadge && sellerProfile?.verificationStatus === 'approved'
  );

  return (
    <header
      className={`sticky top-0 z-20 px-3 sm:px-6 py-2.5 sm:py-3 border-b backdrop-blur-md transition-colors ${
        isLightMode
          ? 'bg-white/95 border-slate-200 text-slate-900'
          : 'bg-[#090F20]/95 border-neutral-800/90 text-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile Menu + Breadcrumb & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className={`lg:hidden p-2 rounded-xl border cursor-pointer shrink-0 ${
              isLightMode
                ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-800 text-neutral-200 hover:bg-neutral-900'
            }`}
            aria-label="Open Seller Center navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="mkt-breadcrumb hidden xs:flex items-center gap-1 font-medium text-neutral-400 text-[11px] truncate">
              <span className="truncate">{currentGroup.label}</span>
              <span>/</span>
              <span className="text-[#F5A623] font-semibold truncate">{currentItem.label}</span>
            </div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate">
              {currentItem.label}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, SKU, brand, or order ID..."
              className={`mkt-input w-full pl-9 pr-8 py-2 rounded-xl border focus:outline-none focus:border-[#F5A623] transition-all ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-neutral-900/90 border-neutral-800 text-white placeholder-neutral-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Actions, Notifications & Seller Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onReturnStorefront && (
            <button
              type="button"
              onClick={onReturnStorefront}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isLightMode
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
              }`}
              title="Back to Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden sm:inline">Store</span>
            </button>
          )}

          {sellerProfile?.status !== 'suspended' && (
            <button
              type="button"
              onClick={onTriggerAddProduct}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Add</span>
              <span className="hidden sm:inline">Product</span>
            </button>
          )}

          {/* Sync / Refresh Data Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLightMode
                ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
            title="Refresh Seller Center Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => onSelectSection('notifications')}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              activeSection === 'notifications'
                ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]'
                : isLightMode
                ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
            title="Seller Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Seller Profile Dropdown */}
          {sellerProfile && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isLightMode
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623] font-black text-xs shrink-0 overflow-hidden">
                  {sellerProfile.logo ? (
                    <img
                      src={sellerProfile.logo}
                      alt={sellerProfile.shopName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    sellerProfile.shopName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left max-w-[130px]">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate block">
                      {sellerProfile.shopName}
                    </span>
                    {isVerifiedBadge && (
                      <span title="Verified Seller" className="inline-flex items-center">
                        <ShieldCheck
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                        />
                      </span>
                    )}
                  </div>
                  <span className="block text-[10px] text-neutral-400 truncate">
                    {sellerProfile.ownerName}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-60 rounded-2xl border shadow-2xl z-20 p-2 space-y-1 ${
                      isLightMode
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-[#0D152B] border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b ${isLightMode ? 'border-slate-200' : 'border-neutral-800/60'}`}>
                      <p className="text-xs font-bold truncate">{sellerProfile.shopName}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{sellerProfile.email}</p>
                    </div>
                    {onReturnStorefront && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onReturnStorefront();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left cursor-pointer ${
                          isLightMode ? 'hover:bg-slate-100 text-[#0F1A3C]' : 'hover:bg-neutral-800/60 text-[#F5A623]'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#F5A623]" />
                        <span>Return to Storefront</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSelectSection('store_profile');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left cursor-pointer ${
                        isLightMode ? 'hover:bg-slate-100' : 'hover:bg-neutral-800/60'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                      <span>Store Profile & Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSelectSection('nid_verification');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left cursor-pointer ${
                        isLightMode ? 'hover:bg-slate-100' : 'hover:bg-neutral-800/60'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>NID & Face Verification</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSelectSection('settings_hub');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left cursor-pointer ${
                        isLightMode ? 'hover:bg-slate-100' : 'hover:bg-neutral-800/60'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-500" />
                      <span>Settings Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSelectSection('personal_info');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left cursor-pointer ${
                        isLightMode ? 'hover:bg-slate-100' : 'hover:bg-neutral-800/60'
                      }`}
                    >
                      <UserCog className="w-3.5 h-3.5 text-sky-500" />
                      <span>Account & Security</span>
                    </button>
                    <div className={`pt-1 border-t ${isLightMode ? 'border-slate-200' : 'border-neutral-800/60'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
