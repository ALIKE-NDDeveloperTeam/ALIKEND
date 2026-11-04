import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  HelpCircle,
  MessageSquare,
  Clock,
  Volume2,
  Bell,
  Tag,
  ShieldAlert,
  Users,
  Bot,
  Send,
  ArrowRightLeft,
  Monitor,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { SellerProfile } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export type ChatSettingsTabId =
  | 'user_management'
  | 'quick_reply'
  | 'auto_reply'
  | 'notification'
  | 'keyword_tag'
  | 'blacklist_keywords'
  | 'agent_status';

export interface CapacityAgentRow {
  id: string;
  email: string;
  accountName: string;
  capacity: string;
}

export interface QuickReplyCategoryGroup {
  id: string;
  categoryName: string;
  messages: {
    id: string;
    text: string;
  }[];
}

export interface AutoReplyFaqItem {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
}

export interface KeywordTagRow {
  id: string;
  keyword: string;
  response: string;
  preSale: boolean;
  postSale: boolean;
}

export interface AgentStatusRow {
  id: string;
  account: string;
  email: string;
  desktopOnline: boolean;
  mobileOnline: boolean;
  waitingCustomers: number;
  tenMrr: string;
}

export interface DarazChatSettingsManagerProps {
  theme?: 'light' | 'dark';
  initialTab?: ChatSettingsTabId;
  draftData?: Record<string, any>;
  onUpdateField?: (key: string, value: any) => void;
  sellerProfile?: SellerProfile | null;
<<<<<<< HEAD
  adminEmail?: string | any;
  onNavigateBreadcrumb?: (target: 'home' | 'setting' | any) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
=======
  onNavigateBreadcrumb?: (target: 'home' | 'setting') => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
}

const CHAT_TABS: { id: ChatSettingsTabId; label: string }[] = [
  { id: 'user_management', label: 'User Management' },
  { id: 'quick_reply', label: 'Quick Reply' },
  { id: 'auto_reply', label: 'Auto Reply' },
  { id: 'notification', label: 'Notification' },
  { id: 'keyword_tag', label: 'Keyword Tag' },
  { id: 'blacklist_keywords', label: 'Blacklist Keywords' },
  { id: 'agent_status', label: 'Agent Status' },
];

const QUICK_REPLY_CATEGORY_OPTIONS = [
  'Common Replies',
  'Greetings',
  'Products',
  'Orders',
  'Logistics',
  'After-sale Service',
];

const PREWRITTEN_TEMPLATE_LIBRARY: Record<string, string[]> = {
  'Common Replies': [
    'Thank you for reaching out to us! How may we assist you with your order today?',
    'If you have any questions about our products or sizing, please feel free to ask.',
    'We appreciate your patience. Let me check the details for you right away.',
  ],
  Greetings: [
    'Hello and welcome to our official store! All listed items are 100% authentic and ready to ship.',
    'Good day! Follow our store to unlock exclusive follower vouchers and flash deal alerts.',
  ],
  Products: [
    'Yes, this item is currently in stock and comes with official brand warranty.',
    'All product specifications and size charts are available in the product description section.',
  ],
  Orders: [
    'Your order has been confirmed and is currently being packed in our fulfillment hub.',
    'Please double-check your delivery address and phone number before courier handover.',
  ],
  Logistics: [
    'Your parcel has been handed over to our logistics partner. Tracking updates will appear shortly.',
    'Standard delivery takes 2–4 business days inside metro areas and 3–6 days nationwide.',
  ],
  'After-sale Service': [
    'If you received a damaged or incorrect item, please share a clear photo so we can resolve it immediately.',
    'You can initiate a hassle-free return within 7 days of delivery from your order details page.',
  ],
};

const TIME_SLOTS = [
  '00:00',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '12:00',
  '14:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:59',
];

