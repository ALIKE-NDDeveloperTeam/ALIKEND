import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { adminApi } from '../pages/adminApi';

export interface AdminUser {
  _id?: string;
  name: string;
  email: string;
  role: string;
}

interface AdminEditContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  toggleEditMode: () => void;
  loginAdmin: (admin: AdminUser, token?: string) => void;
  logoutAdmin: () => void;

  // Products
  editingProduct: Product | null;
  openEditProduct: (p: Product) => void;
  closeEditProduct: () => void;
  deletingProduct: Product | null;
  openDeleteProduct: (p: Product) => void;
  closeDeleteProduct: () => void;
  toggleProductVisibility: (p: Product) => Promise<boolean>;

  // Banners
  editingBanner: any | null;
  isCreatingBanner: boolean;
  openEditBanner: (b: any) => void;
  openCreateBanner: () => void;
  closeEditBanner: () => void;
  deletingBanner: any | null;
  openDeleteBanner: (b: any) => void;
  closeDeleteBanner: () => void;

  // Advertisements
  editingAd: any | null;
  isCreatingAd: boolean;
  openEditAd: (ad: any) => void;
  openCreateAd: () => void;
  closeEditAd: () => void;
  deletingAd: any | null;
  openDeleteAd: (ad: any) => void;
  closeDeleteAd: () => void;

  // Flash Deals
  isFlashSaleModalOpen: boolean;
  openFlashSaleModal: () => void;
  closeFlashSaleModal: () => void;

  // Data Refresh Sync
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AdminEditContext = createContext<AdminEditContextType | undefined>(undefined);

