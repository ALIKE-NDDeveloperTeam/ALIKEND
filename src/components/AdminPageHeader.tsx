import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { exportDataToExcel } from '../utils/exportToExcel';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  dataToExport?: Record<string, any>[];
  exportFilename: string;
  onSync?: () => void;
  isSyncing?: boolean;
  extraAction?: React.ReactNode;
}

export const AdminPageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle = 'Root Administrator Console · alikendshop database',
  dataToExport = [],
  exportFilename,
  onSync,
  isSyncing = false,
  extraAction,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white capitalize">{title}</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Universal Excel Export Button */}
        <button
          type="button"
          onClick={() => exportDataToExcel(dataToExport, exportFilename)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer border border-emerald-500"
          title={`Export ${title} to Excel (.xlsx)`}
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>

        {/* Sync DB Button */}
        {onSync && (
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
        )}

        {extraAction}
      </div>
    </div>
  );
};

export default AdminPageHeader;
