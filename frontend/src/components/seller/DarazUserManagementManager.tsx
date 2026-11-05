import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  RotateCcw,
  Check,
  X,
  Eye,
  EyeOff,
  Shield,
  Users,
  Lock,
  Loader2,
  Trash2,
  Edit2,
} from 'lucide-react';
import { SellerProfile } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export interface SubAccountUserRow {
  id: string;
  name: string;
  maskedName?: string;
  email: string;
  role: string;
  enabled: boolean;
  status?: 'Active' | 'Inactive';
  isOwnerAccount?: boolean;
  defaultLanguage?: string;
  sendCredentialsEmail?: boolean;
  createdAt?: string;
  lastActive?: string;
}

export interface RbacRoleDefinition {
  id: string;
  role: string;
  description: string;
  isSystem?: boolean;
  pcPermissions: string[];
  appPermissions: string[];
  updatedAt?: string;
}

export interface DarazUserManagementManagerProps {
  theme?: 'light' | 'dark';
  initialTab?: 'sub_accounts' | 'roles';
  draftData?: Record<string, any>;
  onUpdateField?: (key: string, value: any) => void;
  sellerProfile?: SellerProfile | null;
  onNavigateBreadcrumb?: (target: 'home' | 'setting') => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export interface PermissionCategoryGroup {
  category: string;
  permissions: {
    code: string;
    label: string;
  }[];
}

export const GRANULAR_PERMISSION_GROUPS: PermissionCategoryGroup[] = [
  {
    category: 'Authentication & Core',
    permissions: [
      { code: 'login', label: 'login' },
      { code: 'login_two_factor', label: 'login_two_factor' },
      { code: 'maintenance_only', label: 'maintenance_only' },
      { code: 'admin_only', label: 'admin_only' },
    ],
  },
  {
    category: 'Product & SPU',
    permissions: [
      { code: 'products_read', label: 'products_read' },
      { code: 'products_write', label: 'products_write' },
      { code: 'product_qc_read', label: 'product_qc_read' },
      { code: 'product_qc_write', label: 'product_qc_write' },
      { code: 'stock_write', label: 'stock_write' },
      { code: 'PRODUCT_BRAND_MNG', label: 'PRODUCT_BRAND_MNG' },
      { code: 'spu_manager_read', label: 'spu_manager_read' },
      { code: 'spu_manager_write', label: 'spu_manager_write' },
    ],
  },
  {
    category: 'Orders & Fulfillment',
    permissions: [
      { code: 'orders_read', label: 'orders_read' },
      { code: 'orders_write', label: 'orders_write' },
      { code: 'orders_return', label: 'orders_return' },
      { code: 'order_cancel', label: 'order_cancel' },
      { code: 'global_order_overview_read', label: 'global_order_overview_read' },
      { code: 'global_order_overview_write', label: 'global_order_overview_write' },
      { code: 'shipment_information_edit', label: 'shipment_information_edit' },
    ],
  },
  {
    category: 'Finance & Commission',
    permissions: [
      { code: 'finance_read', label: 'finance_read' },
      { code: 'finance_write', label: 'finance_write' },
      { code: 'finance_qc', label: 'finance_qc' },
      { code: 'commission_fees_read', label: 'commission_fees_read' },
      { code: 'commission_fees_write', label: 'commission_fees_write' },
      { code: 'backend_finance_api_write', label: 'backend_finance_api_write' },
    ],
  },
  {
    category: 'Marketing & Store',
    permissions: [
      { code: 'MC_CAMPAIGN', label: 'MC_CAMPAIGN' },
      { code: 'MC_DRZ_FLASH', label: 'MC_DRZ_FLASH' },
      { code: 'MC_SELLER_VOUCHER', label: 'MC_SELLER_VOUCHER' },
      { code: 'MC_FLEXI_COMBO', label: 'MC_FLEXI_COMBO' },
      { code: 'decorate_shop', label: 'decorate_shop' },
      { code: 'store_management', label: 'store_management' },
    ],
  },
  {
    category: 'Communication & Chat',
    permissions: [
      { code: 'seller_messenger', label: 'seller_messenger' },
      { code: 'IM_USER_MNG', label: 'IM_USER_MNG' },
      { code: 'IM_QUICK_REPLY', label: 'IM_QUICK_REPLY' },
      { code: 'IM_AUTO_REPLY', label: 'IM_AUTO_REPLY' },
      { code: 'IM_CHAT_ALERT', label: 'IM_CHAT_ALERT' },
      { code: 'IM_KEYWORD_TAG', label: 'IM_KEYWORD_TAG' },
    ],
  },
  {
    category: 'Settings & Support',
    permissions: [
      { code: 'settings_read', label: 'settings_read' },
      { code: 'settings_write', label: 'settings_write' },
      { code: 'profile_read', label: 'profile_read' },
      { code: 'profile_write', label: 'profile_write' },
      { code: 'seller_support_read', label: 'seller_support_read' },
      { code: 'seller_support_write', label: 'seller_support_write' },
    ],
  },
  {
    category: 'System & ACL',
    permissions: [
      { code: 'acl_management', label: 'acl_management' },
      { code: 'api_write', label: 'api_write' },
      { code: 'integration_management_access', label: 'integration_management_access' },
      { code: 'master_write', label: 'master_write' },
      { code: 'master_read', label: 'master_read' },
    ],
  },
];

const ALL_PERMISSION_CODES = GRANULAR_PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.code)
);

