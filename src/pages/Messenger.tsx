import { useState, useRef, useEffect, FormEvent, ChangeEvent, Dispatch, SetStateAction, MouseEvent, TouchEvent } from 'react';
import { 
  Send, Search, Image, Paperclip, Clock, MoreVertical, 
  Ban, VolumeX, Volume2, X, ArrowLeft, User, Trash2, Flag,
  Mic, Smile, Reply, Star, Check, CheckCheck, Copy, Forward, 
  Play, Pause, MapPin, FileText, Camera, AlertCircle, Info, Pin, Pencil, CheckSquare,
  ChevronDown, Minus, ThumbsUp
} from 'lucide-react';
import GlassCloseButton from '../components/GlassCloseButton';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, Message } from '../types';

interface MessengerProps {
  contacts: Contact[];
  setContacts: Dispatch<SetStateAction<Contact[]>>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  user: { name: string; email: string; phone: string } | null;
  onNavigate?: (view: string) => void;
  isLightMode?: boolean;
  isWidget?: boolean;
  onClose?: () => void;
}

export default function Messenger({ 
  contacts, 
  setContacts, 
  showToast, 
  user, 
  onNavigate, 
  isLightMode = false,
  isWidget = false,
  onClose
}: MessengerProps) {
  const customerName = user?.name ? user.name.split(' ')[0] : 'Customer';

  const personalizeText = (text: string): string => {
    if (!text) return text;
    return text
      .replace(/\bDear customer\b/gi, `Dear ${customerName}`)
      .replace(/\bDear client\b/gi, `Dear ${customerName}`)
      .replace(/\bNoble customer\b/gi, `Dear ${customerName}`)
      .replace(/\bVIP client\b/gi, `VIP client ${customerName}`);
  };

  const [activeContactId, setActiveContactId] = useState<string>(() => contacts[0]?.id || 'contact-alike-support');
  const [messageText, setMessageText] = useState<string>('');
  const [contactSearch, setContactSearch] = useState<string>('');
  
  // Custom overlays / states
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showWidgetDropdown, setShowWidgetDropdown] = useState<boolean>(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [isSearchingChat, setIsSearchingChat] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  
  // WhatsApp Features States
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [replyingToMsg, setReplyingToMsg] = useState<Message | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // WhatsApp style Right-Click Context Menu & Forward Feature States
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: Message } | null>(null);
  const [deleteConfirmMsgId, setDeleteConfirmMsgId] = useState<string | null>(null);
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
  const [selectedForwardContactIds, setSelectedForwardContactIds] = useState<string[]>([]);

  // WhatsApp context menu action states
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [infoMsg, setInfoMsg] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [lastDeletedMsg, setLastDeletedMsg] = useState<{ contactId: string; msg: Message; index: number } | null>(null);
  const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'starred' | 'blocked'>('all');

  // touch long-press references
  const touchTimeoutRef = useRef<any>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const widgetDropdownRef = useRef<HTMLDivElement>(null);
  const widgetMoreButtonRef = useRef<HTMLButtonElement>(null);
  const recordingIntervalRef = useRef<any>(null);
  const isTransmittingRef = useRef<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  const scrollToBottom = (smooth = true) => {
    // scroll function call boundary check with requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight + 1000, // force scroll beyond bounds to ensure bottom
            behavior: smooth ? 'smooth' : 'auto'
          });
        }
      }, 50); // slight timeout ensures content is fully compiled react-side
    });
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement> | MouseEvent, msg: Message) => {
    e.preventDefault();
    const menuWidth = 176; // Match menu card width
    const menuHeight = 380; // Adjusted height for more items
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    setContextMenu({ x, y, msg });
  };

  const onBubbleTouchStart = (e: TouchEvent<HTMLDivElement>, msg: Message) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;

      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      touchTimeoutRef.current = setTimeout(() => {
        // Trigger long press context menu
        const menuWidth = 176;
        const menuHeight = 380;
        let x = touch.clientX;
        let y = touch.clientY - 40; // slightly above touch point

        if (x + menuWidth > window.innerWidth) {
          x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
          y = window.innerHeight - menuHeight - 10;
        }
        if (x < 10) x = 10;
        if (y < 10) y = 10;

        setContextMenu({ x, y, msg });
        
        // Vibrate to give physical feedback if supported
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500); // 500ms touchhold rule
    }
  };

  const onBubbleTouchEnd = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  const onBubbleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && touchTimeoutRef.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartXRef.current);
      const dy = Math.abs(touch.clientY - touchStartYRef.current);
      if (dx > 8 || dy > 8) {
        // user is scrolling, cancel longpress
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }
  };

  const lastActiveContactIdRef = useRef<string>(activeContactId);
  const lastMsgCountRef = useRef<number>(0);

  useEffect(() => {
    const currentLength = activeContact?.messages?.length || 0;
    const isChannelSwitch = lastActiveContactIdRef.current !== activeContactId;

    if (isChannelSwitch) {
      scrollToBottom(false);
      lastActiveContactIdRef.current = activeContactId;
      setIsSearchingChat(false);
      setChatSearchQuery('');
      setReplyingToMsg(null);
      setShowEmojiPicker(false);
      setShowAttachmentMenu(false);
    } else if (currentLength > lastMsgCountRef.current) {
      scrollToBottom(true);
    }

    lastMsgCountRef.current = currentLength;
  }, [activeContactId, activeContact?.messages?.length]);

  useEffect(() => {
    if (isTyping) {
      scrollToBottom(true);
    }
  }, [isTyping]);

  // Handle outside click closure of lists
  useEffect(() => {
    const handleOutsideClick = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      
      // Options dropdown
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }

      // Widget options dropdown
      if (
        showWidgetDropdown &&
        widgetDropdownRef.current &&
        !widgetDropdownRef.current.contains(target) &&
        widgetMoreButtonRef.current &&
        !widgetMoreButtonRef.current.contains(target)
      ) {
        setShowWidgetDropdown(false);
      }

      // Emoji picker
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }

      // Attachment menu
      if (
        showAttachmentMenu &&
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(target)
      ) {
        setShowAttachmentMenu(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showDropdown, showWidgetDropdown, showEmojiPicker, showAttachmentMenu]);

  // Handle right-click context menu window close events
  useEffect(() => {
    const handleWindowClickAndContextMenu = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleWindowClickAndContextMenu);
    window.addEventListener('contextmenu', handleWindowClickAndContextMenu);
    return () => {
      window.removeEventListener('click', handleWindowClickAndContextMenu);
      window.removeEventListener('contextmenu', handleWindowClickAndContextMenu);
    };
  }, []);

  // Escape key handler to shut options instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowEmojiPicker(false);
        setShowAttachmentMenu(false);
        setReplyingToMsg(null);
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recording timer logic
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const highlightText = (text: string, search: string) => {
    if (!search || !text) return personalizeText(text);
    const personalized = personalizeText(text);
    const parts = personalized.split(new RegExp(`(${search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 text-neutral-900 rounded-[2px] px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file to upload.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPendingImage(event.target.result as string);
          showToast('Image staged for dispatch. Send to analyze.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Groups messages into arrays labeled with dates
  const getMessageGroups = (msgs: Message[]) => {
    const groups: { label: string; messages: Message[] }[] = [];
    msgs.forEach((msg) => {
      let groupLabel = 'Today';
      if (msg.timestamp.toLowerCase().includes('yesterday')) {
        groupLabel = 'Yesterday';
      } else if (msg.timestamp.toLowerCase().includes('days ago')) {
        groupLabel = msg.timestamp; // "3 days ago" etc.
      } else if (msg.timestamp.includes('/') || msg.timestamp.includes('-')) {
        groupLabel = msg.timestamp;
      } else {
        groupLabel = 'Today';
      }

      const existingGroup = groups.find((g) => g.label === groupLabel);
      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ label: groupLabel, messages: [msg] });
      }
    });
    return groups;
  };

  const startVoiceRecording = () => {
    if (activeContact.isBlocked) {
      showToast('This butler channel is blocked. Unblock to resume chat.', 'warning');
      return;
    }
    setIsRecording(true);
    setRecordingSeconds(0);
    showToast('Voice encoder active. Recording...', 'info');
  };

  const cancelVoiceRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
    showToast('Voice message discarded', 'warning');
  };

  const stopAndSendVoiceRecording = () => {
    setIsRecording(false);
    const durationMin = Math.floor(recordingSeconds / 60);
    const durationSec = recordingSeconds % 60;
    const formattedDuration = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;
    sendVoiceMessage(formattedDuration);
    setRecordingSeconds(0);
  };

  const sendVoiceMessage = (duration: string) => {
    const userMsgId = `usr-v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userMsg: Message = {
      id: userMsgId,
      text: '',
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      isVoice: true,
      voiceDuration: duration,
      ...(replyingToMsg ? {
        replyTo: replyingToMsg.id,
        replyToText: replyingToMsg.text || '🎙 Voice message',
        replyToSender: replyingToMsg.sender
      } : {})
    };

    setContacts((prevContacts) =>
      prevContacts.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            lastMessage: '🎙 Voice note dispatched',
            timestamp: 'Just now',
            messages: [...(c.messages || []), userMsg]
          };
        }
        return c;
      })
    );

    setReplyingToMsg(null);
    setTimeout(() => scrollToBottom(true), 50);

    // Simulate Status Ticks Transitions for voice note
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === userMsgId ? { ...m, status: 'sent' } : m
                )
              }
            : c
        )
      );
    }, 200);

    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === userMsgId ? { ...m, status: 'delivered' } : m
                )
              }
            : c
        )
      );
    }, 700);

    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === userMsgId ? { ...m, status: 'read' } : m
                )
              }
            : c
        )
      );

      // Reply simulation
      setIsTyping(true);
      setTimeout(() => scrollToBottom(true), 50);

      setTimeout(() => {
        setIsTyping(false);
        setContacts((prevContacts) => {
          const currentRef = prevContacts.find((c) => c.id === activeContactId);
          if (!currentRef || currentRef.isBlocked) return prevContacts;

          const replyText = `🎙 Alike Luxury Concierge has processed your voice memo. We verified the specific luxury specifications requested. Dispatch preparing accordingly.`;
          const butlerMsg: Message = {
            id: `bt-v-reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            text: replyText,
            sender: 'contact',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          };

          if (!currentRef.isMuted) {
            showToast('Boutique Butler responded!', 'info');
          }

          return prevContacts.map((c) => {
            if (c.id === activeContactId) {
              return {
                ...c,
                lastMessage: replyText,
                timestamp: 'Just now',
                messages: [...(c.messages || []), butlerMsg]
              };
            }
            return c;
          });
        });
        setTimeout(() => scrollToBottom(true), 100);
      }, 1500);

    }, 1400);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();

    if (activeContact.isBlocked) {
      showToast('This butler channel is blocked. Unblock to resume chat.', 'warning');
      return;
    }

    if (!messageText.trim() && !pendingImage) return;
    if (isTransmittingRef.current) return;

    isTransmittingRef.current = true;

    // Define unique id
    const userMsgId = `usr-m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userMsg: Message = {
      id: userMsgId,
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      ...(pendingImage ? { image: pendingImage } : {}),
      ...(replyingToMsg ? {
        replyTo: replyingToMsg.id,
        replyToText: replyingToMsg.text || '🎙 Voice note',
        replyToSender: replyingToMsg.sender
      } : {})
    };

    const hasImageSent = !!pendingImage;
    const sentText = messageText;

    // Update locally instantly
    setContacts((prevContacts) =>
      prevContacts.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            lastMessage: hasImageSent ? '📷 Photo attachment dispatched' : sentText,
            timestamp: 'Just now',
            messages: [...(c.messages || []), userMsg]
          };
        }
        return c;
      })
    );

    // Clear Composer states
    setMessageText('');
    setPendingImage(null);
    setReplyingToMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setTimeout(() => scrollToBottom(true), 50);

    // Simulate tick sequences
    // 100ms: Sent status
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === userMsgId ? { ...m, status: 'sent' } : m
                )
              }
            : c
        )
      );
    }, 150);

    // 600ms: Delivered status
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === userMsgId ? { ...m, status: 'delivered' } : m
                )
              }
            : c
        )
      );
      // Unblock the transmission reference so next message can be sent immediately!
      // This solves the bug permanently!
      isTransmittingRef.current = false;
    }, 600);

    // 1200ms: Read status & Typing triggers
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === userMsgId ? { ...m, status: 'read' } : m
                )
              }
            : c
        )
      );

      // Contacts replies typing
      setIsTyping(true);
      setTimeout(() => scrollToBottom(true), 50);

      // 2800ms: Typing completes
      setTimeout(() => {
        setIsTyping(false);

        setContacts((prevContacts) => {
          const currentRef = prevContacts.find((c) => c.id === activeContactId);
          if (!currentRef || currentRef.isBlocked) return prevContacts;

          let autoReplyText = '';

          if (hasImageSent) {
            if (activeContactId === 'contact-alike-support' || currentRef.name.toLowerCase().includes('concierge')) {
              autoReplyText = `Dear ${customerName}, our high-end Butler Vision System has processed your visual upload. Specifically, we detected authentic stitch vectors and precious metal refractions of an elite Alike-ND luxury asset. This artifact is authenticated 100% genuine under sovereign dark lodge standards. Staging code is updated to PRIORITY status. ✨`;
            } else if (activeContactId === 'contact-jewel-boutique') {
              autoReplyText = `Dear ${customerName}, your visual preview has been shared directly with our lead jeweler in Florence. We have verified the certified gold weight and pristine bezel index layouts matching this snapshot. Parcel preparations have been expedited.`;
            } else {
              autoReplyText = `Dear ${customerName}, we have cataloged this photo attachment under your order routing. Dispatch curators are preparing transit boarding.`;
            }
          } else {
            const autoReplyTextRaw = {
              'contact-alike-support': 'Noble customer, your personal Alike Butler has verified this routing segment. A client consultant will arrive at this channel momentarily.',
              'contact-jewel-boutique': 'Dear client, yes! The Italian Venetian dip chain is fully crafted in Florence. We can provide custom certificates of gold weight inside your parcel.',
              'contact-gaming-hub': 'No worries gamer! We cleared your gold controller holding limit, we are packing it next.'
            }[activeContactId] || 'Greetings VIP client! Alike-ND Concierge has received your prompt. Our physical dark store is preparing immediate feedback.';

            autoReplyText = personalizeText(autoReplyTextRaw);
          }

          const butlerMsg: Message = {
            id: `bt-reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            text: autoReplyText,
            sender: 'contact',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          };

          if (!currentRef.isMuted) {
            showToast('Boutique Butler responded!', 'info');
          }

          return prevContacts.map((c) => {
            if (c.id === activeContactId) {
              return {
                ...c,
                lastMessage: autoReplyText,
                timestamp: 'Just now',
                messages: [...(c.messages || []), butlerMsg]
              };
            }
            return c;
          });
        });

        setTimeout(() => scrollToBottom(true), 100);
      }, 1400);

    }, 1200);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied message text to clipboard', 'info');
  };

  const handleDeleteMessage = (msgId: string) => {
    let deletedInfo: { contactId: string; msg: Message; index: number } | null = null;
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          const idx = (c.messages || []).findIndex((m) => m.id === msgId);
          if (idx !== -1) {
            deletedInfo = { contactId: c.id, msg: c.messages[idx], index: idx };
          }
          const updatedMessages = (c.messages || []).filter((m) => m.id !== msgId);
          const lastMsg = updatedMessages[updatedMessages.length - 1];
          return {
            ...c,
            lastMessage: lastMsg ? (lastMsg.isVoice ? '🎙 Voice message' : lastMsg.text) : 'No messages yet',
            messages: updatedMessages
          };
        }
        return c;
      })
    );

    if (deletedInfo) {
      setLastDeletedMsg(deletedInfo);
      showToast('Message deleted', 'success');
      // Extend timer to 10 seconds so they have enough time to click Undo
      setTimeout(() => {
        setLastDeletedMsg((current) => current?.msg.id === msgId ? null : current);
      }, 10000);
    }
  };

  const handleUndoDelete = () => {
    if (!lastDeletedMsg) return;
    const { contactId, msg, index } = lastDeletedMsg;
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          const currentMsgs = [...(c.messages || [])];
          currentMsgs.splice(index, 0, msg);
          const lastMsg = currentMsgs[currentMsgs.length - 1];
          return {
            ...c,
            messages: currentMsgs,
            lastMessage: lastMsg ? (lastMsg.isVoice ? '🎙 Voice message' : lastMsg.text) : 'No messages yet'
          };
        }
        return c;
      })
    );
    setLastDeletedMsg(null);
    showToast('Message deletion undone successfully', 'success');
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          const updatedMessages = (c.messages || []).map((m) => {
            if (m.id === msgId) {
              const currentReactions = m.reactions || [];
              const exists = currentReactions.some((r) => r.emoji === emoji);
              let newReactions;
              if (exists) {
                newReactions = currentReactions.filter((r) => r.emoji !== emoji);
              } else {
                newReactions = [...currentReactions, { emoji }];
              }
              return { ...m, reactions: newReactions };
            }
            return m;
          });
          return {
            ...c,
            messages: updatedMessages
          };
        }
        return c;
      })
    );
  };

  const handleToggleSelectMsg = (msgId: string) => {
    setSelectedMsgIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  const handleUpdateEditMessage = (msgId: string, newText: string) => {
    if (!newText.trim()) {
      showToast('Message content cannot be blank', 'warning');
      return;
    }
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          const updated = (c.messages || []).map((m) => {
            if (m.id === msgId) {
              return { ...m, text: newText, isEdited: true };
            }
            return m;
          });
          const isLast = (c.messages || [])[(c.messages || []).length - 1]?.id === msgId;
          return {
            ...c,
            messages: updated,
            lastMessage: isLast ? newText : c.lastMessage
          };
        }
        return c;
      })
    );
    setEditingMsgId(null);
    setEditingText('');
    showToast('Message content edited successfully', 'success');
  };

  const handleTogglePinMsg = (msgId: string) => {
    let completed = false;
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          const currentPinnedCount = (c.messages || []).filter((m) => m.isPinned && m.id !== msgId).length;
          const updated = (c.messages || []).map((m) => {
            if (m.id === msgId) {
              const nextPin = !m.isPinned;
              if (nextPin && currentPinnedCount >= 3) {
                showToast('You can pin up to 3 messages maximum.', 'warning');
                return m;
              }
              completed = true;
              showToast(nextPin ? 'Message pinned to corridor header' : 'Message unpinned', 'success');
              return { ...m, isPinned: nextPin };
            }
            return m;
          });
          return {
            ...c,
            messages: updated
          };
        }
        return c;
      })
    );
  };

  const handleStarMsg = (msgId: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: (c.messages || []).map((m) =>
              m.id === msgId ? { ...m, isStarred: !m.isStarred } : m
            )
          };
        }
        return c;
      })
    );
    const msg = activeContact.messages.find((m) => m.id === msgId);
    showToast(msg?.isStarred ? 'Unstarred message' : 'Starred message ⭐', 'success');
  };

  const handleToggleForwardContact = (contactId: string) => {
    setSelectedForwardContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleConfirmForward = () => {
    if (!forwardMsg || selectedForwardContactIds.length === 0) return;

    setContacts((prevContacts) => {
      return prevContacts.map((c) => {
        if (selectedForwardContactIds.includes(c.id)) {
          const newMsgId = `usr-m-fwd-${Date.now()}-${c.id}-${Math.random().toString(36).slice(2, 7)}`;
          const isMsgVoice = forwardMsg.isVoice;
          const isMsgImage = forwardMsg.image;
          const forwardedClonedMessage: Message = {
            id: newMsgId,
            text: forwardMsg.text,
            sender: 'user', // user is sending it
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            ...(isMsgVoice ? { isVoice: true, voiceDuration: forwardMsg.voiceDuration } : {}),
            ...(isMsgImage ? { image: forwardMsg.image } : {})
          };

          const updatedMessages = [...(c.messages || []), forwardedClonedMessage];
          let updatedLastText = forwardMsg.text || '';
          if (isMsgImage) updatedLastText = '📷 Photo attachment dispatched';
          else if (isMsgVoice) updatedLastText = '🎙 Voice message';

          return {
            ...c,
            lastMessage: updatedLastText,
            timestamp: 'Just now',
            messages: updatedMessages
          };
        }
        return c;
      });
    });

    const count = selectedForwardContactIds.length;
    showToast(`Message forwarded to ${count} boutique(s)`, 'success');
    setForwardMsg(null);
    setSelectedForwardContactIds([]);
  };

  const handleForwardMsg = (msg: Message) => {
    setForwardMsg(msg);
    setSelectedForwardContactIds([]);
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(contactSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (contactFilter === 'unread') {
      return c.unreadCount && c.unreadCount > 0;
    }
    if (contactFilter === 'starred') {
      return c.messages && c.messages.some((m) => m.isStarred);
    }
    if (contactFilter === 'blocked') {
      return c.isBlocked;
    }
    return true; // 'all'
  });

  const emojiList = [
    '😊', '😂', '🔥', '❤️', '👍', '🙏', '🙌', '✨', '👑', '💎',
    '😍', '🤩', '🤔', '🎉', '👏', '🚀', '💼', '📦', '📱', '🎧',
    '🛍', '💵', '✔️', '😭', '😮'
  ];

  if (isWidget) {
    const handleSendCustom = (textToSend: string) => {
      if (activeContact.isBlocked) {
        showToast('This channel is blocked. Unblock to resume chat.', 'warning');
        return;
      }
      if (isTransmittingRef.current) return;
      isTransmittingRef.current = true;

      const userMsgId = `usr-m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const userMsg: Message = {
        id: userMsgId,
        text: textToSend,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'sending'
      };

      setContacts((prevContacts) =>
        prevContacts.map((c) => {
          if (c.id === activeContactId) {
            return {
              ...c,
              lastMessage: textToSend,
              timestamp: 'Just now',
              messages: [...(c.messages || []), userMsg]
            };
          }
          return c;
        })
      );

      setMessageText('');
      setTimeout(() => scrollToBottom(true), 50);

      setTimeout(() => {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? {
                  ...c,
                  messages: (c.messages || []).map((m) =>
                    m.id === userMsgId ? { ...m, status: 'sent' } : m
                  )
                }
              : c
          )
        );
      }, 150);

      setTimeout(() => {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? {
                  ...c,
                  messages: (c.messages || []).map((m) =>
                    m.id === userMsgId ? { ...m, status: 'delivered' } : m
                  )
                }
              : c
          )
        );
        isTransmittingRef.current = false;
      }, 600);

      // Simulator response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyId = `adv-r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const replies = [
            "😊👍",
            "Perfect, thank you!",
            "Got it! Let me know if you need anything else.",
            "Understood, thank you!",
            "I'm on it right now!"
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const responseMsg: Message = {
            id: replyId,
            text: randomReply,
            sender: 'contact',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          };

          setContacts((prev) =>
            prev.map((c) => {
              if (c.id === activeContactId) {
                return {
                  ...c,
                  lastMessage: randomReply,
                  timestamp: 'Just now',
                  messages: [...(c.messages || []), responseMsg]
                };
              }
              return c;
            })
          );
          setTimeout(() => scrollToBottom(true), 50);
        }, 1200);
      }, 1000);
    };

    return (
      <div id="messenger-widget-container" className="w-full h-full flex flex-col overflow-hidden bg-white text-neutral-850 font-sans">
        {mobileView === 'list' ? (
          <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Chats Header */}
            <div className="p-4 flex flex-col gap-3 shrink-0 border-b border-solid border-neutral-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                  Chats
                </h3>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A833FF]/10 text-[#A833FF]">
                    Messenger Style
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  id="contact-search-bar-widget"
                  type="text"
                  placeholder="Search chats"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-[#F0F2F5] text-xs text-neutral-900 placeholder-neutral-500 rounded-full focus:outline-none border-none focus:ring-1 focus:ring-neutral-200 transition-all"
                />
              </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredContacts.length === 0 ? (
                <p className="text-center text-xs text-neutral-500 mt-10 font-sans">No chats found.</p>
              ) : (
                filteredContacts.map((c) => {
                  const isBlocked = c.isBlocked;
                  const isMuted = c.isMuted;
                  const isActive = c.id === activeContactId;
                  
                  let lastMsgContent = c.lastMessage;
                  if (isBlocked) {
                    lastMsgContent = '🚫 Blocked';
                  }

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveContactId(c.id);
                        setContacts(contacts.map(item => item.id === c.id ? { ...item, unreadCount: 0 } : item));
                        setMobileView('chat');
                        setTimeout(() => scrollToBottom(false), 80);
                      }}
                      className={`p-3 rounded-2xl flex gap-3.5 cursor-pointer transition-all duration-200 relative select-none ${
                        isActive
                          ? 'bg-[#F2F3F5]'
                          : 'hover:bg-[#F9F9FA]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={c.avatar} 
                          alt={c.name} 
                          className="w-12 h-12 rounded-full object-cover border border-solid border-neutral-200"
                          referrerPolicy="no-referrer"
                        />
                        {c.isOnline && !isBlocked && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-[#45BD62]" />
                        )}
                      </div>

                      <div className="text-xs flex-1 min-w-0 pr-4 flex flex-col justify-center">
                        <div className="flex justify-between items-baseline">
                          <h4 className="truncate font-semibold text-sm text-neutral-900 font-sans">{c.name}</h4>
                          <span className="text-[10px] text-neutral-400 font-sans">{c.timestamp}</span>
                        </div>
                        <p className={`truncate mt-0.5 text-xs ${c.unreadCount > 0 ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}>
                          {lastMsgContent}
                        </p>
                      </div>

                      {c.unreadCount > 0 && !isMuted && !isBlocked && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#0084FF] text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px]">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Active Chat View */
          <div className="flex flex-col h-full overflow-hidden bg-white relative">
            {/* Header exactly like screenshot */}
            <div className="px-3.5 py-2.5 border-b border-solid border-neutral-100 flex items-center justify-between shrink-0 relative z-10 bg-white">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="p-1.5 bg-[#0d0d0d] hover:bg-black rounded-xl transition-colors cursor-pointer text-white flex items-center justify-center border border-[#0d0d0d] shadow-xs active:scale-95"
                  title="Back to Chats"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                <div className="relative shrink-0">
                  <img 
                    src={activeContact.avatar} 
                    alt={activeContact.name} 
                    className="w-10 h-10 rounded-full object-cover border border-solid border-neutral-100" 
                    referrerPolicy="no-referrer" 
                  />
                  {activeContact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white bg-[#45BD62]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 group cursor-pointer">
                    <h4 className="text-sm font-bold text-neutral-900 font-sans tracking-tight">{activeContact.name}</h4>
                    <ChevronDown className="w-3 h-3 text-[#A833FF]" />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-sans leading-none mt-0.5">
                    {activeContact.isOnline ? 'Active 2h ago' : 'Offline'}
                  </span>
                </div>
              </div>
              
              {/* Purple Violet Header Icons */}
              <div className="flex items-center gap-1 relative">
                <button
                  ref={widgetMoreButtonRef}
                  type="button"
                  onClick={() => setShowWidgetDropdown(!showWidgetDropdown)}
                  className={`p-1.5 hover:bg-neutral-100 rounded-full text-[#A833FF] transition-all cursor-pointer flex items-center justify-center ${
                    showWidgetDropdown ? 'bg-neutral-100' : ''
                  }`}
                  title="More Options"
                >
                  <MoreVertical className="w-4 h-4 text-[#A833FF]" />
                </button>

                {/* Dropdown Options inside widget */}
                {showWidgetDropdown && (
                  <div 
                    ref={widgetDropdownRef}
                    className="absolute right-0 top-10 border border-solid rounded-xl shadow-2xl p-1.5 w-48 max-w-[85vw] z-50 text-[11px] font-semibold bg-white border-neutral-200 text-neutral-800"
                  >
                    {/* Silent/Mute */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentMuted = activeContact.isMuted;
                        setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isMuted: !currentMuted } : c));
                        showToast(currentMuted ? 'Notifications restored' : 'Notifications muted', 'info');
                        setShowWidgetDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 cursor-pointer transition-colors"
                    >
                      {activeContact.isMuted ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-green-500" />
                          <span>Restore Notices</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                          <span>Mute/Silent</span>
                        </>
                      )}
                    </button>

                    {/* Block/Unblock */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeContact.isBlocked) {
                          setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isBlocked: false } : c));
                          showToast(`${activeContact.name} unblocked successfully`, 'success');
                        } else {
                          setShowBlockConfirm(true);
                        }
                        setShowWidgetDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-100 cursor-pointer transition-colors"
                    >
                      <Ban className={`w-3.5 h-3.5 ${activeContact.isBlocked ? 'text-green-500' : 'text-red-500'}`} />
                      <span>{activeContact.isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
                    </button>

                    {/* Clear Chat */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowClearConfirm(true);
                        setShowWidgetDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete/Clear Chat</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-neutral-100 rounded-full text-[#A833FF] transition-all cursor-pointer flex items-center justify-center"
                  title="Close"
                >
                  <X className="w-4 h-4 text-[#A833FF] stroke-[3px]" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 bg-white custom-scrollbar flex flex-col"
            >
              {activeContact.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-1 mt-12">
                  <span className="text-xl">💬</span>
                  <p className="text-[11px] text-neutral-400">
                    Messenger encryption active. Start a conversation.
                  </p>
                </div>
              ) : (
                activeContact.messages.map((m, idx) => {
                  const fromMe = m.sender === 'user';

                  // Show date separator before the last image message or at custom position to match screenshot
                  const showDateSeparator = idx === 1;

                  return (
                    <div key={`media-msg-${m.id || 'id'}-${idx}`} className="flex flex-col">
                      {showDateSeparator && (
                        <div className="flex justify-center my-3">
                          <span className="text-[11px] text-neutral-400 font-sans font-medium">
                            {m.timestamp || 'Feb 16, 2026, 10:46 PM'}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {/* Received message shows tiny contact avatar on left */}
                        {!fromMe && (
                          <img 
                            src={activeContact.avatar} 
                            alt={activeContact.name} 
                            className="w-7 h-7 rounded-full object-cover border border-solid border-neutral-100 select-none shrink-0 mb-0.5" 
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {/* Rendering Message Content */}
                        {m.image ? (
                          /* Custom Outgoing Image Attachment with Captioned Bengali Text */
                          <div className="flex flex-col items-end">
                            <div className="border border-solid border-neutral-200 bg-white shadow-sm rounded-[24px] overflow-hidden max-w-[240px] flex flex-col">
                              <img 
                                src={m.image} 
                                alt="Attachment" 
                                className="w-full h-44 object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="bg-[#F0F2F5] px-4 py-3 text-center border-t border-solid border-neutral-100">
                                <span className="text-sm font-bold text-neutral-800 font-sans block">
                                  {m.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Standard Chat Bubble */
                          <div className={`rounded-[20px] px-3.5 py-2 text-xs leading-relaxed max-w-[80%] break-words ${
                            fromMe
                              ? 'bg-[#0084FF] text-white rounded-tr-[4px] font-sans font-medium'
                              : 'bg-[#F0F2F5] text-neutral-900 rounded-tl-[4px] font-sans'
                          }`}>
                            {m.text}
                          </div>
                        )}
                      </div>

                      {/* Seen status avatar below the last sent message */}
                      {fromMe && idx === activeContact.messages.length - 1 && (
                        <div className="flex justify-end mt-1 pr-1 select-none">
                          <img
                            src={activeContact.avatar}
                            alt="Seen"
                            className="w-3.5 h-3.5 rounded-full object-cover border border-white shadow-sm"
                            referrerPolicy="no-referrer"
                            title="Seen"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start items-center gap-2 pl-9">
                  <div className="rounded-[20px] px-3.5 py-2 bg-[#F0F2F5] text-neutral-500 text-xs flex items-center gap-1.5 font-sans">
                    <span className="text-[11px]">Typing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Messenger Buttons */}
            <div className="p-2 border-t border-solid border-neutral-100 flex items-center gap-2 bg-white shrink-0">
              {/* Bottom blue icon shortcuts */}
              <div className="flex items-center gap-1 shrink-0 pl-1">
                <button
                  type="button"
                  onClick={() => showToast('Voice messages ready...', 'info')}
                  className="p-1.5 text-[#0084FF] hover:bg-[#F0F2F5] rounded-full transition-all cursor-pointer flex items-center justify-center"
                  title="Record voice"
                >
                  <Mic className="w-[18px] h-[18px] text-[#0084FF]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sampleImgs = [
                      "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&q=80&w=600",
                      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600"
                    ];
                    setPendingImage(sampleImgs[Math.floor(Math.random() * sampleImgs.length)]);
                    showToast('Photo attachment selected! Type title and press send.', 'success');
                  }}
                  className="p-1.5 text-[#0084FF] hover:bg-[#F0F2F5] rounded-full transition-all cursor-pointer flex items-center justify-center"
                  title="Attach photo"
                >
                  <Image className="w-[18px] h-[18px] text-[#0084FF]" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Sticker menu ready...', 'info')}
                  className="p-1.5 text-[#0084FF] hover:bg-[#F0F2F5] rounded-full transition-all cursor-pointer flex items-center justify-center"
                  title="Stickers"
                >
                  <Smile className="w-[18px] h-[18px] text-[#0084FF]" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('GIF directory ready...', 'info')}
                  className="p-1 px-1.5 text-[#0084FF] hover:bg-[#F0F2F5] border border-solid border-[#0084FF] rounded-lg transition-all cursor-pointer flex items-center justify-center select-none"
                  title="GIF"
                >
                  <span className="text-[9px] font-extrabold leading-none tracking-wider text-[#0084FF]">GIF</span>
                </button>
              </div>

              {/* Text Input Pill */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (messageText.trim() || pendingImage) {
                    if (pendingImage) {
                      // Custom image flow
                      const userMsgId = `usr-m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                      const textVal = messageText.trim() || "Sent an attachment";
                      const userMsg: Message = {
                        id: userMsgId,
                        text: textVal,
                        sender: 'user',
                        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        status: 'sending',
                        image: pendingImage
                      };
                      setContacts((prevContacts) =>
                        prevContacts.map((c) => {
                          if (c.id === activeContactId) {
                            return {
                              ...c,
                              lastMessage: textVal,
                              timestamp: 'Just now',
                              messages: [...(c.messages || []), userMsg]
                            };
                          }
                          return c;
                        })
                      );
                      setMessageText('');
                      setPendingImage(null);
                      setTimeout(() => scrollToBottom(true), 50);
                    } else {
                      handleSendCustom(messageText.trim());
                    }
                  }
                }} 
                className="flex-grow flex items-center gap-1.5"
              >
                <div className="relative flex-grow flex items-center bg-[#F0F2F5] rounded-full px-3.5 py-1.5">
                  <input
                    id="widget-chat-input"
                    type="text"
                    disabled={activeContact.isBlocked}
                    placeholder={activeContact.isBlocked ? "Blocked..." : "Aa"}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-grow text-xs text-neutral-950 bg-transparent outline-none border-none focus:ring-0 w-full pr-6"
                  />
                  <button
                    type="button"
                    onClick={() => showToast('Emoji picker opened...', 'info')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0084FF] hover:opacity-85 flex items-center justify-center"
                  >
                    <Smile className="w-4 h-4 text-[#0084FF]" />
                  </button>
                </div>

                {/* Right button: Send or ThumbsUp based on content */}
                {messageText.trim() || pendingImage ? (
                  <button
                    type="submit"
                    className="p-1.5 hover:bg-[#F0F2F5] rounded-full text-[#0084FF] transition-all cursor-pointer flex items-center justify-center shrink-0"
                    title="Send message"
                  >
                    <Send className="w-5 h-5 text-[#0084FF] fill-[#0084FF]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendCustom('👍')}
                    className="p-1.5 hover:bg-[#F0F2F5] rounded-full text-[#0084FF] transition-all cursor-pointer flex items-center justify-center shrink-0"
                    title="Like"
                  >
                    <ThumbsUp className="w-5 h-5 text-[#0084FF] fill-[#0084FF]" />
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="messenger-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Container widget with WhatsApp styling */}
      <div className={`border border-solid ${
        isLightMode 
          ? 'bg-[#E5DDD5] border-neutral-200 shadow-xl' 
          : 'bg-[#0B141A] border-neutral-850 shadow-2xl shadow-black/80'
      } rounded-3xl overflow-hidden h-[680px] grid grid-cols-1 md:grid-cols-12`}>
        
        {/* Left column: Contact chats list */}
        <div className={`${
          mobileView === 'chat' ? 'hidden' : 'flex'
        } md:flex md:col-span-4 border-r border-solid ${
          isLightMode ? 'border-neutral-200 bg-white' : 'border-neutral-850 bg-[#111B21]'
        } flex-col h-full`}>
          
          {/* Header of channels */}
          <div className={`p-4 border-b border-solid ${
            isLightMode ? 'border-neutral-200 bg-[#F0F2F5]' : 'border-neutral-850 bg-[#202C33]'
          } space-y-3 shrink-0`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xs uppercase tracking-widest font-black font-sans flex items-center gap-2 ${
                isLightMode ? 'text-neutral-700' : 'text-white'
              }`}>
<<<<<<< HEAD
                <span className={`w-2.5 h-2.5 rounded-full ${isLightMode ? 'bg-[#9C4B8A]' : 'bg-[#FF007F]'} animate-pulse`}></span>
                Secure Concierge
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isLightMode ? 'bg-[#9C4B8A]/10 text-[#9C4B8A]' : 'bg-[#FF007F]/10 text-[#FF007F]'
=======
                <span className={`w-2.5 h-2.5 rounded-full ${isLightMode ? 'bg-[#9C4B8A]' : 'bg-[#D4AF37]'} animate-pulse`}></span>
                Secure Concierge
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isLightMode ? 'bg-[#9C4B8A]/10 text-[#9C4B8A]' : 'bg-[#D4AF37]/10 text-[#D4AF37]'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              }`}>
                WhatsApp Protocol
              </span>
            </div>

            {/* Search channels bar */}
            <div className="relative">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`} />
              <input
                id="contact-search-bar"
                type="text"
                placeholder="Search boutiques, advisors..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 border border-solid rounded-xl text-xs focus:outline-none transition-colors ${
                  isLightMode
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:bg-white focus:border-neutral-300'
                    : 'bg-[#202C33] border-transparent text-white placeholder-neutral-400 focus:bg-[#2A3942]'
                }`}
              />
            </div>

            {/* Quick Filter Pill Row */}
            <div className="flex gap-1.5 items-center overflow-x-auto no-scrollbar pt-0.5 select-none">
              {(['all', 'unread', 'starred', 'blocked'] as const).map((filter) => {
                const isActive = contactFilter === filter;
                let label = filter.toUpperCase();
                if (filter === 'all') label = 'All';
                if (filter === 'unread') label = 'Unread';
                if (filter === 'starred') label = 'Starred ⭐';
                if (filter === 'blocked') label = 'Blocked 🚫';

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setContactFilter(filter)}
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? isLightMode
                          ? 'bg-[#9C4B8A] text-white'
<<<<<<< HEAD
                          : 'bg-[#FF007F] text-neutral-900 font-extrabold'
=======
                          : 'bg-[#D4AF37] text-neutral-900 font-extrabold'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        : isLightMode
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-solid border-neutral-200/50'
                          : 'bg-[#202C33] hover:bg-[#2A3942] text-neutral-300 border border-solid border-[#2c3e46]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory Listings */}
          <div className={`flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth custom-scrollbar ${
            isLightMode ? 'bg-white' : 'bg-[#111B21]'
          }`}>
            {filteredContacts.map((c) => {
              const isBlocked = c.isBlocked;
              const isMuted = c.isMuted;
              const isActive = c.id === activeContactId;
              
              // Last message customized check
              let lastMsgContent = c.lastMessage;
              if (isBlocked) {
                lastMsgContent = '🚫 Corridor Blocked';
              }

              return (
                <div
                  key={c.id}
                  id={`contact-row-${c.id}`}
                  onClick={() => {
                    setActiveContactId(c.id);
                    setContacts(contacts.map(item => item.id === c.id ? { ...item, unreadCount: 0 } : item));
                    setMobileView('chat');
                  }}
                  className={`p-3.5 rounded-xl flex gap-3 cursor-pointer transition-all duration-200 relative select-none ${
                    isActive
                      ? isLightMode
                        ? 'bg-[#EAE6DF] border-l-4 border-solid border-[#9C4B8A] shadow-sm'
<<<<<<< HEAD
                        : 'bg-[#2A3942] border-l-4 border-solid border-[#FF007F] shadow-md shadow-black/15'
=======
                        : 'bg-[#2A3942] border-l-4 border-solid border-[#D4AF37] shadow-md shadow-black/15'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                      : isLightMode
                        ? 'hover:bg-neutral-50 border-l-4 border-solid border-transparent text-neutral-850'
                        : 'hover:bg-[#202C33]/50 border-l-4 border-solid border-transparent text-white'
                  }`}
                >
                  {/* Photo & Online badge */}
                  <div className="relative shrink-0">
                    <img 
                      src={c.avatar} 
                      alt={c.name} 
                      className={`w-11 h-11 rounded-full object-cover border border-solid ${
                        isLightMode ? 'border-neutral-200' : 'border-neutral-850'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 ${
                      isLightMode ? 'border-white' : 'border-[#111B21]'
                    } ${
                      c.isOnline && !isBlocked ? 'bg-[#00A884]' : 'bg-neutral-500'
                    }`} />
                  </div>

                  <div className="text-xs flex-1 min-w-0 pr-4">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-1.5 min-w-0 font-bold">
                        <h4 className={`truncate uppercase text-[11px] tracking-wider font-extrabold max-w-[90%] ${
                          isLightMode ? 'text-neutral-900' : 'text-neutral-100'
                        }`}>{c.name}</h4>
                        {isMuted && <VolumeX className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                        {isBlocked && <Ban className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      </div>
                      <span className={`text-[9px] font-mono shrink-0 ${
                        isActive ? 'text-neutral-500' : 'text-neutral-400'
                      }`}>{c.timestamp}</span>
                    </div>
                    <p className={`truncate mt-1 text-[11px] font-medium leading-relaxed ${
                      isActive 
                        ? 'text-neutral-600 dark:text-neutral-300' 
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {lastMsgContent}
                    </p>
                  </div>

                  {c.unreadCount > 0 && !isMuted && !isBlocked && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#25D366] text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Main active Conversation workspace */}
        <div className={`${
          mobileView === 'list' ? 'hidden' : 'flex'
        } md:flex md:col-span-8 flex-col h-full relative`}>

          {/* Active Chat Header */}
          {isSelectionMode ? (
            <div className={`px-4 sm:px-6 py-3 border-b border-solid flex items-center justify-between shrink-0 relative z-10 shadow-sm ${
<<<<<<< HEAD
              isLightMode ? 'border-[#9C4B8A]/35 bg-[#EAE6DF] text-neutral-800' : 'border-[#FF007F]/35 bg-[#222E35] text-white'
=======
              isLightMode ? 'border-[#9C4B8A]/35 bg-[#EAE6DF] text-neutral-800' : 'border-[#D4AF37]/35 bg-[#222E35] text-white'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
            }`}>
              <div className="flex items-center gap-3.5">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedMsgIds([]);
                  }}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
<<<<<<< HEAD
                    isLightMode ? 'hover:bg-neutral-200 text-neutral-700' : 'hover:bg-[#2A3942] text-[#FF007F]'
=======
                    isLightMode ? 'hover:bg-neutral-200 text-neutral-700' : 'hover:bg-[#2A3942] text-[#D4AF37]'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                  }`}
                  title="Cancel selection"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                  {selectedMsgIds.length} Selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedMsgIds.length === 0}
                  onClick={() => {
                    const selectedMsgs = activeContact.messages.filter(m => selectedMsgIds.includes(m.id));
                    const combinedText = selectedMsgs.map(m => m.text).filter(Boolean).join('\n---\n');
                    setForwardMsg({
                      id: 'forwarded-combo',
                      text: combinedText,
                      sender: 'user',
                      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                    });
                    setSelectedForwardContactIds([]);
                  }}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-solid border-purple-500/20 hover:bg-purple-500/10 text-[#bf8bf1] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  title="Forward selected items"
                >
                  <Forward className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Forward</span>
                </button>

                <button
                  type="button"
                  disabled={selectedMsgIds.length === 0}
                  onClick={() => {
                    setContacts(contacts.map(c => {
                      if (c.id === activeContactId) {
                        const remainingMsgs = c.messages.filter(m => !selectedMsgIds.includes(m.id));
                        const lastMsgText = remainingMsgs.length > 0 ? remainingMsgs[remainingMsgs.length - 1].text : 'No messages yet';
                        return {
                          ...c,
                          messages: remainingMsgs,
                          lastMessage: lastMsgText
                        };
                      }
                      return c;
                    }));
                    const count = selectedMsgIds.length;
                    setIsSelectionMode(false);
                    setSelectedMsgIds([]);
                    showToast(`${count} messages deleted`, 'success');
                  }}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-solid border-red-500/20 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  title="Delete selected items"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`px-4 sm:px-6 py-3 border-b border-solid ${
              isLightMode ? 'border-neutral-200 bg-[#F0F2F5] text-neutral-800' : 'border-neutral-850 bg-[#202C33] text-white'
            } flex items-center justify-between shrink-0 relative z-10 shadow-sm`}>
              
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className={`md:hidden p-1.5 rounded-xl transition-all cursor-pointer shrink-0 border active:scale-95 flex items-center justify-center ${
                    isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-[#2A3942] hover:bg-[#324450] text-neutral-200 border-neutral-700'
                  }`}
                  title="Back to lists"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
  
                <img 
                  src={activeContact.avatar} 
                  alt={activeContact.name} 
                  className="w-9 h-9 rounded-full object-cover border border-solid border-neutral-700 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs min-w-0">
                  <h4 className={`text-[12px] sm:text-[13px] font-black uppercase tracking-wider truncate ${
                    isLightMode ? 'text-neutral-900' : 'text-neutral-100'
                  }`}>{activeContact.name}</h4>
                  <p className={`font-semibold flex items-center gap-1.5 mt-0.5 truncate text-[10px] sm:text-[11px] ${
                    isLightMode ? 'text-neutral-500' : 'text-neutral-350'
                  }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      activeContact.isOnline && !activeContact.isBlocked ? 'bg-[#00D488] animate-pulse' : 'bg-neutral-500'
                    }`} />
                    <span className="truncate">
                      {activeContact.isBlocked 
                        ? 'Corridor Blocked' 
                        : activeContact.isOnline 
                          ? 'online' 
                          : 'last seen today at 10:42 AM'}
                    </span>
                  </p>
                </div>
              </div>
  
              {/* Utility Actions & Menu Dropdown trigger */}
              <div className="flex items-center gap-1 text-neutral-400 relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSearchingChat(!isSearchingChat)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isLightMode 
                      ? isSearchingChat ? 'bg-[#9C4B8A]/10 text-[#9C4B8A]' : 'text-neutral-600 hover:bg-neutral-200' 
<<<<<<< HEAD
                      : isSearchingChat ? 'bg-[#FF007F]/10 text-[#FF007F]' : 'text-neutral-300 hover:bg-neutral-800'
=======
                      : isSearchingChat ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-neutral-300 hover:bg-neutral-800'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                  }`}
                  title="Search messages in this channel"
                >
                  <Search className="w-4 h-4" />
                </button>
  
                <button
                  ref={moreButtonRef}
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isLightMode 
                      ? showDropdown ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-200' 
                      : showDropdown ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Advisors settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
  
                {/* Three-dot dropdown options */}
                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    className={`absolute right-0 top-11 border border-solid rounded-xl shadow-2xl p-1.5 w-48 max-w-[85vw] z-20 text-[11px] font-semibold ${
                      isLightMode ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-[#233138] border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        showToast(`Viewing ${activeContact.name}'s luxury advisor profile`, 'info');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-400/15 cursor-pointer`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>
  
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setIsSearchingChat(true);
                       }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-400/15 cursor-pointer`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search in Chat</span>
                    </button>
  
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        const currentMuted = activeContact.isMuted;
                        setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isMuted: !currentMuted } : c));
                        showToast(currentMuted ? 'Notifications restored' : 'Notifications muted', 'info');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-400/15 cursor-pointer`}
                    >
                      {activeContact.isMuted ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-green-500" />
                          <span>Restore Notices</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                          <span>Mute Notices</span>
                        </>
                      )}
                    </button>
  
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        if (activeContact.isBlocked) {
                          setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isBlocked: false } : c));
                          showToast(`${activeContact.name} unblocked successfully`, 'success');
                        } else {
                          setShowBlockConfirm(true);
                        }
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-neutral-400/15 cursor-pointer`}
                    >
                      <Ban className={`w-3.5 h-3.5 ${activeContact.isBlocked ? 'text-green-500' : 'text-red-500'}`} />
                      <span>{activeContact.isBlocked ? 'Unblock Butler' : 'Block Butler'}</span>
                    </button>
  
                    <div className={`my-1 border-t border-solid ${
                      isLightMode ? 'border-neutral-200' : 'border-neutral-800'
                    }`} />
  
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowClearConfirm(true);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Chat History</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Interactive Slide Search bar */}
          {isSearchingChat && (
            <div className={`px-4 sm:px-6 py-2.5 border-b border-solid flex items-center justify-between gap-3 animate-fade-in ${
              isLightMode ? 'bg-[#FCFAF7] border-neutral-100' : 'bg-[#182229] border-neutral-800 text-white'
            }`}>
              <div className="flex items-center gap-2 flex-grow max-w-md relative">
<<<<<<< HEAD
                <Search className={`w-3.5 h-3.5 ${isLightMode ? 'text-neutral-500' : 'text-[#FF007F]'}`} />
=======
                <Search className={`w-3.5 h-3.5 ${isLightMode ? 'text-neutral-500' : 'text-[#D4AF37]'}`} />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                <input
                  type="text"
                  placeholder="Filter messages in this stream..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs focus:outline-none focus:ring-1 ${
                    isLightMode
                      ? 'bg-neutral-100 border border-neutral-200 text-neutral-900 focus:bg-white focus:border-neutral-300'
                      : 'bg-[#2A3942] border-transparent text-white placeholder-neutral-400 focus:bg-[#202C33]'
                  }`}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSearchingChat(false);
                  setChatSearchQuery('');
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLightMode ? 'hover:bg-neutral-200 text-neutral-500' : 'hover:bg-neutral-800 text-neutral-450'
                }`}
                title="Close searching"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Pinned Messages Bar */}
          {activeContact.messages && activeContact.messages.filter(m => m.isPinned).length > 0 && (
            <div className={`px-4 py-2 border-b border-solid flex items-center justify-between gap-3 text-xs font-semibold shrink-0 select-none animate-fade-in ${
              isLightMode ? 'bg-[#FCFAF7] border-neutral-200 text-neutral-800' : 'bg-[#182229] border-neutral-800 text-neutral-200'
            }`}>
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-0.5 flex-1 select-none pr-3">
                <span className="text-amber-500 text-xs shrink-0 select-none">📌</span>
                <div className="flex gap-2.5 items-center select-none">
                  {activeContact.messages.filter(m => m.isPinned).map((pinMsg, pinIdx) => {
                    return (
                      <button
                        key={`pin-${pinMsg.id || 'pin'}-${pinIdx}`}
                        type="button"
                        onClick={() => {
                          const element = document.getElementById(`msg-bubble-container-${pinMsg.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setHighlightedMsgId(pinMsg.id);
                            setTimeout(() => setHighlightedMsgId(null), 2000);
                          } else {
                            showToast('Message not found in active workspace', 'warning');
                          }
                        }}
                        className={`px-2 py-1 rounded-lg border border-solid text-[10.5px] max-w-[140px] truncate transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                          isLightMode 
                            ? 'bg-neutral-100/80 border-neutral-200 hover:bg-[#9C4B8A]/10 text-neutral-700' 
<<<<<<< HEAD
                            : 'bg-neutral-850/80 border-neutral-750 hover:bg-[#FF007F]/10 text-neutral-200'
                        }`}
                        title="Scroll to pinned message"
                      >
                        <span className="font-extrabold text-[#FF007F]">#{pinIdx + 1}:</span>
=======
                            : 'bg-neutral-850/80 border-neutral-750 hover:bg-[#D4AF37]/10 text-neutral-200'
                        }`}
                        title="Scroll to pinned message"
                      >
                        <span className="font-extrabold text-[#D4AF37]">#{pinIdx + 1}:</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        <span className="truncate">{pinMsg.text || 'Voice/Media'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setContacts(contacts.map(c => {
                    if (c.id === activeContactId) {
                      const clearedMsg = c.messages.map(m => ({ ...m, isPinned: false }));
                      return { ...c, messages: clearedMsg };
                    }
                    return c;
                  }));
                  showToast('All messages unpinned', 'info');
                }}
<<<<<<< HEAD
                className={`text-[9.5px] uppercase font-black tracking-widest text-[#FF007F] hover:brightness-125 shrink-0 cursor-pointer`}
=======
                className={`text-[9.5px] uppercase font-black tracking-widest text-[#D4AF37] hover:brightness-125 shrink-0 cursor-pointer`}
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              >
                Unpin All
              </button>
            </div>
          )}

          {/* Messages stream chat scroll container */}
          <div 
            ref={scrollContainerRef} 
            className={`flex-1 overflow-y-auto p-4 sm:p-6 pb-10 sm:pb-12 space-y-3 relative scroll-smooth custom-scrollbar ${
              isLightMode ? 'bg-white' : 'bg-[#18191A]'
            }`}
          >
            {activeContact.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                <span className="text-3xl">💬</span>
                <p className={`text-xs max-w-xs font-semibold ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  This corridor is fully encrypted. Begin your conversation safely with {activeContact.name}.
                </p>
              </div>
            ) : (
              getMessageGroups(activeContact.messages).map((group, gIdx) => (
                <div key={group.label + gIdx} className="space-y-4">
                  {/* Messenger-style subtle date separator */}
                  <div className="flex justify-center my-4 select-none">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-neutral-400">
                      {group.label}
                    </span>
                  </div>

                  {group.messages.map((m, mIdx) => {
                    const fromMe = m.sender === 'user';
                    
                    return (
                      <div
                        key={`msg-${m.id || 'id'}-${mIdx}`}
                        id={`msg-bubble-container-${m.id}`}
                        className={`group/msg flex ${fromMe ? 'justify-end' : 'justify-start'} items-start gap-1.5 relative transition-all duration-500 rounded-xl px-2 py-1 ${
                          highlightedMsgId === m.id
                            ? isLightMode
                              ? 'bg-amber-150/40 border-l-4 border-solid border-[#9C4B8A]'
<<<<<<< HEAD
                              : 'bg-[#FF007F]/15 border-l-4 border-solid border-[#FF007F]'
=======
                              : 'bg-[#D4AF37]/15 border-l-4 border-solid border-[#D4AF37]'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                            : ''
                        } ${
                          m.reactions && m.reactions.length > 0 ? 'pb-3.5' : 'pb-1'
                        }`}
                      >
                        {/* Selector checkbox for multi selection mode */}
                        {isSelectionMode && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectMsg(m.id);
                            }}
                            className="mr-1.5 self-center shrink-0 cursor-pointer select-none"
                          >
                            <div className={`w-4 h-4 rounded border border-solid flex items-center justify-center transition-all ${
                              selectedMsgIds.includes(m.id)
<<<<<<< HEAD
                                ? 'bg-[#FF007F] border-[#FF007F] text-white'
=======
                                ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                                : isLightMode ? 'border-neutral-400 bg-white' : 'border-neutral-700 bg-neutral-900'
                            }`}>
                              {selectedMsgIds.includes(m.id) && <Check className="w-2.5 h-2.5 stroke-[3px] text-black" />}
                            </div>
                          </div>
                        )}

                        {/* Hover Action Options Menu on left/right */}
                        {fromMe && !isSelectionMode && (
                          <div className="hidden group-hover/msg:flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full absolute -left-20 top-2 z-10 transition-all opacity-0 animate-fade-in group-hover/msg:opacity-100 text-white shadow-lg">
                            <button
                              type="button"
                              onClick={() => setReplyingToMsg(m)}
                              className="p-1 hover:text-[#25D366] transition-colors cursor-pointer"
                              title="Reply"
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStarMsg(m.id)}
                              className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Star message"
                            >
                              <Star className={`w-3.5 h-3.5 ${m.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.text || '')}
                              className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(m.id)}
                              className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {!fromMe && !isSelectionMode && (
                          <div className="hidden group-hover/msg:flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full absolute -right-20 top-2 z-10 transition-all opacity-0 animate-fade-in group-hover/msg:opacity-100 text-white shadow-lg">
                            <button
                              type="button"
                              onClick={() => setReplyingToMsg(m)}
                              className="p-1 hover:text-[#25D366] transition-colors cursor-pointer"
                              title="Reply"
                            >
                              <Reply className="w-3.5 h-3.5 rotate-180 scale-y-[-1]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStarMsg(m.id)}
                              className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Star"
                            >
                              <Star className={`w-3.5 h-3.5 ${m.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.text || '')}
                              className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleForwardMsg(m)}
                              className="p-1 hover:text-purple-400 transition-colors cursor-pointer"
                              title="Forward"
                            >
                              <Forward className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Message Bubble wrapper */}
                        <div
                          onContextMenu={(e) => {
                            if (isSelectionMode) {
                              e.preventDefault();
                              handleToggleSelectMsg(m.id);
                              return;
                            }
                            handleContextMenu(e, m);
                          }}
                          onClick={() => {
                            if (isSelectionMode) {
                              handleToggleSelectMsg(m.id);
                            }
                          }}
                          onTouchStart={(e) => {
                            if (isSelectionMode) return;
                            onBubbleTouchStart(e, m);
                          }}
                          onTouchEnd={onBubbleTouchEnd}
                          onTouchMove={onBubbleTouchMove}
                          className={`relative px-4 py-2.5 max-w-[75%] shadow-sm transition-all duration-200 cursor-pointer ${
                            selectedMsgIds.includes(m.id)
                              ? 'scale-[0.98] ring-1 ring-blue-500/55 opacity-95'
                              : ''
                          } ${
                            fromMe
                              ? 'bg-[#0084FF] text-white rounded-2xl rounded-br-sm'
                              : isLightMode
                                ? 'bg-[#E4E6EB] text-neutral-900 rounded-2xl rounded-bl-sm'
                                : 'bg-[#3E4042] text-white rounded-2xl rounded-bl-sm'
                          }`}
                        >
                          {/* STARRED INDICATION BADGE */}
                          {m.isStarred && (
                            <div className="absolute top-1 right-2.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shadow-sm" />
                            </div>
                          )}

                          {/* Quoted Reply Header nested box if present */}
                          {m.replyToText && (
                            <div className={`p-2 rounded-lg text-[10.5px] border-l-4 border-solid mb-1.5 leading-relaxed truncate max-w-full ${
                              isLightMode
                                ? 'bg-neutral-900/5 border-[#9C4B8A] text-neutral-700'
<<<<<<< HEAD
                                : 'bg-black/20 border-[#FF007F] text-neutral-300'
=======
                                : 'bg-black/20 border-[#D4AF37] text-neutral-300'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                            }`}>
                              <p className="font-extrabold text-[9px] uppercase tracking-wide">
                                Replying to {m.replyToSender === 'user' ? 'You' : 'Advisor'}
                              </p>
                              <p className="italic truncate">{m.replyToText}</p>
                            </div>
                          )}

                          {/* Image Attachment content */}
                          {m.image && (
                            <div className="rounded-xl overflow-hidden border border-solid border-neutral-800 max-w-full sm:max-w-xs bg-black mb-2 flex items-center justify-center">
                              <img 
                                src={m.image} 
                                alt="Shared asset preview" 
                                className="w-full h-auto max-h-40 object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                          )}

                          {/* INLINE EDIT MODE OR REGULAR VIEW */}
                          {editingMsgId === m.id ? (
                            <div className="space-y-2 py-1 select-none min-w-[160px] sm:min-w-[200px]" onClick={(e) => { e.stopPropagation(); }}>
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className={`w-full p-2 text-xs rounded-lg focus:outline-none focus:ring-1 border border-solid font-semibold leading-relaxed ${
                                  isLightMode
                                    ? 'bg-white border-neutral-300 text-neutral-900 focus:ring-[#9C4B8A]'
<<<<<<< HEAD
                                    : 'bg-[#2A3942] border-[#FF007F]/55 text-white focus:ring-[#FF007F]'
=======
                                    : 'bg-[#2A3942] border-[#D4AF37]/55 text-white focus:ring-[#D4AF37]'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                                }`}
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMsgId(null);
                                    setEditingText('');
                                  }}
                                  className="p-1 rounded bg-red-500/15 hover:bg-red-500/30 text-red-500 transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateEditMessage(m.id, editingText);
                                  }}
                                  className="p-1 rounded bg-green-500/15 hover:bg-green-500/30 text-green-500 transition-colors cursor-pointer"
                                  title="Save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Voice Recording Message layout */}
                              {m.isVoice ? (
                                <div className="flex items-center gap-3 py-1.5 pr-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (playingVoiceId === m.id) {
                                        setPlayingVoiceId(null);
                                      } else {
                                        setPlayingVoiceId(m.id);
                                        setTimeout(() => setPlayingVoiceId((curr) => curr === m.id ? null : curr), 4000);
                                      }
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                      fromMe
<<<<<<< HEAD
                                        ? isLightMode ? 'bg-[#9C4B8A] text-white' : 'bg-[#FF007F] text-neutral-900'
=======
                                        ? isLightMode ? 'bg-[#9C4B8A] text-white' : 'bg-[#D4AF37] text-neutral-900'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                                        : isLightMode ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-800 text-white'
                                    } cursor-pointer`}
                                  >
                                    {playingVoiceId === m.id ? (
                                      <Pause className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                                    )}
                                  </button>

                                  {/* Waveform indicator lines */}
                                  <div className="flex flex-col flex-grow">
                                    <div className="flex items-end gap-0.5 h-5 px-1">
                                      {Array.from({ length: 18 }).map((_, idx) => {
                                        const heightPercent = idx % 3 === 0 ? 'h-2' : idx % 2 === 0 ? 'h-3.5' : 'h-1.5';
                                        const isPassed = idx < 10;
                                        return (
                                          <span
                                            key={idx}
                                            className={`w-0.5 ${heightPercent} rounded-full transition-all ${
                                              playingVoiceId === m.id && isPassed
                                                ? 'bg-amber-400 animate-pulse'
                                                : fromMe
                                                  ? 'bg-neutral-300'
                                                  : 'bg-neutral-500'
                                            }`}
                                          />
                                        );
                                      })}
                                    </div>
                                    <span className="text-[8.5px] font-mono tracking-wider opacity-85 mt-1 block">
                                      {m.voiceDuration || '0:05'} · encrypted audio
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                /* Regular Text note */
                                m.text && (
                                  <div className="message-bubble-content max-h-[280px] overflow-y-auto custom-scrollbar pr-1 text-xs md:text-[13px] leading-relaxed font-semibold whitespace-pre-line tracking-wide">
                                    {highlightText(m.text, chatSearchQuery)}
                                  </div>
                                )
                              )}
                            </>
                          )}

                          {/* Footer with Timestamp and WhatsApp ticking checks */}
                          <div className="flex items-center justify-end gap-1 px-0.5 mt-1.5 text-[8.5px] font-mono opacity-80 leading-none select-none">
<<<<<<< HEAD
                            {m.isEdited && <span className="italic mr-1 text-[#FF007F] font-semibold font-sans">edited</span>}
=======
                            {m.isEdited && <span className="italic mr-1 text-[#D4AF37] font-semibold font-sans">edited</span>}
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                            <span>{m.timestamp}</span>

                            {fromMe && (
                              m.status === 'sending' ? (
                                <Clock className="w-2.5 h-2.5 animate-spin text-neutral-400" />
                              ) : m.status === 'sent' ? (
                                <Check className="w-3 h-3 text-neutral-400" />
                              ) : m.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3 text-neutral-400" />
                              ) : m.status === 'read' ? (
                                <CheckCheck className={`w-3 h-3 ${isLightMode ? 'text-amber-500' : 'text-amber-300'}`} />
                              ) : (
                                <CheckCheck className="w-3 h-3 text-neutral-400" />
                              )
                            )}
                          </div>

                          {/* REACTION BADGES */}
                          {m.reactions && m.reactions.length > 0 && (
                            <div className={`absolute -bottom-2 flex items-center gap-1 px-2 py-0.5 rounded-full border border-solid text-[9.5px] font-black shadow-md select-none shrink-0 cursor-pointer ${
                              fromMe ? 'right-3' : 'left-3'
                            } ${
                              isLightMode
                                ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                                : 'bg-[#1F2C34] border-neutral-750 text-neutral-200 hover:bg-neutral-800'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (m.reactions && m.reactions.length > 0) {
                                handleToggleReaction(m.id, m.reactions[0].emoji);
                              }
                            }}
                            title="Click to remove reaction"
                            >
                              {m.reactions.map((r, rIdx) => (
                                <span key={rIdx}>{r.emoji}</span>
                              ))}
                              {m.reactions.length > 1 && (
<<<<<<< HEAD
                                <span className="font-mono text-[8px] font-extrabold opacity-95 text-[#FF007F] ml-0.5">{m.reactions.length}</span>
=======
                                <span className="font-mono text-[8px] font-extrabold opacity-95 text-[#D4AF37] ml-0.5">{m.reactions.length}</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            {/* WA Generic Typing Indicator bubble */}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className={`relative px-4 py-3 rounded-2xl border shadow-lg rounded-tl-none max-w-[65%] ${
                  isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-[#202C33] border-neutral-800 text-neutral-100'
                }`}>
                  {/* Left Bubble Tail */}
                  <div className="absolute left-[-6px] top-0 w-3 h-3 overflow-hidden select-none pointer-events-none">
                    <div className={`w-4 h-4 rotate-45 transform origin-top-left rounded-sm ${
                      isLightMode ? 'bg-white' : 'bg-[#202C33]'
                    }`}></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest uppercase text-[#00A884]">
                      {activeContact.name.split(' ')[0]} is writing
                    </span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                  <p className="text-[9.5px] text-neutral-500 font-medium mt-1">Typing secure luxury response...</p>
                </div>
              </div>
            )}
          </div>

          {/* User Input actions panel */}
          <div className="shrink-0 relative">
            
            {/* 7. Replying To bar visual context preview */}
            {replyingToMsg && (
              <div className={`px-4 sm:px-6 py-2 border-b border-solid flex items-center justify-between gap-3 animate-slide-up ${
                isLightMode ? 'bg-neutral-100 border-neutral-200 text-neutral-800' : 'bg-[#1f2c34] border-neutral-800 text-neutral-200'
              }`}>
                <div className="flex items-start gap-2 text-xs border-l-4 border-solid border-[#00A884] pl-2.5 truncate max-w-lg">
                  <div>
                    <p className="font-extrabold text-[9px] uppercase tracking-wide text-[#00A884]">
                      Replying to {replyingToMsg.sender === 'user' ? 'yourself' : activeContact.name}
                    </p>
                    <p className="italic truncate text-[11px]">
                      {replyingToMsg.text || '🎙 Voice note'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingToMsg(null)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    isLightMode ? 'hover:bg-neutral-200 text-neutral-500' : 'hover:bg-neutral-800 text-neutral-400'
                  }`}
                  title="Cancel reply"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Undo Deletion Toast Alert Panel */}
            {lastDeletedMsg && (
              <div className={`px-4 sm:px-6 py-2 border-b border-solid flex items-center justify-between gap-3 animate-slide-up ${
                isLightMode ? 'bg-[#FCFAF7] border-neutral-200' : 'bg-[#182229] border-neutral-800'
              }`}>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-red-500 text-base">🗑️</span>
                  <span className={isLightMode ? 'text-neutral-700' : 'text-neutral-300'}>
                    Message deleted. You can retrieve it instantly.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleUndoDelete}
                    className="px-2.5 py-1 text-[10px] uppercase font-black tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLastDeletedMsg(null)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isLightMode ? 'hover:bg-neutral-200 text-neutral-500' : 'hover:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Emoji Picker Popup container */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className={`absolute bottom-full left-4 mb-2 p-3.5 rounded-2xl border border-solid shadow-2xl z-25 w-64 max-w-[90vw] animate-fade-in ${
                  isLightMode ? 'bg-white border-neutral-200 shadow-neutral-100' : 'bg-[#233138] border-neutral-800 text-white'
                }`}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#00A884]">
                    Select Emoji
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(false)} 
                    className="p-0.5 rounded-lg hover:bg-neutral-400/10"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2.5 text-center">
                  {emojiList.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => {
                        setMessageText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-xl hover:scale-115 active:scale-90 transition-transform cursor-pointer p-1 rounded-lg hover:bg-neutral-500/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Attachment Popover Menu */}
            {showAttachmentMenu && (
              <div 
                ref={attachmentMenuRef}
                className={`absolute bottom-full left-12 mb-3 rounded-2xl p-4 w-48 border border-solid shadow-2xl z-25 animate-scale-up ${
                  isLightMode ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-[#233138] border-neutral-800 text-white'
                }`}
              >
                <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400 border-b border-solid border-neutral-400/10 pb-2 mb-2">
                  Paperclip menu
                </p>
                <div className="flex flex-col gap-2">
                  {/* Photo triggers file select */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2.5 py-2 px-2 rounded-xl text-xs font-bold hover:bg-neutral-400/10 text-left transition-colors cursor-pointer w-full"
                  >
                    <span className="w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5" />
                    </span>
                    <span>Camera / Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      showToast('Secure Document Index: Loaded. Select file below ₹50MB.', 'info');
                    }}
                    className="flex items-center gap-2.5 py-2 px-2 rounded-xl text-xs font-bold hover:bg-neutral-400/10 text-left transition-colors cursor-pointer w-full"
                  >
                    <span className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                    <span>Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      showToast('Live secure GPS locator dispatched to concierge advisor.', 'success');
                    }}
                    className="flex items-center gap-2.5 py-2 px-2 rounded-xl text-xs font-bold hover:bg-neutral-400/10 text-left transition-colors cursor-pointer w-full"
                  >
                    <span className="w-7 h-7 bg-[#25D366] text-white rounded-full flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <span>GPS Location</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      showToast('Premium client digital identity card shared inside channel.', 'success');
                    }}
                    className="flex items-center gap-2.5 py-2 px-2 rounded-xl text-xs font-bold hover:bg-neutral-400/10 text-left transition-colors cursor-pointer w-full"
                  >
                    <span className="w-7 h-7 bg-amber-500 text-neutral-950 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <span>Contact Info</span>
                  </button>
                </div>
              </div>
            )}

            {/* Default bottom bar form input */}
            <form
              onSubmit={handleSend}
              className={`p-3.5 border-t border-solid ${
                isLightMode ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-[#18191A]'
              }`}
              id="chat-user-input-form"
            >
              {/* Image Preview staging thumb */}
              {pendingImage && (
                <div className={`mb-2.5 flex items-center gap-3 border border-solid p-2.5 rounded-xl max-w-xs animate-fade-in relative ${
                  isLightMode ? 'bg-[#FCFAF7] border-neutral-300' : 'bg-[#182229] border-neutral-800 text-white'
                }`}>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-solid border-neutral-700">
                    <img src={pendingImage} alt="Staged snapshot" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[10px] min-w-0 pr-6">
                    <p className="font-extrabold truncate">snapshot_upload.png</p>
                    <p className="text-neutral-400 text-[8px] uppercase tracking-wider mt-0.5">Ready to transmit</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center border border-solid border-[#0B141A] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Block status alert banner */}
              {activeContact.isBlocked && (
                <div className="flex items-center gap-2 bg-red-950/40 border border-solid border-red-900/30 text-red-400 p-2 text-center text-[10px] font-semibold tracking-wide uppercase rounded-xl justify-center mb-2">
                  <span>🚫 Advisor blocked. Resuming chat stream disabled currently.</span>
                </div>
              )}

              <div className="flex items-center gap-2 relative">
                
                {/* 4. Voice recorder dynamic overlay inside input bar */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="absolute inset-0 bg-[#25D366]/10 backdrop-blur-sm z-30 rounded-2xl flex items-center justify-between px-4 border border-solid border-[#25D366]/40"
                    >
                      <div className="flex items-center gap-2 text-xs font-black">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
                        <span className="text-red-500 uppercase tracking-widest text-[10px]">Recording client memo</span>
                        <span className="font-mono text-neutral-800 dark:text-neutral-200">
                          {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Cancel trash button */}
                        <button
                          type="button"
                          onClick={cancelVoiceRecording}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                        >
                          Discard
                        </button>
                        {/* Stop and send button */}
                        <button
                          type="button"
                          onClick={stopAndSendVoiceRecording}
                          className="px-3 py-1.5 bg-[#00A884] hover:bg-[#009070] text-white text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          Send Memo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="hidden-image-upload-input"
                />

                {/* Left controls: Attachment, then Smile face exactly like Messenger */}
                <div className="flex gap-1 text-neutral-400 shrink-0">
                  <button
                    type="button"
                    disabled={activeContact.isBlocked}
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      isLightMode ? 'hover:bg-neutral-100 text-neutral-500' : 'hover:bg-neutral-800 text-neutral-350'
                    }`}
                    title="Attachment tools clips"
                  >
                    <Paperclip className="w-5 h-5 text-blue-500" />
                  </button>

                  <button
                    type="button"
                    disabled={activeContact.isBlocked}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      isLightMode ? 'hover:bg-neutral-100 text-neutral-500' : 'hover:bg-neutral-800 text-neutral-350'
                    }`}
                    title="Add smile emojis picker"
                  >
                    <Smile className="w-5 h-5 text-blue-500" />
                  </button>
                </div>

                {/* Primary TextInput area (Pill Shaped with Soft Gray Background) */}
                <input
                  id="chat-text-input"
                  type="text"
                  disabled={activeContact.isBlocked}
                  placeholder={activeContact.isBlocked ? "Unblock advisor to compose..." : "Write message..."}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className={`flex-1 px-4 py-2.5 border-none outline-none rounded-full text-xs disabled:opacity-50 transition-colors ${
                    isLightMode 
                      ? 'bg-[#E4E6EB] text-neutral-900 placeholder-neutral-500 focus:bg-[#D8DADF]' 
                      : 'bg-[#3E4042] text-white placeholder-neutral-400 focus:bg-[#4E4F51]'
                  }`}
                />

                {/* Circular Mic vs Send button on the right */}
                {messageText.trim() === '' && !pendingImage ? (
                  <button
                    type="button"
                    disabled={activeContact.isBlocked}
                    onClick={startVoiceRecording}
                    className={`p-2.5 rounded-full transition-all duration-200 select-none ${
                      isLightMode 
                        ? 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#0084FF]' 
                        : 'bg-[#3E4042] hover:bg-[#4E4F51] text-[#0084FF]'
                    } disabled:opacity-35 cursor-pointer shrink-0 flex items-center justify-center`}
                    title="Record voice note memo"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="chat-send-submit"
                    type="submit"
                    disabled={activeContact.isBlocked}
                    className="p-2.5 bg-[#0084FF] hover:bg-[#006ACC] text-white rounded-full transition-all duration-200 select-none disabled:opacity-35 cursor-pointer shrink-0 flex items-center justify-center shadow-sm"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}

              </div>
            </form>

          </div>

        </div>
      </div>

      {/* Block Confirm Dialog Overlay modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowBlockConfirm(false)}>
          <div className={`border border-solid rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-fade-in ${
            isLightMode 
              ? 'bg-white border-red-200 text-neutral-900 shadow-neutral-100' 
              : 'bg-neutral-900 border-red-500/30 text-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black uppercase tracking-wider">Confirm Block Action</h3>
              <p className={`text-xs mt-1 leading-relaxed ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Are you sure you want to block <span className="font-extrabold">{activeContact.name}</span>? 
                This will prevent sending and receiving messages.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isLightMode ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isBlocked: true } : c));
                  setShowBlockConfirm(false);
                  showToast(`${activeContact.name} advisor has been blocked`, 'warning');
                }}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirm Dialog modal overlay */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
          <div className={`border border-solid rounded-2xl max-w-sm w-full p-6 text-center space-y-4 animate-fade-in ${
            isLightMode 
              ? 'bg-white border-neutral-250 text-neutral-900 shadow-xl' 
              : 'bg-neutral-900 border-red-500/20 text-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black uppercase tracking-wider">Clear Chat History</h3>
              <p className={`text-xs mt-1 leading-relaxed ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Are you sure you want to delete all messages in this stream with <span className="font-extrabold">{activeContact.name}</span>? This action is permanent.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isLightMode ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setContacts(contacts.map(c => c.id === activeContactId ? { ...c, messages: [], lastMessage: 'No messages yet' } : c));
                  setShowClearConfirm(false);
                  showToast('Chat history cleared', 'success');
                }}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Right-Click Context Menu floating panel */}
      {contextMenu && (
        <div 
          className={`fixed rounded-2xl shadow-2xl p-2 w-52 z-50 text-[11.5px] font-semibold border border-solid animate-fade-in ${
            isLightMode 
              ? 'bg-[#F0F2F5] border-neutral-250 text-neutral-800 shadow-neutral-400/40' 
              : 'bg-[#233138] border-[#293c44] text-neutral-100 shadow-black/60'
          }`}
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick reactions bar at the top */}
          <div className="flex items-center justify-between px-1 py-1 mb-2 border-b border-solid border-neutral-400/15">
            <div className="flex gap-2.5 items-center">
              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => {
                const hasReacted = contextMenu.msg.reactions?.some(r => r.emoji === emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      handleToggleReaction(contextMenu.msg.id, emoji);
                      setContextMenu(null);
                    }}
                    className={`text-base hover:scale-130 transition-transform duration-200 cursor-pointer p-0.5 rounded ${
<<<<<<< HEAD
                      hasReacted ? 'bg-[#FF007F]/20 scale-110' : ''
=======
                      hasReacted ? 'bg-[#D4AF37]/20 scale-110' : ''
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={() => {
                handleToggleReaction(contextMenu.msg.id, '🌟');
                setContextMenu(null);
              }}
              className="text-amber-500 hover:scale-130 transition-transform duration-200 cursor-pointer font-black text-sm p-0.5 rounded flex items-center justify-center"
              title="Add special star reaction"
            >
              ➕
            </button>
          </div>

          <div className="space-y-0.5">
            {/* 1. Message Info */}
            <button
              type="button"
              onClick={() => {
                setInfoMsg(contextMenu.msg);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Info className="w-4 h-4 text-sky-400" />
              <span>Message Info</span>
            </button>

            {/* 2. Reply */}
            <button
              type="button"
              onClick={() => {
                setReplyingToMsg(contextMenu.msg);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Reply className="w-4 h-4 text-green-500" />
              <span>Reply</span>
            </button>

            {/* 3. Copy Text */}
            <button
              type="button"
              onClick={() => {
                handleCopyMessage(contextMenu.msg.text || '');
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Copy className="w-4 h-4 text-teal-400" />
              <span>Copy Text</span>
            </button>

            {/* 4. Forward */}
            <button
              type="button"
              onClick={() => {
                setForwardMsg(contextMenu.msg);
                setSelectedForwardContactIds([]);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Forward className="w-4 h-4 text-purple-400" />
              <span>Forward Message</span>
            </button>

            {/* 5. Pin / Unpin option */}
            <button
              type="button"
              onClick={() => {
                handleTogglePinMsg(contextMenu.msg.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Pin className={`w-4 h-4 ${contextMenu.msg.isPinned ? 'fill-pink-400 text-pink-400' : 'text-pink-405'}`} />
              <span>{contextMenu.msg.isPinned ? 'Unpin Message' : 'Pin Message'}</span>
            </button>

            {/* 6. Star / Unstar Option */}
            <button
              type="button"
              onClick={() => {
                handleStarMsg(contextMenu.msg.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Star className={`w-4 h-4 ${contextMenu.msg.isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span>{contextMenu.msg.isStarred ? 'Unstar Message' : 'Star Message'}</span>
            </button>

            {/* 7. Inline Edit (Only user messages) */}
            {contextMenu.msg.sender === 'user' && (
              <button
                type="button"
                onClick={() => {
                  setEditingMsgId(contextMenu.msg.id);
                  setEditingText(contextMenu.msg.text || '');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
              >
                <Pencil className="w-4 h-4 text-orange-400" />
                <span>Edit Message</span>
              </button>
            )}

            {/* 8. Select Messages */}
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(true);
                setSelectedMsgIds([contextMenu.msg.id]);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-sky-400" />
              <span>Select Messages</span>
            </button>

            {/* 9. Delete Option (Only user messages) */}
            {contextMenu.msg.sender === 'user' && (
              <>
                <div className={`my-1 border-t border-solid ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`} />
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmMsgId(contextMenu.msg.id);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-red-500 hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Delete Message</span>
                </button>
              </>
            )}

            <div className={`my-1 border-t border-solid ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`} />

            {/* Silent/Mute Contact */}
            <button
              type="button"
              onClick={() => {
                const currentMuted = activeContact.isMuted;
                setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isMuted: !currentMuted } : c));
                showToast(currentMuted ? 'Notifications restored' : 'Notifications muted', 'info');
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              {activeContact.isMuted ? (
                <Volume2 className="w-4 h-4 text-amber-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-amber-500" />
              )}
              <span>{activeContact.isMuted ? 'Unmute Contact' : 'Mute/Silent'}</span>
            </button>

            {/* Block/Unblock Contact */}
            <button
              type="button"
              onClick={() => {
                if (activeContact.isBlocked) {
                  setContacts(contacts.map(c => c.id === activeContactId ? { ...c, isBlocked: false } : c));
                  showToast(`${activeContact.name} unblocked successfully`, 'success');
                } else {
                  setShowBlockConfirm(true);
                }
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Ban className={`w-4 h-4 ${activeContact.isBlocked ? 'text-green-500' : 'text-red-500'}`} />
              <span>{activeContact.isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
            </button>

            {/* Clear Chat Messages */}
            <button
              type="button"
              onClick={() => {
                setShowClearConfirm(true);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 hover:bg-neutral-400/10 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Clear/Delete Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Message Info Custom Dialog modal */}
      {infoMsg && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setInfoMsg(null)}>
          <div className={`border border-solid rounded-2xl max-w-sm w-full p-6 space-y-4 ${
            isLightMode 
              ? 'bg-white border-neutral-250 text-neutral-900 shadow-xl' 
              : 'bg-[#182229] border-neutral-800 text-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-solid pb-3 border-neutral-800/10">
<<<<<<< HEAD
              <h3 className="text-sm font-serif font-black uppercase tracking-wider flex items-center gap-1.5 text-[#FF007F]">
                <Info className="w-4 h-4 text-[#FF007F] animate-bounce" />
=======
              <h3 className="text-sm font-serif font-black uppercase tracking-wider flex items-center gap-1.5 text-[#D4AF37]">
                <Info className="w-4 h-4 text-[#D4AF37] animate-bounce" />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                <span>Message Info</span>
              </h3>
              <button 
                onClick={() => setInfoMsg(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLightMode ? 'hover:bg-neutral-150 text-neutral-600' : 'hover:bg-neutral-800 text-neutral-400'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Preview */}
            <div className={`p-3 rounded-xl border border-solid text-xs ${
              isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-[#202C33] border-neutral-800/50 text-neutral-200'
            }`}>
              <p className="font-extrabold text-[9px] uppercase tracking-wider opacity-60 mb-1">Message Content Preview:</p>
              <p className="italic">
                "{infoMsg.text || (infoMsg.isVoice ? '🎙 Voice record memo' : '📷 Shared asset image')}"
              </p>
            </div>

            {/* Time Status List */}
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <span className="text-sm">📨</span>
                <div>
                  <p className="font-bold uppercase text-[9.5px] tracking-wider text-neutral-500">Sent time</p>
                  <p className="font-semibold mt-0.5">{infoMsg.timestamp}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-sm">📦</span>
                <div>
                  <p className="font-bold uppercase text-[9.5px] tracking-wider text-neutral-500">Delivered</p>
                  <p className="font-semibold mt-0.5">{infoMsg.timestamp} <span className="text-neutral-550 font-normal">· Synced on cloud server</span></p>
                </div>
              </div>

              {infoMsg.sender === 'user' && (
                <div className="flex items-start gap-3">
                  <span className="text-sm">👁️</span>
                  <div>
<<<<<<< HEAD
                    <p className="font-bold uppercase text-[9.5px] tracking-wider text-[#FF007F]">Read Receipt</p>
=======
                    <p className="font-bold uppercase text-[9.5px] tracking-wider text-[#D4AF37]">Read Receipt</p>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                    <p className="font-semibold mt-0.5">{infoMsg.timestamp} <span className="text-amber-500 font-extrabold">· Read by Advisor</span></p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInfoMsg(null)}
<<<<<<< HEAD
                className="w-full py-2 bg-[#FF007F] hover:brightness-110 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer"
=======
                className="w-full py-2 bg-[#D4AF37] hover:brightness-110 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              >
                Dismiss Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Bubble Custom Dialog Confirmation */}
      {deleteConfirmMsgId && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteConfirmMsgId(null)}>
          <div className={`border border-solid rounded-2xl max-w-sm w-full p-6 text-center space-y-4 ${
            isLightMode 
              ? 'bg-white border-neutral-250 text-neutral-900 shadow-xl' 
              : 'bg-neutral-900 border-red-500/20 text-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black uppercase tracking-wider">Confirm Delete</h3>
              <p className={`text-xs mt-2 leading-relaxed ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Are you sure you want to delete this message? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMsgId(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLightMode ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteMessage(deleteConfirmMsgId);
                  setDeleteConfirmMsgId(null);
                }}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Multi-Select Modal Dialog */}
      {forwardMsg && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setForwardMsg(null)}>
          <div className={`border border-solid rounded-2xl max-w-sm w-full p-6 space-y-4 ${
            isLightMode 
              ? 'bg-white border-neutral-250 text-neutral-900 shadow-xl' 
              : 'bg-[#182229] border-neutral-800 text-white'
          }`} onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between border-b border-solid pb-3 border-neutral-800/10">
<<<<<<< HEAD
              <h3 className="text-sm font-serif font-black uppercase tracking-wider flex items-center gap-1.5 text-[#FF007F]">
=======
              <h3 className="text-sm font-serif font-black uppercase tracking-wider flex items-center gap-1.5 text-[#D4AF37]">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                <Forward className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Forward Message</span>
              </h3>
              <button 
                onClick={() => setForwardMsg(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLightMode ? 'hover:bg-neutral-150 text-neutral-600' : 'hover:bg-neutral-800 text-neutral-400'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original content preview */}
            <div className={`p-3 rounded-xl text-xs italic border border-solid ${
              isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-[#202C33] border-neutral-800/60 text-neutral-350'
            }`}>
              <p className="font-extrabold not-italic text-[10px] text-neutral-555 mb-1 uppercase tracking-wide">Content preview:</p>
              <p className="truncate">"{forwardMsg.text || (forwardMsg.isVoice ? '🎙 Voice message' : '📷 Attachment photo')}"</p>
            </div>

            {/* Checklists */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1 select-none">
<<<<<<< HEAD
              <p className="text-[10px] font-black uppercase tracking-widest text-[#FF007F] mb-1.5">Deliver to:</p>
=======
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1.5">Deliver to:</p>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              {contacts.map((c) => {
                const isSelected = selectedForwardContactIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggleForwardContact(c.id)}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border border-solid ${
                      isSelected 
                        ? isLightMode 
                          ? 'bg-[#EAE6DF]/60 border-[#9C4B8A]' 
<<<<<<< HEAD
                          : 'bg-[#2A3942] border-[#FF007F]'
=======
                          : 'bg-[#2A3942] border-[#D4AF37]'
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        : isLightMode
                          ? 'bg-transparent border-neutral-100 hover:bg-neutral-50'
                          : 'bg-transparent border-transparent hover:bg-[#202C33]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={c.avatar} 
                        alt={c.name} 
                        className="w-8 h-8 rounded-full object-cover border border-solid border-neutral-700 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-black uppercase tracking-wider">{c.name}</span>
                    </div>
                    {/* Checkbox badge */}
                    <div className={`w-5 h-5 rounded-md border border-solid flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-[#25D366] border-[#25D366] text-white' 
                        : isLightMode ? 'border-neutral-300' : 'border-neutral-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3.5 pt-3.5 border-t border-solid border-neutral-800/10">
              <span className={`text-[10px] font-semibold mr-auto ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {selectedForwardContactIds.length === 0 
                  ? 'No boutique selected' 
                  : `${selectedForwardContactIds.length} boutique(s) selected`}
              </span>
              <button
                type="button"
                onClick={() => setForwardMsg(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLightMode ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedForwardContactIds.length === 0}
                onClick={handleConfirmForward}
                className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Forward
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