export const AdminEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('alikend_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    return localStorage.getItem('alikend_admin_edit_mode') === 'true';
  });

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [isCreatingBanner, setIsCreatingBanner] = useState<boolean>(false);
  const [deletingBanner, setDeletingBanner] = useState<any | null>(null);

  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [isCreatingAd, setIsCreatingAd] = useState<boolean>(false);
  const [deletingAd, setDeletingAd] = useState<any | null>(null);

  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState<boolean>(false);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Validate admin token on mount with /api/admin/me
  useEffect(() => {
    const token = localStorage.getItem('alikend_admin_token') || sessionStorage.getItem('alikend_admin_token');
    if (!token) {
      if (adminUser) setAdminUser(null);
      return;
    }

    let isMounted = true;
    adminApi
      .getMe()
      .then((res: any) => {
        if (!isMounted) return;
        if (res && res.valid && res.admin) {
          const u: AdminUser = {
            _id: res.admin._id,
            name: res.admin.name || 'Administrator',
            email: res.admin.email,
            role: res.admin.role || 'admin',
          };
          setAdminUser(u);
          localStorage.setItem('alikend_admin_user', JSON.stringify(u));
        } else {
          // Token invalid
          adminApi.clearToken();
          localStorage.removeItem('alikend_admin_user');
          setAdminUser(null);
        }
      })
      .catch(() => {
        // Network or token error, keep local if recent, otherwise clear
        if (!isMounted) return;
        const saved = localStorage.getItem('alikend_admin_user');
        if (!saved) {
          adminApi.clearToken();
          setAdminUser(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loginAdmin = useCallback((user: AdminUser, token?: string) => {
    if (token) {
      adminApi.setToken(token);
    }
    setAdminUser(user);
    localStorage.setItem('alikend_admin_user', JSON.stringify(user));
    setIsEditMode(true);
    localStorage.setItem('alikend_admin_edit_mode', 'true');
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const logoutAdmin = useCallback(() => {
    adminApi.clearToken();
    localStorage.removeItem('alikend_admin_user');
    localStorage.removeItem('alikend_admin_edit_mode');
    setAdminUser(null);
    setIsEditMode(false);
    // Close all open admin modals
    setEditingProduct(null);
    setDeletingProduct(null);
    setEditingBanner(null);
    setIsCreatingBanner(false);
    setDeletingBanner(null);
    setEditingAd(null);
    setIsCreatingAd(false);
    setDeletingAd(null);
    setIsFlashSaleModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      const next = !prev;
      localStorage.setItem('alikend_admin_edit_mode', String(next));
      return next;
    });
  }, []);

  // Product controls
  const openEditProduct = useCallback((p: Product) => {
    setEditingProduct(p);
  }, []);

  const closeEditProduct = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const openDeleteProduct = useCallback((p: Product) => {
    setDeletingProduct(p);
  }, []);

  const closeDeleteProduct = useCallback(() => {
    setDeletingProduct(null);
  }, []);

  const toggleProductVisibility = useCallback(async (p: Product): Promise<boolean> => {
    try {
      const targetId = p._id || p.id;
      await adminApi.toggleProductVisibility(targetId);
      triggerRefresh();
      return true;
    } catch (err: any) {
      console.error('Failed to toggle product visibility:', err);
      alert(err.message || 'Failed to toggle product visibility');
      return false;
    }
  }, [triggerRefresh]);

  // Banner controls
  const openEditBanner = useCallback((b: any) => {
    setEditingBanner(b);
    setIsCreatingBanner(false);
  }, []);

  const openCreateBanner = useCallback(() => {
    setEditingBanner(null);
    setIsCreatingBanner(true);
  }, []);

  const closeEditBanner = useCallback(() => {
    setEditingBanner(null);
    setIsCreatingBanner(false);
  }, []);

  const openDeleteBanner = useCallback((b: any) => {
    setDeletingBanner(b);
  }, []);

  const closeDeleteBanner = useCallback(() => {
    setDeletingBanner(null);
  }, []);

  // Ad controls
  const openEditAd = useCallback((ad: any) => {
    setEditingAd(ad);
    setIsCreatingAd(false);
  }, []);

  const openCreateAd = useCallback(() => {
    setEditingAd(null);
    setIsCreatingAd(true);
  }, []);

  const closeEditAd = useCallback(() => {
    setEditingAd(null);
    setIsCreatingAd(false);
  }, []);

  const openDeleteAd = useCallback((ad: any) => {
    setDeletingAd(ad);
  }, []);

  const closeDeleteAd = useCallback(() => {
    setDeletingAd(null);
  }, []);

  // Flash Sale
  const openFlashSaleModal = useCallback(() => {
    setIsFlashSaleModalOpen(true);
  }, []);

  const closeFlashSaleModal = useCallback(() => {
    setIsFlashSaleModalOpen(false);
  }, []);

  const isAdmin = Boolean(
    (adminUser &&
      (adminUser.role === 'admin' ||
        adminUser.role === 'superadmin' ||
        adminUser.role === 'staff' ||
        adminUser.role === 'manager')) ||
    (typeof window !== 'undefined' &&
      (Boolean(localStorage.getItem('alikend_admin_token')) ||
        Boolean(localStorage.getItem('alikend_staff_token')) ||
        localStorage.getItem('alikend_admin_edit_mode') === 'true'))
  );

  return (
    <AdminEditContext.Provider
      value={{
        adminUser,
        isAdmin: isAdmin || isEditMode,
        isEditMode: isEditMode,
        setIsEditMode,
        toggleEditMode,
        loginAdmin,
        logoutAdmin,
        editingProduct,
        openEditProduct,
        closeEditProduct,
        deletingProduct,
        openDeleteProduct,
        closeDeleteProduct,
        toggleProductVisibility,
        editingBanner,
        isCreatingBanner,
        openEditBanner,
        openCreateBanner,
        closeEditBanner,
        deletingBanner,
        openDeleteBanner,
        closeDeleteBanner,
        editingAd,
        isCreatingAd,
        openEditAd,
        openCreateAd,
        closeEditAd,
        deletingAd,
        openDeleteAd,
        closeDeleteAd,
        isFlashSaleModalOpen,
        openFlashSaleModal,
        closeFlashSaleModal,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AdminEditContext.Provider>
  );
};

export const useAdminEdit = (): AdminEditContextType => {
  const ctx = useContext(AdminEditContext);
  if (!ctx) {
    throw new Error('useAdminEdit must be used within an AdminEditProvider');
  }
  return ctx;
};