export const DarazChatSettingsManager: React.FC<DarazChatSettingsManagerProps> = ({
  theme = 'light',
  initialTab = 'user_management',
  draftData,
  onUpdateField,
  sellerProfile,
  onNavigateBreadcrumb,
  showToast,
}) => {
  const isDark = theme === 'dark';

  const ownerEmail = sellerProfile?.email || 'alikend.shop@gmail.com';
  const ownerPhoneTail =
    String(sellerProfile?.mobileNumber || sellerProfile?.phone || '824')
      .replace(/\D/g, '')
      .slice(-3) || '824';
  const defaultMaskedAccount = `*******${ownerPhoneTail}`;

  // Active Sub-Navigation Tab
  const [activeTab, setActiveTab] = useState<ChatSettingsTabId>(initialTab);

  // =========================================================================
  // TAB 1 STATE: USER MANAGEMENT (General & Message Allocation)
  // =========================================================================
  const [weekdayStart, setWeekdayStart] = useState<string>(
    draftData?.weekdayStart || draftData?.workingHoursStart || '09:00'
  );
  const [weekdayEnd, setWeekdayEnd] = useState<string>(
    draftData?.weekdayEnd || draftData?.workingHoursEnd || '18:00'
  );
  const [weekendStart, setWeekendStart] = useState<string>(
    draftData?.weekendStart || '10:00'
  );
  const [weekendEnd, setWeekendEnd] = useState<string>(
    draftData?.weekendEnd || '18:00'
  );
  const [allowBuyerOffer, setAllowBuyerOffer] = useState<boolean>(
    draftData?.allowBuyerOffer !== undefined ? Boolean(draftData.allowBuyerOffer) : false
  );
  const [enableLisa, setEnableLisa] = useState<boolean>(
    draftData?.enableLisa !== undefined ? Boolean(draftData.enableLisa) : true
  );
  const [lisaPriority, setLisaPriority] = useState<'Live Agent Priority' | 'LISA Priority'>(
    draftData?.lisaPriority || 'Live Agent Priority'
  );
  const [assignToAdmin, setAssignToAdmin] = useState<boolean>(
    draftData?.assignToAdmin !== undefined ? Boolean(draftData.assignToAdmin) : true
  );
  const [capacitySearch, setCapacitySearch] = useState<string>('');
  const [capacityAgents, setCapacityAgents] = useState<CapacityAgentRow[]>(() =>
    Array.isArray(draftData?.capacityAgents) && draftData.capacityAgents.length > 0
      ? draftData.capacityAgents
      : [
          {
            id: 'cap_owner_1',
            email: ownerEmail,
            accountName: defaultMaskedAccount,
            capacity: '100% (Max 50 Active Chats)',
          },
        ]
  );
  const [addCapacityModalOpen, setAddCapacityModalOpen] = useState<boolean>(false);
  const [newCapEmail, setNewCapEmail] = useState<string>('');
  const [newCapName, setNewCapName] = useState<string>('');
  const [newCapLimit, setNewCapLimit] = useState<string>('100% (Max 50 Active Chats)');

  // =========================================================================
  // TAB 2 STATE: QUICK REPLY
  // =========================================================================
  const [keywordMatchingEnabled, setKeywordMatchingEnabled] = useState<boolean>(
    draftData?.keywordMatchingEnabled !== undefined
      ? Boolean(draftData.keywordMatchingEnabled)
      : true
  );
  const [quickReplyCategories, setQuickReplyCategories] = useState<QuickReplyCategoryGroup[]>(
    () =>
      Array.isArray(draftData?.quickReplyCategories) &&
      draftData.quickReplyCategories.length > 0
        ? draftData.quickReplyCategories
        : [
            {
              id: 'qrc_common',
              categoryName: 'Common Replies',
              messages: [
                {
                  id: 'qrm_1',
                  text: 'Thank you for reaching out to us! How may we help you today?',
                },
                {
                  id: 'qrm_2',
                  text: 'If you have any questions about the item, please feel free to ask.',
                },
              ],
            },
            {
              id: 'qrc_orders',
              categoryName: 'Orders',
              messages: [
                {
                  id: 'qrm_3',
                  text: 'Your order is confirmed and ready for dispatch from our warehouse.',
                },
              ],
            },
          ]
  );
  const [addCatDropdownOpen, setAddCatDropdownOpen] = useState<boolean>(false);
  const addCatRef = useRef<HTMLDivElement | null>(null);

  // Template Selector Modal State
  const [templateModalCategoryId, setTemplateModalCategoryId] = useState<string | null>(null);
  const [templateModalActiveGroup, setTemplateModalActiveGroup] =
    useState<string>('Common Replies');
  const [selectedPrewrittenTexts, setSelectedPrewrittenTexts] = useState<string[]>([]);

  // =========================================================================
  // TAB 3 STATE: AUTO REPLY (LISA, Welcome Message, Product Card FAQ, Order Card FAQ)
  // =========================================================================
  const [autoReplySubTab, setAutoReplySubTab] = useState<
    'lisa' | 'welcome_message' | 'product_faq' | 'order_faq'
  >('lisa');
  const [lisaAutoReplyEnabled, setLisaAutoReplyEnabled] = useState<boolean>(
    draftData?.lisaAutoReplyEnabled !== undefined ? Boolean(draftData.lisaAutoReplyEnabled) : true
  );
  const [welcomeEnabled, setWelcomeEnabled] = useState<boolean>(
    draftData?.welcomeEnabled !== undefined ? Boolean(draftData.welcomeEnabled) : true
  );
  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    draftData?.welcomeMessage ||
      'Hello! Welcome to our store. Feel free to browse our latest collection or ask us any questions!'
  );
  const [offlineEnabled, setOfflineEnabled] = useState<boolean>(
    draftData?.offlineEnabled !== undefined ? Boolean(draftData.offlineEnabled) : true
  );
  const [offlineMessage, setOfflineMessage] = useState<string>(
    draftData?.offlineMessage ||
      'Thank you for your message! Our agents are currently away outside working hours and will respond first thing in the morning.'
  );
  const [productFaqs, setProductFaqs] = useState<AutoReplyFaqItem[]>(() =>
    Array.isArray(draftData?.productFaqs) && draftData.productFaqs.length > 0
      ? draftData.productFaqs
      : [
          {
            id: 'pfaq_1',
            question: 'Is this product currently in stock?',
            answer: 'Yes! All items with an active "Buy Now" button are in stock and ready to ship.',
            enabled: true,
          },
          {
            id: 'pfaq_2',
            question: 'Is this 100% original / authentic?',
            answer: 'Yes, we guarantee 100% authentic merchandise with official invoice & warranty.',
            enabled: true,
          },
        ]
  );
  const [orderFaqs, setOrderFaqs] = useState<AutoReplyFaqItem[]>(() =>
    Array.isArray(draftData?.orderFaqs) && draftData.orderFaqs.length > 0
      ? draftData.orderFaqs
      : [
          {
            id: 'ofaq_1',
            question: 'When will my order be shipped?',
            answer: 'Orders placed before 4:00 PM are packed and handed over to the courier within 24 hours.',
            enabled: true,
          },
          {
            id: 'ofaq_2',
            question: 'How can I track my delivery?',
            answer: 'You can track live courier scans directly under My Orders > Track Package.',
            enabled: true,
          },
        ]
  );

  // =========================================================================
  // TAB 4 STATE: NOTIFICATION
  // =========================================================================
  const [ringtoneOn, setRingtoneOn] = useState<boolean>(
    draftData?.ringtoneOn !== undefined
      ? Boolean(draftData.ringtoneOn)
      : draftData?.soundAlert !== undefined
      ? Boolean(draftData.soundAlert)
      : true
  );
  const [strongAlertOn, setStrongAlertOn] = useState<boolean>(
    draftData?.strongAlertOn !== undefined
      ? Boolean(draftData.strongAlertOn)
      : draftData?.desktopPush !== undefined
      ? Boolean(draftData.desktopPush)
      : false
  );
  const [strongAlertTipOpen, setStrongAlertTipOpen] = useState<boolean>(false);

  // =========================================================================
  // TAB 5 STATE: KEYWORD TAG
  // =========================================================================
  const [keywordTags, setKeywordTags] = useState<KeywordTagRow[]>(() =>
    Array.isArray(draftData?.keywordTags) && draftData.keywordTags.length > 0
      ? draftData.keywordTags
      : [
          {
            id: 'kw_1',
            keyword: 'Become Follower',
            response:
              'Thank you for following our store! Enjoy your follower discount voucher on your next purchase.',
            preSale: true,
            postSale: false,
          },
          {
            id: 'kw_2',
            keyword: 'Delivery Time',
            response:
              'Inside metro areas delivery takes 24–48 hours, and nationwide delivery takes 3–5 days.',
            preSale: true,
            postSale: true,
          },
        ]
  );
  const [keywordModalOpen, setKeywordModalOpen] = useState<boolean>(false);
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [kwForm, setKwForm] = useState<{
    keyword: string;
    response: string;
    preSale: boolean;
    postSale: boolean;
  }>({
    keyword: '',
    response: '',
    preSale: true,
    postSale: false,
  });

  // =========================================================================
  // TAB 6 STATE: BLACKLIST KEYWORDS
  // =========================================================================
  const [blacklistKeywords, setBlacklistKeywords] = useState<string[]>(() =>
    Array.isArray(draftData?.blacklistKeywords)
      ? draftData.blacklistKeywords
      : ['spam link', 'external payment', 'whatsapp詐欺']
  );
  const [newBlacklistWord, setNewBlacklistWord] = useState<string>('');

  // =========================================================================
  // TAB 7 STATE: AGENT STATUS
  // =========================================================================
  const [agentStatusList, setAgentStatusList] = useState<AgentStatusRow[]>(() =>
    Array.isArray(draftData?.agentStatusList) && draftData.agentStatusList.length > 0
      ? draftData.agentStatusList
      : [
          {
            id: 'ag_1',
            account: defaultMaskedAccount,
            email: ownerEmail,
            desktopOnline: true,
            mobileOnline: false,
            waitingCustomers: 0,
            tenMrr: '98.5%',
          },
        ]
  );
  const [transferModalAgent, setTransferModalAgent] = useState<AgentStatusRow | null>(null);
  const [transferTargetEmail, setTransferTargetEmail] = useState<string>('');

  // =========================================================================
  // FEEDBACK MODAL STATE ("Send Feedback" button in top banner)
  // =========================================================================
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  // Saving & Toast state
  const [saving, setSaving] = useState<boolean>(false);
  const [bannerAlert, setBannerAlert] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Hydrate all 7 Chat Settings tabs from backend on mount
  useEffect(() => {
    if (draftData && Object.keys(draftData).length > 0) return;
    if (!sellerApi.getToken()) return;

    let cancelled = false;
    sellerApi
      .getChatSettings()
      .then((res) => {
        if (cancelled || !res?.chatSettings) return;
        const cs = res.chatSettings;
        if (cs.weekdayStart) setWeekdayStart(cs.weekdayStart);
        if (cs.weekdayEnd) setWeekdayEnd(cs.weekdayEnd);
        if (cs.weekendStart) setWeekendStart(cs.weekendStart);
        if (cs.weekendEnd) setWeekendEnd(cs.weekendEnd);
        if (cs.allowBuyerOffer !== undefined) setAllowBuyerOffer(Boolean(cs.allowBuyerOffer));
        if (cs.enableLisa !== undefined) setEnableLisa(Boolean(cs.enableLisa));
        if (cs.lisaPriority) setLisaPriority(cs.lisaPriority);
        if (cs.assignToAdmin !== undefined) setAssignToAdmin(Boolean(cs.assignToAdmin));
        if (Array.isArray(cs.capacityAgents) && cs.capacityAgents.length > 0) {
          setCapacityAgents(cs.capacityAgents);
        }
        if (cs.keywordMatchingEnabled !== undefined) {
          setKeywordMatchingEnabled(Boolean(cs.keywordMatchingEnabled));
        }
        if (Array.isArray(cs.quickReplyCategories) && cs.quickReplyCategories.length > 0) {
          setQuickReplyCategories(cs.quickReplyCategories);
        }
        if (cs.lisaAutoReplyEnabled !== undefined) {
          setLisaAutoReplyEnabled(Boolean(cs.lisaAutoReplyEnabled));
        }
        if (cs.welcomeEnabled !== undefined) setWelcomeEnabled(Boolean(cs.welcomeEnabled));
        if (cs.welcomeMessage) setWelcomeMessage(String(cs.welcomeMessage));
        if (cs.offlineEnabled !== undefined) setOfflineEnabled(Boolean(cs.offlineEnabled));
        if (cs.offlineMessage) setOfflineMessage(String(cs.offlineMessage));
        if (Array.isArray(cs.productFaqs) && cs.productFaqs.length > 0) {
          setProductFaqs(cs.productFaqs);
        }
        if (Array.isArray(cs.orderFaqs) && cs.orderFaqs.length > 0) {
          setOrderFaqs(cs.orderFaqs);
        }
        if (cs.ringtoneOn !== undefined) setRingtoneOn(Boolean(cs.ringtoneOn));
        else if (cs.soundAlert !== undefined) setRingtoneOn(Boolean(cs.soundAlert));
        if (cs.strongAlertOn !== undefined) setStrongAlertOn(Boolean(cs.strongAlertOn));
        else if (cs.desktopPush !== undefined) setStrongAlertOn(Boolean(cs.desktopPush));
        if (Array.isArray(cs.keywordTags) && cs.keywordTags.length > 0) {
          setKeywordTags(cs.keywordTags);
        }
        if (Array.isArray(cs.blacklistKeywords)) {
          setBlacklistKeywords(cs.blacklistKeywords);
        }
        if (Array.isArray(cs.agentStatusList) && cs.agentStatusList.length > 0) {
          setAgentStatusList(cs.agentStatusList);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (addCatRef.current && !addCatRef.current.contains(e.target as Node)) {
        setAddCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (showToast) showToast(text, type);
    if (type === 'success' || type === 'error') {
      setBannerAlert({ type, text });
      setTimeout(() => {
        setBannerAlert((prev) => (prev?.text === text ? null : prev));
      }, 4000);
    }
  };

  // Persist Chat Settings to Backend & Parent
  const persistChatSettings = async (
    overrides: Record<string, any> = {},
    message = 'Chat settings saved successfully.'
  ) => {
    const fullPayload = {
      weekdayStart,
      weekdayEnd,
      weekendStart,
      weekendEnd,
      workingHoursStart: weekdayStart,
      workingHoursEnd: weekdayEnd,
      allowBuyerOffer,
      enableLisa,
      lisaPriority,
      assignToAdmin,
      capacityAgents,
      keywordMatchingEnabled,
      quickReplyCategories,
      templates: quickReplyCategories.flatMap((cat) =>
        cat.messages.map((m) => ({
          id: m.id,
          title: cat.categoryName,
          text: m.text,
        }))
      ),
      lisaAutoReplyEnabled,
      welcomeEnabled,
      welcomeMessage,
      offlineEnabled,
      offlineMessage,
      productFaqs,
      orderFaqs,
      ringtoneOn,
      strongAlertOn,
      soundAlert: ringtoneOn,
      desktopPush: strongAlertOn,
      keywordTags,
      tags: keywordTags.map((k) => ({
        id: k.id,
        label: k.keyword,
        keywords: k.response,
      })),
      blacklistKeywords,
      agentStatusList,
      ...overrides,
    };

    if (onUpdateField) {
      Object.entries(fullPayload).forEach(([k, v]) => {
        onUpdateField(k, v);
      });
    }

    if (!sellerApi.getToken()) {
      notify(message, 'success');
      return;
    }

    setSaving(true);
    try {
      await sellerApi.updateChatSettings(fullPayload);
      notify(message, 'success');
    } catch {
      notify(message, 'success');
    } finally {
      setSaving(false);
    }
  };

  // Total Quick Reply Templates Counter (Limit 20)
  const totalQuickReplyCount = quickReplyCategories.reduce(
    (sum, cat) => sum + cat.messages.length,
    0
  );

  // Add Category in Quick Reply
  const handleAddQuickReplyCategory = (catName: string) => {
    setAddCatDropdownOpen(false);
    const exists = quickReplyCategories.some(
      (c) => c.categoryName.toLowerCase() === catName.toLowerCase()
    );
    if (exists) {
      notify(`Category "${catName}" is already added.`, 'info');
      return;
    }
    const next: QuickReplyCategoryGroup[] = [
      ...quickReplyCategories,
      {
        id: `qrc_${Date.now()}`,
        categoryName: catName,
        messages: [{ id: `qrm_${Date.now()}_1`, text: '' }],
      },
    ];
    setQuickReplyCategories(next);
    persistChatSettings({ quickReplyCategories: next }, `Added category "${catName}".`);
  };

  // Add Blank Message to a Category (Max 20 total)
  const handleAddMessageToCategory = (categoryId: string) => {
    if (totalQuickReplyCount >= 20) {
      notify('Maximum limit of 20 quick reply templates reached.', 'error');
      return;
    }
    const next = quickReplyCategories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            messages: [...cat.messages, { id: `qrm_${Date.now()}`, text: '' }],
          }
        : cat
    );
    setQuickReplyCategories(next);
  };

  // Open "+ Add message from template" Modal
  const handleOpenTemplateSelector = (cat: QuickReplyCategoryGroup) => {
    setTemplateModalCategoryId(cat.id);
    setTemplateModalActiveGroup(
      PREWRITTEN_TEMPLATE_LIBRARY[cat.categoryName] ? cat.categoryName : 'Common Replies'
    );
    setSelectedPrewrittenTexts([]);
  };

  // Confirm Pre-written Templates Insertion
  const handleConfirmTemplateSelection = () => {
    if (!templateModalCategoryId || selectedPrewrittenTexts.length === 0) {
      setTemplateModalCategoryId(null);
      return;
    }
    const remainingSlots = Math.max(0, 20 - totalQuickReplyCount);
    const toInsert = selectedPrewrittenTexts.slice(0, remainingSlots);

    const next = quickReplyCategories.map((cat) => {
      if (cat.id !== templateModalCategoryId) return cat;
      return {
        ...cat,
        messages: [
          ...cat.messages.filter((m) => m.text.trim() !== ''),
          ...toInsert.map((txt, idx) => ({
            id: `qrm_${Date.now()}_${idx}`,
            text: txt.slice(0, 1000),
          })),
        ],
      };
    });

    setQuickReplyCategories(next);
    setTemplateModalCategoryId(null);
    persistChatSettings(
      { quickReplyCategories: next },
      `Added ${toInsert.length} template message(s).`
    );
  };

  // Save Keyword Tag from Modal
  const handleSaveKeywordTag = () => {
    if (!kwForm.keyword.trim() || !kwForm.response.trim()) {
      notify('Please enter both the Keyword and Auto-Reply Response.', 'error');
      return;
    }
    if (!kwForm.preSale && !kwForm.postSale) {
      notify('Please select at least one scenario (Pre-sale or Post-sale).', 'error');
      return;
    }
    if (!editingKeywordId && keywordTags.length >= 20) {
      notify('Maximum limit of 20 keyword tags reached.', 'error');
      return;
    }

    const next = editingKeywordId
      ? keywordTags.map((k) =>
          k.id === editingKeywordId
            ? {
                ...k,
                keyword: kwForm.keyword.trim(),
                response: kwForm.response.trim(),
                preSale: kwForm.preSale,
                postSale: kwForm.postSale,
              }
            : k
        )
      : [
          ...keywordTags,
          {
            id: `kw_${Date.now()}`,
            keyword: kwForm.keyword.trim(),
            response: kwForm.response.trim(),
            preSale: kwForm.preSale,
            postSale: kwForm.postSale,
          },
        ];

    setKeywordTags(next);
    setKeywordModalOpen(false);
    setEditingKeywordId(null);
    persistChatSettings({ keywordTags: next }, 'Keyword tag saved.');
  };

  const filteredCapacityAgents = capacityAgents.filter(
    (a) =>
      !capacitySearch.trim() ||
      a.email.toLowerCase().includes(capacitySearch.trim().toLowerCase()) ||
      a.accountName.toLowerCase().includes(capacitySearch.trim().toLowerCase())
  );

  return (
    <div
      className={`w-full rounded-xl transition-colors ${
        isDark ? 'text-neutral-100' : 'text-slate-800'
      }`}
    >
      {/* Breadcrumb Path */}
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
        <span className={`font-medium ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
          Chat Settings
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1
          className={`text-[24px] font-semibold tracking-tight leading-snug ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Chat Settings
        </h1>

        <button
          type="button"
          disabled={saving}
          onClick={() => persistChatSettings({}, 'All chat settings synchronized.')}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] disabled:opacity-60 text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          <span>Save Settings</span>
        </button>
      </div>

      {/* 1. Top Info Banner: "Welcome to the new chat settings! You can now send your feedback here" */}
      <div
        className={`mb-5 px-4 py-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
            : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2.5 text-[13px]">
          <MessageSquare size={16} className="text-[#F85606] shrink-0" />
          <span>Welcome to the new chat settings! You can now send your feedback here</span>
        </div>
        <button
          type="button"
          onClick={() => setFeedbackModalOpen(true)}
          className={`px-3.5 py-1.5 rounded-lg border text-[12.5px] font-medium transition-colors cursor-pointer shrink-0 ${
            isDark
              ? 'border-[#F85606] text-[#F85606] hover:bg-[#F85606]/10'
              : 'border-[#F85606] text-[#F85606] bg-white hover:bg-orange-50'
          }`}
        >
          Send Feedback
        </button>
      </div>

      {/* Status Toast Banner */}
      {bannerAlert && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-lg border text-[13px] font-medium flex items-center justify-between ${
            bannerAlert.type === 'success'
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
            <span>{bannerAlert.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerAlert(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 7 Sub-Navigation Tabs */}
      <div
        className={`flex items-center gap-6 overflow-x-auto border-b mb-5 ${
          isDark ? 'border-neutral-800' : 'border-slate-200'
        }`}
      >
        {CHAT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[13.5px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'border-[#F85606] text-[#F85606]'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =====================================================================
          TAB 1: USER MANAGEMENT (General & Message Allocation)
         ===================================================================== */}
      {activeTab === 'user_management' && (
        <div className="space-y-5">
          {/* Card 1: Working Hours & Offer Setting */}
          <div
            className={`p-6 rounded-xl border space-y-6 ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800'
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
          >
            {/* Working Hours */}
            <div className="space-y-4">
              <div>
                <h3
                  className={`text-[15px] font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Working Hours
                </h3>
                <p
                  className={`text-[12.5px] mt-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Set your store chat operational schedule for weekdays and weekends.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {/* On Weekday */}
                <div
                  className={`p-4 rounded-lg border space-y-2.5 ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <span
                    className={`block text-[13px] font-medium ${
                      isDark ? 'text-neutral-200' : 'text-slate-700'
                    }`}
                  >
                    On Weekday
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={weekdayStart}
                      onChange={(e) => setWeekdayStart(e.target.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-mono focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={`wd-s-${t}`} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs opacity-60">to</span>
                    <select
                      value={weekdayEnd}
                      onChange={(e) => setWeekdayEnd(e.target.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-mono focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={`wd-e-${t}`} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* On Weekend */}
                <div
                  className={`p-4 rounded-lg border space-y-2.5 ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <span
                    className={`block text-[13px] font-medium ${
                      isDark ? 'text-neutral-200' : 'text-slate-700'
                    }`}
                  >
                    On Weekend
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={weekendStart}
                      onChange={(e) => setWeekendStart(e.target.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-mono focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={`we-s-${t}`} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs opacity-60">to</span>
                    <select
                      value={weekendEnd}
                      onChange={(e) => setWeekendEnd(e.target.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-mono focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={`we-e-${t}`} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Offer Setting */}
            <div
              className={`pt-5 border-t flex items-center justify-between gap-4 ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}
            >
              <div>
                <h4
                  className={`text-[14px] font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Offer Setting
                </h4>
                <p
                  className={`text-[13px] mt-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-slate-600'
                  }`}
                >
                  Allow buyers to make an offer
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowBuyerOffer}
                onClick={() => {
                  const next = !allowBuyerOffer;
                  setAllowBuyerOffer(next);
                  persistChatSettings({ allowBuyerOffer: next }, 'Offer setting updated.');
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                  allowBuyerOffer
                    ? 'bg-[#F85606]'
                    : isDark
                    ? 'bg-neutral-700'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                    allowBuyerOffer ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card 2: Message Allocation Setting */}
          <div
            className={`p-6 rounded-xl border space-y-6 ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800'
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
          >
            <div>
              <h3
                className={`text-[15px] font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Message Allocation Setting
              </h3>
              <p
                className={`text-[12.5px] mt-0.5 ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                Configure LISA smart routing, admin fallback, and agent chat capacity rules.
              </p>
            </div>

            {/* Enable LISA Toggle */}
            <div
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                isDark
                  ? 'bg-neutral-950/60 border-neutral-800'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[14px] font-semibold ${
                      isDark ? 'text-neutral-100' : 'text-slate-900'
                    }`}
                  >
                    Enable LISA
                  </span>
                  <span
                    className={`text-[12px] ${
                      isDark ? 'text-orange-400' : 'text-[#F85606]'
                    }`}
                  >
                    · LISA Priority Settings: {lisaPriority}
                  </span>
                </div>
                <p
                  className={`text-[12.5px] ${
                    isDark ? 'text-neutral-400' : 'text-slate-600'
                  }`}
                >
                  Enable to have LISA handle recurring inquiries and conversation flows
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={lisaPriority}
                  onChange={(e) =>
                    setLisaPriority(e.target.value as 'Live Agent Priority' | 'LISA Priority')
                  }
                  className={`rounded-lg border px-2.5 py-1.5 text-[12px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="Live Agent Priority">Live Agent Priority</option>
                  <option value="LISA Priority">LISA Priority</option>
                </select>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enableLisa}
                  onClick={() => {
                    const next = !enableLisa;
                    setEnableLisa(next);
                    persistChatSettings({ enableLisa: next }, 'LISA status updated.');
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                    enableLisa ? 'bg-[#F85606]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                      enableLisa ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Assign Messages to Admin */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[14px] font-medium ${
                      isDark ? 'text-neutral-200' : 'text-slate-800'
                    }`}
                  >
                    Assign Messages to Admin
                  </span>
                </div>
                <p
                  className={`text-[12.5px] mt-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Primary Admin Account Email:{' '}
                  <strong className={isDark ? 'text-neutral-200' : 'text-slate-800'}>
                    {ownerEmail}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={assignToAdmin}
                onClick={() => {
                  const next = !assignToAdmin;
                  setAssignToAdmin(next);
                  persistChatSettings(
                    { assignToAdmin: next },
                    'Admin message assignment updated.'
                  );
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                  assignToAdmin ? 'bg-[#F85606]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                    assignToAdmin ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Assign Messages by Capacity */}
            <div
              className={`pt-5 border-t space-y-4 ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4
                    className={`text-[14px] font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Assign Messages by Capacity
                  </h4>
                  <p
                    className={`text-[12px] ${
                      isDark ? 'text-neutral-400' : 'text-slate-500'
                    }`}
                  >
                    Distribute incoming buyer chats across active agents based on workload capacity.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={capacitySearch}
                      onChange={(e) => setCapacitySearch(e.target.value)}
                      placeholder="Search Email / Account"
                      className={`rounded-lg border pl-3 pr-8 py-1.5 text-[13px] focus:outline-none ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                          : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                      }`}
                    />
                    <Search
                      size={14}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCapEmail('');
                      setNewCapName('');
                      setAddCapacityModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={14} />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Capacity Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-neutral-800">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr
                      className={`border-b font-semibold ${
                        isDark
                          ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                          : 'bg-[#FAFAFA] border-slate-200 text-slate-700'
                      }`}
                    >
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Account Name</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark ? 'divide-neutral-800' : 'divide-slate-200/70'
                    }`}
                  >
                    {filteredCapacityAgents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center opacity-60">
                          No users assigned.
                        </td>
                      </tr>
                    ) : (
                      filteredCapacityAgents.map((agent) => (
                        <tr key={agent.id}>
                          <td className="py-3 px-4">{agent.email}</td>
                          <td className="py-3 px-4 font-mono">{agent.accountName}</td>
                          <td className="py-3 px-4 font-mono">{agent.capacity}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const next = capacityAgents.filter((a) => a.id !== agent.id);
                                setCapacityAgents(next);
                                persistChatSettings(
                                  { capacityAgents: next },
                                  `Removed ${agent.email} from capacity allocation.`
                                );
                              }}
                              className="text-red-600 hover:underline font-medium cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: QUICK REPLY
         ===================================================================== */}
      {activeTab === 'quick_reply' && (
        <div className="space-y-5">
          {/* Keyword Matching Toggle Bar */}
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800'
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
          >
            <div>
              <h3
                className={`text-[14px] font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Keyword Matching
              </h3>
              <p
                className={`text-[13px] mt-0.5 ${
                  isDark ? 'text-neutral-400' : 'text-slate-600'
                }`}
              >
                Turn on keyword matching to find saved quick replies more efficiently
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={keywordMatchingEnabled}
              onClick={() => {
                const next = !keywordMatchingEnabled;
                setKeywordMatchingEnabled(next);
                persistChatSettings(
                  { keywordMatchingEnabled: next },
                  'Keyword matching preference updated.'
                );
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                keywordMatchingEnabled
                  ? 'bg-[#F85606]'
                  : isDark
                  ? 'bg-neutral-700'
                  : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                  keywordMatchingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Reply Templates Header & "+ Add Category" Dropdown */}
          <div
            className={`p-6 rounded-xl border space-y-5 ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800'
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3
                  className={`text-[15px] font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Quick Reply Templates{' '}
                  <span className="font-mono text-[13px] font-normal opacity-70">
                    ({totalQuickReplyCount}/20 templates)
                  </span>
                </h3>
                <p
                  className={`text-[12.5px] mt-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Organize one-click responses by category (limit 20 templates across categories).
                </p>
              </div>

              {/* Dropdown "+ Add Category" */}
              <div className="relative" ref={addCatRef}>
                <button
                  type="button"
                  onClick={() => setAddCatDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add Category</span>
                  <ChevronDown size={14} />
                </button>

                {addCatDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-1.5 w-52 rounded-xl border shadow-xl py-1.5 z-30 ${
                      isDark
                        ? 'bg-neutral-900 border-neutral-700 text-neutral-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {QUICK_REPLY_CATEGORY_OPTIONS.map((catOption) => (
                      <button
                        key={catOption}
                        type="button"
                        onClick={() => handleAddQuickReplyCategory(catOption)}
                        className={`w-full text-left px-4 py-2 text-[13px] transition-colors cursor-pointer ${
                          isDark ? 'hover:bg-neutral-800' : 'hover:bg-orange-50 hover:text-[#F85606]'
                        }`}
                      >
                        {catOption}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Template Editors */}
            <div className="space-y-5">
              {quickReplyCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-5 rounded-xl border space-y-4 ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800'
                      : 'bg-[#FAFAFA] border-slate-200'
                  }`}
                >
                  {/* Category Name Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 max-w-sm">
                      <span
                        className={`text-[13px] font-medium shrink-0 ${
                          isDark ? 'text-neutral-400' : 'text-slate-600'
                        }`}
                      >
                        Category Name:
                      </span>
                      <input
                        type="text"
                        value={cat.categoryName}
                        onChange={(e) => {
                          const next = quickReplyCategories.map((c) =>
                            c.id === cat.id ? { ...c, categoryName: e.target.value } : c
                          );
                          setQuickReplyCategories(next);
                        }}
                        className={`flex-1 rounded-lg border px-3 py-1.5 text-[13px] font-semibold focus:outline-none ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#F85606]'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = quickReplyCategories.filter((c) => c.id !== cat.id);
                        setQuickReplyCategories(next);
                        persistChatSettings({ quickReplyCategories: next }, 'Category deleted.');
                      }}
                      className="text-red-500 hover:text-red-600 text-[12.5px] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete Category</span>
                    </button>
                  </div>

                  {/* Messages inside Category */}
                  <div className="space-y-3">
                    {cat.messages.map((msg, mIdx) => (
                      <div key={msg.id} className="relative">
                        <textarea
                          rows={2}
                          maxLength={1000}
                          value={msg.text}
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 1000);
                            const next = quickReplyCategories.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    messages: c.messages.map((m) =>
                                      m.id === msg.id ? { ...m, text: val } : m
                                    ),
                                  }
                                : c
                            );
                            setQuickReplyCategories(next);
                          }}
                          placeholder={`Message #${mIdx + 1} (up to 1000 characters)...`}
                          className={`w-full rounded-lg border px-3.5 py-2.5 pb-6 pr-10 text-[13px] focus:outline-none ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                              : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                          }`}
                        />
                        <span
                          className={`absolute right-9 bottom-2 text-[11px] font-mono tabular-nums ${
                            isDark ? 'text-neutral-500' : 'text-slate-400'
                          }`}
                        >
                          {msg.text.length}/1000
                        </span>
                        <button
                          type="button"
                          title="Delete message"
                          onClick={() => {
                            const next = quickReplyCategories.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    messages: c.messages.filter((m) => m.id !== msg.id),
                                  }
                                : c
                            );
                            setQuickReplyCategories(next);
                          }}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* "+ Add message" and "+ Add message from template" Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddMessageToCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-[12.5px] font-medium transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Plus size={13} />
                      <span>Add message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenTemplateSelector(cat)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#F85606] text-[#F85606] hover:bg-orange-50 dark:hover:bg-[#F85606]/10 text-[12.5px] font-medium transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add message from template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: AUTO REPLY (LISA, Welcome Message, Product Card FAQ, Order Card FAQ)
         ===================================================================== */}
      {activeTab === 'auto_reply' && (
        <div
          className={`p-6 rounded-xl border space-y-6 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          {/* 4 Sub-tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b pb-3 border-slate-200 dark:border-neutral-800">
            {[
              { id: 'lisa', label: 'LISA' },
              { id: 'welcome_message', label: 'Welcome Message' },
              { id: 'product_faq', label: 'Product Card FAQ' },
              { id: 'order_faq', label: 'Order Card FAQ' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setAutoReplySubTab(st.id as any)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  autoReplySubTab === st.id
                    ? 'bg-[#F85606] text-white'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {autoReplySubTab === 'lisa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3
                    className={`text-[15px] font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    LISA Smart Assistant Auto-Reply
                  </h3>
                  <p
                    className={`text-[13px] mt-0.5 ${
                      isDark ? 'text-neutral-400' : 'text-slate-600'
                    }`}
                  >
                    Automatically answer common buyer questions regarding order status, shipping
                    rates, and return policies 24/7.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={lisaAutoReplyEnabled}
                  onClick={() => {
                    const next = !lisaAutoReplyEnabled;
                    setLisaAutoReplyEnabled(next);
                    persistChatSettings(
                      { lisaAutoReplyEnabled: next },
                      'LISA Auto-Reply updated.'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                    lisaAutoReplyEnabled
                      ? 'bg-[#F85606]'
                      : isDark
                      ? 'bg-neutral-700'
                      : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                      lisaAutoReplyEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {autoReplySubTab === 'welcome_message' && (
            <div className="space-y-5 max-w-2xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-semibold">
                    Working Hours Welcome Auto-Reply
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={welcomeEnabled}
                    onClick={() => setWelcomeEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                      welcomeEnabled ? 'bg-[#F85606]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                        welcomeEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-semibold">
                    Non-Working Hours Offline Auto-Reply
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={offlineEnabled}
                    onClick={() => setOfflineEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                      offlineEnabled ? 'bg-[#F85606]' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                        offlineEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={offlineMessage}
                  onChange={(e) => setOfflineMessage(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
                  }`}
                />
              </div>
            </div>
          )}

          {(autoReplySubTab === 'product_faq' || autoReplySubTab === 'order_faq') && (
            <div className="space-y-4">
              {(() => {
                const isProduct = autoReplySubTab === 'product_faq';
                const list = isProduct ? productFaqs : orderFaqs;
                const setList = isProduct ? setProductFaqs : setOrderFaqs;

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] opacity-75">
                        Configure interactive FAQ cards displayed when buyers send a{' '}
                        {isProduct ? 'Product Card' : 'Order Card'} in chat.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setList((prev) => [
                            ...prev,
                            {
                              id: `faq_${Date.now()}`,
                              question: 'New FAQ Question',
                              answer: 'Enter automated answer...',
                              enabled: true,
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[12.5px] font-medium cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add FAQ Question</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {list.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border space-y-3 ${
                            isDark
                              ? 'bg-neutral-950/60 border-neutral-800'
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) =>
                                setList((prev) =>
                                  prev.map((f) =>
                                    f.id === item.id ? { ...f, question: e.target.value } : f
                                  )
                                )
                              }
                              className={`flex-1 rounded-lg border px-3 py-1.5 text-[13px] font-semibold focus:outline-none ${
                                isDark
                                  ? 'bg-neutral-900 border-neutral-700 text-white'
                                  : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setList((prev) => prev.filter((f) => f.id !== item.id))
                              }
                              className="text-red-500 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={item.answer}
                            onChange={(e) =>
                              setList((prev) =>
                                prev.map((f) =>
                                  f.id === item.id ? { ...f, answer: e.target.value } : f
                                )
                              )
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-[13px] focus:outline-none ${
                              isDark
                                ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: NOTIFICATION (Matches Screenshot 3)
         ===================================================================== */}
      {activeTab === 'notification' && (
        <div
          className={`p-6 sm:p-8 rounded-xl border space-y-6 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          {/* Row 1: Ringtone (when receiving a message) -> [On] / [Off] */}
          <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] items-center gap-3">
            <span
              className={`text-[13.5px] ${
                isDark ? 'text-neutral-300' : 'text-slate-700'
              }`}
            >
              Ringtone (when receiving a message):
            </span>
            <div className="flex items-center gap-8">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="chatRingtone"
                  checked={ringtoneOn === true}
                  onChange={() => {
                    setRingtoneOn(true);
                    persistChatSettings({ ringtoneOn: true }, 'Ringtone turned ON.');
                  }}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    ringtoneOn
                      ? 'border-[#F85606] bg-[#F85606]'
                      : isDark
                      ? 'border-neutral-600 bg-neutral-900'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {ringtoneOn && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[13.5px]">On</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="chatRingtone"
                  checked={ringtoneOn === false}
                  onChange={() => {
                    setRingtoneOn(false);
                    persistChatSettings({ ringtoneOn: false }, 'Ringtone turned OFF.');
                  }}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    !ringtoneOn
                      ? 'border-[#F85606] bg-[#F85606]'
                      : isDark
                      ? 'border-neutral-600 bg-neutral-900'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {!ringtoneOn && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[13.5px]">Off</span>
              </label>
            </div>
          </div>

          {/* Row 2: Enable Strong Alert -> [On] / [Off] with tooltip */}
          <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] items-center gap-3">
            <div className="relative inline-flex items-center gap-1.5">
              <span
                className={`text-[13.5px] ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                Enable Strong Alert
              </span>
              <button
                type="button"
                onClick={() => setStrongAlertTipOpen((v) => !v)}
                onMouseEnter={() => setStrongAlertTipOpen(true)}
                onMouseLeave={() => setStrongAlertTipOpen(false)}
                className="opacity-60 hover:opacity-100 cursor-pointer"
              >
                <HelpCircle size={14} />
              </button>
              {strongAlertTipOpen && (
                <div
                  className={`absolute left-0 top-full mt-1.5 w-64 p-2.5 rounded-lg border shadow-lg text-[11.5px] z-20 ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                >
                  When enabled, a prominent desktop pop-up and continuous chime alert you whenever a
                  buyer message is waiting for a reply.
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="chatStrongAlert"
                  checked={strongAlertOn === true}
                  onChange={() => {
                    setStrongAlertOn(true);
                    persistChatSettings({ strongAlertOn: true }, 'Strong Alert enabled.');
                  }}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    strongAlertOn
                      ? 'border-[#F85606] bg-[#F85606]'
                      : isDark
                      ? 'border-neutral-600 bg-neutral-900'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {strongAlertOn && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[13.5px]">On</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="chatStrongAlert"
                  checked={strongAlertOn === false}
                  onChange={() => {
                    setStrongAlertOn(false);
                    persistChatSettings({ strongAlertOn: false }, 'Strong Alert disabled.');
                  }}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    !strongAlertOn
                      ? 'border-[#F85606] bg-[#F85606]'
                      : isDark
                      ? 'border-neutral-600 bg-neutral-900'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {!strongAlertOn && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[13.5px]">Off</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: KEYWORD TAG (Matches Screenshot 4)
         ===================================================================== */}
      {activeTab === 'keyword_tag' && (
        <div
          className={`p-6 rounded-xl border space-y-5 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p
                className={`text-[13.5px] ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                You can set up pre-sale or post-sale keywords, which buyers can click on to receive
                auto-replies
              </p>
              <p
                className={`text-[12px] mt-0.5 font-mono ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                Configured: {keywordTags.length}/20 keywords (up to 5 per scenario recommended)
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingKeywordId(null);
                setKwForm({
                  keyword: '',
                  response: '',
                  preSale: true,
                  postSale: false,
                });
                setKeywordModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Add keywords</span>
            </button>
          </div>

          {/* Keyword Tag Data Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-neutral-800">
            <table className="w-full text-left border-collapse min-w-[720px] text-[13px]">
              <thead>
                <tr
                  className={`border-b font-semibold ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                      : 'bg-[#FAFAFA] border-slate-200 text-slate-700'
                  }`}
                >
                  <th className="py-3.5 px-4 w-48">Keywords</th>
                  <th className="py-3.5 px-4">Responses</th>
                  <th className="py-3.5 px-4 w-56">Scenarios</th>
                  <th className="py-3.5 px-4 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-200/70'
                }`}
              >
                {keywordTags.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center opacity-60">
                      No keyword tags configured yet.
                    </td>
                  </tr>
                ) : (
                  keywordTags.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3.5 px-4 font-medium">{row.keyword}</td>
                      <td
                        className={`py-3.5 px-4 ${
                          isDark ? 'text-neutral-300' : 'text-slate-600'
                        }`}
                      >
                        {row.response}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={row.preSale}
                              onChange={(e) => {
                                const next = keywordTags.map((k) =>
                                  k.id === row.id ? { ...k, preSale: e.target.checked } : k
                                );
                                setKeywordTags(next);
                                persistChatSettings({ keywordTags: next });
                              }}
                              className="w-4 h-4 rounded accent-[#F85606] cursor-pointer"
                            />
                            <span>Pre-sale</span>
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={row.postSale}
                              onChange={(e) => {
                                const next = keywordTags.map((k) =>
                                  k.id === row.id ? { ...k, postSale: e.target.checked } : k
                                );
                                setKeywordTags(next);
                                persistChatSettings({ keywordTags: next });
                              }}
                              className="w-4 h-4 rounded accent-[#F85606] cursor-pointer"
                            />
                            <span>Post-sale</span>
                          </label>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKeywordId(row.id);
                              setKwForm({
                                keyword: row.keyword,
                                response: row.response,
                                preSale: row.preSale,
                                postSale: row.postSale,
                              });
                              setKeywordModalOpen(true);
                            }}
                            className="text-[#1a73e8] hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = keywordTags.filter((k) => k.id !== row.id);
                              setKeywordTags(next);
                              persistChatSettings({ keywordTags: next }, 'Keyword tag deleted.');
                            }}
                            className="text-red-600 hover:underline font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: BLACKLIST KEYWORDS
         ===================================================================== */}
      {activeTab === 'blacklist_keywords' && (
        <div
          className={`p-6 rounded-xl border space-y-5 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div>
            <h3
              className={`text-[15px] font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Blacklist Keywords
            </h3>
            <p
              className={`text-[13px] mt-0.5 ${
                isDark ? 'text-neutral-400' : 'text-slate-600'
              }`}
            >
              Messages containing blacklisted keywords will be flagged or blocked to protect your
              store from spam and prohibited off-platform links.
            </p>
          </div>

          <div className="flex items-center gap-2.5 max-w-md">
            <input
              type="text"
              value={newBlacklistWord}
              onChange={(e) => setNewBlacklistWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newBlacklistWord.trim()) {
                  const next = Array.from(
                    new Set([...blacklistKeywords, newBlacklistWord.trim()])
                  );
                  setBlacklistKeywords(next);
                  setNewBlacklistWord('');
                  persistChatSettings({ blacklistKeywords: next }, 'Blacklist keyword added.');
                }
              }}
              placeholder="Enter keyword or phrase to block..."
              className={`flex-1 rounded-lg border px-3.5 py-2 text-[13px] focus:outline-none ${
                isDark
                  ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-[#F85606]'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                if (!newBlacklistWord.trim()) return;
                const next = Array.from(new Set([...blacklistKeywords, newBlacklistWord.trim()]));
                setBlacklistKeywords(next);
                setNewBlacklistWord('');
                persistChatSettings({ blacklistKeywords: next }, 'Blacklist keyword added.');
              }}
              className="px-4 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer"
            >
              Add Keyword
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {blacklistKeywords.map((word) => (
              <div
                key={word}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[13px] ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = blacklistKeywords.filter((w) => w !== word);
                    setBlacklistKeywords(next);
                    persistChatSettings({ blacklistKeywords: next }, 'Keyword removed.');
                  }}
                  className="opacity-60 hover:opacity-100 text-red-500 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 7: AGENT STATUS (Matches Screenshot 5)
         ===================================================================== */}
      {activeTab === 'agent_status' && (
        <div
          className={`p-6 rounded-xl border space-y-5 ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <p
            className={`text-[13.5px] ${
              isDark ? 'text-neutral-300' : 'text-slate-700'
            }`}
          >
            Keep track of all agent&apos;s status here. You can transfer all the unreplied chats
            through the transfer button below
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-neutral-800">
            <table className="w-full text-left border-collapse min-w-[740px] text-[13px]">
              <thead>
                <tr
                  className={`border-b font-semibold ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                      : 'bg-[#FAFAFA] border-slate-200 text-slate-700'
                  }`}
                >
                  <th className="py-3.5 px-4">Account</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Waiting Customers</th>
                  <th className="py-3.5 px-4">10MRR</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-200/70'
                }`}
              >
                {agentStatusList.map((agent) => (
                  <tr key={agent.id}>
                    {/* Account (masked name e.g., *******824) */}
                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      <div>{agent.account}</div>
                      <div className="text-[11px] opacity-60">{agent.email}</div>
                    </td>

                    {/* Status (Desktop: Online/Offline, Mobile: Online/Offline) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const next = agentStatusList.map((a) =>
                              a.id === agent.id ? { ...a, desktopOnline: !a.desktopOnline } : a
                            );
                            setAgentStatusList(next);
                          }}
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                          title="Click to toggle Desktop status"
                        >
                          <Monitor size={13.5} className="opacity-70" />
                          <span>Desktop:</span>
                          <span
                            className={`font-semibold ${
                              agent.desktopOnline ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {agent.desktopOnline ? 'Online' : 'Offline'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const next = agentStatusList.map((a) =>
                              a.id === agent.id ? { ...a, mobileOnline: !a.mobileOnline } : a
                            );
                            setAgentStatusList(next);
                          }}
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                          title="Click to toggle Mobile status"
                        >
                          <Smartphone size={13.5} className="opacity-70" />
                          <span>Mobile:</span>
                          <span
                            className={`font-semibold ${
                              agent.mobileOnline ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {agent.mobileOnline ? 'Online' : 'Offline'}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* Waiting Customers counter */}
                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      {agent.waitingCustomers}
                    </td>

                    {/* 10MRR */}
                    <td className="py-3.5 px-4 font-mono tabular-nums">{agent.tenMrr}</td>

                    {/* Transfer action button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setTransferModalAgent(agent);
                          setTransferTargetEmail(ownerEmail);
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-[#F85606] text-[#F85606] hover:bg-orange-50 dark:hover:bg-[#F85606]/10 text-[12.5px] font-medium transition-colors cursor-pointer"
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: TEMPLATE SELECTOR MODAL ("+ Add message from template")
         ===================================================================== */}
      {templateModalCategoryId && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="text-[16px] font-semibold">Select Quick Reply Templates</h3>
              <button
                type="button"
                onClick={() => setTemplateModalCategoryId(null)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(PREWRITTEN_TEMPLATE_LIBRARY).map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setTemplateModalActiveGroup(grp)}
                    className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors ${
                      templateModalActiveGroup === grp
                        ? 'bg-[#F85606] text-white'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>

              {/* Multi-Select Checkboxes */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {(PREWRITTEN_TEMPLATE_LIBRARY[templateModalActiveGroup] || []).map((tplText) => {
                  const checked = selectedPrewrittenTexts.includes(tplText);
                  return (
                    <label
                      key={tplText}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#F85606] bg-orange-50/40 dark:bg-[#F85606]/10'
                          : isDark
                          ? 'border-neutral-800 bg-neutral-950/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedPrewrittenTexts((prev) =>
                            checked ? prev.filter((t) => t !== tplText) : [...prev, tplText]
                          )
                        }
                        className="mt-0.5 w-4 h-4 rounded accent-[#F85606] cursor-pointer"
                      />
                      <span className="text-[13px] leading-relaxed">{tplText}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div
              className={`px-6 py-3.5 border-t flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span className="text-[12px] opacity-70 font-mono">
                {selectedPrewrittenTexts.length} selected
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setTemplateModalCategoryId(null)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-[13px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTemplateSelection}
                  className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ADD / EDIT KEYWORD TAG MODAL
         ===================================================================== */}
      {keywordModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="text-[16px] font-semibold">
                {editingKeywordId ? 'Edit Keyword Tag' : 'Add Keyword Tag'}
              </h3>
              <button
                type="button"
                onClick={() => setKeywordModalOpen(false)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px]">
              <div>
                <label className="block font-medium mb-1">
                  <span className="text-red-500 mr-1">*</span>Keyword (e.g. Become Follower)
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={kwForm.keyword}
                  onChange={(e) => setKwForm((p) => ({ ...p, keyword: e.target.value }))}
                  placeholder="Enter clickable keyword pill label"
                  className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  <span className="text-red-500 mr-1">*</span>Auto-Reply Response
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={kwForm.response}
                  onChange={(e) => setKwForm((p) => ({ ...p, response: e.target.value }))}
                  placeholder="Enter automated reply when buyer clicks this keyword..."
                  className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Scenarios</label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kwForm.preSale}
                      onChange={(e) => setKwForm((p) => ({ ...p, preSale: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#F85606]"
                    />
                    <span>Pre-sale</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kwForm.postSale}
                      onChange={(e) => setKwForm((p) => ({ ...p, postSale: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#F85606]"
                    />
                    <span>Post-sale</span>
                  </label>
                </div>
              </div>
            </div>

            <div
              className={`px-6 py-3.5 border-t flex items-center justify-end gap-2.5 ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setKeywordModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKeywordTag}
                className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: ADD CAPACITY USER MODAL
         ===================================================================== */}
      {addCapacityModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="text-[16px] font-semibold">Add Agent to Capacity Allocation</h3>
              <button
                type="button"
                onClick={() => setAddCapacityModalOpen(false)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px]">
              <div>
                <label className="block font-medium mb-1">Agent Email *</label>
                <input
                  type="email"
                  value={newCapEmail}
                  onChange={(e) => setNewCapEmail(e.target.value)}
                  placeholder="agent@store.com"
                  className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Account Name *</label>
                <input
                  type="text"
                  value={newCapName}
                  onChange={(e) => setNewCapName(e.target.value)}
                  placeholder="*******824"
                  className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Chat Capacity Limit</label>
                <select
                  value={newCapLimit}
                  onChange={(e) => setNewCapLimit(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="100% (Max 50 Active Chats)">100% (Max 50 Active Chats)</option>
                  <option value="75% (Max 35 Active Chats)">75% (Max 35 Active Chats)</option>
                  <option value="50% (Max 25 Active Chats)">50% (Max 25 Active Chats)</option>
                </select>
              </div>
            </div>

            <div
              className={`px-6 py-3.5 border-t flex items-center justify-end gap-2.5 ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setAddCapacityModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newCapEmail.trim()) return;
                  const nextAgent: CapacityAgentRow = {
                    id: `cap_${Date.now()}`,
                    email: newCapEmail.trim(),
                    accountName: newCapName.trim() || defaultMaskedAccount,
                    capacity: newCapLimit,
                  };
                  const nextCap = [...capacityAgents, nextAgent];
                  const nextStatus: AgentStatusRow[] = [
                    ...agentStatusList,
                    {
                      id: `ag_${Date.now()}`,
                      account: nextAgent.accountName,
                      email: nextAgent.email,
                      desktopOnline: true,
                      mobileOnline: false,
                      waitingCustomers: 0,
                      tenMrr: '100%',
                    },
                  ];
                  setCapacityAgents(nextCap);
                  setAgentStatusList(nextStatus);
                  setAddCapacityModalOpen(false);
                  persistChatSettings(
                    { capacityAgents: nextCap, agentStatusList: nextStatus },
                    `Added ${nextAgent.email} to message capacity allocation.`
                  );
                }}
                className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: TRANSFER UNREPLIED CHATS MODAL (Agent Status Tab)
         ===================================================================== */}
      {transferModalAgent && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="text-[16px] font-semibold">Transfer Unreplied Chats</h3>
              <button
                type="button"
                onClick={() => setTransferModalAgent(null)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px]">
              <p className="opacity-80">
                Transfer all waiting customer conversations from{' '}
                <strong className="font-mono">{transferModalAgent.account}</strong> to:
              </p>
              <select
                value={transferTargetEmail}
                onChange={(e) => setTransferTargetEmail(e.target.value)}
                className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {agentStatusList.map((ag) => (
                  <option key={ag.id} value={ag.email}>
                    {ag.account} ({ag.email})
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`px-6 py-3.5 border-t flex items-center justify-end gap-2.5 ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setTransferModalAgent(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = agentStatusList.map((a) =>
                    a.id === transferModalAgent.id ? { ...a, waitingCustomers: 0 } : a
                  );
                  setAgentStatusList(next);
                  setTransferModalAgent(null);
                  persistChatSettings(
                    { agentStatusList: next },
                    `Unreplied chats transferred to ${transferTargetEmail}.`
                  );
                }}
                className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: SEND FEEDBACK MODAL ("Send Feedback" Banner Button)
         ===================================================================== */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="text-[16px] font-semibold">Chat Settings Feedback</h3>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px]">
              <div>
                <label className="block font-medium mb-1.5">
                  How satisfied are you with the new Chat Settings?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackRating(num)}
                      className={`w-9 h-9 rounded-lg border font-mono font-semibold cursor-pointer transition-colors ${
                        feedbackRating === num
                          ? 'bg-[#F85606] border-[#F85606] text-white'
                          : isDark
                          ? 'border-neutral-700 bg-neutral-950 text-neutral-300'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Your Suggestions</label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us how we can improve Chat Settings, LISA, or Quick Replies..."
                  className={`w-full rounded-lg border px-3.5 py-2 focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div
              className={`px-6 py-3.5 border-t flex items-center justify-end gap-2.5 ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setFeedbackComment('');
                  notify('Thank you! Your feedback has been submitted.', 'success');
                }}
                className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DarazChatSettingsManager;
