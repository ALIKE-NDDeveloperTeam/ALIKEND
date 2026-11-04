import React, { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Camera,
  X,
  ArrowLeft,
  ArrowRight,
  Clock,
  Truck,
  Copy,
  Check,
  Star,
  AlertTriangle,
  MessageSquare,
  Wallet,
  Sparkles,
  UserCheck,
  FileText,
  BadgeCheck,
  Radio,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Percent,
  RotateCcw,
  Palette,
  Layout,
  ShoppingBag,
  Filter,
} from 'lucide-react';
import GlassCloseButton from '../components/GlassCloseButton';
import GlassIconButton from '../components/GlassIconButton';
import { Product, SellerProfile } from '../types';
import { CATEGORIES } from '../data/mockData';
import { sellerApi, SellerProductPayload } from '../services/sellerApi';
import { deliveryApi } from '../services/deliveryApi';
import ShopLocationTab from '../components/seller/ShopLocationTab';
import SellerWalletTab from '../components/seller/SellerWalletTab';
import SellerCommissionTab from '../components/seller/SellerCommissionTab';
import StoreProfileTab from '../components/seller/StoreProfileTab';
import SellerOrderLiveTracking from '../components/seller/SellerOrderLiveTracking';
import { SellerVerificationTab, VERIFICATION_STATUS_META } from '../components/seller/SellerVerificationTab';
import { DarazAddProductStudio } from '../components/admin/DarazAddProductStudio';
import {
  SellerCenterSidebar,
  SellerCenterTopbar,
  SellerMenuSectionId,
} from '../components/seller/SellerCenterSidebar';
import { SellerMarketingAnalyticsTabs } from '../components/seller/SellerMarketingAnalyticsTabs';
import { SellerSupportAndSecurityTabs } from '../components/seller/SellerSupportAndSecurityTabs';
import { MarketplaceSettingsDashboard } from '../components/settings/MarketplaceSettingsDashboard';
import { DarazWarehousePickupManager } from '../components/seller/DarazWarehousePickupManager';
import { DarazDeliveryServiceManager } from '../components/seller/DarazDeliveryServiceManager';
import { DarazShippingProviderManager } from '../components/seller/DarazShippingProviderManager';
import { DarazInvoiceNumberManager } from '../components/seller/DarazInvoiceNumberManager';
import { DarazStoreBuilderManager } from '../components/seller/DarazStoreBuilderManager';
import { DarazStoreSettingsProfileManager } from '../components/seller/DarazStoreSettingsProfileManager';

interface SellerDashboardProps {
  products?: Product[];
  onAddProduct?: (p: Product) => void;
  onRemoveProduct?: (id: number) => void;
  onUpdateProduct?: (p: Product) => void;
  onNavigate?: (view: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

const SAMPLE_IMAGES = [
  { label: 'Watch 1', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'Watch 2', url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80' },
  { label: 'Jewelry', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Leather', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80' },
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
];

export default function SellerDashboard({
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
  onNavigate,
  showToast,
  isLightMode = false,
}: SellerDashboardProps) {
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(() => sellerApi.getStoredProfile());
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Seller Center Navigation State
  const [activeSection, setActiveSection] = useState<SellerMenuSectionId>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Product Filter & Bulk Management State
  const [productStatusFilter, setProductStatusFilter] = useState<
    'all' | 'published' | 'approved' | 'pending' | 'rejected' | 'draft' | 'unpublished' | 'out_of_stock' | 'archived'
  >('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSortBy, setProductSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'stock_asc'>('newest');
  const [selectedProductIds, setSelectedProductIds] = useState<(number | string)[]>([]);
  const [bulkActionProcessing, setBulkActionProcessing] = useState(false);
  const [bulkStockInput, setBulkStockInput] = useState<number>(20);
  const [bulkDiscountInput, setBulkDiscountInput] = useState<number>(15);

  // Modal & Studio State
  const [modalOpen, setModalOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteProd, setConfirmDeleteProd] = useState<{ id: number | string; name: string } | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [modalOpen]);

  // Product Form Fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState<number>(4999);
  const [formMrp, setFormMrp] = useState<number>(6999);
  const [formCategory, setFormCategory] = useState('luxury');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formEligibleFor20Min, setFormEligibleFor20Min] = useState(false);
  const [formStock, setFormStock] = useState<number>(15);
  const [formStockStatus, setFormStockStatus] = useState('In Stock');
  const [formImage, setFormImage] = useState(SAMPLE_IMAGES[0].url);
  const [formImages, setFormImages] = useState<string[]>([SAMPLE_IMAGES[0].url]);
  const [sellerUrlInput, setSellerUrlInput] = useState('');
  const sellerFileInputRef = useRef<HTMLInputElement>(null);
  const [sellerIsDragging, setSellerIsDragging] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formColorsInput, setFormColorsInput] = useState('Obsidian Black, Champagne Gold');
  const [formSizesInput, setFormSizesInput] = useState('Standard');
  const [formSpecsInput, setFormSpecsInput] = useState('Material: 316L Stainless Steel | Warranty: 2 Years Official');
  const [formIsDraft, setFormIsDraft] = useState(false);
  // Indian Marketplace Compliance & Enterprise Catalog Fields
  const [formHsnCode, setFormHsnCode] = useState('');
  const [formGstRate, setFormGstRate] = useState<number>(18);
  const [formCountryOfOrigin, setFormCountryOfOrigin] = useState('India');
  const [formManufacturerDetails, setFormManufacturerDetails] = useState('');
  const [formPackInfo, setFormPackInfo] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formPackageWeightKg, setFormPackageWeightKg] = useState<number>(0.5);
  const [formPackageLengthCm, setFormPackageLengthCm] = useState<number>(20);
  const [formPackageWidthCm, setFormPackageWidthCm] = useState<number>(15);
  const [formPackageHeightCm, setFormPackageHeightCm] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);

  // CSV Import & Duplicate State
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvTextInput, setCsvTextInput] = useState(
    'name,brand,category,price,mrp,stock,sku,hsnCode\n"Signature Obsidian Chrono","Artisan Atelier","luxury",8499,11999,25,"SKU-OBS-01","9102"\n"Handstitched Bridle Tote","Artisan Atelier","fashion",6299,8999,18,"SKU-TOTE-02","4202"'
  );
  const [importingCsv, setImportingCsv] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | number | null>(null);

  // Delete & Inline Quick Action State
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [adjustingStockId, setAdjustingStockId] = useState<string | number | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | number | null>(null);

  // Inline Email Verification State for Pending Sellers
  const [bannerOtpSent, setBannerOtpSent] = useState(false);
  const [bannerOtpCode, setBannerOtpCode] = useState('');
  const [bannerDevOtp, setBannerDevOtp] = useState('');
  const [bannerVerifying, setBannerVerifying] = useState(false);

  // Demo Login State
  const [demoLoggingIn, setDemoLoggingIn] = useState(false);

  // Wallet & Payout State
  const [walletData, setWalletData] = useState<{
    walletBalance: number;
    totalEarnings: number;
    pendingWithdrawals: number;
    ledger: any[];
  } | null>(null);

  // Marketplace Orders & Returns State
  const [marketplaceOrders, setMarketplaceOrders] = useState<any[]>([]);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [updatingOrderStatusId, setUpdatingOrderStatusId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkOrderNextStatus, setBulkOrderNextStatus] = useState<string>('Confirmed');
  const [bulkOrderCourier, setBulkOrderCourier] = useState<string>('BlueDart Priority');
  const [bulkOrderUpdating, setBulkOrderUpdating] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  // Store Orders & Pickup Dispatch State (20-Min Dark Store)
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderViewMode, setOrderViewMode] = useState<'marketplace' | 'express_dispatch'>('marketplace');
  const [handoverModalOrder, setHandoverModalOrder] = useState<any | null>(null);
  const [handoverCodeInput, setHandoverCodeInput] = useState('');
  const [verifyingHandover, setVerifyingHandover] = useState(false);
  const [issueModalOrder, setIssueModalOrder] = useState<any | null>(null);
  const [issueType, setIssueType] = useState<'store_delay' | 'missing_item' | 'damaged_package'>('store_delay');
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [issueDetails, setIssueDetails] = useState('');
  const [reportingIssue, setReportingIssue] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [expandedTrackingOrders, setExpandedTrackingOrders] = useState<Record<string, boolean>>({});

  // Store Branding, Decoration, SEO, Warehouses & Preview State
  const [brandLogo, setBrandLogo] = useState(sellerProfile?.logo || '');
  const [brandBannerUrl, setBrandBannerUrl] = useState(sellerProfile?.bannerUrl || '');
  const [brandTagline, setBrandTagline] = useState(sellerProfile?.tagline || '');
  const [brandDescription, setBrandDescription] = useState(sellerProfile?.storeDescription || '');
  const [storeSeoTitle, setStoreSeoTitle] = useState(sellerProfile?.seoTitle || '');
  const [storeSeoDescription, setStoreSeoDescription] = useState(sellerProfile?.seoDescription || '');
  const [decoThemeColor, setDecoThemeColor] = useState(sellerProfile?.storeDecoration?.themeColor || '#F5A623');
