import React from 'react';
import { Product } from '../adminTypes';
import AdminFlashSaleManager from '../../components/AdminFlashSaleManager';

export interface FlashSaleManagementProps {
  products: Product[];
  onProductsRefresh?: () => void;
  onFlashSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  isSuperAdmin?: boolean;
}

export default function FlashSaleManagement({
  products,
  onProductsRefresh,
  onFlashSuccess,
  onError,
  isSuperAdmin,
}: FlashSaleManagementProps) {
  return (
    <AdminFlashSaleManager
      products={products}
      onProductsRefresh={onProductsRefresh}
      onFlashSuccess={onFlashSuccess}
      onError={onError}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
