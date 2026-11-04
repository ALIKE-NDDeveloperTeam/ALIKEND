import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  Search,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Upload,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Wallet,
  Building2,
  RefreshCw,
  X,
  Check,
  Filter
} from 'lucide-react';

export interface BankInstitutionItem {
  institutionId: string;
  officialName: string;
  aliases: string[];
  country: string;
  countriesOfOperation: string[];
  region: string;
  category: string;
  isTraditionalBank: boolean;
  officialWebsite: string;
  supportedCurrencies: string[];
  swiftBicCode?: string;
  routingCodeType?: string;
  verificationSource: string;
  verificationSourceUrl?: string;
  regulatoryStatus: string;
  verified: boolean;
  payoutEligible: boolean;
  payoutSupportedCountries: string[];
  supportedPayoutRails: string[];
  active: boolean;
  lastVerifiedDate: string;
  adminNotes?: string;
}

interface DirectoryStats {
  totalUnique: number;
  verifiedCount: number;
  unverifiedCount?: number;
  payoutEligibleCount: number;
  activeCount?: number;
  inactiveCount?: number;
  traditionalBankCount: number;
  mfsAndPspCount: number;
  totalCountriesCovered?: number;
  countries: string[];
  regions: string[];
  categories: string[];
}

/* ============================================================================
 * 1. Seller & Admin Bank Account Selector (Paginated, Filterable, 500+ Ready)
 * ========================================================================== */

