import { useState, FormEvent } from 'react';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Award,
  Lock,
  Edit2,
  Save,
  X,
  RefreshCw,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SellerProfile } from '../../types';
import { sellerApi } from '../../services/sellerApi';

interface StoreProfileTabProps {
  sellerProfile: SellerProfile | null;
  onProfileUpdate?: (updated: SellerProfile) => void;
  onNavigate?: (view: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function StoreProfileTab({
  sellerProfile,
  onProfileUpdate,
  showToast,
}: StoreProfileTabProps) {
  const shopName = sellerProfile?.shopName || 'Maison Argent Storefront';
  const ownerName = sellerProfile?.ownerName || 'Sara Whitfield';
  const email = sellerProfile?.email || 'sara@example.com';
  const phone = sellerProfile?.mobileNumber || '+91 98765 43210';
  const address =
    sellerProfile?.shopAddress ||
    sellerProfile?.businessAddress ||
    'Block B, Inner Circle, Connaught Place, New Delhi 110001';
  const category = sellerProfile?.category || 'Luxury & Lifestyle';
  const pan = sellerProfile?.panNumber || '';
  const gstin = sellerProfile?.gstin || '';
  const bankHolder = sellerProfile?.bankAccountHolderName || ownerName;
  const bankName = sellerProfile?.bankName || '';
  const bankIfsc = sellerProfile?.bankIFSC || '';
  const bankAccount = sellerProfile?.bankAccountNumber || '';

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editShopName, setEditShopName] = useState(shopName);
  const [editOwnerName, setEditOwnerName] = useState(ownerName);
  const [editMobile, setEditMobile] = useState(phone);
  const [editCategory, setEditCategory] = useState(category);
  const [editAddress, setEditAddress] = useState(address);
  const [editPan, setEditPan] = useState(pan);
  const [editGstin, setEditGstin] = useState(gstin);
  const [editBankHolder, setEditBankHolder] = useState(bankHolder);
  const [editBankName, setEditBankName] = useState(bankName);
  const [editBankIfsc, setEditBankIfsc] = useState(bankIfsc);
  const [editBankAccount, setEditBankAccount] = useState(bankAccount);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Email Verification State
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const handleOpenEdit = () => {
    setEditShopName(shopName);
    setEditOwnerName(ownerName);
    setEditMobile(phone);
    setEditCategory(category);
    setEditAddress(address);
    setEditPan(pan);
    setEditGstin(gstin);
    setEditBankHolder(bankHolder);
    setEditBankName(bankName);
    setEditBankIfsc(bankIfsc);
    setEditBankAccount(bankAccount);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await sellerApi.updateProfile({
        shopName: editShopName.trim(),
        ownerName: editOwnerName.trim(),
        mobileNumber: editMobile.trim(),
        category: editCategory.trim(),
        businessAddress: editAddress.trim(),
        panNumber: editPan.trim().toUpperCase(),
        gstin: editGstin.trim().toUpperCase(),
        bankAccountHolderName: editBankHolder.trim(),
        bankName: editBankName.trim(),
        bankIFSC: editBankIfsc.trim().toUpperCase(),
        bankAccountNumber: editBankAccount.trim(),
      });
      if (res?.seller && onProfileUpdate) {
        onProfileUpdate(res.seller);
      }
      setIsEditing(false);
      showToast?.('Store profile and KYC details updated!', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to update store profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast?.('Please enter current and new passwords.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showToast?.('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast?.('New password and confirmation do not match.', 'error');
      return;
    }
    try {
      setChangingPassword(true);
      const res = await sellerApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast?.(res.message || 'Seller password updated successfully!', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to update password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendVerifyOtp = async () => {
    try {
      setVerifyingEmail(true);
      const res = await sellerApi.sendVerificationOtp();
      setOtpRequested(true);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      showToast?.(res.message || 'Verification code sent to your email.', 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to send verification code', 'error');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyEmailCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;
    try {
      setVerifyingEmail(true);
      const res = await sellerApi.verifyEmail(otpInput.trim());
      if (res?.seller && onProfileUpdate) {
        onProfileUpdate(res.seller);
      }
      setOtpRequested(false);
      setOtpInput('');
      showToast?.(res.message || 'Email verified successfully!', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Email verification failed', 'error');
    } finally {
      setVerifyingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-3xl font-black shadow-md shrink-0">
              {shopName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">{shopName}</h2>
                {sellerProfile?.status === 'approved' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Approved Merchant
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Status: {(sellerProfile?.status || 'pending').toUpperCase()}
                  </span>
                )}
                {sellerProfile?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                    <CheckCircle2 className="w-3 h-3" /> Email Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                    <AlertCircle className="w-3 h-3" /> Email Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Alike-ND Dedicated Seller Account • Category: {category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Store & KYC</span>
              </button>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              ID: {sellerProfile?._id || 'sel_1'}
            </span>
          </div>
        </div>

        {/* Email Ownership Verification Box if unverified */}
        {sellerProfile && !sellerProfile.emailVerified && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>Verify Email Ownership ({sellerProfile.email})</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                Verify your registered seller email address to unlock sensitive merchant features and faster KYC approval.
              </p>
              {devOtpHint && (
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Verification OTP: {devOtpHint}
                </p>
              )}
            </div>
            {!otpRequested ? (
              <button
                type="button"
                disabled={verifyingEmail}
                onClick={handleSendVerifyOtp}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50"
              >
                {verifyingEmail ? 'Sending...' : 'Send Verification OTP'}
              </button>
            ) : (
              <form onSubmit={handleVerifyEmailCode} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit OTP"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-amber-500/40 text-xs font-mono font-bold w-28 text-neutral-900 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={verifyingEmail}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase cursor-pointer"
                >
                  Verify
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Edit Store & KYC Form Modal / Drawer */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 bg-white dark:bg-neutral-900 border-2 border-[#FF007F]/40 rounded-2xl shadow-lg space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#FF007F]" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Update Store Profile, KYC & Payout Bank Details
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={editShopName}
                onChange={(e) => setEditShopName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Full Name (Owner) *</label>
              <input
                type="text"
                required
                value={editOwnerName}
                onChange={(e) => setEditOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Store Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="e.g. Fashion, Electronics, Grocery, Luxury"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Registered Business Address</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">PAN Number</label>
              <input
                type="text"
                maxLength={10}
                value={editPan}
                onChange={(e) => setEditPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">GSTIN</label>
              <input
                type="text"
                maxLength={15}
                value={editGstin}
                onChange={(e) => setEditGstin(e.target.value.toUpperCase())}
                placeholder="07ABCDE1234F1Z5"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Bank Name</label>
              <input
                type="text"
                value={editBankName}
                onChange={(e) => setEditBankName(e.target.value)}
                placeholder="HDFC Bank"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={editBankHolder}
                onChange={(e) => setEditBankHolder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Bank IFSC Code</label>
              <input
                type="text"
                maxLength={11}
                value={editBankIfsc}
                onChange={(e) => setEditBankIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0000240"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={editBankAccount}
                onChange={(e) => setEditBankAccount(e.target.value)}
                placeholder="50100234567890"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 rounded-xl bg-[#FF007F] hover:bg-[#D80068] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store & Contact Information */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <Store className="w-4 h-4 text-[#FF007F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Store & Ownership Profile
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-400">Storefront Name:</span>
              <strong className="text-neutral-900 dark:text-white font-medium">{shopName}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-400">Merchant Owner:</span>
              <strong className="text-neutral-900 dark:text-white font-medium">{ownerName}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-neutral-400" /> Email:
              </span>
              <strong className="text-neutral-900 dark:text-white font-mono">{email}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <span className="text-neutral-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-neutral-400" /> Phone:
              </span>
              <strong className="text-neutral-900 dark:text-white font-mono">{phone}</strong>
            </div>

            <div className="py-1">
              <span className="text-neutral-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-neutral-400" /> Registered Business Address:
              </span>
              <p className="text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px]">
                {address}
              </p>
            </div>
          </div>
        </div>

        {/* KYC & Tax Compliance */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Indian KYC & Tax Verification
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <div>
                <span className="text-neutral-400 block text-[11px]">Permanent Account Number (PAN)</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {pan || 'Not Provided Yet'}
                </span>
              </div>
              {pan ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" /> Recorded
                </span>
              ) : (
                <span className="text-[10px] text-amber-500 font-bold">Pending</span>
              )}
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
              <div>
                <span className="text-neutral-400 block text-[11px]">Goods and Services Tax ID (GSTIN)</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {gstin || 'Not Provided Yet'}
                </span>
              </div>
              {gstin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="text-[10px] text-amber-500 font-bold">Optional / Pending</span>
              )}
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 font-bold text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>Payout Bank Account Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px] font-sans">Bank:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{bankName || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-sans">IFSC:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{bankIfsc || 'Not set'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-400 block text-[10px] font-sans">Account (Masked):</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {bankAccount ? `•••• •••• ${bankAccount.slice(-4)}` : 'Not configured'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Security & Password Update */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Seller Account Password & Security
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-white flex items-center gap-1"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">
                Current Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Strong new password"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {changingPassword ? 'Updating Password...' : 'Update Seller Password'}
            </button>
          </form>
        </div>

        {/* Account Role & Granular Permissions Card */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <Lock className="w-4 h-4 text-[#FF007F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Seller Account Role & Permissions
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Your seller account operates independently from customer accounts. Below are your active store capabilities managed by Marketplace Administration:
            </p>
            {[
              {
                label: 'Create & Publish New Products',
                enabled:
                  sellerProfile?.status === 'approved' &&
                  sellerProfile?.permissions?.canAddProducts !== false,
              },
              {
                label: 'Edit & Manage Existing Inventory',
                enabled:
                  sellerProfile?.status === 'approved' &&
                  sellerProfile?.permissions?.canEditProducts !== false,
              },
              {
                label: 'Accept & Dispatch Customer Orders',
                enabled:
                  sellerProfile?.status === 'approved' &&
                  sellerProfile?.permissions?.canManageOrders !== false,
              },
              {
                label: 'Request Wallet & Bank Payouts',
                enabled:
                  sellerProfile?.status === 'approved' &&
                  sellerProfile?.permissions?.canWithdrawPayouts !== false,
              },
            ].map((perm, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
              >
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{perm.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    perm.enabled
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  }`}
                >
                  {perm.enabled ? 'Enabled' : 'Restricted'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA & Marketplace Policy Badges */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Merchant Service Level Agreement (SLA)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 20-Min Quick Dispatch
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Store orders marked ready within designated prep window for instant rider pickup.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> OTP Handover Security
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Every package handover requires driver verification code to protect inventory.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Transparent 5% Fee
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              No hidden listing fees. Only 5% deducted on fulfilled orders with daily payout cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
