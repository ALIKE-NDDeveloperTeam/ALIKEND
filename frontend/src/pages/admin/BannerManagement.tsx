import React from "react";
import { Banner } from "../adminTypes";
import AdminBannerManager from "../../components/AdminBannerManager";

export interface BannerManagementProps {
  banners: Banner[];
  onBannersChange: (banners: Banner[]) => void;
  onFlashSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  isSuperAdmin: boolean;
}

export default function BannerManagement({
  banners,
  onBannersChange,
  onFlashSuccess,
  onError,
  isSuperAdmin,
}: BannerManagementProps) {
  return (
    <AdminBannerManager
      banners={banners}
      onBannersChange={onBannersChange}
      onFlashSuccess={onFlashSuccess}
      onError={onError}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