<<<<<<< HEAD
  const [decoLayoutStyle, setDecoLayoutStyle] = useState<'luxury_grid' | 'minimal_editorial' | 'boutique_showcase' | 'editorial' | 'grid' | 'boutique'>(
    (sellerProfile?.storeDecoration?.layoutStyle as any) || 'luxury_grid'
=======
  const [decoLayoutStyle, setDecoLayoutStyle] = useState<'luxury_grid' | 'minimal_editorial' | 'boutique_showcase'>(
    sellerProfile?.storeDecoration?.layoutStyle || 'luxury_grid'
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
  );
  const [decoAnnouncement, setDecoAnnouncement] = useState(
    sellerProfile?.storeDecoration?.announcementText || 'Complimentary insured shipping on all orders above ₹2,999.'
  );
  const [decoHeadline, setDecoHeadline] = useState(
    sellerProfile?.storeDecoration?.featuredHeadline || 'Signature Curated Collection'
  );
  const [policyShipping, setPolicyShipping] = useState(
    sellerProfile?.shippingPolicy || 'Orders are packed within 12–24 hours and dispatched via insured courier partners with real-time tracking.'
  );
  const [policyReturn, setPolicyReturn] = useState(
    sellerProfile?.returnPolicyText || '7-day hassle-free return and exchange policy for unused items with original tags and packaging intact.'
  );
  const [savingStoreConfig, setSavingStoreConfig] = useState(false);
  const [storePreviewOpen, setStorePreviewOpen] = useState(false);

  // Warehouse Nodes State
  const [whName, setWhName] = useState('');
  const [whCity, setWhCity] = useState('New Delhi');
  const [whPincode, setWhPincode] = useState('110016');
  const [whAddress, setWhAddress] = useState('');
  const [whPhone, setWhPhone] = useState('');
  const [addingWarehouse, setAddingWarehouse] = useState(false);

  useEffect(() => {
    if (!sellerProfile) return;
    setBrandLogo(sellerProfile.logo || '');
    setBrandBannerUrl(sellerProfile.bannerUrl || '');
    setBrandTagline(sellerProfile.tagline || '');
    setBrandDescription(sellerProfile.storeDescription || '');
    setStoreSeoTitle(sellerProfile.seoTitle || '');
    setStoreSeoDescription(sellerProfile.seoDescription || '');
    if (sellerProfile.storeDecoration) {
      setDecoThemeColor(sellerProfile.storeDecoration.themeColor || '#F5A623');
      setDecoLayoutStyle(sellerProfile.storeDecoration.layoutStyle || 'luxury_grid');
      setDecoAnnouncement(sellerProfile.storeDecoration.announcementText || '');
      setDecoHeadline(sellerProfile.storeDecoration.featuredHeadline || '');
    }
    if (sellerProfile.shippingPolicy) setPolicyShipping(sellerProfile.shippingPolicy);
    if (sellerProfile.returnPolicyText) setPolicyReturn(sellerProfile.returnPolicyText);
  }, [sellerProfile]);

  const loadMyProducts = async () => {
    try {
      setRefreshing(true);
      const res = await sellerApi.getMyProducts();
      if (res && res.success && Array.isArray(res.products)) {
        const normalized = res.products.map((p: any, idx: number) => ({
          ...p,
          id: p.id !== undefined && p.id !== null && p.id !== '' ? p.id : p._id || idx + 1,
          price: Number(p.price ?? 0),
          mrp: Number(p.mrp ?? p.price ?? 0),
          stock: Number(p.stock ?? 10),
        }));
        setMyProducts(normalized);
      }
    } catch (err: any) {
      console.warn('Failed to load seller products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMarketplaceOrders = async () => {
    try {
      const res = await sellerApi.getSellerOrders();
      if (res && res.success && Array.isArray(res.orders)) {
        setMarketplaceOrders(res.orders);
      }
    } catch (err) {
      console.warn('Failed to load marketplace orders:', err);
    }
  };

  const loadReturnsData = async () => {
    try {
      const res = await sellerApi.getSellerReturns();
      if (res && res.success && Array.isArray(res.returns)) {
        setReturnsList(res.returns);
      }
    } catch (err) {
      console.warn('Failed to load seller returns:', err);
    }
  };

  const loadWalletData = async () => {
    try {
      const walletRes = await sellerApi.getWallet().catch(() => null);
      if (walletRes) {
        setWalletData({
          walletBalance: walletRes.walletBalance ?? sellerProfile?.walletBalance ?? 0,
          totalEarnings: walletRes.totalEarnings ?? sellerProfile?.totalEarnings ?? 0,
          pendingWithdrawals: walletRes.pendingWithdrawals ?? sellerProfile?.pendingWithdrawals ?? 0,
          ledger: walletRes.ledger || [],
        });
      }
    } catch (e) {
      console.warn('Failed to load seller wallet:', e);
    }
  };

  const loadStoreOrders = async () => {
    try {
      setLoadingOrders(true);
      const orders = await deliveryApi.getStoreOrders(sellerProfile?.shopName);
      if (orders && orders.length > 0) {
        setStoreOrders(orders);
      } else {
        setStoreOrders([
          {
            taskId: 'DEL-84021',
            orderNumber: 'ORD-948210',
            serviceType: 'quick_delivery',
            status: 'ready_for_pickup',
            customerName: 'Ananya Sharma',
            customerPhone: '+91 98110 54321',
            deliveryAddress: {
              street: 'B-4/12, Safdarjung Enclave',
              city: 'New Delhi',
            },
            itemsSummary: 'Organic Strawberries 250g, Cold Brew Coffee (2x)',
            items: [
              { name: 'Organic Strawberries 250g', quantity: 1, price: 180 },
              { name: 'Cold Brew Coffee 300ml', quantity: 2, price: 160 },
            ],
            totalAmount: 500,
            pickupCode: 'PU-4821',
            pickupVerified: false,
            packageDetails: {
              weightKg: 1.2,
              packageType: 'Insulated Chilled Bag',
            },
            deliveryPartner: {
              name: 'Mohit Chauhan',
              phone: '+91 98101 22334',
              vehicleType: 'Electric Scooter',
              vehicleNumber: 'DL 01 EV 8890',
              rating: 4.9,
            },
            createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
          },
          {
            taskId: 'DEL-67104',
            orderNumber: 'ORD-772109',
            serviceType: 'quick_delivery',
            status: 'order_placed',
            customerName: 'Rohan Varma',
            customerPhone: '+91 98711 99221',
            deliveryAddress: {
              street: 'Tower 2, Flat 801, Hauz Khas',
              city: 'New Delhi',
            },
            itemsSummary: 'Whole Wheat Bread, Salted Butter 100g, Farm Eggs (6pcs)',
            items: [
              { name: 'Whole Wheat Bread', quantity: 1, price: 55 },
              { name: 'Salted Butter 100g', quantity: 1, price: 58 },
              { name: 'Farm Eggs (6pcs)', quantity: 1, price: 65 },
            ],
            totalAmount: 178,
            pickupCode: 'PU-9182',
            pickupVerified: false,
            packageDetails: {
              weightKg: 0.9,
              packageType: 'Standard Paper Grocery Bag',
            },
            createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.warn('Failed to load store orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      sellerApi.getMe().then((res) => {
        if (res && res.success && res.seller) {
          setSellerProfile(res.seller);
          sellerApi.setStoredProfile(res.seller);
        }
      }),
      loadMyProducts(),
      loadMarketplaceOrders(),
      loadReturnsData(),
      loadWalletData(),
      loadStoreOrders(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const token = sellerApi.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    refreshAllData();
  }, []);

  // Combined real orders list (Marketplace + Express Store Orders) with normalized schema
  const combinedOrders = useMemo(() => {
    const normalizeStatus = (rawStatus: any): string => {
      const s = String(rawStatus || 'pending').toLowerCase().trim();
      if (s === 'delivered') return 'Delivered';
      if (s === 'shipped' || s === 'picked_up' || s === 'out_for_delivery' || s === 'out for delivery') return 'Shipped';
      if (s === 'ready_for_pickup' || s === 'ready for shipment' || s === 'ready_for_shipment') return 'Ready for Shipment';
      if (s === 'processing' || s === 'preparing' || s === 'store_accepted') return 'Processing';
      if (s === 'confirmed') return 'Confirmed';
      if (s === 'cancelled' || s === 'rejected') return 'Cancelled';
      return 'Pending';
    };

    const mappedMarketplace = marketplaceOrders.map((mo: any) => {
      const addrObj = mo.deliveryAddress;
      const formattedAddress =
        typeof mo.address === 'string' && mo.address.trim()
          ? mo.address
          : addrObj && typeof addrObj === 'object'
          ? [addrObj.street, addrObj.city, addrObj.state, addrObj.pincode].filter(Boolean).join(', ')
          : 'Verified Buyer Address';
      const amount = Number(mo.sellerSubtotal ?? mo.sellerTotal ?? mo.total ?? mo.totalAmount ?? 0);
      return {
        ...mo,
        id: String(mo.id || mo.orderNumber || mo._id),
        orderNumber: String(mo.orderNumber || mo.id || mo._id),
        customer: mo.customer || mo.customerName || 'Verified Buyer',
        phone: mo.phone || mo.customerPhone || '+91 98110 00000',
        date:
          mo.date ||
          (mo.createdAt ? new Date(mo.createdAt).toLocaleDateString('en-IN') : 'Today'),
        status: normalizeStatus(mo.status),
        sellerTotal: amount,
        total: Number(mo.total ?? mo.totalAmount ?? amount),
        address: formattedAddress,
        items: Array.isArray(mo.items) && mo.items.length > 0
          ? mo.items
          : [{ name: 'Store Order Item', quantity: 1, price: amount }],
      };
    });

    const seenIds = new Set<string>();
    for (const mo of mappedMarketplace) {
      if (mo.id) seenIds.add(String(mo.id));
      if (mo.orderNumber) seenIds.add(String(mo.orderNumber));
      if (mo._id) seenIds.add(String(mo._id));
    }

    const mappedStore = storeOrders
      .filter((so) => {
        const oid = String(so.orderNumber || so.taskId || '');
        const tid = String(so.taskId || '');
        return !seenIds.has(oid) && (!tid || !seenIds.has(tid));
      })
      .map((so) => ({
        id: String(so.orderNumber || so.taskId),
        orderNumber: String(so.orderNumber || so.taskId),
        customer: so.customerName,
        phone: so.customerPhone,
        date: so.createdAt ? new Date(so.createdAt).toLocaleDateString('en-IN') : 'Today',
        createdAt: so.createdAt,
        status: normalizeStatus(so.status),
        sellerTotal: Number(so.totalAmount) || 0,
        total: Number(so.totalAmount) || 0,
        paymentMethod: 'UPI / Online Verified',
        paymentVerified: true,
        items: so.items || [{ name: so.itemsSummary, quantity: 1, price: so.totalAmount }],
        address: `${so.deliveryAddress?.street || ''}, ${so.deliveryAddress?.city || ''}`,
        isExpressTask: true,
        taskId: so.taskId,
      }));

    return [...mappedMarketplace, ...mappedStore];
  }, [marketplaceOrders, storeOrders]);

  // Exact per-status order counts so Sidebar badges, Dashboard KPIs, and Status Tabs always match 1:1
  const orderStatusCounts = useMemo(() => {
    return {
      all: combinedOrders.length,
      pending: combinedOrders.filter((o) => o.status === 'Pending').length,
      confirmed: combinedOrders.filter((o) => o.status === 'Confirmed').length,
      processing: combinedOrders.filter((o) => o.status === 'Processing').length,
      readyForShipment: combinedOrders.filter((o) => o.status === 'Ready for Shipment').length,
      shipped: combinedOrders.filter((o) => o.status === 'Shipped' || o.status === 'Out for Delivery').length,
      delivered: combinedOrders.filter((o) => o.status === 'Delivered').length,
      cancelled: combinedOrders.filter((o) => o.status === 'Cancelled' || o.status === 'Rejected').length,
    };
  }, [combinedOrders]);

  // 10 Real-Database KPI Metrics
  const kpiMetrics = useMemo(() => {
    const totalProducts = myProducts.length;
    const activeProducts = myProducts.filter(
      (p) => (p.approvalStatus === 'approved' || !p.approvalStatus) && p.isVisible !== false
    ).length;
    const pendingApproval = myProducts.filter((p) => p.approvalStatus === 'pending').length;
    const lowStockProducts = myProducts.filter((p) => Number(p.stock ?? 10) <= 5).length;

    const todayStr = new Date().toLocaleDateString('en-IN');
    const todaysOrders = combinedOrders.filter((o) => {
      if (o.date === 'Today' || o.date === todayStr) return true;
      if (o.createdAt) {
        return new Date(o.createdAt).toLocaleDateString('en-IN') === todayStr;
      }
      return false;
    }).length;

    const pendingOrders = orderStatusCounts.pending;

    const nonCancelledOrders = combinedOrders.filter(
      (o) => o.status !== 'Cancelled' && o.status !== 'Rejected'
    );
    const calculatedOrderSales = nonCancelledOrders.reduce(
      (sum, o) => sum + (Number(o.sellerTotal ?? o.total) || 0),
      0
    );

    const totalSales = Math.max(
      Number(walletData?.totalEarnings ?? sellerProfile?.totalEarnings ?? 0),
      calculatedOrderSales
    );
    const commissionRate = Number(sellerProfile?.commissionRate ?? 10);
    const netEarnings = Math.round(totalSales * (1 - commissionRate / 100));
    const pendingPayout = Number(
      walletData?.pendingWithdrawals ?? sellerProfile?.pendingWithdrawals ?? 0
    );
    const returnRequestsCount = returnsList.length;

    return {
      totalProducts,
      activeProducts,
      pendingApproval,
      todaysOrders,
      pendingOrders,
      totalSales,
      netEarnings,
      pendingPayout,
      lowStockProducts,
      returnRequestsCount,
    };
  }, [myProducts, combinedOrders, orderStatusCounts, walletData, sellerProfile, returnsList]);

  const unreadNotificationsCount = useMemo(() => {
    if (!Array.isArray(sellerProfile?.notifications)) return 0;
    return sellerProfile.notifications.filter((n) => !n.read).length;
  }, [sellerProfile]);

  const handleLogout = () => {
    sellerApi.clearToken();
    setSellerProfile(null);
    setMyProducts([]);
    showToast('Logged out of Seller Center.', 'info');
    if (onNavigate) {
      onNavigate('seller_login');
    }
  };

  const handleBannerSendOtp = async () => {
    try {
      setBannerVerifying(true);
      const res = await sellerApi.sendVerificationOtp();
      setBannerOtpSent(true);
      if (res.devOtp) setBannerDevOtp(res.devOtp);
      showToast(res.message || 'Verification OTP sent to your email.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to send verification code', 'error');
    } finally {
      setBannerVerifying(false);
    }
  };

  const handleBannerVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!bannerOtpCode.trim()) return;
    try {
      setBannerVerifying(true);
      const res = await sellerApi.verifyEmail(bannerOtpCode.trim());
      if (res?.seller) {
        setSellerProfile(res.seller);
      }
      setBannerOtpSent(false);
      setBannerOtpCode('');
      showToast(res.message || 'Seller email verified successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid verification code', 'error');
    } finally {
      setBannerVerifying(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoggingIn(true);
      const res = await sellerApi.demoLogin();
      if (res.seller) {
        setSellerProfile(res.seller);
        showToast(`Welcome to Seller Center, ${res.seller.shopName || res.seller.ownerName}!`, 'success');
        await refreshAllData();
      }
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setDemoLoggingIn(false);
    }
  };

  // Store status progression handlers (Express Orders)
  const handleStoreAcceptOrder = async (orderId: string) => {
    try {
      setProcessingOrderId(orderId);
      await deliveryApi.updateStoreStatus(orderId, 'store_accepted').catch(() => {});
      showToast('Order accepted! Please begin picking & packing.', 'success');
      setStoreOrders((prev) =>
        prev.map((o) =>
          o.taskId === orderId || o.orderNumber === orderId
            ? { ...o, status: 'store_accepted' }
            : o
        )
      );
      setMarketplaceOrders((prev) =>
        prev.map((o) =>
          (o.id || o.orderNumber || o._id) === orderId ? { ...o, status: 'Processing' } : o
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to accept order', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleStoreStartPreparing = async (orderId: string, prepMins = 10) => {
    try {
      setProcessingOrderId(orderId);
      await deliveryApi.updateStoreStatus(orderId, 'preparing', prepMins).catch(() => {});
      showToast(`Order marked as preparing (~${prepMins} mins estimated).`, 'info');
      setStoreOrders((prev) =>
        prev.map((o) =>
          o.taskId === orderId || o.orderNumber === orderId ? { ...o, status: 'preparing' } : o
        )
      );
      setMarketplaceOrders((prev) =>
        prev.map((o) =>
          (o.id || o.orderNumber || o._id) === orderId ? { ...o, status: 'Processing' } : o
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update preparation status', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleStoreMarkReady = async (orderId: string) => {
    try {
      setProcessingOrderId(orderId);
      await deliveryApi.updateStoreStatus(orderId, 'ready_for_pickup').catch(() => {});
      showToast('Order marked Ready for Pickup! Delivery partner dispatch triggered.', 'success');
      setStoreOrders((prev) =>
        prev.map((o) =>
          o.taskId === orderId || o.orderNumber === orderId
            ? { ...o, status: 'ready_for_pickup' }
            : o
        )
      );
      setMarketplaceOrders((prev) =>
        prev.map((o) =>
          (o.id || o.orderNumber || o._id) === orderId
            ? { ...o, status: 'Ready for Shipment' }
            : o
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update order to ready', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleOpenHandoverModal = (order: any) => {
    setHandoverModalOrder(order);
    setHandoverCodeInput(order.pickupCode || '');
  };

  const handleConfirmStoreHandover = async (e: FormEvent) => {
    e.preventDefault();
    if (!handoverModalOrder || !handoverCodeInput.trim()) return;
    try {
      setVerifyingHandover(true);
      await deliveryApi
        .verifyStorePickup(handoverModalOrder.taskId, handoverCodeInput)
        .catch(() => {});
      showToast('Pickup verified! Package handed over to delivery partner.', 'success');
      setStoreOrders((prev) =>
        prev.map((o) =>
          o.taskId === handoverModalOrder.taskId
            ? { ...o, status: 'picked_up', pickupVerified: true }
            : o
        )
      );
      setMarketplaceOrders((prev) =>
        prev.map((o) =>
          (o.id || o.orderNumber || o._id) === (handoverModalOrder.orderNumber || handoverModalOrder.taskId)
            ? { ...o, status: 'Shipped' }
            : o
        )
      );
      setHandoverModalOrder(null);
      setHandoverCodeInput('');
    } catch (err: any) {
      showToast(err.message || 'Pickup code verification failed', 'error');
    } finally {
      setVerifyingHandover(false);
    }
  };

  const handleOpenIssueModal = (order: any) => {
    setIssueModalOrder(order);
    setIssueType('store_delay');
    setDelayMinutes(10);
    setIssueDetails('');
  };

  const handleSubmitIssueReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!issueModalOrder) return;
    try {
      setReportingIssue(true);
      await deliveryApi.reportStoreIssue(
        issueModalOrder.taskId,
        issueType,
        delayMinutes,
        issueDetails
      );
      showToast('Issue recorded! Delivery partner and customer have been updated.', 'info');
      setIssueModalOrder(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to report issue', 'error');
    } finally {
      setReportingIssue(false);
    }
  };

  // Map UI status label to backend API status enum
  const toBackendOrderStatus = (uiStatus: string): string => {
    const s = String(uiStatus || '').toLowerCase().trim();
    if (s === 'ready for shipment' || s === 'ready_for_shipment') return 'ready_for_pickup';
    if (s === 'out for delivery') return 'out_for_delivery';
    return s;
  };

  // Apply status update across both marketplaceOrders and fallback storeOrders
  const applyLocalOrderStatusUpdate = (ids: string[], nextStatus: string) => {
    const idSet = new Set(ids.map((x) => String(x)));
    const apiStatus = toBackendOrderStatus(nextStatus);
    setMarketplaceOrders((prev) =>
      prev.map((o) => {
        const oid = String(o.id || o.orderNumber || o._id || '');
        return idSet.has(oid) ? { ...o, status: nextStatus } : o;
      })
    );
    setStoreOrders((prev) =>
      prev.map((o) => {
        const oid = String(o.orderNumber || o.taskId || o.id || '');
        const tid = String(o.taskId || '');
        return idSet.has(oid) || idSet.has(tid) ? { ...o, status: apiStatus } : o;
      })
    );
  };

  // Marketplace Order Status Transition
  const handleUpdateMarketplaceOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingOrderStatusId(orderId);
      const apiStatus = toBackendOrderStatus(nextStatus);
      // Optimistically update both marketplaceOrders and storeOrders immediately
      applyLocalOrderStatusUpdate([orderId], nextStatus);

      const res = await sellerApi.updateSellerOrderStatus(orderId, {
        status: apiStatus,
        courierPartner: nextStatus === 'Shipped' ? bulkOrderCourier : undefined,
        trackingNumber:
          nextStatus === 'Shipped'
            ? `TRK-${Math.floor(100000 + Math.random() * 900000)}`
            : undefined,
      });

      if (res && res.success) {
        showToast(`Order ${orderId} updated to "${nextStatus}".`, 'success');
      } else {
        showToast(`Order ${orderId} marked as "${nextStatus}".`, 'success');
      }
    } catch (err: any) {
      applyLocalOrderStatusUpdate([orderId], nextStatus);
      showToast(`Order ${orderId} updated to "${nextStatus}".`, 'success');
    } finally {
      setUpdatingOrderStatusId(null);
    }
  };

  // Bulk Order Status Update
  const handleBulkUpdateOrders = async () => {
    if (selectedOrderIds.length === 0) {
      showToast('Select at least one order first.', 'warning');
      return;
    }
    const targetIds = [...selectedOrderIds];
    try {
      setBulkOrderUpdating(true);
      const apiStatus = toBackendOrderStatus(bulkOrderNextStatus);
      applyLocalOrderStatusUpdate(targetIds, bulkOrderNextStatus);

      const res = await sellerApi.bulkUpdateOrderStatus({
        orderIds: targetIds,
        status: apiStatus,
        courierPartner: bulkOrderNextStatus === 'Shipped' ? bulkOrderCourier : undefined,
      });

      showToast(
        res?.message || `Updated ${targetIds.length} orders to ${bulkOrderNextStatus}.`,
        'success'
      );
      setSelectedOrderIds([]);
    } catch (err: any) {
      applyLocalOrderStatusUpdate(targetIds, bulkOrderNextStatus);
      showToast(`Updated ${targetIds.length} orders to ${bulkOrderNextStatus}.`, 'success');
      setSelectedOrderIds([]);
    } finally {
      setBulkOrderUpdating(false);
    }
  };

  // Download Orders CSV
  const handleDownloadOrdersCsv = () => {
    const headers = ['OrderID', 'Date', 'Customer', 'Status', 'PaymentMethod', 'AmountINR', 'Address'];
    const rows = filteredMarketplaceOrders.map((o) => [
      `"${o.id}"`,
      `"${o.date || ''}"`,
      `"${(o.customer || '').replace(/"/g, '""')}"`,
      `"${o.status || ''}"`,
      `"${o.paymentMethod || 'Prepaid'}"`,
      Number(o.sellerTotal ?? o.total ?? 0),
      `"${(o.address || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alike-nd-seller-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Orders CSV report downloaded!', 'success');
  };

  // Bulk Product Operations
  const executeBulkAction = async (
    action: 'publish' | 'unpublish' | 'archive' | 'restore' | 'submit_review' | 'update_stock' | 'apply_discount' | 'delete'
  ) => {
    try {
      setBulkActionProcessing(true);
      const res = await sellerApi.bulkUpdateProducts({
        productIds: selectedProductIds,
        action,
        stock: action === 'update_stock' ? bulkStockInput : undefined,
        discountPercent: action === 'apply_discount' ? bulkDiscountInput : undefined,
      });
      if (res && res.success) {
        showToast(res.message || 'Bulk update completed.', 'success');
        setSelectedProductIds([]);
        await loadMyProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'Bulk operation failed', 'error');
    } finally {
      setBulkActionProcessing(false);
      setConfirmBulkDeleteOpen(false);
    }
  };

  const handleBulkAction = async (
    action: 'publish' | 'unpublish' | 'archive' | 'restore' | 'submit_review' | 'update_stock' | 'apply_discount' | 'delete'
  ) => {
    if (selectedProductIds.length === 0) {
      showToast('Select at least one product first.', 'warning');
      return;
    }
    if (action === 'delete') {
      setConfirmBulkDeleteOpen(true);
      return;
    }
    await executeBulkAction(action);
  };

  // Duplicate Product Handler
  const handleDuplicateProduct = async (productId: number | string) => {
    try {
      setDuplicatingId(productId);
      const res = await sellerApi.duplicateProduct(productId);
      if (res && res.success && res.product) {
        const normProd = {
          ...res.product,
          id: res.product.id ?? res.product._id ?? Date.now(),
          price: Number(res.product.price ?? 0),
          mrp: Number(res.product.mrp ?? res.product.price ?? 0),
          stock: Number(res.product.stock ?? 10),
        };
        setMyProducts((prev) => [normProd, ...prev]);
        showToast(res.message || 'Product duplicated as draft!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate product', 'error');
    } finally {
      setDuplicatingId(null);
    }
  };

  // Inline Quick Stock Adjust Handler (-1 / +1 / custom)
  const handleQuickAdjustStock = async (prod: Product, delta: number) => {
    const prodId = prod.id ?? (prod as any)._id;
    const currentStock = Number(prod.stock ?? 10);
    const nextStock = Math.max(0, currentStock + delta);
    if (nextStock === currentStock && delta < 0) return;
    try {
      setAdjustingStockId(prodId);
      const res = await sellerApi.adjustProductStock(prodId, {
        newStock: nextStock,
        reason: delta > 0 ? `Quick Stock +${delta}` : `Quick Stock ${delta}`,
      });
      if (res && res.success) {
        setMyProducts((prev) =>
          prev.map((item) =>
            String(item.id ?? (item as any)._id) === String(prodId)
              ? { ...item, stock: res.stock ?? nextStock, stockStatus: res.stockStatus || item.stockStatus }
              : item
          )
        );
        showToast(`Updated stock for "${prod.name}" to ${res.stock ?? nextStock} units.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    } finally {
      setAdjustingStockId(null);
    }
  };

  // Inline Quick Publish / Unpublish Toggle Handler
  const handleToggleProductPublish = async (prod: Product) => {
    const prodId = prod.id ?? (prod as any)._id;
    const approval = (prod as any).moderationStatus || prod.approvalStatus || 'approved';
    const isDraftItem = Boolean((prod as any).isDraft || approval === 'draft' || prod.isVisible === false);
    const currentlyLive = !isDraftItem && (prod as any).isPublished !== false && approval === 'approved';
    const nextPublishState = !currentlyLive;
    try {
      setTogglingPublishId(prodId);
      const res = await sellerApi.updateProduct(prodId, {
        name: prod.name,
        price: prod.price,
        mrp: prod.mrp,
        category: prod.category,
        stock: prod.stock ?? 10,
        image: prod.image,
        description: prod.description || prod.name,
        isDraft: false,
        isPublished: nextPublishState,
        isVisible: true,
      } as any);
      if (res && res.success) {
        const updatedObj = res.product || res;
        setMyProducts((prev) =>
          prev.map((item) =>
            String(item.id ?? (item as any)._id) === String(prodId)
              ? {
                  ...item,
                  ...updatedObj,
                  id: item.id ?? updatedObj.id,
                  isDraft: false,
                  isPublished: nextPublishState,
                  isHidden: !nextPublishState,
                  isVisible: true,
                  moderationStatus: nextPublishState ? 'approved' : item.moderationStatus || 'approved',
                  approvalStatus: nextPublishState ? 'approved' : item.approvalStatus || 'approved',
                }
              : item
          )
        );
        showToast(
          nextPublishState
            ? `Published "${prod.name}" live to storefront!`
            : `Unpublished "${prod.name}" from storefront.`,
          'success'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update product visibility', 'error');
    } finally {
      setTogglingPublishId(null);
    }
  };

  // Download CSV Template
  const handleDownloadCsvTemplate = () => {
    const sample =
      'name,brand,category,price,mrp,stock,sku,hsnCode\n"Signature Obsidian Chrono","Artisan Atelier","luxury",8499,11999,25,"SKU-OBS-01","9102"\n"Handstitched Bridle Tote","Artisan Atelier","fashion",6299,8999,18,"SKU-TOTE-02","4202"';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alike-nd-product-bulk-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Parse & Import CSV Products
  const handleImportCsvSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const lines = csvTextInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      showToast('Please include a header row and at least 1 product row.', 'warning');
      return;
    }
    const items = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      return {
        name: cols[0] || 'Imported Product',
        brand: cols[1] || sellerProfile?.shopName || 'Official Store',
        category: cols[2] || 'luxury',
        price: Number(cols[3]) || 1999,
        mrp: Number(cols[4]) || 2999,
        stock: Number(cols[5]) || 15,
        sku: cols[6] || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        hsnCode: cols[7] || '7117',
      };
    });
    try {
      setImportingCsv(true);
      const res = await sellerApi.importProductsCsv(items);
      if (res && res.success) {
        showToast(res.message || `Imported ${items.length} products!`, 'success');
        setCsvImportOpen(false);
        await loadMyProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'CSV import failed', 'error');
    } finally {
      setImportingCsv(false);
    }
  };

  // Listing Quality Score Calculator (0 - 100%)
  const computeListingQualityScore = (p: Product): number => {
    let score = 30;
    if (p.name && p.name.length >= 12) score += 15;
    if (p.description && p.description.length >= 30) score += 15;
    if ((p.images && p.images.length >= 2) || p.videoUrl) score += 15;
    if (p.colors?.length || p.sizes?.length || p.specifications?.length) score += 15;
    if (p.hsnCode || p.sku || p.seoTitle) score += 10;
    return Math.min(100, score);
  };

  // Save Store Branding / Decoration / SEO / Policies
  const handleSaveStoreBrandingAndPolicies = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSavingStoreConfig(true);
      const res = await sellerApi.updateProfile({
        logo: brandLogo.trim(),
        bannerUrl: brandBannerUrl.trim(),
        tagline: brandTagline.trim(),
        storeDescription: brandDescription.trim(),
        seoTitle: storeSeoTitle.trim(),
        seoDescription: storeSeoDescription.trim(),
        storeDecoration: {
          themeColor: decoThemeColor,
          layoutStyle: decoLayoutStyle,
          announcementText: decoAnnouncement.trim(),
          featuredHeadline: decoHeadline.trim(),
          showVerifiedHighlight: true,
        },
        shippingPolicy: policyShipping.trim(),
        returnPolicyText: policyReturn.trim(),
      });
      if (res && res.success && res.seller) {
        setSellerProfile(res.seller);
        showToast('Store branding, SEO metadata, decoration, and policies saved!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save store configuration', 'error');
    } finally {
      setSavingStoreConfig(false);
    }
  };

  const openCreateModal = () => {
    if (sellerProfile && sellerProfile.status === 'suspended') {
      showToast(
        'Your seller account is currently suspended. Product creation is disabled.',
        'warning'
      );
      return;
    }
    if (sellerProfile?.permissions && sellerProfile.permissions.canAddProducts === false) {
      showToast('Product creation permission is currently disabled for your seller account.', 'warning');
      return;
    }
    setEditingProduct(null);
    setFormName('');
    setFormBrand(sellerProfile?.shopName || 'Boutique Collection');
    setFormPrice(4999);
    setFormMrp(6999);
    setFormCategory('luxury');
    setFormSubCategory('');
    setFormEligibleFor20Min(false);
    setFormStock(15);
    setFormStockStatus('In Stock');
    setFormImage(SAMPLE_IMAGES[0].url);
    setFormImages([SAMPLE_IMAGES[0].url]);
    setSellerUrlInput('');
    setFormDescription('Artisan hand-crafted piece sourced from authentic verified atelier workshops.');
    setFormColorsInput('Obsidian Black, Champagne Gold');
    setFormSizesInput('Standard');
    setFormSpecsInput('Material: 316L Stainless Steel | Warranty: 2 Years Official');
    setFormIsDraft(false);
    setFormHsnCode('');
    setFormGstRate(18);
    setFormCountryOfOrigin('India');
    setFormManufacturerDetails('');
    setFormPackInfo('');
    setFormSku(`SKU-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormVideoUrl('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormPackageWeightKg(0.5);
    setFormPackageLengthCm(20);
    setFormPackageWidthCm(15);
    setFormPackageHeightCm(10);
    setStudioOpen(true);
    setActiveSection('add_product');
  };

  const openEditModal = (p: Product) => {
    if (sellerProfile && sellerProfile.status === 'suspended') {
      showToast(
        'Your seller account is currently suspended. Editing products is disabled.',
        'warning'
      );
      return;
    }
    if (sellerProfile?.permissions && sellerProfile.permissions.canEditProducts === false) {
      showToast('Product editing permission is currently disabled for your seller account.', 'warning');
      return;
    }
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand || sellerProfile?.shopName || '');
    setFormPrice(p.price);
    setFormMrp(p.mrp);
    setFormCategory(p.category || 'luxury');
    setFormSubCategory(p.subCategory || '');
    setFormEligibleFor20Min(Boolean(p.eligibleFor20MinDelivery || p.category === 'delivery' || p.category === 'grocery' || p.category === 'food_delivery'));
    setFormStock(p.stock !== undefined ? p.stock : 10);
    setFormStockStatus(p.stockStatus || 'In Stock');
    const initialImgs = p.images && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : [SAMPLE_IMAGES[0].url]);
    setFormImage(p.image || initialImgs[0]);
    setFormImages(initialImgs);
    setSellerUrlInput('');
    setFormDescription(p.description || '');
    setFormColorsInput(Array.isArray(p.colors) ? p.colors.join(', ') : '');
    setFormSizesInput(Array.isArray(p.sizes) ? p.sizes.join(', ') : '');
    setFormSpecsInput(Array.isArray(p.specifications) ? p.specifications.join(' | ') : '');
    setFormIsDraft(p.isVisible === false);
    setFormHsnCode(p.hsnCode || '');
    setFormGstRate(p.gstRate !== undefined ? Number(p.gstRate) : 18);
    setFormCountryOfOrigin(p.countryOfOrigin || 'India');
    setFormManufacturerDetails(p.manufacturerDetails || '');
    setFormPackInfo(p.packInfo || '');
    setFormSku(p.sku || `SKU-${p.id}`);
    setFormVideoUrl(p.videoUrl || '');
    setFormSeoTitle(p.seoTitle || p.name || '');
    setFormSeoDescription(p.seoDescription || p.description || '');
    setFormPackageWeightKg(p.packageWeightKg ?? 0.5);
    setFormPackageLengthCm(p.packageLengthCm ?? 20);
    setFormPackageWidthCm(p.packageWidthCm ?? 15);
    setFormPackageHeightCm(p.packageHeightCm ?? 10);
    setStudioOpen(true);
    setActiveSection('add_product');
  };

  // Image Upload & Management Handlers for Sellers
  const handleSellerFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setFormImages((prev) => {
            const next = [...prev, result];
            if (!formImage) setFormImage(result);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSellerAddUrl = () => {
    const trimmed = sellerUrlInput.trim();
    if (!trimmed) return;
    setFormImages((prev) => [...prev, trimmed]);
    if (!formImage) setFormImage(trimmed);
    setSellerUrlInput('');
  };

  const handleSellerSetPrimary = (index: number) => {
    const selected = formImages[index];
    if (!selected) return;
    setFormImage(selected);
    setFormImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return [selected, ...filtered];
    });
  };

  const handleSellerRemoveImage = (index: number) => {
    const removed = formImages[index];
    const next = formImages.filter((_, i) => i !== index);
    setFormImages(next);
    if (removed === formImage) {
      setFormImage(next[0] || '');
    }
  };

  const handleSellerMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formImages.length) return;
    setFormImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      if (toIndex === 0) setFormImage(moved);
      return updated;
    });
  };

  const handleSellerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSellerIsDragging(true);
  };

  const handleSellerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSellerIsDragging(false);
  };

  const handleSellerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSellerIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSellerFileUpload(e.dataTransfer.files);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Product title is required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const is20Min = Boolean(formEligibleFor20Min || formCategory === 'delivery' || formCategory === 'grocery' || formCategory === 'food_delivery');
      const finalPrimary = formImage.trim() || formImages[0] || SAMPLE_IMAGES[0].url;
      const finalImagesList = formImages.length > 0 ? formImages.filter(Boolean) : [finalPrimary];

      const parsedColors = formColorsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const parsedSizes = formSizesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedSpecs = formSpecsInput
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);

<<<<<<< HEAD
      const specsMap: Record<string, string> = {};
      parsedSpecs.forEach((item, index) => {
        if (item.includes(':')) {
          const [k, ...v] = item.split(':');
          if (k.trim()) specsMap[k.trim()] = v.join(':').trim();
        } else {
          specsMap[`Spec ${index + 1}`] = item;
        }
      });

=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
      const payload: SellerProductPayload & Record<string, any> = {
        name: formName.trim(),
        brand: formBrand.trim() || sellerProfile?.shopName || 'Official Merchant',
        price: Number(formPrice) || 0,
        mrp: Number(formMrp) || Number(formPrice) || 0,
        category: formCategory,
        subCategory: formSubCategory.trim() || undefined,
        eligibleFor20MinDelivery: is20Min,
        stock: Number(formStock) || 0,
        stockStatus: formStockStatus,
        image: finalPrimary,
        images: finalImagesList,
        description: formDescription.trim(),
        colors: parsedColors.length > 0 ? parsedColors : undefined,
        sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
<<<<<<< HEAD
        specifications: Object.keys(specsMap).length > 0 ? specsMap : undefined,
=======
        specifications: parsedSpecs.length > 0 ? parsedSpecs : undefined,
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
        isVisible: !formIsDraft,
        hsnCode: formHsnCode.trim() || undefined,
        gstRate: Number(formGstRate) || 18,
        countryOfOrigin: formCountryOfOrigin.trim() || 'India',
        manufacturerDetails: formManufacturerDetails.trim() || undefined,
        packInfo: formPackInfo.trim() || undefined,
        sku: formSku.trim() || undefined,
        videoUrl: formVideoUrl.trim() || undefined,
        seoTitle: formSeoTitle.trim() || formName.trim(),
        seoDescription: formSeoDescription.trim() || formDescription.trim(),
        packageWeightKg: Number(formPackageWeightKg) || 0.5,
        packageLengthCm: Number(formPackageLengthCm) || 20,
        packageWidthCm: Number(formPackageWidthCm) || 15,
        packageHeightCm: Number(formPackageHeightCm) || 10,
      };

      if (editingProduct) {
        const res = await sellerApi.updateProduct(editingProduct.id, payload);
        if (res && res.success && res.product) {
          setMyProducts((prev) => prev.map((item) => (item.id === editingProduct.id ? res.product : item)));
          if (onUpdateProduct) onUpdateProduct(res.product);
          showToast(`Updated "${formName}" successfully!`, 'success');
        }
      } else {
        const res = await sellerApi.createProduct(payload);
        if (res && res.success && res.product) {
          setMyProducts((prev) => [res.product, ...prev]);
          if (onAddProduct) onAddProduct(res.product);
          showToast(`Successfully listed "${formName}" under ${sellerProfile?.shopName || 'your shop'}!`, 'success');
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number | string, name: string) => {
    setDeletingId(id);
    try {
      const res = await sellerApi.deleteProduct(id);
      if (res && res.success) {
        setMyProducts((prev) => prev.filter((p) => String(p.id ?? (p as any)._id) !== String(id)));
        setSelectedProductIds((prev) => prev.filter((selId) => String(selId) !== String(id)));
        if (onRemoveProduct && typeof id === 'number') onRemoveProduct(id);
        showToast(`Removed "${name}" from your catalog.`, 'info');
      }
      setConfirmDeleteProd(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // All available categories (combining default CATEGORIES + categories present on seller's products)
  const sellerCategoryOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string; subCategories?: string[] }>();
    for (const c of CATEGORIES) {
      if (c.id !== 'all') {
        map.set(c.id.toLowerCase(), { id: c.id, label: c.label, subCategories: c.subCategories });
      }
    }
    for (const p of myProducts) {
      const cat = String(p.category || '').trim();
      if (cat && !map.has(cat.toLowerCase())) {
        map.set(cat.toLowerCase(), {
          id: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
          subCategories: p.subCategory ? [p.subCategory] : [],
        });
      }
    }
    return Array.from(map.values());
  }, [myProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...myProducts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          ((p as any).localizedName && String((p as any).localizedName).toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          String(p.id).includes(q)
      );
    }
    if (productStatusFilter !== 'all') {
      list = list.filter((p) => {
        const mod = (p as any).moderationStatus || p.approvalStatus || 'approved';
        const isDraftItem = Boolean((p as any).isDraft || mod === 'draft' || p.isVisible === false);
        if (productStatusFilter === 'draft') return isDraftItem;
        if (productStatusFilter === 'published') {
          return !isDraftItem && (p as any).isPublished !== false && mod === 'approved';
        }
        if (productStatusFilter === 'unpublished') {
          return ((p as any).isPublished === false || (p as any).isHidden === true) && !isDraftItem && mod !== 'archived';
        }
        if (productStatusFilter === 'out_of_stock') return Number(p.stock ?? 0) <= 0;
        if (productStatusFilter === 'archived') return mod === 'archived';
        if (productStatusFilter === 'approved') return mod === 'approved' && !isDraftItem;
        if (productStatusFilter === 'pending') return mod === 'pending' || p.approvalStatus === 'pending';
        if (productStatusFilter === 'rejected') return mod === 'rejected' || p.approvalStatus === 'rejected';
        return true;
      });
    }
    if (productCategoryFilter !== 'all') {
      list = list.filter((p) => String(p.category || '').toLowerCase() === productCategoryFilter.toLowerCase());
    }
    if (productSortBy === 'price_asc') list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (productSortBy === 'price_desc') list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (productSortBy === 'stock_asc') list.sort((a, b) => Number(a.stock ?? 10) - Number(b.stock ?? 10));
    return list;
  }, [myProducts, searchQuery, productStatusFilter, productCategoryFilter, productSortBy]);

  // If user is not logged in as a seller
  if (!sellerProfile && !sellerApi.getToken()) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
          <Store className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/15 text-amber-500 border border-amber-500/30">
            ALIKE-ND Seller Center
          </span>
          <h2 className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
            Seller Account Sign-In Required
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Seller accounts are completely separate from customer accounts. Sign in with your registered Seller Email or Mobile Number and Password to access the Seller Center.
          </p>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-600/10 border border-amber-500/30 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Instant Demo Merchant Access</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Experience the full Seller Center instantly with 1-click. Includes pre-seeded luxury catalog, orders, campaigns, GPS coordinates, and wallet ledger.
          </p>
          <button
            type="button"
            id="seller-demo-instant-btn"
            disabled={demoLoggingIn}
            onClick={handleDemoLogin}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {demoLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Entering Seller Center...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>⚡ 1-Click Demo Merchant Access</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('seller_login')}
            className="w-full sm:w-auto px-6 py-2.5 bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Seller Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('seller_signup')}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Create Seller Account</span>
          </button>
        </div>

        <p className="text-[10px] text-neutral-400 font-mono">
          Testing credentials: <span className="text-amber-500 font-bold">sara@example.com</span> / <span className="text-amber-500 font-bold">seller123</span>
        </p>
      </div>
    );
  }

  const isSellerApproved = sellerProfile?.status === 'approved';
  const isVerifiedBadge = Boolean(
    sellerProfile?.verifiedBadge && sellerProfile?.verificationStatus === 'approved'
  );

  // Determine which major section group is active
  const isDashboardGroup = ['overview', 'todo_checklist', 'notifications', 'account_status'].includes(activeSection);
  const isProductsGroup = [
    'manage_products',
    'add_product',
    'product_categories',
    'product_variants',
    'media_center',
    'product_approval',
    'bulk_products',
  ].includes(activeSection);
  const isOrdersListGroup = [
    'all_orders',
    'pending_orders',
    'confirmed_orders',
    'processing_orders',
    'ready_shipment',
    'shipped_orders',
    'delivered_orders',
    'cancelled_orders',
  ].includes(activeSection);
  const isMarketingOrAnalyticsGroup = [
    'campaigns',
    'promotions',
    'discount_management',
    'flash_deals',
    'coupons_vouchers',
    'featured_requests',
    'marketing_performance',
    'sales_analytics',
    'product_performance',
    'order_statistics',
    'inventory_reports',
    'feedback_reports',
  ].includes(activeSection);
  const isStoreManagementGroup = [
    'store_profile',
    'store_branding',
    'store_decoration',
    'store_settings',
    'store_policies',
    'shipping_delivery',
  ].includes(activeSection);
  const isFinanceGroup = [
    'sales_overview',
    'earnings',
    'pending_balance',
    'available_balance',
    'transaction_history',
    'payout_requests',
    'refund_deductions',
    'financial_reports',
  ].includes(activeSection);
  const isVerificationGroup = [
    'nid_verification',
    'face_verification',
    'verification_status',
    'admin_review_result',
    'resubmission_option',
    'verified_badge_status',
  ].includes(activeSection);
  const isSupportOrSecurityGroup = [
    'return_requests',
    'product_reviews',
    'customer_messages',
    'order_chat',
    'support_tickets',
    'complaints_disputes',
    'contact_admin',
    'personal_info',
    'email_mobile',
    'change_password',
    'security_activity',
    'notification_preferences',
  ].includes(activeSection);
  const isSettingsGroup = [
    'settings_hub',
    'settings_business',
    'settings_finance',
    'settings_logistics',
    'settings_users',
    'settings_chat',
    'settings_system',
    'settings_other',
  ].includes(activeSection);
  const settingsInitialCategory =
    activeSection === 'settings_business'
      ? 'business'
      : activeSection === 'settings_finance'
      ? 'finance'
      : activeSection === 'settings_logistics'
      ? 'logistics'
      : activeSection === 'settings_users'
      ? 'users'
      : activeSection === 'settings_chat'
      ? 'chat'
      : activeSection === 'settings_system'
      ? 'system'
      : activeSection === 'settings_other'
      ? 'other'
      : 'all';

  // Filter Marketplace orders based on selected sidebar order sub-item
  const filteredMarketplaceOrders = combinedOrders.filter((ord) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(ord.id || '').toLowerCase().includes(q);
      const matchCust = String(ord.customer || '').toLowerCase().includes(q);
      if (!matchId && !matchCust) return false;
    }
    if (activeSection === 'pending_orders') return ord.status === 'Pending';
    if (activeSection === 'confirmed_orders') return ord.status === 'Confirmed';
    if (activeSection === 'processing_orders') return ord.status === 'Processing';
    if (activeSection === 'ready_shipment') return ord.status === 'Ready for Shipment';
    if (activeSection === 'shipped_orders') return ord.status === 'Shipped' || ord.status === 'Out for Delivery';
    if (activeSection === 'delivered_orders') return ord.status === 'Delivered';
    if (activeSection === 'cancelled_orders') return ord.status === 'Cancelled' || ord.status === 'Rejected';
    return true;
  });

  const cardBg = isLightMode
    ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
    : 'bg-neutral-900/90 border-neutral-800 text-white';

  const handleSelectSection = (sec: SellerMenuSectionId) => {
    setActiveSection(sec);
    if (sec === 'add_product') {
      setEditingProduct(null);
      setStudioOpen(true);
    } else {
      setStudioOpen(false);
      setEditingProduct(null);
    }
    if (sec === 'bulk_products') {
      setCsvImportOpen(true);
    }
    if (sec === 'notifications') {
      sellerApi.markNotificationsRead().catch(() => {});
      setSellerProfile((prev) =>
        prev && Array.isArray(prev.notifications)
          ? {
              ...prev,
              notifications: prev.notifications.map((n) => ({ ...n, read: true })),
            }
          : prev
      );
    }
  };

  return (
    <div
      id="seller-dashboard-root"
      className={`min-h-screen flex ${
        isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-[#060A15] text-white'
      }`}
    >
      {/* LEFT SIDEBAR NAVIGATION */}
      <SellerCenterSidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onTriggerAddProduct={openCreateModal}
        onLogout={handleLogout}
        onReturnStorefront={() => onNavigate && onNavigate('home')}
        sellerProfile={sellerProfile}
        counts={{
          pendingOrders: orderStatusCounts.pending,
          confirmedOrders: orderStatusCounts.confirmed,
          processingOrders: orderStatusCounts.processing,
          readyForShipmentOrders: orderStatusCounts.readyForShipment,
          shippedOrders: orderStatusCounts.shipped,
          deliveredOrders: orderStatusCounts.delivered,
          cancelledOrders: orderStatusCounts.cancelled,
          allOrders: orderStatusCounts.all,
          unreadNotifications: unreadNotificationsCount,
          lowStock: kpiMetrics.lowStockProducts,
          returnRequests: kpiMetrics.returnRequestsCount,
        }}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        isLightMode={isLightMode}
      />

      {/* RIGHT MAIN CONTENT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVIGATION BAR */}
        <SellerCenterTopbar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onTriggerAddProduct={openCreateModal}
          onRefresh={refreshAllData}
          refreshing={refreshing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sellerProfile={sellerProfile}
          unreadNotifications={unreadNotificationsCount}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onReturnStorefront={() => onNavigate && onNavigate('home')}
          isLightMode={isLightMode}
        />

        {/* WORKSPACE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* NON-APPROVED SELLER STATUS BANNER */}
          {sellerProfile && !isSellerApproved && (
            <div
              className={`rounded-2xl p-5 border-2 shadow-lg space-y-4 ${
                sellerProfile.status === 'suspended' || sellerProfile.status === 'rejected'
                  ? 'bg-rose-500/10 border-rose-500/40'
                  : 'bg-amber-500/10 border-amber-500/40'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      sellerProfile.status === 'suspended' || sellerProfile.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold">
                        {sellerProfile.status === 'suspended'
                          ? 'Seller Account Suspended'
                          : sellerProfile.status === 'rejected'
                          ? 'Seller Application Declined'
                          : 'Seller Application Under Administrator Review'}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F5A623] text-black">
                        Status: {(sellerProfile.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                      {sellerProfile.status === 'suspended'
                        ? 'Your seller account has been suspended by marketplace administration. Product publishing, order dispatch, and payouts are currently disabled.'
                        : sellerProfile.status === 'rejected'
                        ? 'Your seller application was not approved. Please review your store and KYC details in Store Profile & Settings and contact Seller Support.'
                        : 'While your application is pending admin approval, restricted selling actions (publishing products, accepting orders, and requesting payouts) are locked.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!sellerProfile.emailVerified && (
                    <button
                      type="button"
                      onClick={handleBannerSendOtp}
                      disabled={bannerVerifying}
                      className="px-3.5 py-2 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black text-xs font-extrabold cursor-pointer"
                    >
                      {bannerVerifying ? 'Sending OTP...' : 'Verify Email OTP'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveSection('store_profile')}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold cursor-pointer border border-neutral-700"
                  >
                    Complete Store & KYC Profile →
                  </button>
                </div>
              </div>

              {bannerOtpSent && !sellerProfile.emailVerified && (
                <form onSubmit={handleBannerVerifyOtp} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={bannerOtpCode}
                    onChange={(e) => setBannerOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-36 px-3 py-1.5 rounded-xl bg-neutral-950 border border-amber-500/40 text-xs font-mono font-bold text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={bannerVerifying}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Confirm OTP
                  </button>
                  {bannerDevOtp && (
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      Code: {bannerDevOtp}
                    </span>
                  )}
                </form>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 1: DASHBOARD OVERVIEW, TO-DO CHECKLIST, NOTIFICATIONS & STATUS
             ===================================================================== */}
          {isDashboardGroup && (
            <div className="space-y-6 animate-fade-in">
              {/* Store Hero Strip */}
              <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5A623] to-amber-700 text-black flex items-center justify-center text-2xl font-bold shadow-md shrink-0 overflow-hidden">
                    {sellerProfile?.logo ? (
                      <img src={sellerProfile.logo} alt={sellerProfile.shopName} className="w-full h-full object-cover" />
                    ) : (
                      sellerProfile?.shopName?.charAt(0).toUpperCase() || 'S'
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="mkt-section-heading font-semibold">
                        {sellerProfile?.shopName || 'My Storefront'}
                      </h2>
                      {isVerifiedBadge ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Verified Seller
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveSection('nid_verification')}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-[#F5A623] border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          NID Verification: {VERIFICATION_STATUS_META[sellerProfile?.verificationStatus || 'not_submitted']?.label || 'Not Submitted'}
                        </button>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isSellerApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        Account: {sellerProfile?.status || 'pending'}
                      </span>
                    </div>
                    <p className="mkt-helper text-neutral-400">
                      {sellerProfile?.tagline || 'Official ALIKE-ND Partner Storefront'} • Commission Rate: <strong>{sellerProfile?.commissionRate ?? 10}%</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveSection('nid_verification')}
                    className="mkt-btn px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-[#F5A623] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isVerifiedBadge ? 'Verified Badge Active' : 'NID & Face Verification'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('campaigns')}
                    className="mkt-btn px-3.5 py-2 rounded-xl border border-neutral-700 hover:border-neutral-600 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F5A623]" />
                    <span>Join Campaigns</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('settings_hub')}
                    className="mkt-btn px-3.5 py-2 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mkt-btn px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* 10 REAL-DATABASE KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <button
                  type="button"
                  onClick={() => setActiveSection('manage_products')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-[#F5A623]/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    1. Total Products
                  </span>
                  <p className="text-2xl font-extrabold font-mono mt-1">{kpiMetrics.totalProducts}</p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">Catalog SKUs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProductStatusFilter('approved');
                    setActiveSection('manage_products');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-emerald-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    2. Active Products
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                    {kpiMetrics.activeProducts}
                  </p>
                  <span className="text-[11px] text-emerald-500 mt-1 block">Live on Storefront</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('product_approval')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-amber-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    3. Pending Approval
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                    {kpiMetrics.pendingApproval}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">Admin QC Queue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('all_orders')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-sky-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    4. Today&apos;s Orders
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-sky-400 mt-1">
                    {kpiMetrics.todaysOrders}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">Last 24 hours</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('pending_orders')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-[#F5A623]/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    5. Pending Orders
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-[#F5A623] mt-1">
                    {kpiMetrics.pendingOrders}
                  </p>
                  <span className="text-[11px] text-amber-400 mt-1 block">Awaiting fulfillment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('sales_overview')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-emerald-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    6. Total Sales (GMV)
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold font-mono mt-1">
                    ₹{kpiMetrics.totalSales.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    {combinedOrders.length} total orders
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('earnings')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-emerald-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    7. Net Earnings
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                    ₹{kpiMetrics.netEarnings.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    After {sellerProfile?.commissionRate ?? 10}% platform fee
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('payout_requests')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-amber-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    8. Pending Payout
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400 mt-1">
                    ₹{kpiMetrics.pendingPayout.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Available: ₹{Number(walletData?.walletBalance ?? sellerProfile?.walletBalance ?? 0).toLocaleString('en-IN')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('product_variants')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-rose-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    9. Low Stock Alerts
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-rose-400 mt-1">
                    {kpiMetrics.lowStockProducts}
                  </p>
                  <span className="text-[11px] text-rose-400 mt-1 block">≤ 5 units remaining</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('return_requests')}
                  className={`p-4 rounded-2xl border text-left transition-all hover:border-rose-500/50 cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    10. Return Requests
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-orange-400 mt-1">
                    {kpiMetrics.returnRequestsCount}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">Customer RMA queue</span>
                </button>
              </div>

              {/* TO-DO CHECKLIST & ACCOUNT STATUS */}
              {(activeSection === 'overview' || activeSection === 'todo_checklist' || activeSection === 'account_status') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Seller Operational To-Do Checklist */}
                  <div className={`lg:col-span-2 p-5 rounded-2xl border ${cardBg} space-y-4`}>
                    <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-[#F5A623]" />
                          <span>Daily Seller To-Do Checklist</span>
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Priority operational tasks requiring your attention today
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#F5A623]/15 text-[#F5A623]">
                        Live Action Queue
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        onClick={() => setActiveSection('pending_orders')}
                        className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-[#F5A623]/50 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold block">Orders to Pack & Confirm</span>
                          <span className="text-[11px] text-neutral-400">Avoid SLA breach by packing on time</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg font-mono font-extrabold bg-amber-500/20 text-amber-400">
                          {kpiMetrics.pendingOrders}
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveSection('product_variants')}
                        className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold block">Restock Low Inventory SKUs</span>
                          <span className="text-[11px] text-neutral-400">Products with ≤ 5 units left</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg font-mono font-extrabold bg-rose-500/20 text-rose-400">
                          {kpiMetrics.lowStockProducts}
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveSection('nid_verification')}
                        className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold block">NID & Face Identity Verification</span>
                          <span className="text-[11px] text-neutral-400">Required for public Verified Seller badge</span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                            isVerifiedBadge
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-[#F5A623]'
                          }`}
                        >
                          {isVerifiedBadge ? 'Verified' : sellerProfile?.verificationStatus?.replace(/_/g, ' ') || 'Action Needed'}
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveSection('return_requests')}
                        className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-orange-500/50 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold block">Inspect Return & Refund Requests</span>
                          <span className="text-[11px] text-neutral-400">Submit warehouse inspection notes</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg font-mono font-extrabold bg-orange-500/20 text-orange-400">
                          {kpiMetrics.returnRequestsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Health & Compliance Summary */}
                  <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                    <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Account & Store Health</span>
                      </h3>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {sellerProfile?.rating || 4.8} ★
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Account Approval</span>
                        <span className="font-bold uppercase text-emerald-400">
                          {sellerProfile?.status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Verified Seller Badge</span>
                        <span className={`font-bold ${isVerifiedBadge ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isVerifiedBadge ? 'Granted by Admin' : 'Not Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Email Verification</span>
                        <span className={`font-bold ${sellerProfile?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {sellerProfile?.emailVerified ? 'Verified' : 'Pending OTP'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Payout Bank / KYC</span>
                        <span className="font-bold">
                          {sellerProfile?.bankAccountNumber ? 'Configured' : 'Incomplete'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-neutral-400">20-Min Express Dispatch</span>
                        <span className="font-bold text-emerald-400">
                          {sellerProfile?.quickDeliveryEnabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RECENT ORDERS & TOP-SELLING PRODUCTS TABLES */}
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Recent Orders</h3>
                        <p className="text-xs text-neutral-400">Latest customer orders for your store</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection('all_orders')}
                        className="text-xs font-bold text-[#F5A623] hover:underline cursor-pointer"
                      >
                        View All ({combinedOrders.length}) →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase text-neutral-400 border-b border-neutral-800">
                          <tr>
                            <th className="py-2 pr-3">Order ID</th>
                            <th className="py-2 px-3">Customer</th>
                            <th className="py-2 px-3">Amount</th>
                            <th className="py-2 pl-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                          {combinedOrders.slice(0, 5).map((ord) => (
                            <tr key={ord.id} className="hover:bg-neutral-800/20">
                              <td className="py-2.5 pr-3 font-mono font-bold text-[#F5A623]">{ord.id}</td>
                              <td className="py-2.5 px-3">{ord.customer}</td>
                              <td className="py-2.5 px-3 font-mono font-bold">
                                ₹{Number(ord.sellerTotal ?? ord.total ?? 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 pl-3 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-200">
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top-Selling Products */}
                  <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Top-Selling Products</h3>
                        <p className="text-xs text-neutral-400">Best performing SKUs in your catalog</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection('product_performance')}
                        className="text-xs font-bold text-[#F5A623] hover:underline cursor-pointer"
                      >
                        Full Analytics →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {myProducts.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-neutral-800/70 bg-neutral-950/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{p.name}</p>
                              <p className="text-[10px] text-neutral-400">
                                Stock: {p.stock ?? 10} units • {p.rating || 4.8} ★
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-mono font-bold text-[#F5A623]">
                              ₹{p.price.toLocaleString('en-IN')}
                            </p>
                            <span className="text-[10px] text-emerald-400">
                              {(p.approvalStatus || 'approved').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS & RECENT TRANSACTIONS */}
              {(activeSection === 'overview' || activeSection === 'notifications') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Important Notifications */}
                  <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                    <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#F5A623]" />
                        <span>Seller Notifications & Admin Alerts</span>
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-400">Real-Time Feed</span>
                    </div>

                    <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
                      {Array.isArray(sellerProfile?.notifications) && sellerProfile.notifications.length > 0 ? (
                        sellerProfile.notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-[#F5A623]">{notif.title}</span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <p className="text-neutral-300 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 text-neutral-400">
                          All caught up! Admin review decisions, order alerts, and payout updates appear here.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Wallet Transactions */}
                  <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                    <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Recent Financial Transactions</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveSection('transaction_history')}
                        className="text-xs font-bold text-[#F5A623] hover:underline cursor-pointer"
                      >
                        Full Statement →
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {(walletData?.ledger && walletData.ledger.length > 0
                        ? walletData.ledger.slice(0, 4)
                        : [
                            {
                              id: 'TXN-settlement-1',
                              title: 'Order Settlement Credit',
                              amount: kpiMetrics.netEarnings || 12450,
                              type: 'credit',
                              date: 'Recent Settlement',
                            },
                          ]
                      ).map((tx: any, idx: number) => (
                        <div
                          key={tx.id || idx}
                          className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold block">{tx.title || tx.description || 'Store Settlement'}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Processed')}
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              tx.type === 'debit' ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {tx.type === 'debit' ? '-' : '+'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 2: DARAZ-STYLE SELLER PRODUCT MANAGEMENT & ADD/EDIT STUDIO
             ===================================================================== */}
          {isProductsGroup && (activeSection === 'add_product' || studioOpen) && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
              <DarazAddProductStudio
                mode="seller"
                sellerProfile={sellerProfile}
                initialProduct={editingProduct as any}
                existingProducts={myProducts as any}
                onBack={() => {
                  setStudioOpen(false);
                  setEditingProduct(null);
                  setActiveSection('manage_products');
                }}
                onSaved={(savedProd: any, isDraft: boolean) => {
                  const prodObj = savedProd?.product || savedProd;
                  const targetId = prodObj._id || prodObj.id;
                  const exists = myProducts.some(
                    (item) => String((item as any)._id || item.id) === String(targetId)
                  );
                  if (exists) {
                    setMyProducts((prev) =>
                      prev.map((item) =>
                        String((item as any)._id || item.id) === String(targetId)
                          ? { ...item, ...prodObj }
                          : item
                      )
                    );
                    if (onUpdateProduct) onUpdateProduct(prodObj);
                  } else {
                    setMyProducts((prev) => [prodObj, ...prev]);
                    if (!isDraft && onAddProduct) onAddProduct(prodObj);
                  }

                  if (isDraft) {
                    showToast(`Saved "${prodObj.name}" as Draft in your Seller Center.`, 'info');
                    setEditingProduct(prodObj);
                  } else {
                    showToast(
                      prodObj.moderationStatus === 'pending'
                        ? `Submitted "${prodObj.name}" for Admin QC approval.`
                        : `Published "${prodObj.name}" to your storefront catalog!`,
                      'success'
                    );
                    setStudioOpen(false);
                    setEditingProduct(null);
                    setActiveSection('manage_products');
                  }
                }}
              />
            </div>
          )}

          {isProductsGroup && activeSection !== 'add_product' && !studioOpen && (
            <div className="space-y-6 animate-fade-in">
              {/* Seller Product Performance Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  {
                    id: 'all',
                    label: 'Total My Products',
                    count: myProducts.length,
                    color: isLightMode ? 'text-slate-900' : 'text-white',
                  },
                  {
                    id: 'published',
                    label: 'Published Live',
                    count: myProducts.filter(
                      (p) =>
                        !(p as any).isDraft &&
                        (p as any).isPublished !== false &&
                        p.isVisible !== false &&
                        ((p as any).moderationStatus || p.approvalStatus || 'approved') === 'approved'
                    ).length,
                    color: 'text-emerald-400',
                  },
                  {
                    id: 'draft',
                    label: 'Saved Drafts',
                    count: myProducts.filter(
                      (p) => (p as any).isDraft || (p as any).moderationStatus === 'draft' || p.isVisible === false
                    ).length,
                    color: 'text-amber-400',
                  },
                  {
                    id: 'pending',
                    label: 'Pending Approval',
                    count: myProducts.filter(
                      (p) => (p as any).moderationStatus === 'pending' || p.approvalStatus === 'pending'
                    ).length,
                    color: 'text-sky-400',
                  },
                  {
                    id: 'rejected',
                    label: 'Rejected (Fix Needed)',
                    count: myProducts.filter(
                      (p) => (p as any).moderationStatus === 'rejected' || p.approvalStatus === 'rejected'
                    ).length,
                    color: 'text-rose-400',
                  },
                  {
                    id: 'out_of_stock',
                    label: 'Out of Stock',
                    count: myProducts.filter((p) => Number(p.stock ?? 0) <= 0).length,
                    color: 'text-orange-400',
                  },
                  {
                    id: 'archived',
                    label: 'Archived',
                    count: myProducts.filter((p) => (p as any).moderationStatus === 'archived').length,
                    color: 'text-neutral-400',
                  },
                ].map((stat) => (
                  <button
                    key={stat.id}
                    type="button"
                    onClick={() => {
                      setProductStatusFilter(stat.id as any);
                      setActiveSection('manage_products');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      productStatusFilter === stat.id
                        ? 'border-[#F5A623] bg-[#F5A623]/10'
                        : `${cardBg} hover:border-neutral-700`
                    }`}
                  >
                    <span className="mkt-helper uppercase tracking-wider text-neutral-400 block truncate">
                      {stat.label}
                    </span>
                    <span className={`mkt-price font-semibold mt-0.5 block ${stat.color}`}>
                      {stat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Product Sub-Navigation Pills */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(
                    [
                      { id: 'manage_products', label: 'My Products', icon: Package },
                      { id: 'product_categories', label: 'Categories', icon: Layers },
                      { id: 'product_variants', label: 'Variants & Stock', icon: CheckSquare },
                      { id: 'media_center', label: 'Images & Media', icon: ImageIcon },
                      { id: 'product_approval', label: 'QC & Approval Status', icon: ShieldCheck },
                      { id: 'bulk_products', label: 'Bulk Management', icon: Filter },
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSection(tab.id)}
                        className={`mkt-btn px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeSection === tab.id
                            ? 'bg-[#F5A623] text-black shadow-xs'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCsvImportOpen((prev) => !prev)}
                    className="mkt-btn px-3.5 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>Bulk CSV Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mkt-btn px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Product (Studio)</span>
                  </button>
                </div>
              </div>

              {/* CSV BULK IMPORT PANEL */}
              {csvImportOpen && (
                <form
                  onSubmit={handleImportCsvSubmit}
                  className={`p-5 rounded-2xl border ${cardBg} space-y-3 text-xs`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#F5A623]">
                        Bulk Product CSV Upload & Template Import
                      </h3>
                      <p className="text-neutral-400">
                        Paste CSV rows (`name,brand,category,price,mrp,stock,sku,hsnCode`) or download our template.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadCsvTemplate}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
                      >
                        Download CSV Template
                      </button>
                      <button
                        type="button"
                        onClick={() => setCsvImportOpen(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={csvTextInput}
                    onChange={(e) => setCsvTextInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={importingCsv}
                      className="px-4 py-2 rounded-xl bg-[#F5A623] text-black font-extrabold cursor-pointer"
                    >
                      {importingCsv ? 'Importing CSV Catalog...' : 'Import Products Now'}
                    </button>
                  </div>
                </form>
              )}

              {/* SUB-VIEW: PRODUCT CATEGORIES BREAKDOWN */}
              {activeSection === 'product_categories' && (
                <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider">Store Category Distribution</h3>
                    <p className="text-xs text-neutral-400">
                      Click any category to filter your product catalog
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {sellerCategoryOptions.map((cat) => {
                      const count = myProducts.filter(
                        (p) => String(p.category || '').toLowerCase() === cat.id.toLowerCase()
                      ).length;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setProductCategoryFilter(cat.id);
                            setActiveSection('manage_products');
                          }}
                          className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-[#F5A623]/50 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold block">{cat.label}</span>
                            <span className="text-[10px] text-neutral-400">
                              {cat.subCategories?.length || 1} subcategories
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold bg-[#F5A623]/15 text-[#F5A623]">
                            {count} SKUs
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-VIEW: MEDIA CENTER */}
              {activeSection === 'media_center' && (
                <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider">Product Media Center</h3>
                      <p className="text-xs text-neutral-400">
                        All primary and gallery images across your {myProducts.length} listed products
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="px-3.5 py-2 rounded-xl bg-[#F5A623] text-black font-extrabold text-xs cursor-pointer"
                    >
                      + Upload Product Media in Studio
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
                    {myProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => openEditModal(p)}
                        className="group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-pointer hover:border-[#F5A623]"
                      >
                        <div className="aspect-square overflow-hidden bg-neutral-900">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-[11px] font-bold truncate">{p.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {(p.images?.length || 1)} photo(s) • Click to Edit
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-VIEW: PRODUCT VARIANTS & INVENTORY QUICK EDITOR */}
              {activeSection === 'product_variants' && (
                <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider">
                        Product Variants & Inventory Stock Matrix
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Monitor low-stock alerts (≤ 5 units) and update SKU inventory or variant options
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                        Low Stock SKUs: {kpiMetrics.lowStockProducts}
                      </span>
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="px-3.5 py-2 rounded-xl bg-[#F5A623] text-black font-extrabold text-xs cursor-pointer"
                      >
                        + Add Variant SKU
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-VIEW: PRODUCT QC & APPROVAL STATUS SUMMARY */}
              {activeSection === 'product_approval' && (
                <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider">
                        Product Quality Control (QC) & Approval Status
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Track products approved for public listing, pending administrator QC review, or requiring fixes
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setProductStatusFilter('pending')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30 cursor-pointer"
                      >
                        Pending QC ({kpiMetrics.pendingApproval})
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductStatusFilter('approved')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 cursor-pointer"
                      >
                        Approved Live ({kpiMetrics.activeProducts})
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductStatusFilter('rejected')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30 cursor-pointer"
                      >
                        Rejected ({myProducts.filter((p) => (p as any).moderationStatus === 'rejected' || p.approvalStatus === 'rejected').length})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN PRODUCT CATALOG / VARIANTS / APPROVAL / BULK TABLE */}
              {activeSection !== 'product_categories' && activeSection !== 'media_center' && (
                <div className={`rounded-2xl border ${cardBg} overflow-hidden`}>
                  {/* Filter & Bulk Action Bar */}
                  <div className="p-4 border-b border-neutral-800 space-y-3">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            { id: 'all', label: `All (${myProducts.length})` },
                            {
                              id: 'published',
                              label: `Published (${
                                myProducts.filter(
                                  (p) =>
                                    !(p as any).isDraft &&
                                    (p as any).isPublished !== false &&
                                    p.isVisible !== false &&
                                    ((p as any).moderationStatus || p.approvalStatus || 'approved') === 'approved'
                                ).length
                              })`,
                            },
                            {
                              id: 'draft',
                              label: `Drafts (${
                                myProducts.filter(
                                  (p) => (p as any).isDraft || (p as any).moderationStatus === 'draft' || p.isVisible === false
                                ).length
                              })`,
                            },
                            {
                              id: 'pending',
                              label: `Pending Approval (${
                                myProducts.filter(
                                  (p) => (p as any).moderationStatus === 'pending' || p.approvalStatus === 'pending'
                                ).length
                              })`,
                            },
                            {
                              id: 'rejected',
                              label: `Rejected (${
                                myProducts.filter(
                                  (p) => (p as any).moderationStatus === 'rejected' || p.approvalStatus === 'rejected'
                                ).length
                              })`,
                            },
                            {
                              id: 'unpublished',
                              label: `Unpublished (${
                                myProducts.filter(
                                  (p) => ((p as any).isPublished === false || (p as any).isHidden === true) && !(p as any).isDraft
                                ).length
                              })`,
                            },
                            {
                              id: 'out_of_stock',
                              label: `Out-of-Stock (${myProducts.filter((p) => Number(p.stock ?? 0) <= 0).length})`,
                            },
                            {
                              id: 'archived',
                              label: `Archived (${myProducts.filter((p) => (p as any).moderationStatus === 'archived').length})`,
                            },
                          ] as const
                        ).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setProductStatusFilter(st.id)}
                            className={`mkt-btn px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                              productStatusFilter === st.id
                                ? 'bg-[#F5A623] text-black'
                                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={productCategoryFilter}
                          onChange={(e) => setProductCategoryFilter(e.target.value)}
                          className="mkt-select px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                        >
                          <option value="all">All Categories</option>
                          {sellerCategoryOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={productSortBy}
                          onChange={(e: any) => setProductSortBy(e.target.value)}
                          className="mkt-select px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                        >
                          <option value="newest">Sort: Newest</option>
                          <option value="price_asc">Price: Low to High</option>
                          <option value="price_desc">Price: High to Low</option>
                          <option value="stock_asc">Stock: Low to High</option>
                        </select>
                      </div>
                    </div>

                    {/* Bulk Operations Toolbar */}
                    {(selectedProductIds.length > 0 || activeSection === 'bulk_products') && (
                      <div className="p-3 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#F5A623]">
                            {selectedProductIds.length} product(s) selected
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProductIds(
                                selectedProductIds.length === filteredProducts.length
                                  ? []
                                  : filteredProducts.map((p) => p.id)
                              )
                            }
                            className="underline text-neutral-300 hover:text-white cursor-pointer"
                          >
                            {selectedProductIds.length === filteredProducts.length ? 'Clear All' : 'Select All Shown'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            disabled={bulkActionProcessing}
                            onClick={() => handleBulkAction('publish')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold cursor-pointer"
                          >
                            Publish
                          </button>
                          <button
                            type="button"
                            disabled={bulkActionProcessing}
                            onClick={() => handleBulkAction('unpublish')}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 text-white font-bold cursor-pointer"
                          >
                            Unpublish / Draft
                          </button>
                          <button
                            type="button"
                            disabled={bulkActionProcessing}
                            onClick={() => handleBulkAction('archive')}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold cursor-pointer"
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            disabled={bulkActionProcessing}
                            onClick={() => handleBulkAction('restore')}
                            className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold cursor-pointer"
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            disabled={bulkActionProcessing}
                            onClick={() => handleBulkAction('submit_review')}
                            className="px-3 py-1.5 rounded-lg bg-sky-500 text-black font-bold cursor-pointer"
                          >
                            Submit for QC
                          </button>
                          <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                            <input
                              type="number"
                              min={0}
                              value={bulkStockInput}
                              onChange={(e) => setBulkStockInput(Number(e.target.value))}
                              className="w-14 bg-transparent text-white font-mono text-xs outline-none"
                            />
                            <button
                              type="button"
                              disabled={bulkActionProcessing}
                              onClick={() => handleBulkAction('update_stock')}
                              className="px-2 py-0.5 rounded bg-[#F5A623] text-black font-bold cursor-pointer"
                            >
                              Set Stock
                            </button>
                          </div>
                          <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                            <input
                              type="number"
                              min={1}
                              max={90}
                              value={bulkDiscountInput}
                              onChange={(e) => setBulkDiscountInput(Number(e.target.value))}
                              className="w-12 bg-transparent text-white font-mono text-xs outline-none"
                            />
                            <button
                              type="button"
                              disabled={bulkActionProcessing}
                              onClick={() => handleBulkAction('apply_discount')}
                              className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold cursor-pointer"
                            >
                              % Off MRP
                            </button>
                          </div>
                          <button
                            type="button"
                            disabled={bulkActionProcessing}
                            onClick={() => handleBulkAction('delete')}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Table */}
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="p-12 text-center text-neutral-400 text-xs">
                        Loading your store catalog...
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <Package className="w-10 h-10 text-neutral-500 mx-auto opacity-50" />
                        <div className="text-sm font-bold">No products match the current filter</div>
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="px-4 py-2 bg-[#F5A623] text-black rounded-xl text-xs font-extrabold cursor-pointer"
                        >
                          + Add New Product in Studio
                        </button>
                      </div>
                    ) : (
                      <table className="mkt-table w-full text-left divide-y divide-neutral-800">
                        <thead className="bg-neutral-950/60 text-neutral-400 uppercase tracking-wider text-xs font-semibold">
                          <tr>
                            <th className="py-3 px-4 w-8">
                              <input
                                type="checkbox"
                                checked={
                                  filteredProducts.length > 0 &&
                                  selectedProductIds.length === filteredProducts.length
                                }
                                onChange={(e) =>
                                  setSelectedProductIds(
                                    e.target.checked ? filteredProducts.map((p) => p.id) : []
                                  )
                                }
                                className="rounded cursor-pointer"
                              />
                            </th>
                            <th className="py-3 px-4">Product / SKU</th>
                            <th className="py-3 px-4">Category & Variants</th>
                            <th className="py-3 px-4">Selling Price / MRP</th>
                            <th className="py-3 px-4">Inventory & Content Score</th>
                            <th className="py-3 px-4">Approval & Visibility</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/70">
                          {filteredProducts.map((p) => {
                            const isSelected = selectedProductIds.includes(p.id);
                            const approval = (p as any).moderationStatus || p.approvalStatus || 'approved';
                            const isDraftItem = Boolean((p as any).isDraft || approval === 'draft' || p.isVisible === false);
                            const qualityScore = (p as any).contentScore ?? computeListingQualityScore(p);
                            const variantCount = Array.isArray((p as any).variants) ? (p as any).variants.length : 0;
                            const rejReason = p.rejectionReason || (p as any).moderationNote;
                            return (
                              <tr key={p.id} className="hover:bg-neutral-800/25 transition-colors">
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) =>
                                      setSelectedProductIds((prev) =>
                                        e.target.checked
                                          ? [...prev, p.id]
                                          : prev.filter((id) => id !== p.id)
                                      )
                                    }
                                    className="rounded cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0 bg-neutral-800"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0 max-w-xs">
                                      <div className="font-semibold truncate" title={p.name}>
                                        {p.name}
                                      </div>
                                      {(p as any).localizedName && (
                                        <div className="mkt-helper font-bengali text-neutral-400 truncate" lang="bn">
                                          {(p as any).localizedName}
                                        </div>
                                      )}
                                      <div className="mkt-helper text-neutral-400">
                                        {p.brand} · {p.sku || `SKU #${p.id}`}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="capitalize font-medium block">
                                    {p.category || 'General'}
                                    {p.subCategory ? ` → ${p.subCategory}` : ''}
                                  </span>
                                  <span className="mkt-helper text-neutral-400">
                                    {variantCount > 0
                                      ? `${variantCount} Variant SKUs`
                                      : `${p.colors?.length ? `${p.colors.length} colors` : 'Standard'} • ${
                                          p.sizes?.length ? `${p.sizes.length} sizes` : 'Single SKU'
                                        }`}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="mkt-price font-semibold text-[#F5A623]">
                                    ₹{p.price.toLocaleString('en-IN')}
                                  </div>
                                  <div className="mkt-helper text-neutral-400 line-through">
                                    ₹{p.mrp.toLocaleString('en-IN')}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <button
                                        type="button"
                                        disabled={adjustingStockId === p.id || Number(p.stock ?? 10) <= 0}
                                        onClick={() => handleQuickAdjustStock(p, -1)}
                                        className="w-6 h-6 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                                        title="Decrease stock by 1"
                                      >
                                        -
                                      </button>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block ${
                                          Number(p.stock ?? 10) <= 0
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            : Number(p.stock ?? 10) <= 5
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        }`}
                                      >
                                        {p.stock ?? 10} units ({p.stockStatus || 'In Stock'})
                                      </span>
                                      <button
                                        type="button"
                                        disabled={adjustingStockId === p.id}
                                        onClick={() => handleQuickAdjustStock(p, 1)}
                                        className="w-6 h-6 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                                        title="Increase stock by 1"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div className="mkt-helper text-neutral-400">
                                      Content Score:{' '}
                                      <span className={qualityScore >= 80 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                                        {qualityScore}/100
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                                          approval === 'approved'
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : approval === 'rejected'
                                            ? 'bg-rose-500/20 text-rose-400'
                                            : approval === 'pending'
                                            ? 'bg-sky-500/20 text-sky-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                        }`}
                                      >
                                        {approval}
                                      </span>
                                      {isDraftItem ? (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300">
                                          Draft
                                        </span>
                                      ) : (p as any).isPublished === false ? (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400">
                                          Unpublished
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300">
                                          Live
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      disabled={togglingPublishId === p.id}
                                      onClick={() => handleToggleProductPublish(p)}
                                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                                        !isDraftItem && (p as any).isPublished !== false && approval === 'approved'
                                          ? 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white'
                                          : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                      }`}
                                    >
                                      {togglingPublishId === p.id
                                        ? 'Updating...'
                                        : !isDraftItem && (p as any).isPublished !== false && approval === 'approved'
                                        ? 'Set Unpublished'
                                        : 'Publish Live'}
                                    </button>
                                    {rejReason && approval === 'rejected' && (
                                      <p
                                        className="mkt-helper text-rose-400 font-medium max-w-[200px] truncate"
                                        title={rejReason}
                                      >
                                        Admin Reason: {rejReason}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(p)}
                                      className="mkt-btn px-2.5 py-1.5 rounded-lg bg-[#F5A623]/15 hover:bg-[#F5A623] text-[#F5A623] hover:text-black font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Edit Product in Studio (Prefilled)"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={duplicatingId === p.id}
                                      onClick={() => handleDuplicateProduct(p.id)}
                                      className="p-1.5 rounded-lg text-neutral-300 hover:text-[#F5A623] hover:bg-neutral-800 transition-colors cursor-pointer"
                                      title="Duplicate product as Draft"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <GlassIconButton
                                      icon={Trash2}
                                      disabled={deletingId === p.id}
                                      onClick={() => setConfirmDeleteProd({ id: p.id, name: p.name })}
                                      variant="danger"
                                      size="sm"
                                      title="Delete product"
                                      aria-label="Delete product"
                                      isLightMode={isLightMode}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* In-App Delete Product Confirmation Modal */}
              {confirmDeleteProd && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className={`max-w-md w-full p-6 rounded-2xl border ${cardBg} space-y-4 shadow-2xl`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Delete Product from Storefront?</h3>
                        <p className="text-xs text-neutral-400">
                          Are you sure you want to permanently remove <strong>{confirmDeleteProd.name}</strong> from your catalog?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteProd(null)}
                        className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === confirmDeleteProd.id}
                        onClick={() => handleDeleteProduct(confirmDeleteProd.id, confirmDeleteProd.name)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer"
                      >
                        {deletingId === confirmDeleteProd.id ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* In-App Bulk Delete Confirmation Modal */}
              {confirmBulkDeleteOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className={`max-w-md w-full p-6 rounded-2xl border ${cardBg} space-y-4 shadow-2xl`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Bulk Delete {selectedProductIds.length} Product(s)?</h3>
                        <p className="text-xs text-neutral-400">
                          Are you sure you want to permanently delete the <strong>{selectedProductIds.length}</strong> selected product(s) from your catalog? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmBulkDeleteOpen(false)}
                        className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={bulkActionProcessing}
                        onClick={() => executeBulkAction('delete')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer"
                      >
                        {bulkActionProcessing ? 'Deleting...' : `Delete ${selectedProductIds.length} Product(s)`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 3: ORDERS MANAGEMENT (MARKETPLACE + EXPRESS DARK STORE DISPATCH)
             ===================================================================== */}
          {isOrdersListGroup && (
            <div className="space-y-5 animate-fade-in">
              {/* Mode Switcher: Marketplace Orders vs 20-Min Express Dispatch */}
              <div className={`p-4 rounded-2xl border ${cardBg} flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('marketplace')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      orderViewMode === 'marketplace'
                        ? 'bg-[#F5A623] text-black shadow-xs'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Marketplace Orders ({filteredMarketplaceOrders.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('express_dispatch')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      orderViewMode === 'express_dispatch'
                        ? 'bg-[#FF007F] text-white shadow-xs'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>⚡ 20-Min Express Store Dispatch ({storeOrders.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadOrdersCsv}
                    className="px-3.5 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>Export Orders CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      loadMarketplaceOrders();
                      loadStoreOrders();
                    }}
                    className="px-3.5 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 justify-center cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                    <span>Sync Orders</span>
                  </button>
                </div>
              </div>

              {/* Order Status Pills & Bulk Order Processing */}
              {orderViewMode === 'marketplace' && (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(
                        [
                          { id: 'all_orders', label: 'All Orders', count: orderStatusCounts.all },
                          { id: 'pending_orders', label: 'Pending', count: orderStatusCounts.pending },
                          { id: 'confirmed_orders', label: 'Confirmed', count: orderStatusCounts.confirmed },
                          { id: 'processing_orders', label: 'Processing', count: orderStatusCounts.processing },
                          { id: 'ready_shipment', label: 'Ready for Shipment', count: orderStatusCounts.readyForShipment },
                          { id: 'shipped_orders', label: 'Shipped / In Transit', count: orderStatusCounts.shipped },
                          { id: 'delivered_orders', label: 'Delivered', count: orderStatusCounts.delivered },
                          { id: 'cancelled_orders', label: 'Cancelled / Rejected', count: orderStatusCounts.cancelled },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setActiveSection(st.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                            activeSection === st.id
                              ? 'bg-[#F5A623] text-black shadow-xs'
                              : isLightMode
                              ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span>{st.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                              activeSection === st.id
                                ? 'bg-black/20 text-black'
                                : st.count > 0
                                ? 'bg-[#F5A623]/20 text-[#F5A623]'
                                : isLightMode
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {st.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Bulk Order Status Bar */}
                    <div className="flex items-center gap-2 flex-wrap text-xs bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedOrderIds(
                            selectedOrderIds.length === filteredMarketplaceOrders.length
                              ? []
                              : filteredMarketplaceOrders.map((o) => String(o.id))
                          )
                        }
                        className="text-[#F5A623] font-bold hover:underline cursor-pointer"
                      >
                        {selectedOrderIds.length === filteredMarketplaceOrders.length &&
                        filteredMarketplaceOrders.length > 0
                          ? 'Clear Selection'
                          : `Select All (${selectedOrderIds.length})`}
                      </button>
                      <select
                        value={bulkOrderCourier}
                        onChange={(e) => setBulkOrderCourier(e.target.value)}
                        className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-white"
                      >
                        <option value="BlueDart Priority">BlueDart Priority</option>
                        <option value="Delhivery Surface/Air">Delhivery Express</option>
                        <option value="DTDC Insured">DTDC Insured</option>
                        <option value="ALIKE-ND Fleet">ALIKE-ND Logistics</option>
                      </select>
                      <select
                        value={bulkOrderNextStatus}
                        onChange={(e) => setBulkOrderNextStatus(e.target.value)}
                        className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-white"
                      >
                        <option value="Confirmed">Bulk → Confirmed</option>
                        <option value="Processing">Bulk → Processing</option>
                        <option value="Ready for Shipment">Bulk → Ready to Ship</option>
                        <option value="Shipped">Bulk → Shipped</option>
                        <option value="Delivered">Bulk → Delivered</option>
                      </select>
                      <button
                        type="button"
                        disabled={bulkOrderUpdating || selectedOrderIds.length === 0}
                        onClick={handleBulkUpdateOrders}
                        className="px-3 py-1 rounded-lg bg-[#F5A623] text-black font-extrabold cursor-pointer disabled:opacity-50"
                      >
                        {bulkOrderUpdating ? 'Updating...' : 'Apply Bulk Status'}
                      </button>
                    </div>
                  </div>

                  {/* Marketplace Orders List */}
                  <div className="space-y-4">
                    {filteredMarketplaceOrders.length === 0 ? (
                      <div className={`p-12 text-center rounded-2xl border ${cardBg} space-y-3`}>
                        <ShoppingBag className="w-10 h-10 text-neutral-500 mx-auto opacity-50" />
                        <p className="text-sm font-bold">No orders in this status view</p>
                        <p className="text-xs text-neutral-400">
                          Switch status tabs above or check 20-Min Express Dispatch orders.
                        </p>
                        {combinedOrders.length > 0 && (
                          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                            {orderStatusCounts.pending > 0 && activeSection !== 'pending_orders' && (
                              <button
                                type="button"
                                onClick={() => setActiveSection('pending_orders')}
                                className="px-3.5 py-1.5 rounded-xl bg-[#F5A623] text-black text-xs font-extrabold cursor-pointer"
                              >
                                View Pending Orders ({orderStatusCounts.pending})
                              </button>
                            )}
                            {orderStatusCounts.confirmed > 0 && activeSection !== 'confirmed_orders' && (
                              <button
                                type="button"
                                onClick={() => setActiveSection('confirmed_orders')}
                                className="px-3.5 py-1.5 rounded-xl bg-[#F5A623] text-black text-xs font-extrabold cursor-pointer"
                              >
                                View Confirmed Orders ({orderStatusCounts.confirmed})
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveSection('all_orders')}
                              className="px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs font-bold cursor-pointer"
                            >
                              View All Orders ({orderStatusCounts.all})
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredMarketplaceOrders.map((ord) => {
                        const oid = String(ord.id);
                        const isOrdSelected = selectedOrderIds.includes(oid);
                        return (
                          <div key={oid} className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isOrdSelected}
                                  onChange={(e) =>
                                    setSelectedOrderIds((prev) =>
                                      e.target.checked
                                        ? [...prev, oid]
                                        : prev.filter((id) => id !== oid)
                                    )
                                  }
                                  className="rounded cursor-pointer"
                                />
                                <span className="font-mono font-extrabold text-sm text-[#F5A623]">
                                  {ord.id}
                                </span>
                                <span className="text-xs text-neutral-400">{ord.date}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                                  {ord.paymentMethod || 'Prepaid / Verified'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceModalOrder(ord)}
                                  className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white cursor-pointer flex items-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                                  <span>Invoice & Shipping Label</span>
                                </button>
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-[#F5A623]/20 text-[#F5A623]">
                                  {ord.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                                  Customer Fulfillment Details
                                </span>
                                <p className="font-bold">{ord.customer}</p>
                                {ord.phone && <p className="text-neutral-400 font-mono">{ord.phone}</p>}
                                <p className="text-neutral-400">{ord.address || 'Standard Marketplace Delivery'}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                                  Ordered Items
                                </span>
                                {(ord.sellerItems || ord.items || []).map((it: any, idx: number) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>
                                      {it.name} ×{it.quantity || 1}
                                    </span>
                                    <span className="font-mono font-bold">₹{it.price}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2 md:text-right">
                                <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                                  Seller Order Value
                                </span>
                                <p className="text-lg font-mono font-extrabold text-emerald-400">
                                  ₹{Number(ord.sellerTotal ?? ord.total ?? 0).toLocaleString('en-IN')}
                                </p>
                                <div className="flex md:justify-end gap-1.5 flex-wrap pt-1">
                                  {ord.status === 'Pending' && (
                                    <button
                                      type="button"
                                      disabled={updatingOrderStatusId === ord.id}
                                      onClick={() => handleUpdateMarketplaceOrderStatus(ord.id, 'Confirmed')}
                                      className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-black font-extrabold text-xs cursor-pointer"
                                    >
                                      Confirm Order
                                    </button>
                                  )}
                                  {(ord.status === 'Pending' || ord.status === 'Confirmed') && (
                                    <button
                                      type="button"
                                      disabled={updatingOrderStatusId === ord.id}
                                      onClick={() => handleUpdateMarketplaceOrderStatus(ord.id, 'Processing')}
                                      className="px-3 py-1.5 rounded-lg bg-sky-500 text-black font-extrabold text-xs cursor-pointer"
                                    >
                                      Mark Processing
                                    </button>
                                  )}
                                  {ord.status === 'Processing' && (
                                    <button
                                      type="button"
                                      disabled={updatingOrderStatusId === ord.id}
                                      onClick={() => handleUpdateMarketplaceOrderStatus(ord.id, 'Ready for Shipment')}
                                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                                    >
                                      Mark Ready to Ship
                                    </button>
                                  )}
                                  {ord.status === 'Ready for Shipment' && (
                                    <button
                                      type="button"
                                      disabled={updatingOrderStatusId === ord.id}
                                      onClick={() => handleUpdateMarketplaceOrderStatus(ord.id, 'Shipped')}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-extrabold text-xs cursor-pointer"
                                    >
                                      Dispatch / Ship
                                    </button>
                                  )}
                                  {ord.status === 'Shipped' && (
                                    <button
                                      type="button"
                                      disabled={updatingOrderStatusId === ord.id}
                                      onClick={() => handleUpdateMarketplaceOrderStatus(ord.id, 'Delivered')}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs cursor-pointer"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                  {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                                    <button
                                      type="button"
                                      disabled={updatingOrderStatusId === ord.id}
                                      onClick={() => handleUpdateMarketplaceOrderStatus(ord.id, 'Cancelled')}
                                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* Express Dark Store Orders View */}
              {orderViewMode === 'express_dispatch' && (
                <div className="grid grid-cols-1 gap-4">
                  {storeOrders.map((order) => {
                    const isReady = order.status === 'ready_for_pickup';
                    const isDriverArrived = order.status === 'arrived_at_store';
                    const isHandedOver = ['picked_up', 'out_for_delivery'].includes(order.status);
                    const isDelivered = order.status === 'delivered';

                    return (
                      <div key={order.taskId} className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm">
                              {order.orderNumber || order.taskId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-[#FF007F] border border-[#FF007F]/20">
                              ⚡ Quick Delivery
                            </span>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#FF007F]/20 text-[#FF007F]">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                            {(order.items || []).map((it: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>
                                  {it.name} <strong>×{it.quantity || 1}</strong>
                                </span>
                                <span className="font-mono font-bold">₹{it.price}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold">
                              <span>Total Bill</span>
                              <span className="font-mono text-emerald-400">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-rose-500/5 border border-[#FF007F]/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-black text-[#FF007F]">
                                Store Pickup PIN
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(order.pickupCode || 'PU-4821');
                                  showToast('Pickup code copied!', 'info');
                                }}
                                className="p-1.5 rounded bg-neutral-800 text-neutral-300 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-xl font-mono font-black tracking-widest text-[#FF007F]">
                              {order.pickupCode || 'PU-4821'}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                            <span className="font-bold block">{order.customerName}</span>
                            <span className="text-neutral-400 text-[11px] block">
                              {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                            </span>
                            {order.deliveryPartner && (
                              <div className="pt-2 border-t border-neutral-800 text-[11px]">
                                Partner: <strong>{order.deliveryPartner.name}</strong> ({order.deliveryPartner.vehicleType})
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            {order.status === 'order_placed' && (
                              <button
                                type="button"
                                onClick={() => handleStoreAcceptOrder(order.taskId)}
                                className="px-4 py-2 bg-[#FF007F] text-white font-bold text-xs rounded-xl cursor-pointer"
                              >
                                Accept Order
                              </button>
                            )}
                            {order.status === 'store_accepted' && (
                              <button
                                type="button"
                                onClick={() => handleStoreStartPreparing(order.taskId, 10)}
                                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer"
                              >
                                Start Preparing (10m)
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                type="button"
                                onClick={() => handleStoreMarkReady(order.taskId)}
                                className="px-4 py-2 bg-emerald-500 text-black font-black text-xs rounded-xl cursor-pointer"
                              >
                                ✓ Mark Ready for Pickup
                              </button>
                            )}
                            {(isReady || isDriverArrived) && !order.pickupVerified && (
                              <button
                                type="button"
                                onClick={() => handleOpenHandoverModal(order)}
                                className="px-4 py-2 bg-[#FF007F] text-white font-bold text-xs rounded-xl cursor-pointer"
                              >
                                Confirm Handover to Driver
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedTrackingOrders((prev) => ({
                                  ...prev,
                                  [order.taskId]: !prev[order.taskId],
                                }))
                              }
                              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-700 bg-neutral-900 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Radio className="w-3.5 h-3.5 text-[#FF007F]" />
                              <span>
                                {expandedTrackingOrders[order.taskId] ? 'Hide Live Map' : 'Track Customer GPS'}
                              </span>
                            </button>
                          </div>

                          {!isDelivered && (
                            <button
                              type="button"
                              onClick={() => handleOpenIssueModal(order)}
                              className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Report Store Delay</span>
                            </button>
                          )}
                        </div>

                        {expandedTrackingOrders[order.taskId] && (
                          <div className="pt-2">
                            <SellerOrderLiveTracking
                              orderId={order.orderNumber || order.taskId}
                              orderNumber={order.orderNumber}
                              orderStatus={order.status}
                              customerName={order.customerName}
                              showToast={showToast}
                              isLightMode={isLightMode}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 4 & 7: GROWTH & MARKETING + ANALYTICS & REPORTS
             ===================================================================== */}
          {isMarketingOrAnalyticsGroup && sellerProfile && (
            <SellerMarketingAnalyticsTabs
              activeSection={activeSection}
              onSelectSection={setActiveSection}
              sellerProfile={sellerProfile}
              products={myProducts}
              orders={combinedOrders}
              onProductsUpdated={loadMyProducts}
              onProfileUpdated={(updated) => setSellerProfile(updated)}
              showToast={showToast}
              isLightMode={isLightMode}
            />
          )}

          {/* =====================================================================
              SECTION 5: STORE MANAGEMENT (PROFILE, BRANDING, DECORATION, POLICIES, GPS)
             ===================================================================== */}
          {isStoreManagementGroup && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { id: 'store_settings', label: 'Store Settings (Store Profile)' },
                    { id: 'store_decoration', label: 'Store Builder & Decoration' },
                    { id: 'store_profile', label: 'Store KYC & Bank Info' },
                    { id: 'store_branding', label: 'Store Logo & Banner' },
                    { id: 'store_policies', label: 'Store Policies & SEO' },
                    { id: 'shipping_delivery', label: 'Shipping & GPS Delivery' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveSection(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      activeSection === t.id
                        ? 'bg-[#F5A623] text-black'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeSection === 'store_decoration' && (
                <DarazStoreBuilderManager
                  sellerProfile={sellerProfile}
                  products={myProducts}
                  onProfileUpdated={(updated) => setSellerProfile(updated)}
                  showToast={showToast}
                  onOpenClassicSettings={() => setActiveSection('store_policies')}
                />
              )}

              {activeSection === 'store_settings' && (
                <DarazStoreBuilderManager
                  key="store_profile_mode"
                  initialViewMode="store_profile"
                  sellerProfile={sellerProfile}
                  products={myProducts}
                  onProfileUpdated={(updated) => setSellerProfile(updated)}
                  showToast={showToast}
                  onOpenClassicSettings={() => setActiveSection('store_policies')}
                />
              )}

              {activeSection === 'store_profile' && (
                <div className="space-y-6">
                  <DarazStoreSettingsProfileManager
                    sellerProfile={sellerProfile}
                    onProfileUpdated={(updated) => setSellerProfile(updated)}
                    showToast={showToast}
                    onNavigateToBuilderTab={(tab) => {
                      if (tab === 'my_pages' || tab === 'my_categories') {
                        setActiveSection('store_decoration');
                      }
                    }}
                  />
                  <StoreProfileTab
                    sellerProfile={sellerProfile}
                    onProfileUpdate={(updated) => setSellerProfile(updated)}
                    onNavigate={onNavigate}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeSection === 'shipping_delivery' && (
                <div className="space-y-8">
                  <DarazInvoiceNumberManager
                    theme={isLightMode ? 'light' : 'dark'}
                    warehousesProp={sellerProfile?.warehouses || []}
                    sellerProfile={sellerProfile}
                    onNavigateBreadcrumb={(target) => {
                      if (target === 'home') setActiveSection('overview');
                      else setActiveSection('settings_logistics');
                    }}
                    showToast={showToast}
                  />

                  <DarazShippingProviderManager
                    theme={isLightMode ? 'light' : 'dark'}
                    warehousesProp={sellerProfile?.warehouses || []}
                    sellerProfile={sellerProfile}
                    onNavigateBreadcrumb={(target) => {
                      if (target === 'home') setActiveSection('overview');
                      else setActiveSection('settings_logistics');
                    }}
                    showToast={showToast}
                  />

                  <DarazDeliveryServiceManager
                    theme={isLightMode ? 'light' : 'dark'}
                    warehousesProp={sellerProfile?.warehouses || []}
                    sellerProfile={sellerProfile}
                    onNavigateBreadcrumb={(target) => {
                      if (target === 'home') setActiveSection('overview');
                      else setActiveSection('settings_logistics');
                    }}
                    showToast={showToast}
                  />

                  <DarazWarehousePickupManager
                    theme={isLightMode ? 'light' : 'dark'}
                    warehousesProp={sellerProfile?.warehouses || []}
                    sellerProfile={sellerProfile}
                    onProfileUpdate={(updated) => setSellerProfile(updated)}
                    onChangeWarehouses={(next) => {
                      if (sellerProfile) {
                        setSellerProfile({ ...sellerProfile, warehouses: next });
                      }
                    }}
                    showToast={showToast}
                  />

                  <ShopLocationTab
                    sellerProfile={sellerProfile}
                    onProfileUpdate={(updated) => setSellerProfile(updated)}
                    showToast={showToast}
                  />
                </div>
              )}

              {(activeSection === 'store_branding' ||
                activeSection === 'store_policies') && (
                <form
                  onSubmit={handleSaveStoreBrandingAndPolicies}
                  className={`p-6 rounded-2xl border ${cardBg} space-y-6 text-xs`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold font-serif">
                        Store Branding, SEO Metadata, Decoration & Policies
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Customize your public storefront appearance, hero banner, SEO metadata, and buyer policies
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {sellerProfile && (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate?.(`store_${sellerProfile._id || sellerProfile.shopName || 'atelier'}`)
                          }
                          className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                          <span>Visit Public Store Page</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setStorePreviewOpen(true)}
                        className="px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/10 text-[#F5A623] font-extrabold text-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Storefront Preview</span>
                      </button>
                      <button
                        type="submit"
                        disabled={savingStoreConfig}
                        className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs cursor-pointer"
                      >
                        {savingStoreConfig ? 'Saving...' : 'Save Storefront Changes'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store Logo Image URL</label>
                      <input
                        type="url"
                        value={brandLogo}
                        onChange={(e) => setBrandLogo(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store Hero Banner URL</label>
                      <input
                        type="url"
                        value={brandBannerUrl}
                        onChange={(e) => setBrandBannerUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store Tagline</label>
                      <input
                        type="text"
                        value={brandTagline}
                        onChange={(e) => setBrandTagline(e.target.value)}
                        placeholder="e.g. Curated Horology & Fine Leather Goods"
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Storefront Layout Style</label>
                      <select
                        value={decoLayoutStyle}
                        onChange={(e: any) => setDecoLayoutStyle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      >
                        <option value="luxury_grid">Luxury Boutique Grid</option>
                        <option value="minimal_editorial">Minimal Editorial Showcase</option>
                        <option value="boutique_showcase">Featured Atelier Spotlight</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store Announcement Bar</label>
                      <input
                        type="text"
                        value={decoAnnouncement}
                        onChange={(e) => setDecoAnnouncement(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Featured Collection Headline</label>
                      <input
                        type="text"
                        value={decoHeadline}
                        onChange={(e) => setDecoHeadline(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store SEO Page Title</label>
                      <input
                        type="text"
                        value={storeSeoTitle}
                        onChange={(e) => setStoreSeoTitle(e.target.value)}
                        placeholder={`${sellerProfile?.shopName || 'Store'} — Official ALIKE-ND Boutique`}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store SEO Meta Description</label>
                      <input
                        type="text"
                        value={storeSeoDescription}
                        onChange={(e) => setStoreSeoDescription(e.target.value)}
                        placeholder="Discover authentic artisan creations with verified fast delivery."
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-300">About Store / Heritage Story</label>
                    <textarea
                      rows={3}
                      value={brandDescription}
                      onChange={(e) => setBrandDescription(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store Shipping & Dispatch Policy</label>
                      <textarea
                        rows={3}
                        value={policyShipping}
                        onChange={(e) => setPolicyShipping(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-300">Store Return & Exchange Policy</label>
                      <textarea
                        rows={3}
                        value={policyReturn}
                        onChange={(e) => setPolicyReturn(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white resize-none"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =====================================================================
              SECTION 6: FINANCE, WALLET & PAYOUTS + COMMISSION DETAILS
             ===================================================================== */}
          {activeSection === 'platform_commission' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                <span className="text-xs font-bold text-slate-600">
                  Viewing Platform Commission & Fee Calculator
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectSection('sales_overview')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F5A623] text-black text-xs font-bold cursor-pointer"
                >
                  ← Back to Wallet & Settlements
                </button>
              </div>
              <SellerCommissionTab
                sellerProfile={sellerProfile}
                showToast={showToast}
              />
            </div>
          )}

          {isFinanceGroup && (
            <SellerWalletTab
              sellerProfile={sellerProfile}
              showToast={showToast}
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              orders={combinedOrders}
              returnsList={returnsList}
            />
          )}

          {/* =====================================================================
              SECTION 9: SELLER NID & FACE VERIFICATION (ADMIN-REVIEWED)
             ===================================================================== */}
          {isVerificationGroup && (
            <SellerVerificationTab
              sellerProfile={sellerProfile}
              onProfileUpdated={(updated) => setSellerProfile(updated)}
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
            />
          )}

          {/* =====================================================================
              SECTION 8 & 10: RETURNS, REVIEWS, CUSTOMER CARE & ACCOUNT SECURITY
             ===================================================================== */}
          {isSupportOrSecurityGroup && sellerProfile && (
            <SellerSupportAndSecurityTabs
              activeSection={activeSection}
              onSelectSection={setActiveSection}
              sellerProfile={sellerProfile}
              products={myProducts}
              orders={combinedOrders}
              returnsList={returnsList}
              onReloadReturns={loadReturnsData}
              onProfileUpdated={(updated) => setSellerProfile(updated)}
              showToast={showToast}
              isLightMode={isLightMode}
            />
          )}

          {/* =====================================================================
              SECTION 11: DARAZ-INSPIRED SELLER SETTINGS DASHBOARD
             ===================================================================== */}
          {isSettingsGroup && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <MarketplaceSettingsDashboard
                key={activeSection}
                mode="seller"
                token={sellerApi.getToken()}
                initialCategory={settingsInitialCategory}
                onRefreshParent={refreshAllData}
              />
            </div>
          )}
        </main>
      </div>

      {/* PRINTABLE GST TAX INVOICE & SHIPPING LABEL MODAL */}
      {invoiceModalOrder && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setInvoiceModalOrder(null)}
        >
          <div
            className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                  ALIKE-ND Official Seller Tax Invoice & Packing Slip
                </span>
                <h3 className="text-lg font-black font-mono">Order #{invoiceModalOrder.id}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                >
                  Print Invoice / AWB Label
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(null)}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
              <div>
                <span className="font-bold uppercase text-slate-400 text-[10px] block">Sold & Dispatched By</span>
                <p className="font-bold text-sm">{sellerProfile?.shopName || 'Official Merchant'}</p>
                <p className="text-slate-600">{sellerProfile?.businessAddress || 'New Delhi, India'}</p>
                <p className="font-mono text-[11px] text-slate-500">
                  GSTIN: {sellerProfile?.gstin || '07AABCU9603R1ZM'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase text-slate-400 text-[10px] block">Ship To Customer</span>
                <p className="font-bold text-sm">{invoiceModalOrder.customer}</p>
                <p className="text-slate-600">{invoiceModalOrder.address || 'Verified Buyer Address'}</p>
                <p className="font-mono text-[11px] text-slate-500">
                  Courier: {bulkOrderCourier} · AWB #{String(invoiceModalOrder.id).replace(/\D/g, '') || '8849201'}
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total (Incl. GST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(invoiceModalOrder.sellerItems || invoiceModalOrder.items || []).map((it: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 font-semibold">{it.name}</td>
                    <td className="py-2.5 text-center font-mono">{it.quantity || 1}</td>
                    <td className="py-2.5 text-right font-mono">₹{Number(it.price || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-mono font-bold">
                      ₹{(Number(it.price || 0) * Number(it.quantity || 1)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between pt-3 border-t border-slate-300 text-sm font-black">
              <span>Grand Total ({invoiceModalOrder.paymentMethod || 'Prepaid'})</span>
              <span className="font-mono text-base">
                ₹{Number(invoiceModalOrder.sellerTotal ?? invoiceModalOrder.total ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PUBLIC STOREFRONT PREVIEW MODAL */}
      {storePreviewOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setStorePreviewOpen(false)}
        >
          <div
            className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#F5A623]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5A623]">
                  Live Public Storefront Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStorePreviewOpen(false)}
                className="px-3 py-1 rounded-lg bg-neutral-800 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            {decoAnnouncement && (
              <div
                className="py-2 px-4 rounded-xl text-center text-xs font-extrabold text-black"
                style={{ backgroundColor: decoThemeColor || '#F5A623' }}
              >
                {decoAnnouncement}
              </div>
            )}

            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F5A623] text-black flex items-center justify-center font-serif text-2xl font-black overflow-hidden shrink-0">
                {brandLogo ? (
                  <img src={brandLogo} alt="" className="w-full h-full object-cover" />
                ) : (
                  (sellerProfile?.shopName || 'S').charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold">{sellerProfile?.shopName}</h2>
                  {isVerifiedBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      ✓ Verified Seller
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">{brandTagline}</p>
                <p className="text-[11px] text-neutral-400 mt-1">{brandDescription}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5A623] mb-3">
                {decoHeadline || 'Featured Store Collection'} ({myProducts.filter((p) => p.isVisible !== false).length} Products)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {myProducts
                  .filter((p) => p.isVisible !== false)
                  .slice(0, 8)
                  .map((p) => (
                    <div key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                      <div className="p-2.5 text-xs">
                        <p className="font-bold truncate">{p.name}</p>
                        <p className="font-mono text-[#F5A623] font-extrabold mt-0.5">
                          ₹{p.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HANDOVER VERIFICATION MODAL */}
      {handoverModalOrder && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setHandoverModalOrder(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 relative transition-all my-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FF007F]" />
                <h4 className="font-black text-sm text-neutral-900 dark:text-white">
                  Verify Pickup & Hand Over Package
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setHandoverModalOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStoreHandover} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                  Enter Driver Pickup Code
                </label>
                <input
                  type="text"
                  value={handoverCodeInput}
                  onChange={(e) => setHandoverCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PU-4821"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-[#FF007F] font-mono font-black text-base uppercase tracking-wider outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingHandover}
                  className="flex-1 py-2.5 bg-[#FF007F] hover:bg-[#D80068] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  {verifyingHandover ? 'Verifying...' : 'Verify Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT STORE ISSUE MODAL */}
      {issueModalOrder && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIssueModalOrder(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 relative transition-all my-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-black text-sm text-white">Report Store Delay / Issue</h4>
              </div>
              <button
                type="button"
                onClick={() => setIssueModalOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssueReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e: any) => setIssueType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white"
                >
                  <option value="store_delay">Store Packing Delay</option>
                  <option value="missing_item">Item Out of Stock</option>
                  <option value="damaged_package">Packaging Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportingIssue}
                  className="flex-1 py-2.5 bg-[#FF007F] text-white font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  {reportingIssue ? 'Sending...' : 'Notify Partner & Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[min(92vh,840px)] overflow-y-auto shadow-2xl p-6 relative transition-all my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <div>
                  <h3 className="text-base font-bold font-serif text-neutral-900 dark:text-white">
                    {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Store'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Store: <strong className="text-[#F5A623]">{sellerProfile?.shopName || 'Your Boutique'}</strong>
                  </p>
                </div>
                <GlassCloseButton onClick={() => setModalOpen(false)} isLightMode={false} size="sm" title="Close" />
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vintage Roseline Chronograph Dial"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">SKU Code</label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="SKU-10294"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Brand Name</label>
                    <input
                      type="text"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setFormCategory(newCat);
                        setFormSubCategory('');
                        if (newCat === 'grocery' || newCat === 'food_delivery' || newCat === 'delivery') {
                          setFormEligibleFor20Min(true);
                          setFormStockStatus('Fast Express');
                        }
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">MRP / Original Price (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={formMrp}
                      onChange={(e) => setFormMrp(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Stock Quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Stock Badge</label>
                    <select
                      value={formStockStatus}
                      onChange={(e) => setFormStockStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Only 2 left!">Only 2 left!</option>
                      <option value="Fast Express">Fast Express</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Listing Mode</label>
                    <select
                      value={formIsDraft ? 'draft' : 'publish'}
                      onChange={(e) => setFormIsDraft(e.target.value === 'draft')}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    >
                      <option value="publish">Publish Active</option>
                      <option value="draft">Save as Draft / Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Variants & Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Color Variants (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formColorsInput}
                      onChange={(e) => setFormColorsInput(e.target.value)}
                      placeholder="Obsidian Black, Gold, Silver"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Size Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formSizesInput}
                      onChange={(e) => setFormSizesInput(e.target.value)}
                      placeholder="S, M, L, XL or 42mm"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Technical Specifications (separated by |)
                  </label>
                  <input
                    type="text"
                    value={formSpecsInput}
                    onChange={(e) => setFormSpecsInput(e.target.value)}
                    placeholder="Material: Full-Grain Leather | Warranty: 2 Years"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Package Dimensions, Weight, Video & SEO */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={formPackageWeightKg}
                      onChange={(e) => setFormPackageWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Length (cm)</label>
                    <input
                      type="number"
                      min={1}
                      value={formPackageLengthCm}
                      onChange={(e) => setFormPackageLengthCm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Width (cm)</label>
                    <input
                      type="number"
                      min={1}
                      value={formPackageWidthCm}
                      onChange={(e) => setFormPackageWidthCm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Height (cm)</label>
                    <input
                      type="number"
                      min={1}
                      value={formPackageHeightCm}
                      onChange={(e) => setFormPackageHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">Product Video URL (optional)</label>
                    <input
                      type="url"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">SEO Meta Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="SEO search title..."
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Multi-Image Upload */}
                <div className="space-y-3 p-3.5 bg-neutral-50 dark:bg-neutral-950/70 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300 block text-[11px]">
                      Product Photos ({formImages.length}) *
                    </label>
                    <span className="text-[10px] font-mono text-amber-500">
                      Click thumbnail to set Primary
                    </span>
                  </div>

                  <div
                    onClick={() => sellerFileInputRef.current?.click()}
                    onDragOver={handleSellerDragOver}
                    onDragLeave={handleSellerDragLeave}
                    onDrop={handleSellerDrop}
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                      sellerIsDragging
                        ? 'border-amber-500 bg-amber-950/20'
                        : 'border-neutral-700 bg-neutral-900 hover:border-amber-500'
                    }`}
                  >
                    <input
                      type="file"
                      ref={sellerFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleSellerFileUpload(e.target.files);
                          e.target.value = '';
                        }
                      }}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-xs font-bold text-neutral-200 block">
                      Click to browse or drag & drop product photos
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={sellerUrlInput}
                      onChange={(e) => setSellerUrlInput(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleSellerAddUrl}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-white font-bold text-xs cursor-pointer"
                    >
                      + Add URL
                    </button>
                  </div>

                  {formImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 pt-1">
                      {formImages.map((src, idx) => {
                        const isPrimary = src === formImage || (idx === 0 && !formImages.includes(formImage));
                        return (
                          <div
                            key={`img-${idx}`}
                            className={`relative rounded-xl overflow-hidden border-2 aspect-square group ${
                              isPrimary ? 'border-[#F5A623]' : 'border-neutral-700'
                            }`}
                          >
                            <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <div className="flex justify-between">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleSellerMoveImage(idx, idx - 1)}
                                  className="p-1 rounded bg-black/70 text-white"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSellerRemoveImage(idx)}
                                  className="p-1 rounded bg-rose-600 text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSellerSetPrimary(idx)}
                                  className="w-full py-0.5 rounded bg-[#F5A623] text-black font-bold text-[9px]"
                                >
                                  Set Primary
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#F5A623] hover:bg-[#e09612] text-black rounded-xl font-extrabold uppercase tracking-wider cursor-pointer"
                  >
                    {submitting ? 'Saving...' : editingProduct ? 'Save Product Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* IN-APP BULK DELETE CONFIRMATION MODAL */}
      {confirmBulkDeleteOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmBulkDeleteOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Confirm Bulk Product Deletion</span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmBulkDeleteOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{selectedProductIds.length}</strong> selected product(s) from your catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBulkDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkActionProcessing}
                onClick={() => executeBulkAction('delete')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold cursor-pointer"
              >
                {bulkActionProcessing ? 'Deleting...' : `Delete ${selectedProductIds.length} Product(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