export const DEFAULT_DARAZ_ROLES: RbacRoleDefinition[] = [
  {
    id: 'role_full_access',
    role: 'Seller Full Access',
    description: 'Full access to all PC Seller Center and Seller App features, finance, and settings.',
    isSystem: true,
    pcPermissions: [...ALL_PERMISSION_CODES],
    appPermissions: [...ALL_PERMISSION_CODES],
  },
  {
    id: 'role_catalog_access',
    role: 'Seller Catalog Access',
    description: 'Create, edit, and manage product listings, SPU catalog, and quality control.',
    isSystem: true,
    pcPermissions: [
      'login',
      'products_read',
      'products_write',
      'product_qc_read',
      'product_qc_write',
      'stock_write',
      'spu_manager_read',
      'spu_manager_write',
    ],
    appPermissions: ['login', 'products_read', 'products_write', 'stock_write'],
  },
  {
    id: 'role_order_access',
    role: 'Seller Order Access',
    description: 'Manage customer orders, shipments, cancellations, and return requests.',
    isSystem: true,
    pcPermissions: [
      'login',
      'orders_read',
      'orders_write',
      'orders_return',
      'order_cancel',
      'global_order_overview_read',
      'global_order_overview_write',
      'shipment_information_edit',
    ],
    appPermissions: ['login', 'orders_read', 'orders_write', 'orders_return', 'shipment_information_edit'],
  },
  {
    id: 'role_api_access',
    role: 'Seller API Access',
    description: 'Access to Open Platform API credentials, webhooks, and ERP integrations.',
    isSystem: true,
    pcPermissions: [
      'login',
      'api_write',
      'integration_management_access',
      'products_read',
      'orders_read',
    ],
    appPermissions: ['login', 'integration_management_access'],
  },
  {
    id: 'role_api_product_order',
    role: 'Seller API Product Access / Order Access',
    description: 'Read/Write API integration permissions for product catalog sync and order dispatch.',
    isSystem: true,
    pcPermissions: [
      'login',
      'api_write',
      'integration_management_access',
      'products_read',
      'products_write',
      'stock_write',
      'orders_read',
      'orders_write',
    ],
    appPermissions: ['login', 'products_read', 'orders_read'],
  },
  {
    id: 'role_stock_update',
    role: 'Seller Stock Update',
    description: 'Update product inventory quantities and warehouse stock allocations only.',
    isSystem: true,
    pcPermissions: ['login', 'products_read', 'stock_write', 'spu_manager_read'],
    appPermissions: ['login', 'products_read', 'stock_write'],
  },
  {
    id: 'role_brand_user',
    role: 'Seller Brand User',
    description: 'Manage brand registry, product brand attributes, and campaign participation.',
    isSystem: true,
    pcPermissions: [
      'login',
      'products_read',
      'PRODUCT_BRAND_MNG',
      'MC_CAMPAIGN',
      'MC_DRZ_FLASH',
      'decorate_shop',
    ],
    appPermissions: ['login', 'products_read', 'PRODUCT_BRAND_MNG'],
  },
  {
    id: 'role_decorate_shop',
    role: 'Seller Decorate Shop',
    description: 'Design storefront layout, banners, campaigns, vouchers, and Flexi Combo.',
    isSystem: true,
    pcPermissions: [
      'login',
      'decorate_shop',
      'store_management',
      'MC_CAMPAIGN',
      'MC_DRZ_FLASH',
      'MC_SELLER_VOUCHER',
      'MC_FLEXI_COMBO',
    ],
    appPermissions: ['login', 'decorate_shop', 'store_management'],
  },
  {
    id: 'role_read_only',
    role: 'Seller Read Only',
    description: 'View-only access across products, orders, finance, and settings without write rights.',
    isSystem: true,
    pcPermissions: [
      'login',
      'products_read',
      'product_qc_read',
      'spu_manager_read',
      'orders_read',
      'global_order_overview_read',
      'finance_read',
      'commission_fees_read',
      'settings_read',
      'profile_read',
      'seller_support_read',
      'master_read',
    ],
    appPermissions: ['login', 'products_read', 'orders_read', 'finance_read', 'settings_read'],
  },
  {
    id: 'role_junior_chat_agent',
    role: 'Seller Junior Chat Agent',
    description: 'Handle buyer instant messaging, quick replies, auto replies, and keyword tags.',
    isSystem: true,
    pcPermissions: [
      'login',
      'seller_messenger',
      'IM_USER_MNG',
      'IM_QUICK_REPLY',
      'IM_AUTO_REPLY',
      'IM_CHAT_ALERT',
      'IM_KEYWORD_TAG',
      'orders_read',
      'products_read',
    ],
    appPermissions: [
      'login',
      'seller_messenger',
      'IM_QUICK_REPLY',
      'IM_AUTO_REPLY',
      'IM_CHAT_ALERT',
      'IM_KEYWORD_TAG',
    ],
  },
  {
    id: 'role_choice_subaccount',
    role: 'Choice_Subaccount',
    description: 'Specialized Choice channel sub-account for priority fulfillment & SPU operations.',
    isSystem: true,
    pcPermissions: [
      'login',
      'products_read',
      'products_write',
      'spu_manager_read',
      'spu_manager_write',
      'orders_read',
      'orders_write',
      'shipment_information_edit',
    ],
    appPermissions: ['login', 'products_read', 'orders_read', 'orders_write'],
  },
];

const LANGUAGE_OPTIONS = [
  'English (Bangladesh)',
  'Bengali (বাংলা)',
  'English (Global)',
  'Hindi (हिन्दी)',
];

export function formatMaskedName(name: string): string {
  const clean = String(name || '').trim();
  if (!clean) return '*******000';
  if (clean.startsWith('*******')) return clean;
  if (clean.length <= 3) return `*******${clean}`;
  return `*******${clean.slice(-3)}`;
}