export const SellerBankDirectorySelector: React.FC<{
  selectedInstitutionId?: string;
  selectedBankName?: string;
  onSelectInstitution: (inst: BankInstitutionItem) => void;
}> = ({ selectedInstitutionId, selectedBankName, onSelectInstitution }) => {
  const [items, setItems] = useState<BankInstitutionItem[]>([]);
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const [institutionType, setInstitutionType] = useState<'all' | 'traditional_banks' | 'mfs_and_psp'>('all');
  const [payoutEligibleOnly, setPayoutEligibleOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        country,
        institutionType,
        payoutEligibleOnly: String(payoutEligibleOnly),
        page: String(page),
        limit: '12'
      });
      const res = await fetch(`/api/sellers/bank-directory?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.items) {
        setItems(json.items);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalMatches(json.pagination?.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch (e) {
      console.error('Failed to load bank directory:', e);
    } finally {
      setLoading(false);
    }
  }, [q, country, institutionType, payoutEligibleOnly, page]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-4 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
              <Globe size={16} className="text-blue-600" />
              <span>Global Financial Institution & MFS Directory</span>
            </h4>
            {stats && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                {stats.totalUnique} Verified Global Records
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Search and select from {stats?.totalUnique || '500+'} verified banks ({stats?.traditionalBankCount || 550} traditional banks &amp; {stats?.mfsAndPspCount || 44} separate MFS / payment providers).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="px-3.5 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 text-[12px] font-semibold transition-colors self-start sm:self-center shrink-0"
        >
          {expanded ? 'Hide Directory Browser' : 'Browse / Search 500+ Banks & MFS'}
        </button>
      </div>

      {/* Currently Selected Institution Pill */}
      {selectedBankName && (
        <div className="p-3 rounded-lg bg-white border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-[12px] text-slate-500">Selected Institution: </span>
              <strong className="text-[13px] font-bold text-slate-900">{selectedBankName}</strong>
              {selectedInstitutionId && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Directory Match
                </span>
              )}
            </div>
          </div>
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0"
            >
              Change
            </button>
          )}
        </div>
      )}

      {expanded && (
        <div className="space-y-3 pt-1">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-5 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search bank name, alias (e.g. DBBL, SBI, bKash), country, currency..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">All Countries ({stats?.countries?.length || 60}+)</option>
                {(stats?.countries || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <select
                value={institutionType}
                onChange={(e) => {
                  setInstitutionType(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">All Categories (Banks + MFS/PSP)</option>
                <option value="traditional_banks">
                  Traditional & Digital Banks Only ({stats?.traditionalBankCount || 550})
                </option>
                <option value="mfs_and_psp">
                  MFS & Payment Providers Only ({stats?.mfsAndPspCount || 44})
                </option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <label className="inline-flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={payoutEligibleOnly}
                onChange={(e) => {
                  setPayoutEligibleOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-3.5 w-3.5 rounded text-blue-600"
              />
              <span>Show only Payout-Eligible institutions (hide non-payout regulators)</span>
            </label>
            <span className="text-slate-500">
              Showing <strong>{items.length}</strong> of <strong>{totalMatches}</strong> matching institutions
            </span>
          </div>

          {/* Paginated Results Grid */}
          {loading ? (
            <div className="p-6 text-center text-[13px] text-slate-500 bg-white rounded-lg border border-slate-200">
              Loading verified financial institutions...
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-slate-500 bg-white rounded-lg border border-slate-200">
              No financial institutions match your current filter. Try clearing the search or country filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto p-1">
              {items.map((inst) => {
                const isSelected =
                  selectedInstitutionId === inst.institutionId ||
                  (selectedBankName &&
                    selectedBankName.toLowerCase() === inst.officialName.toLowerCase());
                return (
                  <div
                    key={inst.institutionId}
                    className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[13px] font-bold text-slate-900 flex items-center flex-wrap gap-1.5">
                            <span>{inst.officialName}</span>
                            {inst.verified && (
                              <span
                                title={`Verified via ${inst.verificationSource}`}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                Verified
                              </span>
                            )}
                          </div>
                          {inst.aliases && inst.aliases.length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Also known as: {inst.aliases.join(', ')}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            inst.isTraditionalBank
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {inst.category}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                        <span>
                          <strong>Country:</strong> {inst.country}
                        </span>
                        <span>
                          <strong>Currency:</strong> {inst.supportedCurrencies.join(', ')}
                        </span>
                        {inst.officialWebsite && (
                          <a
                            href={inst.officialWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Website</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 truncate">
                        Source: {inst.verificationSource}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {inst.payoutEligible ? (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Rails: {inst.supportedPayoutRails?.slice(0, 2).join(', ') || 'Bank Transfer'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700">
                          {inst.regulatoryStatus} (Non-Payout)
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={!inst.payoutEligible || !inst.active}
                        onClick={() => {
                          onSelectInstitution(inst);
                          setExpanded(false);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          !inst.payoutEligible || !inst.active
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {!inst.payoutEligible
                          ? 'Directory Only'
                          : isSelected
                          ? 'Selected'
                          : 'Select Institution'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[12px]">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 font-semibold inline-flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <span className="text-slate-600 font-medium">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalMatches} records)
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 font-semibold inline-flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 2. Admin Global Bank Directory Management Screen (500+ Verified Records)
 * ========================================================================== */

export const AdminGlobalBankDirectoryManager: React.FC<{
  token?: string | null;
  mode: 'admin' | 'seller';
}> = ({ token, mode }) => {
  const [items, setItems] = useState<BankInstitutionItem[]>([]);
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Pagination
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');
  const [institutionType, setInstitutionType] = useState<'all' | 'traditional_banks' | 'mfs_and_psp'>('all');
  const [payoutEligibleOnly, setPayoutEligibleOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  // Add / Edit Modal State
  const [editingItem, setEditingItem] = useState<Partial<BankInstitutionItem> | null>(null);
  const [isNewModal, setIsNewModal] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  // Bulk CSV / JSON Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importContent, setImportContent] = useState('');
  const [importing, setImporting] = useState(false);

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const t =
      token ||
      localStorage.getItem('alikend_admin_token') ||
      sessionStorage.getItem('alikend_admin_token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token');
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  }, [token]);

  const fetchAdminDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        country,
        region,
        category,
        institutionType,
        payoutEligibleOnly: String(payoutEligibleOnly),
        verifiedOnly: String(verifiedOnly),
        page: String(page),
        limit: '25'
      });
      const endpoint =
        mode === 'admin'
          ? `/api/admin/central/bank-directory?${params.toString()}`
          : `/api/sellers/bank-directory?${params.toString()}`;
      const res = await fetch(endpoint, { headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.items) {
        setItems(json.items);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalMatches(json.pagination?.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch (e) {
      console.error('Failed to load bank directory:', e);
    } finally {
      setLoading(false);
    }
  }, [q, country, region, category, institutionType, payoutEligibleOnly, verifiedOnly, page, mode, authHeaders]);

  useEffect(() => {
    fetchAdminDirectory();
  }, [fetchAdminDirectory]);

  const handleQuickToggle = async (
    inst: BankInstitutionItem,
    field: 'verified' | 'payoutEligible' | 'active'
  ) => {
    if (mode !== 'admin') return;
    setActionMessage(null);
    try {
      const payload: Record<string, any> = {
        officialName: inst.officialName,
        country: inst.country,
        [field]: !inst[field]
      };
      if (field === 'verified') {
        payload.regulatoryStatus = !inst.verified ? 'Verified Licensed' : 'Under Review';
      }
      const res = await fetch(`/api/admin/central/bank-directory/${inst.institutionId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMessage({ type: 'error', text: json.error || 'Failed to update institution' });
        return;
      }
      setActionMessage({ type: 'success', text: json.message || 'Updated institution' });
      fetchAdminDirectory();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    }
  };

  const handleSaveInstitutionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || mode !== 'admin') return;
    setSavingItem(true);
    setActionMessage(null);
    try {
      const url = isNewModal
        ? '/api/admin/central/bank-directory'
        : `/api/admin/central/bank-directory/${editingItem.institutionId}`;
      const method = isNewModal ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(editingItem)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMessage({ type: 'error', text: json.error || 'Failed to save institution' });
        setSavingItem(false);
        return;
      }
      setActionMessage({ type: 'success', text: json.message || 'Institution saved' });
      setEditingItem(null);
      setIsNewModal(false);
      fetchAdminDirectory();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save institution' });
    } finally {
      setSavingItem(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContent.trim() || mode !== 'admin') return;
    setImporting(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/central/bank-directory/import', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          format: importFormat,
          content: importContent
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMessage({ type: 'error', text: json.error || 'Import failed' });
        setImporting(false);
        return;
      }
      setActionMessage({ type: 'success', text: json.message || 'Import complete' });
      setImportModalOpen(false);
      setImportContent('');
      fetchAdminDirectory();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Import error' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Real Directory Integrity & Governance Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50/80 border border-blue-200 text-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Deduplicated Official Register
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
              Directory Separate From Payout Rails
            </span>
          </div>
          <h3 className="text-[18px] font-bold text-slate-900 mt-1.5">
            Global Financial Institution &amp; Payment Provider Directory
          </h3>
          <p className="text-[12px] text-slate-600 mt-0.5 max-w-3xl">
            Contains {stats?.totalUnique || '590+'} unique real-world banks, central banks, mobile financial services (MFS), and payment providers across Bangladesh, South Asia, Asia-Pacific, Europe, North America, Middle East, Africa, Oceania, and Latin America. Aliases are stored on canonical records and never counted as duplicates.
          </p>
        </div>

        {mode === 'admin' && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsNewModal(true);
                setEditingItem({
                  officialName: '',
                  country: 'Bangladesh',
                  region: 'Bangladesh',
                  category: 'Commercial Bank',
                  officialWebsite: '',
                  supportedCurrencies: ['BDT'],
                  verificationSource: 'Bangladesh Bank Scheduled Banks List',
                  regulatoryStatus: 'Verified Licensed',
                  verified: true,
                  payoutEligible: false,
                  active: true,
                  aliases: []
                });
              }}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus size={15} />
              <span>Add Institution</span>
            </button>
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Upload size={15} />
              <span>Import CSV / JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Real-Time Summary Metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl border border-blue-200 border-l-4 border-l-blue-600 bg-blue-50/40">
            <div className="text-[11px] font-bold uppercase text-blue-800">
              Unique Institutions
            </div>
            <div className="text-[22px] font-bold text-slate-900 mt-1">{stats.totalUnique}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Min 500 Target Met
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50/40">
            <div className="text-[11px] font-bold uppercase text-emerald-800">
              Verified vs Unverified
            </div>
            <div className="text-[22px] font-bold text-emerald-700 mt-1">
              {stats.verifiedCount}{' '}
              <span className="text-[12px] font-medium text-slate-500">
                / {stats.unverifiedCount ?? stats.totalUnique - stats.verifiedCount} unverified
              </span>
            </div>
            <div className="text-[11px] text-emerald-800/80 font-medium mt-0.5">Central Bank Referenced</div>
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-200 border-l-4 border-l-indigo-600 bg-indigo-50/40">
            <div className="text-[11px] font-bold uppercase text-indigo-800">
              Payout-Eligible
            </div>
            <div className="text-[22px] font-bold text-indigo-700 mt-1">
              {stats.payoutEligibleCount}
            </div>
            <div className="text-[11px] text-indigo-800/80 font-medium mt-0.5">
              Enabled for Seller Payouts
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-teal-200 border-l-4 border-l-teal-600 bg-teal-50/40">
            <div className="text-[11px] font-bold uppercase text-teal-800">
              Traditional Banks
            </div>
            <div className="text-[22px] font-bold text-teal-900 mt-1">
              {stats.traditionalBankCount}
            </div>
            <div className="text-[11px] text-teal-800/80 font-medium mt-0.5">Commercial, Islamic &amp; State</div>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 border-l-4 border-l-purple-600 bg-purple-50/40">
            <div className="text-[11px] font-bold uppercase text-purple-800">
              MFS &amp; Payment Providers
            </div>
            <div className="text-[22px] font-bold text-purple-700 mt-1">
              {stats.mfsAndPspCount}
            </div>
            <div className="text-[11px] text-purple-800/80 font-medium mt-0.5">Categorized Separately</div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/40">
            <div className="text-[11px] font-bold uppercase text-amber-900">
              Countries Covered
            </div>
            <div className="text-[22px] font-bold text-amber-900 mt-1">
              {stats.countries?.length || 60}
            </div>
            <div className="text-[11px] text-amber-800 font-medium mt-0.5">All 9 Global Regions</div>
          </div>
        </div>
      )}

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-[13px] font-medium flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Search & Multi-Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search 500+ institutions by name, alias, currency, regulator..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900"
          >
            <option value="all">All Countries ({stats?.countries?.length || 60})</option>
            {(stats?.countries || []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900"
          >
            <option value="all">All Global Regions</option>
            {(stats?.regions || []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-900"
          >
            <option value="all">All Institution Categories</option>
            {(stats?.categories || []).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[12px]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
              {[
                { key: 'all', label: 'All Types' },
                { key: 'traditional_banks', label: 'Banks Only' },
                { key: 'mfs_and_psp', label: 'MFS & Payment Providers' }
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setInstitutionType(t.key as any);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    institutionType === t.key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={payoutEligibleOnly}
                onChange={(e) => {
                  setPayoutEligibleOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-3.5 w-3.5 rounded text-blue-600"
              />
              <span>Payout-Eligible Only</span>
            </label>

            <label className="inline-flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-3.5 w-3.5 rounded text-blue-600"
              />
              <span>Verified Only</span>
            </label>
          </div>

          <div className="text-slate-500 font-medium">
            Matching Records: <strong className="text-slate-900">{totalMatches}</strong>
          </div>
        </div>
      </div>

      {/* Paginated Directory Table */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Official Institution Name &amp; Aliases</th>
                <th className="py-3 px-3">Country &amp; Region</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Currency &amp; Rails</th>
                <th className="py-3 px-3">Verification Source</th>
                <th className="py-3 px-3">Payout Status</th>
                {mode === 'admin' && <th className="py-3 px-4 text-right">Admin Controls</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Loading Global Bank Directory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No financial institutions match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                items.map((inst) => (
                  <tr
                    key={inst.institutionId}
                    className={`hover:bg-slate-50/80 ${!inst.active ? 'opacity-50 bg-slate-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{inst.officialName}</span>
                        {inst.officialWebsite && (
                          <a
                            href={inst.officialWebsite}
                            target="_blank"
                            rel="noreferrer"
                            title={inst.officialWebsite}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      {inst.aliases && inst.aliases.length > 0 && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Aliases: {inst.aliases.join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{inst.country}</div>
                      <div className="text-[11px] text-slate-500">{inst.region}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          inst.category === 'Mobile Financial Service (MFS)' ||
                          inst.category === 'Payment Service Provider'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : inst.category === 'Central Bank / Regulator'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : inst.category === 'Islamic Bank'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : inst.category === 'State-Owned Commercial Bank' ||
                              inst.category === 'Specialized Bank'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {inst.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-[12px] text-slate-900">
                        {inst.supportedCurrencies.join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {inst.supportedPayoutRails?.join(', ') || inst.routingCodeType}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            inst.verified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {inst.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] truncate">
                        {inst.verificationSource}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {inst.payoutEligible && inst.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Check size={11} />
                          <span>Payout Eligible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Directory Only</span>
                        </span>
                      )}
                    </td>

                    {mode === 'admin' && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickToggle(inst, 'payoutEligible')}
                            disabled={inst.category === 'Central Bank / Regulator'}
                            title="Toggle Seller Payout Eligibility"
                            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                              inst.payoutEligible
                                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                            } disabled:opacity-40`}
                          >
                            {inst.payoutEligible ? 'Disable Payout' : 'Enable Payout'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickToggle(inst, 'verified')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                              inst.verified
                                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {inst.verified ? 'Unverify' : 'Verify'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickToggle(inst, 'active')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                              inst.active
                                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {inst.active ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsNewModal(false);
                              setEditingItem({ ...inst });
                            }}
                            className="p-1.5 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
                            title="Edit Institution Details"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
          <div className="text-slate-600">
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalMatches}{' '}
            filtered institutions • {stats?.totalUnique || 594} total unique in directory)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 font-semibold inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 font-semibold inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Institution Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-[16px] font-bold text-slate-900">
                {isNewModal ? 'Add Financial Institution to Global Directory' : `Edit ${editingItem.officialName}`}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInstitutionModal} className="space-y-3.5 text-[13px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.officialName || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, officialName: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.country || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, country: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <select
                    value={editingItem.region || 'Bangladesh'}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, region: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {(stats?.regions || [
                      'Bangladesh',
                      'South Asia',
                      'Asia-Pacific',
                      'United Kingdom & Europe',
                      'North America',
                      'Middle East',
                      'Africa',
                      'Latin America & South America',
                      'Oceania',
                      'Global Multi-Region'
                    ]).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editingItem.category || 'Commercial Bank'}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {(stats?.categories || [
                      'Commercial Bank',
                      'Islamic Bank',
                      'State-Owned / Development Bank',
                      'Central Bank / Regulator',
                      'Regional / Cooperative Bank',
                      'Digital / Neobank',
                      'Mobile Financial Service (MFS)',
                      'Payment Service Provider'
                    ]).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="text"
                    value={editingItem.officialWebsite || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, officialWebsite: e.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supported Currencies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(editingItem.supportedCurrencies || []).join(', ')}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        supportedCurrencies: e.target.value
                          .split(',')
                          .map((s) => s.trim().toUpperCase())
                          .filter(Boolean)
                      }))
                    }
                    placeholder="BDT, USD"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aliases / Historical Spellings (comma-separated, not counted as duplicates)
                  </label>
                  <input
                    type="text"
                    value={(editingItem.aliases || []).join(', ')}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        aliases: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      }))
                    }
                    placeholder="e.g. DBBL, Dutch-Bangla Bank PLC"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Verification Source / Central Bank Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.verificationSource || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, verificationSource: e.target.value }))
                    }
                    placeholder="e.g. Bangladesh Bank Scheduled Banks Register"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.verified)}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        verified: e.target.checked,
                        regulatoryStatus: e.target.checked ? 'Verified Licensed' : 'Under Review'
                      }))
                    }
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <span>Verified Regulatory Record</span>
                </label>

                <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.payoutEligible)}
                    disabled={editingItem.category === 'Central Bank / Regulator'}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, payoutEligible: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <span>Enable for Live Seller Payouts</span>
                </label>

                <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.active !== false}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <span>Active in Directory</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {savingItem ? 'Saving...' : isNewModal ? 'Add Institution' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV / JSON Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-[16px] font-bold text-slate-900">
                Bulk Import Bank Records (CSV or JSON)
              </h4>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-3.5 text-[13px]">
              <div className="flex items-center gap-3">
                <label className="font-semibold text-slate-700">Import Format:</label>
                <button
                  type="button"
                  onClick={() => setImportFormat('json')}
                  className={`px-3 py-1 rounded-md font-semibold ${
                    importFormat === 'json'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  JSON Array
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat('csv')}
                  className={`px-3 py-1 rounded-md font-semibold ${
                    importFormat === 'csv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  CSV Text
                </button>
              </div>

              <p className="text-[12px] text-slate-500">
                Duplicate records matching existing official names or aliases in the same country are automatically skipped. Imported records default to <strong>Directory Only (Non-Payout)</strong> unless explicitly enabled.
              </p>

              <textarea
                rows={7}
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                placeholder={
                  importFormat === 'json'
                    ? '[{"officialName": "Example Scheduled Bank", "country": "Bangladesh", "category": "Commercial Bank", "supportedCurrencies": ["BDT"], "officialWebsite": "https://example.com"}]'
                    : 'officialName,country,category,currency,officialWebsite\nExample Scheduled Bank,Bangladesh,Commercial Bank,BDT,https://example.com'
                }
                className="w-full p-3 rounded-lg border border-slate-300 font-mono text-[12px]"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {importing ? 'Importing & Deduplicating...' : 'Run Deduplicated Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
