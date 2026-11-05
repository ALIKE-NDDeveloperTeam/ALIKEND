import React from 'react';

interface AdminWebsiteToolbarProps {
  onNavigateToAdmin?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * AdminWebsiteToolbar - Removed as requested by user.
 * Renders null so it will not appear anywhere on screen.
 */
export const AdminWebsiteToolbar: React.FC<AdminWebsiteToolbarProps> = () => {
  return null;
};

export default AdminWebsiteToolbar;