function buildInitialRoles(draftData?: Record<string, any>): RbacRoleDefinition[] {
  const rawRoles = Array.isArray(draftData?.roles) ? draftData.roles : [];
  if (rawRoles.length === 0) {
    return DEFAULT_DARAZ_ROLES;
  }

  // Merge existing saved roles with the 11 standard Daraz templates so none are missing
  const byName = new Map<string, RbacRoleDefinition>();
  for (const std of DEFAULT_DARAZ_ROLES) {
    byName.set(std.role.toLowerCase(), std);
  }

  for (const r of rawRoles) {
    const roleTitle = String(r.role || r.name || '').trim();
    if (!roleTitle) continue;
    const existingStd = byName.get(roleTitle.toLowerCase());
    const pcPerms = Array.isArray(r.pcPermissions)
      ? r.pcPermissions
      : Array.isArray(r.permissions)
      ? r.permissions
      : existingStd?.pcPermissions || ['login', 'products_read', 'orders_read'];
    const appPerms = Array.isArray(r.appPermissions)
      ? r.appPermissions
      : existingStd?.appPermissions || ['login', 'products_read', 'orders_read'];

    byName.set(roleTitle.toLowerCase(), {
      id: r.id || existingStd?.id || `role_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: roleTitle,
      description:
        r.description ||
        existingStd?.description ||
        'Custom RBAC role with granular PC and Seller App permissions.',
      isSystem: r.isSystem !== undefined ? Boolean(r.isSystem) : Boolean(existingStd?.isSystem),
      pcPermissions: pcPerms,
      appPermissions: appPerms,
      updatedAt: r.updatedAt,
    });
  }

  return Array.from(byName.values());
}

function buildInitialSubAccounts(
  draftData?: Record<string, any>,
  sellerProfile?: SellerProfile | null
): SubAccountUserRow[] {
  const ownerPhoneTail = String(
    sellerProfile?.mobileNumber || sellerProfile?.phone || '824'
  )
    .replace(/\D/g, '')
    .slice(-3) || '824';
  const ownerNameRaw =
    sellerProfile?.ownerName || sellerProfile?.shopName || `*******${ownerPhoneTail}`;
  const ownerEmail = sellerProfile?.email || 'alikend.shop@gmail.com';

  const rawSubs = Array.isArray(draftData?.subAccounts)
    ? draftData.subAccounts
    : Array.isArray(sellerProfile?.staffMembers)
    ? sellerProfile?.staffMembers
    : [];

  const normalized: SubAccountUserRow[] = rawSubs.map((u: any, idx: number) => {
    const isOwner =
      u.isOwnerAccount !== undefined
        ? Boolean(u.isOwnerAccount)
        : idx === 0 && String(u.email || '').toLowerCase() === ownerEmail.toLowerCase();
    const enabled =
      u.enabled !== undefined
        ? Boolean(u.enabled)
        : String(u.status || 'Active').toLowerCase() !== 'inactive';
    const rawName = String(u.name || `*******${ownerPhoneTail}`);
    return {
      id: String(u.id || `SUB-${100 + idx}`),
      name: rawName,
      maskedName: u.maskedName || formatMaskedName(rawName),
      email: String(u.email || ownerEmail),
      role: String(u.role === 'Store Manager' ? 'Seller Full Access' : u.role || 'Seller Full Access'),
      enabled,
      status: enabled ? 'Active' : 'Inactive',
      isOwnerAccount: isOwner,
      defaultLanguage: u.defaultLanguage || 'English (Bangladesh)',
      sendCredentialsEmail: Boolean(u.sendCredentialsEmail ?? true),
      createdAt: u.createdAt || new Date().toISOString(),
      lastActive: u.lastActive || new Date().toISOString(),
    };
  });

  // Ensure owner account is always present at top of list (matching Daraz screenshot)
  const hasOwner = normalized.some((u) => u.isOwnerAccount);
  if (!hasOwner) {
    const ownerEntry: SubAccountUserRow = {
      id: 'SUB-OWNER-01',
      name: ownerNameRaw,
      maskedName: `*******${ownerPhoneTail}`,
      email: ownerEmail,
      role: 'Seller Full Access',
      enabled: true,
      status: 'Active',
      isOwnerAccount: true,
      defaultLanguage: 'English (Bangladesh)',
      createdAt: new Date().toISOString(),
    };
    return [ownerEntry, ...normalized];
  }

  return normalized;
}

export const DarazUserManagementManager: React.FC<DarazUserManagementManagerProps> = ({
  theme = 'light',
  initialTab = 'sub_accounts',
  draftData,
  onUpdateField,
  sellerProfile,
  onNavigateBreadcrumb,
  showToast,
}) => {
  const isDark = theme === 'dark';

  // Active Top Tab: 'sub_accounts' | 'roles'
  const [activeTab, setActiveTab] = useState<'sub_accounts' | 'roles'>(initialTab);

  // Active Sub-View: 'list' | 'add_user' | 'edit_user' | 'add_role' | 'view_role'
  const [viewMode, setViewMode] = useState<
    'list' | 'add_user' | 'edit_user' | 'add_role' | 'view_role'
  >('list');

  // Core Data States
  const [subAccounts, setSubAccounts] = useState<SubAccountUserRow[]>(() =>
    buildInitialSubAccounts(draftData, sellerProfile)
  );
  const [rolesList, setRolesList] = useState<RbacRoleDefinition[]>(() =>
    buildInitialRoles(draftData)
  );

  // Show masked vs full name toggle per row
  const [revealedUserIds, setRevealedUserIds] = useState<Record<string, boolean>>({});

  // Filter States for "Manage Sub Accounts" Tab
  const [roleFilterInput, setRoleFilterInput] = useState<string>('');
  const [statusFilterInput, setStatusFilterInput] = useState<string>('');
  const [emailSearchInput, setEmailSearchInput] = useState<string>('');

  const [appliedFilters, setAppliedFilters] = useState<{
    role: string;
    status: string;
    email: string;
  }>({
    role: '',
    status: '',
    email: '',
  });

  // Pagination state for Sub Accounts Table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Add / Edit User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<{
    role: string;
    email: string;
    name: string;
    defaultLanguage: string;
    password: string;
    sendCredentialsEmail: boolean;
  }>({
    role: 'Seller Full Access',
    email: '',
    name: '',
    defaultLanguage: 'English (Bangladesh)',
    password: '',
    sendCredentialsEmail: true,
  });
  const [showUserPassword, setShowUserPassword] = useState<boolean>(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Add / View / Edit Role Form State
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isRoleReadOnly, setIsRoleReadOnly] = useState<boolean>(false);
  const [permissionPlatformTab, setPermissionPlatformTab] = useState<'pc' | 'app'>('pc');
  const [roleForm, setRoleForm] = useState<{
    role: string;
    description: string;
    pcPermissions: string[];
    appPermissions: string[];
  }>({
    role: '',
    description: '',
    pcPermissions: ['login', 'products_read', 'orders_read'],
    appPermissions: ['login', 'products_read', 'orders_read'],
  });
  const [roleFormError, setRoleFormError] = useState<string | null>(null);

  const [savingBackend, setSavingBackend] = useState<boolean>(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Fetch initial RBAC data from backend
  useEffect(() => {
    if (!sellerApi.getToken()) return;

    let cancelled = false;
    sellerApi
      .getRbacData()
      .then((json) => {
        if (cancelled || !json) return;
        if (Array.isArray(json.subAccounts) && json.subAccounts.length > 0) {
          setSubAccounts(buildInitialSubAccounts({ subAccounts: json.subAccounts }, sellerProfile));
        }
        if (Array.isArray(json.roles) && json.roles.length > 0) {
          setRolesList(buildInitialRoles({ roles: json.roles }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (showToast) showToast(text, type);
    if (type === 'success' || type === 'error') {
      setBannerMsg({ type, text });
      setTimeout(() => {
        setBannerMsg((prev) => (prev?.text === text ? null : prev));
      }, 4000);
    }
  };

  // Persist Sub-Accounts to Backend & Parent
  const syncSubAccounts = async (nextSubs: SubAccountUserRow[], successMessage?: string) => {
    setSubAccounts(nextSubs);
    if (onUpdateField) {
      onUpdateField('subAccounts', nextSubs);
    }

    if (!sellerApi.getToken()) {
      if (successMessage) notify(successMessage, 'success');
      return;
    }

    setSavingBackend(true);
    try {
      await sellerApi.updateSubAccounts(nextSubs);
      if (successMessage) notify(successMessage, 'success');
    } catch {
      if (successMessage) notify(successMessage, 'success');
    } finally {
      setSavingBackend(false);
    }
  };

  // Persist Roles to Backend & Parent
  const syncRoles = async (nextRoles: RbacRoleDefinition[], successMessage?: string) => {
    setRolesList(nextRoles);
    if (onUpdateField) {
      onUpdateField('roles', nextRoles);
    }

    if (!sellerApi.getToken()) {
      if (successMessage) notify(successMessage, 'success');
      return;
    }

    setSavingBackend(true);
    try {
      await sellerApi.updateRbacRoles(nextRoles);
      if (successMessage) notify(successMessage, 'success');
    } catch {
      if (successMessage) notify(successMessage, 'success');
    } finally {
      setSavingBackend(false);
    }
  };

  // Filtered & Paginated Sub-Accounts
  const filteredSubAccounts = useMemo(() => {
    return subAccounts.filter((item) => {
      if (appliedFilters.role && item.role !== appliedFilters.role) {
        return false;
      }
      if (appliedFilters.status) {
        const isActive = item.enabled;
        if (appliedFilters.status === 'Active' && !isActive) return false;
        if (appliedFilters.status === 'Inactive' && isActive) return false;
      }
      if (appliedFilters.email.trim()) {
        const q = appliedFilters.email.trim().toLowerCase();
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchName =
          item.name.toLowerCase().includes(q) ||
          (item.maskedName || '').toLowerCase().includes(q);
        if (!matchEmail && !matchName) return false;
      }
      return true;
    });
  }, [subAccounts, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredSubAccounts.length / pageSize));
  const paginatedSubAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubAccounts.slice(start, start + pageSize);
  }, [filteredSubAccounts, currentPage, pageSize]);

  // Handlers for Filter Controls
  const handleSearchSubAccounts = () => {
    setAppliedFilters({
      role: roleFilterInput,
      status: statusFilterInput,
      email: emailSearchInput,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setRoleFilterInput('');
    setStatusFilterInput('');
    setEmailSearchInput('');
    setAppliedFilters({ role: '', status: '', email: '' });
    setCurrentPage(1);
  };

  // Toggle Status Switch per Sub-Account Row
  const handleToggleUserStatus = (id: string) => {
    const next = subAccounts.map((u) => {
      if (u.id !== id) return u;
      const nextEnabled = !u.enabled;
      return {
        ...u,
        enabled: nextEnabled,
        status: (nextEnabled ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
      };
    });
    syncSubAccounts(next, 'Sub-account status updated.');
  };

  // Open "+ Add Sub Account" Form
  const handleOpenAddSubAccount = () => {
    setEditingUserId(null);
    setUserForm({
      role: rolesList[0]?.role || 'Seller Full Access',
      email: '',
      name: '',
      defaultLanguage: 'English (Bangladesh)',
      password: '',
      sendCredentialsEmail: true,
    });
    setUserFormError(null);
    setShowUserPassword(false);
    setViewMode('add_user');
  };

  // Open "Modify" Sub Account Form
  const handleOpenModifySubAccount = (user: SubAccountUserRow) => {
    setEditingUserId(user.id);
    setUserForm({
      role: user.role,
      email: user.email,
      name: user.name,
      defaultLanguage: user.defaultLanguage || 'English (Bangladesh)',
      password: '••••••••••••',
      sendCredentialsEmail: user.sendCredentialsEmail ?? true,
    });
    setUserFormError(null);
    setShowUserPassword(false);
    setViewMode('edit_user');
  };

  // Delete Sub Account
  const handleDeleteSubAccount = (user: SubAccountUserRow) => {
    if (user.isOwnerAccount) {
      notify('Owner account cannot be deleted.', 'error');
      return;
    }
    const next = subAccounts.filter((u) => u.id !== user.id);
    syncSubAccounts(next, `Sub-account (${user.email}) removed.`);
  };

  // Submit Add / Edit Sub-Account Form
  const handleSubmitUserForm = async () => {
    if (!userForm.role.trim()) {
      setUserFormError('Please select a Role for the sub-account.');
      return;
    }
    if (!userForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email.trim())) {
      setUserFormError('Please enter a valid sub-account email address.');
      return;
    }
    if (!userForm.name.trim()) {
      setUserFormError('Please enter the sub-account holder name.');
      return;
    }
    if (viewMode === 'add_user' && (!userForm.password || userForm.password.length < 6)) {
      setUserFormError('Password is required (minimum 6 characters).');
      return;
    }

    const cleanName = userForm.name.trim();
    const cleanEmail = userForm.email.trim().toLowerCase();

    if (viewMode === 'edit_user' && editingUserId) {
      const next = subAccounts.map((u) =>
        u.id === editingUserId
          ? {
              ...u,
              role: userForm.role,
              email: cleanEmail,
              name: cleanName,
              maskedName: formatMaskedName(cleanName),
              defaultLanguage: userForm.defaultLanguage,
              sendCredentialsEmail: userForm.sendCredentialsEmail,
            }
          : u
      );
      await syncSubAccounts(next, 'Sub-account updated successfully.');
    } else {
      const newSub: SubAccountUserRow = {
        id: `SUB-${Date.now().toString().slice(-5)}`,
        name: cleanName,
        maskedName: formatMaskedName(cleanName),
        email: cleanEmail,
        role: userForm.role,
        enabled: true,
        status: 'Active',
        isOwnerAccount: false,
        defaultLanguage: userForm.defaultLanguage,
        sendCredentialsEmail: userForm.sendCredentialsEmail,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      const next = [...subAccounts, newSub];
      await syncSubAccounts(
        next,
        userForm.sendCredentialsEmail
          ? `Sub-account created and credentials dispatched to ${cleanEmail}.`
          : `Sub-account (${cleanEmail}) created successfully.`
      );
    }

    setActiveTab('sub_accounts');
    setViewMode('list');
  };

  // Open "+ Add New Role" Form
  const handleOpenAddRole = () => {
    setEditingRoleId(null);
    setIsRoleReadOnly(false);
    setPermissionPlatformTab('pc');
    setRoleForm({
      role: '',
      description: '',
      pcPermissions: ['login'],
      appPermissions: ['login'],
    });
    setRoleFormError(null);
    setViewMode('add_role');
  };

  // Open "View Permission" or "Edit" Role
  const handleOpenRolePermissions = (roleItem: RbacRoleDefinition, readOnly = false) => {
    setEditingRoleId(roleItem.id);
    setIsRoleReadOnly(readOnly);
    setPermissionPlatformTab('pc');
    setRoleForm({
      role: roleItem.role.slice(0, 30),
      description: roleItem.description.slice(0, 50),
      pcPermissions: [...(roleItem.pcPermissions || [])],
      appPermissions: [...(roleItem.appPermissions || [])],
    });
    setRoleFormError(null);
    setViewMode('view_role');
  };

  // Clickable Role Link inside Sub-Accounts Table -> Opens View Permission for that Role
  const handleClickRoleFromSubAccount = (roleName: string) => {
    const matched =
      rolesList.find((r) => r.role.toLowerCase() === roleName.toLowerCase()) ||
      DEFAULT_DARAZ_ROLES[0];
    handleOpenRolePermissions(matched, false);
  };

  // Toggle a single permission code in PC or App permission array
  const handleTogglePermissionCode = (code: string) => {
    if (isRoleReadOnly) return;
    if (permissionPlatformTab === 'pc') {
      setRoleForm((prev) => {
        const exists = prev.pcPermissions.includes(code);
        return {
          ...prev,
          pcPermissions: exists
            ? prev.pcPermissions.filter((c) => c !== code)
            : [...prev.pcPermissions, code],
        };
      });
    } else {
      setRoleForm((prev) => {
        const exists = prev.appPermissions.includes(code);
        return {
          ...prev,
          appPermissions: exists
            ? prev.appPermissions.filter((c) => c !== code)
            : [...prev.appPermissions, code],
        };
      });
    }
  };

  // Select / Deselect All in a Category
  const handleToggleCategoryGroup = (group: PermissionCategoryGroup) => {
    if (isRoleReadOnly) return;
    const codes = group.permissions.map((p) => p.code);
    const activeList =
      permissionPlatformTab === 'pc' ? roleForm.pcPermissions : roleForm.appPermissions;
    const allSelected = codes.every((c) => activeList.includes(c));

    const nextList = allSelected
      ? activeList.filter((c) => !codes.includes(c))
      : Array.from(new Set([...activeList, ...codes]));

    if (permissionPlatformTab === 'pc') {
      setRoleForm((prev) => ({ ...prev, pcPermissions: nextList }));
    } else {
      setRoleForm((prev) => ({ ...prev, appPermissions: nextList }));
    }
  };

  // Save Role (Add or Update)
  const handleSaveRoleForm = async () => {
    const cleanTitle = roleForm.role.trim().slice(0, 30);
    const cleanDesc = roleForm.description.trim().slice(0, 50);

    if (!cleanTitle) {
      setRoleFormError('Roles Title is required (max 30 characters).');
      return;
    }
    if (!cleanDesc) {
      setRoleFormError('Role Description is required (max 50 characters).');
      return;
    }

    if (editingRoleId) {
      const next = rolesList.map((r) =>
        r.id === editingRoleId
          ? {
              ...r,
              role: cleanTitle,
              description: cleanDesc,
              pcPermissions: roleForm.pcPermissions,
              appPermissions: roleForm.appPermissions,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      await syncRoles(next, `Permissions for "${cleanTitle}" saved successfully.`);
    } else {
      const newRole: RbacRoleDefinition = {
        id: `role_${Date.now()}`,
        role: cleanTitle,
        description: cleanDesc,
        isSystem: false,
        pcPermissions: roleForm.pcPermissions,
        appPermissions: roleForm.appPermissions,
        updatedAt: new Date().toISOString(),
      };
      const next = [...rolesList, newRole];
      await syncRoles(next, `New role "${cleanTitle}" created successfully.`);
    }

    setActiveTab('roles');
    setViewMode('list');
  };

  // Delete Custom Role
  const handleDeleteCustomRole = (roleItem: RbacRoleDefinition) => {
    if (roleItem.isSystem) {
      notify('Standard system role templates cannot be deleted.', 'error');
      return;
    }
    const next = rolesList.filter((r) => r.id !== roleItem.id);
    syncRoles(next, `Custom role "${roleItem.role}" deleted.`);
  };

  const activeCheckedPerms =
    permissionPlatformTab === 'pc' ? roleForm.pcPermissions : roleForm.appPermissions;

  return (
    <div
      className={`w-full rounded-xl transition-colors ${
        isDark ? 'text-neutral-100' : 'text-slate-800'
      }`}
    >
      {/* Breadcrumb Path: Homepage > Setting > User Management */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-[13px] mb-3 ${
          isDark ? 'text-neutral-400' : 'text-slate-500'
        }`}
      >
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb && onNavigateBreadcrumb('home')}
          className={`transition-colors cursor-pointer ${
            isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
          }`}
        >
          Homepage
        </button>
        <ChevronRight size={13} className="opacity-60" />
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb && onNavigateBreadcrumb('setting')}
          className={`transition-colors cursor-pointer ${
            isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
          }`}
        >
          Setting
        </button>
        <ChevronRight size={13} className="opacity-60" />
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`font-medium cursor-pointer ${
            viewMode === 'list'
              ? isDark
                ? 'text-neutral-200'
                : 'text-slate-700'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Management
        </button>
        {viewMode !== 'list' && (
          <>
            <ChevronRight size={13} className="opacity-60" />
            <span className={`font-medium ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
              {viewMode === 'add_user'
                ? 'Add User'
                : viewMode === 'edit_user'
                ? 'Modify Sub Account'
                : viewMode === 'add_role'
                ? 'Add Role'
                : 'Permission Management'}
            </span>
          </>
        )}
      </nav>

      {/* Page Header & Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <h1
          className={`text-[24px] font-semibold tracking-tight leading-snug ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {viewMode === 'add_user'
            ? 'Add User'
            : viewMode === 'edit_user'
            ? 'Modify Sub Account'
            : viewMode === 'add_role'
            ? 'Add Role'
            : viewMode === 'view_role'
            ? 'Role Permission Management'
            : 'User Management'}
        </h1>

        {viewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAddSubAccount}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Add Sub Account</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddRole}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isDark
                  ? 'border-[#F85606] text-[#F85606] hover:bg-[#F85606]/10'
                  : 'border-[#F85606] text-[#F85606] bg-white hover:bg-orange-50'
              }`}
            >
              <Plus size={15} />
              <span>Add New Role</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {bannerMsg && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-lg border text-[13px] font-medium flex items-center justify-between ${
            bannerMsg.type === 'success'
              ? isDark
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark
              ? 'bg-red-950/50 border-red-800 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check size={15} />
            <span>{bannerMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =======================================================================
          VIEW 1: MAIN TABBED LIST ("Manage Sub Accounts" & "Manage Roles")
         ======================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Navigation Tab Bar */}
          <div
            className={`flex items-center gap-8 border-b ${
              isDark ? 'border-neutral-800' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('sub_accounts')}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'sub_accounts'
                  ? 'border-[#F85606] text-[#F85606]'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Sub Accounts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'border-[#F85606] text-[#F85606]'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Roles
            </button>
          </div>

          {activeTab === 'sub_accounts' ? (
            /* -------------------------------------------------------------------
               TAB 1: MANAGE SUB ACCOUNTS
               ------------------------------------------------------------------- */
            <div className="space-y-4">
              {/* Filter Bar Card */}
              <div
                className={`p-5 rounded-xl border ${
                  isDark
                    ? 'bg-neutral-900/90 border-neutral-800'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Roles Dropdown Filter */}
                  <div className="flex items-center gap-3">
                    <label
                      className={`text-[13px] shrink-0 w-14 ${
                        isDark ? 'text-neutral-400' : 'text-slate-600'
                      }`}
                    >
                      Roles:
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={roleFilterInput}
                        onChange={(e) => setRoleFilterInput(e.target.value)}
                        className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-[13px] focus:outline-none ${
                          isDark
                            ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                        }`}
                      >
                        <option value="">Please Select</option>
                        {rolesList.map((r) => (
                          <option key={r.id} value={r.role}>
                            {r.role}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50"
                      />
                    </div>
                  </div>

                  {/* Status Dropdown Filter */}
                  <div className="flex items-center gap-3">
                    <label
                      className={`text-[13px] shrink-0 w-14 ${
                        isDark ? 'text-neutral-400' : 'text-slate-600'
                      }`}
                    >
                      Status:
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={statusFilterInput}
                        onChange={(e) => setStatusFilterInput(e.target.value)}
                        className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-[13px] focus:outline-none ${
                          isDark
                            ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                        }`}
                      >
                        <option value="">Please Select</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50"
                      />
                    </div>
                  </div>

                  {/* Email Search Input */}
                  <div className="flex items-center gap-3">
                    <label
                      className={`text-[13px] shrink-0 w-14 ${
                        isDark ? 'text-neutral-400' : 'text-slate-600'
                      }`}
                    >
                      Email:
                    </label>
                    <input
                      type="text"
                      value={emailSearchInput}
                      onChange={(e) => setEmailSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchSubAccounts();
                      }}
                      placeholder="Input your search"
                      className={`flex-1 rounded-lg border px-3 py-2 text-[13px] focus:outline-none ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                          : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                      }`}
                    />
                  </div>
                </div>

                {/* Reset & Search Buttons */}
                <div className="mt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={`px-4 py-1.5 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSearchSubAccounts}
                    className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Sub Accounts Data Table Card */}
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark
                    ? 'bg-neutral-900/90 border-neutral-800'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[820px]">
                    <thead>
                      <tr
                        className={`border-b text-[13px] font-semibold ${
                          isDark
                            ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                            : 'bg-[#FAFAFA] border-slate-200 text-slate-700'
                        }`}
                      >
                        <th className="py-3.5 px-4">Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Roles</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Is Owner Account</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y text-[13px] ${
                        isDark ? 'divide-neutral-800' : 'divide-slate-200/70'
                      }`}
                    >
                      {paginatedSubAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-14 text-center">
                            <p
                              className={`text-[13px] ${
                                isDark ? 'text-neutral-500' : 'text-slate-400'
                              }`}
                            >
                              No sub-accounts match your filter criteria.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedSubAccounts.map((user) => {
                          const isRevealed = Boolean(revealedUserIds[user.id]);
                          const displayName = isRevealed
                            ? user.name
                            : user.maskedName || formatMaskedName(user.name);

                          return (
                            <tr
                              key={user.id}
                              className={`transition-colors ${
                                isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Name (Masked format supported e.g., *******824) */}
                              <td className="py-3.5 px-4 font-mono tabular-nums">
                                <div className="inline-flex items-center gap-2">
                                  <span
                                    className={isDark ? 'text-neutral-100' : 'text-slate-800'}
                                  >
                                    {displayName}
                                  </span>
                                  <button
                                    type="button"
                                    title={isRevealed ? 'Mask Name' : 'Reveal Full Name'}
                                    onClick={() =>
                                      setRevealedUserIds((prev) => ({
                                        ...prev,
                                        [user.id]: !prev[user.id],
                                      }))
                                    }
                                    className={`opacity-50 hover:opacity-100 cursor-pointer ${
                                      isDark ? 'text-neutral-400' : 'text-slate-400'
                                    }`}
                                  >
                                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>
                                </div>
                              </td>

                              {/* Email */}
                              <td
                                className={`py-3.5 px-4 ${
                                  isDark ? 'text-neutral-200' : 'text-slate-700'
                                }`}
                              >
                                {user.email}
                              </td>

                              {/* Roles (clickable link) */}
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleClickRoleFromSubAccount(user.role)}
                                  className="text-[#1a73e8] hover:underline font-medium cursor-pointer text-left"
                                >
                                  {user.role}
                                </button>
                              </td>

                              {/* Status (Interactive ON/OFF switch) */}
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={user.enabled}
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none ${
                                    user.enabled
                                      ? 'bg-[#F85606]'
                                      : isDark
                                      ? 'bg-neutral-700'
                                      : 'bg-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                                      user.enabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </td>

                              {/* Is Owner Account (Checkmark indicator) */}
                              <td className="py-3.5 px-4 text-center">
                                {user.isOwnerAccount ? (
                                  <span
                                    className={`inline-flex items-center justify-center font-bold ${
                                      isDark ? 'text-neutral-200' : 'text-slate-700'
                                    }`}
                                    title="Primary Owner Account"
                                  >
                                    <Check size={16} strokeWidth={2.5} />
                                  </span>
                                ) : (
                                  <span className="text-slate-300 dark:text-neutral-600">—</span>
                                )}
                              </td>

                              {/* Actions (Modify, Delete) */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenModifySubAccount(user)}
                                    className="text-[#1a73e8] hover:underline font-medium cursor-pointer"
                                  >
                                    Modify
                                  </button>
                                  {!user.isOwnerAccount && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubAccount(user)}
                                      className="text-red-600 hover:underline font-medium cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div
                  className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-[12px] ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-950/40 text-neutral-400'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div>
                    Total <span className="font-mono font-semibold">{filteredSubAccounts.length}</span>{' '}
                    account(s)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`px-2.5 py-1 rounded border inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer ${
                        isDark
                          ? 'border-neutral-700 hover:bg-neutral-800'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ChevronLeft size={13} />
                      <span>Previous</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCurrentPage(num)}
                        className={`w-7 h-7 rounded font-mono text-[12px] font-medium cursor-pointer transition-colors ${
                          num === currentPage
                            ? 'bg-[#F85606] text-white'
                            : isDark
                            ? 'hover:bg-neutral-800 text-neutral-300'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={`px-2.5 py-1 rounded border inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer ${
                        isDark
                          ? 'border-neutral-700 hover:bg-neutral-800'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight size={13} />
                    </button>

                    <div className="relative ml-2">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className={`appearance-none rounded border px-2.5 py-1 pr-6 text-[12px] font-mono focus:outline-none ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* -------------------------------------------------------------------
               TAB 2: MANAGE ROLES
               ------------------------------------------------------------------- */
            <div
              className={`rounded-xl border overflow-hidden ${
                isDark
                  ? 'bg-neutral-900/90 border-neutral-800'
                  : 'bg-white border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr
                      className={`border-b text-[13px] font-semibold ${
                        isDark
                          ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                          : 'bg-[#FAFAFA] border-slate-200 text-slate-700'
                      }`}
                    >
                      <th className="py-3.5 px-5 w-1/3">Roles</th>
                      <th className="py-3.5 px-5">Role Description</th>
                      <th className="py-3.5 px-5 text-right w-48">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y text-[13px] ${
                      isDark ? 'divide-neutral-800' : 'divide-slate-200/70'
                    }`}
                  >
                    {rolesList.map((roleItem) => (
                      <tr
                        key={roleItem.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td
                          className={`py-3.5 px-5 font-medium ${
                            isDark ? 'text-neutral-100' : 'text-slate-900'
                          }`}
                        >
                          {roleItem.role}
                        </td>
                        <td
                          className={`py-3.5 px-5 ${
                            isDark ? 'text-neutral-400' : 'text-slate-600'
                          }`}
                        >
                          {roleItem.description}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenRolePermissions(roleItem, false)}
                              className="text-[#1a73e8] hover:underline font-medium cursor-pointer"
                            >
                              View Permission
                            </button>
                            {!roleItem.isSystem && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomRole(roleItem)}
                                className="text-red-600 hover:underline font-medium cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          VIEW 2: ADD / MODIFY SUB ACCOUNT FORM (Matches Screenshot 3)
         ======================================================================= */}
      {(viewMode === 'add_user' || viewMode === 'edit_user') && (
        <div
          className={`rounded-xl border p-6 sm:p-8 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          {userFormError && (
            <div className="mb-5 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
              {userFormError}
            </div>
          )}

          <div className="max-w-xl space-y-5">
            {/* Roles (Required Select Dropdown) */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <span className="text-red-500 mr-1">*</span>Roles
              </label>
              <div className="relative">
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                  className={`w-full appearance-none rounded-lg border px-3.5 py-2.5 pr-9 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                  }`}
                >
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.role}>
                      {r.role}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                />
              </div>
            </div>

            {/* Email (Required Text Input) */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <span className="text-red-500 mr-1">*</span>Email
              </label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Enter sub-account email address"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-[13px] focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                }`}
              />
            </div>

            {/* Name (Required Text Input) */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <span className="text-red-500 mr-1">*</span>Name
              </label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Enter staff member full name"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-[13px] focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                }`}
              />
            </div>

            {/* Default Language (Dropdown e.g., English (Bangladesh)) */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                Default Language
              </label>
              <div className="relative">
                <select
                  value={userForm.defaultLanguage}
                  onChange={(e) => setUserForm((p) => ({ ...p, defaultLanguage: e.target.value }))}
                  className={`w-full appearance-none rounded-lg border px-3.5 py-2.5 pr-9 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                  }`}
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                />
              </div>
            </div>

            {/* Password (Required Input) */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <span className="text-red-500 mr-1">*</span>Password
              </label>
              <div className="relative">
                <input
                  type={showUserPassword ? 'text' : 'password'}
                  value={userForm.password}
                  onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter login password"
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                >
                  {showUserPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Checkbox: "Send a username and password to a sub-account email" */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4">
              <div />
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={userForm.sendCredentialsEmail}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, sendCredentialsEmail: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-[#F85606] cursor-pointer"
                />
                <span
                  className={`text-[13px] ${
                    isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  Send a username and password to a sub-account email
                </span>
              </label>
            </div>

            {/* Action Buttons: Cancel and Submit */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-4 pt-3">
              <div />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-5 py-2 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingBackend}
                  onClick={handleSubmitUserForm}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] disabled:opacity-60 text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer"
                >
                  {savingBackend ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW 3: ADD NEW ROLE / VIEW PERMISSION FORM (Matches Screenshot 4)
         ======================================================================= */}
      {(viewMode === 'add_role' || viewMode === 'view_role') && (
        <div
          className={`rounded-xl border p-6 sm:p-8 space-y-6 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          {roleFormError && (
            <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
              {roleFormError}
            </div>
          )}

          {/* Top Inputs: Roles Title (0/30) & Role Description (0/50) */}
          <div className="max-w-2xl space-y-4">
            {/* Roles Title Input */}
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-center gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <span className="text-red-500 mr-1">*</span>Roles:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={30}
                  disabled={isRoleReadOnly}
                  value={roleForm.role}
                  onChange={(e) =>
                    setRoleForm((p) => ({ ...p, role: e.target.value.slice(0, 30) }))
                  }
                  placeholder="Enter role title"
                  className={`w-full rounded-lg border px-3.5 py-2 pr-14 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                  }`}
                />
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums ${
                    isDark ? 'text-neutral-500' : 'text-slate-400'
                  }`}
                >
                  {roleForm.role.length}/30
                </span>
              </div>
            </div>

            {/* Role Description Textarea */}
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start gap-2 sm:gap-4">
              <label
                className={`text-[13px] sm:text-right pt-2 ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <span className="text-red-500 mr-1">*</span>Role Description:
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={50}
                  disabled={isRoleReadOnly}
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm((p) => ({
                      ...p,
                      description: e.target.value.slice(0, 50),
                    }))
                  }
                  placeholder="Describe the scope of this role"
                  className={`w-full rounded-lg border px-3.5 py-2 pb-6 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                  }`}
                />
                <span
                  className={`absolute right-3 bottom-2 text-[11px] font-mono tabular-nums ${
                    isDark ? 'text-neutral-500' : 'text-slate-400'
                  }`}
                >
                  {roleForm.description.length}/50
                </span>
              </div>
            </div>
          </div>

          {/* Permission Management Tab Control */}
          <div className="space-y-4">
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPermissionPlatformTab('pc')}
                  className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                    permissionPlatformTab === 'pc'
                      ? 'border-[#F85606] text-[#F85606]'
                      : isDark
                      ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PC Seller Center Permission Management
                </button>
                <button
                  type="button"
                  onClick={() => setPermissionPlatformTab('app')}
                  className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                    permissionPlatformTab === 'app'
                      ? 'border-[#F85606] text-[#F85606]'
                      : isDark
                      ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Seller APP Permission Management
                </button>
              </div>

              <div className="flex items-center gap-3 pb-2 text-[12px]">
                <span className="font-mono tabular-nums opacity-70">
                  {activeCheckedPerms.length} / {ALL_PERMISSION_CODES.length} permissions enabled
                </span>
                {!isRoleReadOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (permissionPlatformTab === 'pc') {
                          setRoleForm((p) => ({ ...p, pcPermissions: [...ALL_PERMISSION_CODES] }));
                        } else {
                          setRoleForm((p) => ({ ...p, appPermissions: [...ALL_PERMISSION_CODES] }));
                        }
                      }}
                      className="text-[#1a73e8] hover:underline font-medium cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (permissionPlatformTab === 'pc') {
                          setRoleForm((p) => ({ ...p, pcPermissions: [] }));
                        } else {
                          setRoleForm((p) => ({ ...p, appPermissions: [] }));
                        }
                      }}
                      className="text-slate-500 hover:underline font-medium cursor-pointer"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Checkbox Grid Listing Full Granular Permissions */}
            <div
              className={`p-5 rounded-xl border space-y-5 max-h-[460px] overflow-y-auto ${
                isDark
                  ? 'bg-neutral-950/60 border-neutral-800'
                  : 'bg-[#FAFAFA] border-slate-200'
              }`}
            >
              {GRANULAR_PERMISSION_GROUPS.map((group) => {
                const groupCodes = group.permissions.map((p) => p.code);
                const allGroupSelected = groupCodes.every((c) => activeCheckedPerms.includes(c));

                return (
                  <div
                    key={group.category}
                    className={`pb-4 border-b last:border-b-0 last:pb-0 ${
                      isDark ? 'border-neutral-800/80' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`text-[12px] font-semibold ${
                          isDark ? 'text-neutral-300' : 'text-slate-700'
                        }`}
                      >
                        {group.category}
                      </span>
                      {!isRoleReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryGroup(group)}
                          className="text-[11px] text-[#1a73e8] hover:underline cursor-pointer"
                        >
                          {allGroupSelected ? 'Unselect Group' : 'Select Group'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {group.permissions.map((perm) => {
                        const checked = activeCheckedPerms.includes(perm.code);
                        return (
                          <label
                            key={perm.code}
                            className={`inline-flex items-center gap-2 py-1 px-2 rounded select-none ${
                              isRoleReadOnly ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              checked
                                ? isDark
                                  ? 'text-neutral-100'
                                  : 'text-slate-900'
                                : isDark
                                ? 'text-neutral-400'
                                : 'text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isRoleReadOnly}
                              checked={checked}
                              onChange={() => handleTogglePermissionCode(perm.code)}
                              className="w-4 h-4 rounded accent-[#F85606] shrink-0 cursor-pointer"
                            />
                            <span className="text-[12.5px] font-mono truncate" title={perm.label}>
                              {perm.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Back and Save */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-5 py-2 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Back
            </button>
            {!isRoleReadOnly && (
              <button
                type="button"
                disabled={savingBackend}
                onClick={handleSaveRoleForm}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] disabled:opacity-60 text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer"
              >
                {savingBackend ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DarazUserManagementManager;
