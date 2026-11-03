import { useState } from 'react';
import { Bell, ShieldAlert, Tag, Truck, Check, Trash2, ArrowRight, Wallet, MessageSquare, Package, CheckCheck } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate?: (view: string) => void;
}

export default function Notifications({ notifications: initialNotifications, showToast, onNavigate }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'orders' | 'offers' | 'wallet' | 'messages'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const getCategory = (n: Notification): 'orders' | 'offers' | 'wallet' | 'messages' => {
    const text = (n.title + ' ' + (n.description || n.message || '') + ' ' + n.type).toLowerCase();
    if (text.includes('wallet') || text.includes('credit') || text.includes('balance') || text.includes('cash')) {
      return 'wallet';
    }
    if (text.includes('coupon') || text.includes('offer') || text.includes('discount') || text.includes('promo') || n.type === 'promo' || n.type === 'promotion') {
      return 'offers';
    }
    if (text.includes('message') || text.includes('chat') || text.includes('messenger') || n.type === 'message') {
      return 'messages';
    }
    return 'orders'; // Default/shipping/orders
  };

  const getTargetView = (n: Notification): string => {
    const cat = getCategory(n);
    if (cat === 'orders') return 'orders';
    if (cat === 'offers') return 'profile';
    if (cat === 'wallet') return 'profile';
    if (cat === 'messages') return 'messenger';
    return 'profile';
  };

  const getNotificationIcon = (cat: 'orders' | 'offers' | 'wallet' | 'messages') => {
    switch (cat) {
      case 'orders':
        return <Package className="w-5 h-5 text-[#F5A623]" />;
      case 'offers':
        return <Tag className="w-5 h-5 text-[#F5A623]" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-[#F5A623]" />;
      case 'messages':
        return <MessageSquare className="w-5 h-5 text-[#F5A623]" />;
    }
  };

  const handleMarkRead = (id: string | number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isUnread: false, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isUnread: false, isRead: true })));
    showToast('All notifications marked as read.', 'success');
  };

  const handleClearAlert = (id: string | number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    showToast('Notification removed.', 'info');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return getCategory(n) === activeFilter;
  });

  const displayedNotifications = filteredNotifications.slice(0, visibleCount);

  return (
    <div id="notifications-root" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#0F1A3C] dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F5A623]/15 text-[#F5A623]">
              <Bell className="w-6 h-6" />
            </div>
            My Notifications
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Stay updated with real-time order tracks, atelier coupon hours, and wallet activities.
          </p>
        </div>

        {notifications.some(n => n.isUnread) && (
          <button
            id="mark-all-read-btn"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-[#F5A623] hover:text-[#d48c18] hover:underline cursor-pointer transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'all', label: 'All' },
          { id: 'orders', label: 'Orders' },
          { id: 'offers', label: 'Offers' },
          { id: 'wallet', label: 'Wallet' },
          { id: 'messages', label: 'Messages' },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0F1A3C] text-[#F5A623] shadow-md border-b-2 border-solid border-[#F5A623]'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-[#0F1A3C] dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'all' && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[#F5A623]/20 text-[#F5A623] font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {displayedNotifications.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-solid border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center shadow-sm my-6">
          <div className="w-16 h-16 rounded-full bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0F1A3C] dark:text-white mb-1">
            No New Notifications
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            You do not have any {activeFilter !== 'all' ? activeFilter : ''} notifications right now. Check back later for real-time dispatch and exclusive offer updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4" id="notifications-list-container">
          {displayedNotifications.map((n) => {
            const cat = getCategory(n);
            const isUnread = n.isUnread ?? !n.isRead;

            return (
              <div
                key={n.id}
                id={`notif-${n.id}`}
                onClick={() => {
                  handleMarkRead(n.id);
                  onNavigate?.(getTargetView(n));
                }}
                className={`p-5 rounded-2xl border border-solid transition-all duration-300 flex items-start gap-4 cursor-pointer relative group ${
                  isUnread
                    ? 'bg-[#FFFDF7] dark:bg-[#12192e] border-l-4 border-l-[#F5A623] border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-[#F5A623]/50 shadow-xs'
                }`}
              >
                {/* Gold Circle Icon */}
                <div className="w-11 h-11 rounded-full bg-[#F5A623]/15 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {getNotificationIcon(cat)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className={`text-sm leading-snug ${isUnread ? 'font-black text-[#0F1A3C] dark:text-white' : 'font-bold text-neutral-700 dark:text-neutral-300'}`}>
                      {n.title}
                      {isUnread && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#F5A623] text-[#0F1A3C]">
                          New
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono font-medium shrink-0">
                      {n.timestamp || 'Today'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                    {n.description || n.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                        onNavigate?.(getTargetView(n));
                      }}
                      className="inline-flex items-center gap-1.5 text-[#F5A623] hover:text-[#d48c18] font-black hover:underline cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer text-[11px]"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark read
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAlert(n.id);
                      }}
                      className="inline-flex items-center gap-1 text-neutral-400 hover:text-rose-500 cursor-pointer text-[11px] ml-auto"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {filteredNotifications.length > visibleCount && (
        <div className="text-center pt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="px-6 py-2.5 rounded-xl border-2 border-solid border-[#F5A623] text-[#0F1A3C] dark:text-white font-black text-xs uppercase tracking-wider hover:bg-[#F5A623] hover:text-[#0F1A3C] transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
          >
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
}

