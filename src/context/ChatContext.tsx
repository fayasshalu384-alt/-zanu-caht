import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Chat,
  Message,
  StatusItem,
  CallRecord,
  Community,
  ReportItem,
  MessageType,
} from '../types/chat';
import {
  INITIAL_USERS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_STATUSES,
  INITIAL_CALL_RECORDS,
  INITIAL_COMMUNITIES,
  INITIAL_REPORTS,
} from '../data/mockData';
import {
  playMessageSentSound,
  playMessageReceivedSound,
  startRingtone,
  stopRingtone,
  startRingbackTone,
  stopRingbackTone,
  playCallEndSound,
} from '../utils/audio';
import { getLocalStream, RTC_CONFIG } from '../utils/webrtc';
import { encryptE2EEMessage, decryptE2EEMessage } from '../utils/crypto';

export interface ActiveCallState {
  callId: string;
  peerUser: User;
  type: 'voice' | 'video';
  direction: 'outgoing' | 'incoming';
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  startedAt?: number;
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

interface ChatContextType {
  currentUser: User;
  users: User[];
  chats: Chat[];
  activeChat: Chat | null;
  activeChatId: string | null;
  messages: Message[];
  statuses: StatusItem[];
  callRecords: CallRecord[];
  communities: Community[];
  reports: ReportItem[];
  activeTab: 'chats' | 'status' | 'channels' | 'communities' | 'calls' | 'settings' | 'admin';
  searchQuery: string;
  typingUsers: Record<string, string[]>; // chatId -> userIds typing
  activeCall: ActiveCallState | null;
  incomingCall: { callId: string; caller: User; type: 'voice' | 'video' } | null;
  studioModalOpen: boolean;
  newChatModalOpen: boolean;
  authModalOpen: boolean;
  addMemberModalOpen: boolean;
  changePasswordModalOpen: boolean;
  isAuthenticated: boolean;
  setActiveTab: (tab: 'chats' | 'status' | 'channels' | 'communities' | 'calls' | 'settings' | 'admin') => void;
  setActiveChatId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStudioModalOpen: (open: boolean) => void;
  setNewChatModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAddMemberModalOpen: (open: boolean) => void;
  setChangePasswordModalOpen: (open: boolean) => void;
  login: (identifier: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
  addNewMember: (userData: { name: string; phone: string; email?: string; about?: string; avatar?: string; username?: string; password?: string }) => User;
  addMemberToGroup: (chatId: string, userId: string) => void;
  removeMemberFromGroup: (chatId: string, userId: string) => void;
  deleteGroup: (chatId: string) => void;
  switchUser: (userId: string) => void;
  sendMessage: (text: string, type?: MessageType, mediaUrl?: string, mediaMeta?: { name?: string; size?: string; duration?: number }, replyTo?: Message['replyTo']) => Promise<void>;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string, forEveryone: boolean) => void;
  toggleStarMessage: (messageId: string) => void;
  togglePinMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  setDisappearingTimer: (chatId: string, seconds: number) => void;
  createDirectChat: (targetUserId: string) => string;
  createGroupChat: (name: string, participantIds: string[], description?: string) => string;
  createChannel: (name: string, description?: string) => string;
  postStatus: (type: 'text' | 'image' | 'video', content: string, caption?: string, bgColor?: string) => void;
  viewStatus: (statusId: string) => void;
  startCall: (targetUser: User, type: 'voice' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  submitReport: (reportedUserId: string, reason: string, details: string) => void;
  broadcastTyping: (isTyping: boolean) => void;
  togglePinChat: (chatId: string) => void;
  toggleArchiveChat: (chatId: string) => void;
  toggleMuteChat: (chatId: string) => void;
  markChatAsRead: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted or initial state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('chatwave_users_v2');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem('chatwave_current_user_v2') || 'user_alex';
    } catch {
      return 'user_alex';
    }
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem('chatwave_chats_v2');
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('chatwave_messages_v2');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [statuses, setStatuses] = useState<StatusItem[]>(() => {
    try {
      const saved = localStorage.getItem('chatwave_statuses_v2');
      return saved ? JSON.parse(saved) : INITIAL_STATUSES;
    } catch {
      return INITIAL_STATUSES;
    }
  });

  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem('chatwave_calls_v2');
      return saved ? JSON.parse(saved) : INITIAL_CALL_RECORDS;
    } catch {
      return INITIAL_CALL_RECORDS;
    }
  });

  const [communities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'channels' | 'communities' | 'calls' | 'settings' | 'admin'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_alex_sarah');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  // Calling states
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; caller: User; type: 'voice' | 'video' } | null>(null);

  // Modals
  const [studioModalOpen, setStudioModalOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Auth gate state (defaults to true if already logged in previously, or false to prompt password)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('chatwave_auth_v2');
      return stored ? stored === 'true' : true; // Keep true by default for smooth demo or user can log out
    } catch {
      return true;
    }
  });

  // References for WebRTC and WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const callTimerRef = useRef<number | null>(null);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chatwave_users_v2', JSON.stringify(users));
      localStorage.setItem('chatwave_current_user_v2', currentUserId);
      localStorage.setItem('chatwave_chats_v2', JSON.stringify(chats));
      localStorage.setItem('chatwave_messages_v2', JSON.stringify(messages));
      localStorage.setItem('chatwave_statuses_v2', JSON.stringify(statuses));
      localStorage.setItem('chatwave_calls_v2', JSON.stringify(callRecords));
    } catch {
      // Storage quota or privacy mode
    }
  }, [users, currentUserId, chats, messages, statuses, callRecords]);

  // Handle incoming real-time messages via WS or BroadcastChannel
  const handleRealtimeMessage = useCallback((data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const msg = data as Record<string, unknown>;

    if (msg.type === 'chat_message') {
      const incoming = msg.message as Message;
      setMessages(prev => {
        if (prev.some(m => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });

      if (incoming.senderId !== currentUserId) {
        playMessageReceivedSound();
        // Update unread count if not in active chat
        setChats(prev => prev.map(c => {
          if (c.id === incoming.chatId) {
            return {
              ...c,
              lastMessage: incoming,
              unreadCount: (c.id === activeChatId ? 0 : (c.unreadCount || 0) + 1),
            };
          }
          return c;
        }));
      }
    } else if (msg.type === 'message_edited') {
      setMessages(prev => prev.map(m => m.id === msg.messageId ? { ...m, text: msg.newText as string, isEdited: true } : m));
    } else if (msg.type === 'message_deleted') {
      setMessages(prev => prev.map(m => m.id === msg.messageId ? { ...m, isDeleted: true, text: 'This message was deleted' } : m));
    } else if (msg.type === 'message_reaction') {
      setMessages(prev => prev.map(m => {
        if (m.id === msg.messageId) {
          const reactions = { ...(m.reactions || {}) };
          const emoji = msg.emoji as string;
          const uId = msg.userId as string;
          const currentList = reactions[emoji] || [];
          reactions[emoji] = currentList.includes(uId) ? currentList.filter(id => id !== uId) : [...currentList, uId];
          return { ...m, reactions };
        }
        return m;
      }));
    } else if (msg.type === 'typing_status') {
      const { chatId, userId, isTyping } = msg as { chatId: string; userId: string; isTyping: boolean };
      if (userId === currentUserId) return;
      setTypingUsers(prev => {
        const list = prev[chatId] || [];
        const updated = isTyping ? Array.from(new Set([...list, userId])) : list.filter(id => id !== userId);
        return { ...prev, [chatId]: updated };
      });
    } else if (msg.type === 'incoming_call') {
      if (msg.targetUserId === currentUserId) {
        const caller = users.find(u => u.id === msg.callerId) || {
          id: msg.callerId as string,
          name: msg.callerName as string,
          avatar: msg.callerAvatar as string,
          username: 'caller',
          email: '',
          phone: '',
          about: '',
          online: true,
          lastSeen: Date.now(),
          settings: { privacy: { lastSeen: 'everyone', profilePhoto: 'everyone', readReceipts: true, disappearingDefault: 0 }, theme: 'dark', notifications: true, soundEnabled: true, wallpaper: 'default', e2eeEnabled: true }
        };
        setIncomingCall({
          callId: msg.callId as string,
          caller,
          type: (msg.callType as 'voice' | 'video') || 'voice',
        });
        startRingtone();
      }
    } else if (msg.type === 'call_accepted') {
      if (activeCall && activeCall.callId === msg.callId) {
        stopRingbackTone();
        setActiveCall(prev => prev ? { ...prev, status: 'connected', startedAt: Date.now() } : null);
      }
    } else if (msg.type === 'call_rejected' || msg.type === 'call_ended') {
      stopRingtone();
      stopRingbackTone();
      playCallEndSound();
      setIncomingCall(null);
      if (activeCall) {
        // Record call log
        const newRecord: CallRecord = {
          id: `call_${Date.now()}`,
          peerId: activeCall.peerUser.id,
          peerName: activeCall.peerUser.name,
          peerAvatar: activeCall.peerUser.avatar,
          direction: activeCall.direction,
          type: activeCall.type,
          status: activeCall.status === 'connected' ? 'completed' : 'rejected',
          duration: activeCall.duration,
          timestamp: Date.now(),
        };
        setCallRecords(prev => [newRecord, ...prev]);
        if (activeCall.localStream) {
          activeCall.localStream.getTracks().forEach(t => t.stop());
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        setActiveCall(null);
      }
    }
  }, [currentUserId, activeChatId, activeCall, users]);

  // Setup WebSocket and BroadcastChannel
  useEffect(() => {
    // 1. Cross-tab BroadcastChannel
    try {
      const channel = new BroadcastChannel('chatwave_sync');
      broadcastChannelRef.current = channel;
      channel.onmessage = (e) => {
        handleRealtimeMessage(e.data);
      };
    } catch {
      // Ignore BroadcastChannel if unavailable
    }

    // 2. Real WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: 'register_user', userId: currentUserId }));
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handleRealtimeMessage(data);
        } catch {
          // Ignore
        }
      };

      ws.onerror = () => {
        // Fallback to BroadcastChannel
      };
    } catch {
      // WS fallback
    }

    return () => {
      ws?.close();
      broadcastChannelRef.current?.close();
    };
  }, [currentUserId, handleRealtimeMessage]);

  // Broadcast helper
  const sendRealtimeEvent = useCallback((event: unknown) => {
    // 1. BroadcastChannel for same-browser multi-tab testing
    try {
      broadcastChannelRef.current?.postMessage(event);
    } catch {
      // Ignore
    }
    // 2. WebSocket for network clients
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(event));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Call duration counter
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      callTimerRef.current = window.setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall?.status]);

  // Send message
  const sendMessage = async (
    text: string,
    type: MessageType = 'text',
    mediaUrl?: string,
    mediaMeta?: { name?: string; size?: string; duration?: number },
    replyTo?: Message['replyTo']
  ) => {
    if (!activeChatId) return;

    let processedText = text;
    // Check if E2EE encryption is active
    if (currentUser.settings.e2eeEnabled && activeChat?.type === 'direct' && type === 'text') {
      processedText = await encryptE2EEMessage(text, activeChatId);
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chatId: activeChatId,
      senderId: currentUserId,
      senderName: currentUser.name,
      text: processedText,
      type,
      mediaUrl,
      mediaName: mediaMeta?.name,
      mediaSize: mediaMeta?.size,
      mediaDuration: mediaMeta?.duration,
      timestamp: Date.now(),
      status: 'sent',
      replyTo,
      expiresAt: activeChat?.disappearingTimer ? Date.now() + activeChat.disappearingTimer * 1000 : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    playMessageSentSound();

    // Update chat lastMessage
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return { ...c, lastMessage: newMessage };
      }
      return c;
    }));

    // Broadcast in real-time
    sendRealtimeEvent({ type: 'chat_message', message: newMessage });

    // Mark as delivered/read after 1 second for simulation
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
    }, 1500);
  };

  const editMessage = (messageId: string, newText: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
    sendRealtimeEvent({ type: 'message_edited', messageId, newText });
  };

  const deleteMessage = (messageId: string, forEveryone: boolean) => {
    if (forEveryone) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, text: 'This message was deleted' } : m));
      sendRealtimeEvent({ type: 'message_deleted', messageId });
    } else {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const deletedFor = m.deletedForUsers || [];
          return { ...m, deletedForUsers: [...deletedFor, currentUserId] };
        }
        return m;
      }));
    }
  };

  const toggleStarMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: !m.isStarred } : m));
  };

  const togglePinMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m));
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const reactions = { ...(m.reactions || {}) };
        const currentList = reactions[emoji] || [];
        reactions[emoji] = currentList.includes(currentUserId)
          ? currentList.filter(id => id !== currentUserId)
          : [...currentList, currentUserId];
        return { ...m, reactions };
      }
      return m;
    }));
    sendRealtimeEvent({ type: 'message_reaction', messageId, emoji, userId: currentUserId });
  };

  const broadcastTyping = (isTyping: boolean) => {
    if (!activeChatId) return;
    sendRealtimeEvent({ type: 'typing_status', chatId: activeChatId, userId: currentUserId, isTyping });
  };

  const setDisappearingTimer = (chatId: string, seconds: number) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, disappearingTimer: seconds } : c));
  };

  const createDirectChat = (targetUserId: string): string => {
    const existing = chats.find(c => c.type === 'direct' && c.participants.includes(currentUserId) && c.participants.includes(targetUserId));
    if (existing) {
      setActiveChatId(existing.id);
      setActiveTab('chats');
      return existing.id;
    }
    const targetUser = users.find(u => u.id === targetUserId);
    const newChat: Chat = {
      id: `chat_${currentUserId}_${targetUserId}`,
      type: 'direct',
      name: targetUser?.name || 'Contact',
      avatar: targetUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      participants: [currentUserId, targetUserId],
      admins: [],
      disappearingTimer: 0,
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setActiveTab('chats');
    return newChat.id;
  };

  const createGroupChat = (name: string, participantIds: string[], description?: string): string => {
    const newChat: Chat = {
      id: `group_${Date.now()}`,
      type: 'group',
      name,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
      description,
      participants: [currentUserId, ...participantIds],
      admins: [currentUserId],
      disappearingTimer: 0,
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setActiveTab('chats');
    return newChat.id;
  };

  const createChannel = (name: string, description?: string): string => {
    const newChannel: Chat = {
      id: `chan_${Date.now()}`,
      type: 'channel',
      name,
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      description,
      participants: [currentUserId],
      admins: [currentUserId],
      disappearingTimer: 0,
      createdAt: Date.now(),
    };
    setChats(prev => [newChannel, ...prev]);
    setActiveChatId(newChannel.id);
    setActiveTab('channels');
    return newChannel.id;
  };

  const login = (identifier: string, pass: string): { success: boolean; error?: string } => {
    const trimmedId = identifier.trim().toLowerCase();
    const user = users.find(u =>
      u.username.toLowerCase() === trimmedId ||
      u.phone.replace(/[\s\-\+]/g, '') === trimmedId.replace(/[\s\-\+]/g, '') ||
      u.email.toLowerCase() === trimmedId
    );

    if (!user) {
      return { success: false, error: 'User not found. Check username or phone number.' };
    }

    if (user.password && user.password !== pass) {
      return { success: false, error: 'Incorrect password.' };
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('chatwave_auth_v2', 'true');
      localStorage.setItem('chatwave_current_user_v2', user.id);
    } catch {}
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('chatwave_auth_v2', 'false');
    } catch {}
  };

  const changePassword = (oldPass: string, newPass: string): { success: boolean; error?: string } => {
    if (currentUser.password && currentUser.password !== oldPass) {
      return { success: false, error: 'Current password does not match.' };
    }
    if (newPass.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        return { ...u, password: newPass, mustChangePassword: false };
      }
      return u;
    }));
    return { success: true };
  };

  const addNewMember = (userData: { name: string; phone: string; email?: string; about?: string; avatar?: string; username?: string; password?: string }): User => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const avatar = userData.avatar?.trim() || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`;
    const username = userData.username?.trim().toLowerCase().replace(/\s+/g, '_') || userData.name.toLowerCase().replace(/\s+/g, '_');
    const initialPassword = userData.password?.trim() || 'wave123';

    const newUser: User = {
      id,
      name: userData.name.trim(),
      username,
      password: initialPassword,
      mustChangePassword: true, // Prompt them to change it when they log in
      email: userData.email?.trim() || `${username}@chatwave.app`,
      phone: userData.phone.trim(),
      avatar,
      about: userData.about?.trim() || 'Available on ChatWave',
      online: true,
      lastSeen: Date.now(),
      blockedUsers: [],
      settings: {
        privacy: {
          lastSeen: 'everyone',
          profilePhoto: 'everyone',
          readReceipts: true,
          disappearingDefault: 0,
        },
        theme: 'dark',
        notifications: true,
        soundEnabled: true,
        wallpaper: 'default',
        e2eeEnabled: true,
      },
    };

    setUsers(prev => [newUser, ...prev]);
    // Create direct chat with this new member
    createDirectChat(newUser.id);
    return newUser;
  };

  const addMemberToGroup = (chatId: string, userId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId && !c.participants.includes(userId)) {
        return { ...c, participants: [...c.participants, userId] };
      }
      return c;
    }));
  };

  const removeMemberFromGroup = (chatId: string, userId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          participants: c.participants.filter(p => p !== userId),
          admins: c.admins ? c.admins.filter(a => a !== userId) : [],
        };
      }
      return c;
    }));
  };

  const deleteGroup = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setMessages(prev => prev.filter(m => m.chatId !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const postStatus = (type: 'text' | 'image' | 'video', content: string, caption?: string, bgColor?: string) => {
    const newStatus: StatusItem = {
      id: `status_${Date.now()}`,
      userId: currentUserId,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type,
      content,
      caption,
      backgroundColor: bgColor || '#0b141a',
      timestamp: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      viewers: [],
    };
    setStatuses(prev => [newStatus, ...prev]);
  };

  const viewStatus = (statusId: string) => {
    setStatuses(prev => prev.map(s => {
      if (s.id === statusId && !s.viewers.includes(currentUserId)) {
        return { ...s, viewers: [...s.viewers, currentUserId] };
      }
      return s;
    }));
  };

  // Calling features
  const startCall = async (targetUser: User, type: 'voice' | 'video') => {
    const callId = `call_${Date.now()}`;
    const localStream = await getLocalStream(type === 'video', currentUser.name);

    setActiveCall({
      callId,
      peerUser: targetUser,
      type,
      direction: 'outgoing',
      status: 'calling',
      duration: 0,
      isMuted: false,
      isVideoOff: type === 'voice',
      isScreenSharing: false,
      localStream,
      remoteStream: null,
    });

    startRingbackTone();

    // Signal incoming call to target
    sendRealtimeEvent({
      type: 'incoming_call',
      callId,
      callType: type,
      callerId: currentUserId,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      targetUserId: targetUser.id,
    });

    // Initialize RTCPeerConnection
    try {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setActiveCall(prev => prev ? { ...prev, remoteStream: event.streams[0] } : null);
        }
      };
    } catch (e) {
      console.warn('WebRTC peer connection initialization:', e);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    stopRingtone();
    const isVideo = incomingCall.type === 'video';
    const localStream = await getLocalStream(isVideo, currentUser.name);

    setActiveCall({
      callId: incomingCall.callId,
      peerUser: incomingCall.caller,
      type: incomingCall.type,
      direction: 'incoming',
      status: 'connected',
      startedAt: Date.now(),
      duration: 0,
      isMuted: false,
      isVideoOff: !isVideo,
      isScreenSharing: false,
      localStream,
      remoteStream: null,
    });

    setIncomingCall(null);

    // Notify caller
    sendRealtimeEvent({
      type: 'call_accepted',
      callId: incomingCall.callId,
      targetUserId: incomingCall.caller.id,
    });
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    stopRingtone();
    sendRealtimeEvent({
      type: 'call_rejected',
      callId: incomingCall.callId,
      targetUserId: incomingCall.caller.id,
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (!activeCall) return;
    stopRingtone();
    stopRingbackTone();
    playCallEndSound();

    sendRealtimeEvent({
      type: 'call_ended',
      callId: activeCall.callId,
      targetUserId: activeCall.peerUser.id,
    });

    // Save call log
    const newRecord: CallRecord = {
      id: `call_${Date.now()}`,
      peerId: activeCall.peerUser.id,
      peerName: activeCall.peerUser.name,
      peerAvatar: activeCall.peerUser.avatar,
      direction: activeCall.direction,
      type: activeCall.type,
      status: activeCall.status === 'connected' ? 'completed' : 'rejected',
      duration: activeCall.duration,
      timestamp: Date.now(),
    };
    setCallRecords(prev => [newRecord, ...prev]);

    if (activeCall.localStream) {
      activeCall.localStream.getTracks().forEach(t => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setActiveCall(null);
  };

  const toggleMute = () => {
    if (!activeCall || !activeCall.localStream) return;
    const audioTrack = activeCall.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setActiveCall(prev => prev ? { ...prev, isMuted: !audioTrack.enabled } : null);
    } else {
      setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    }
  };

  const toggleVideo = () => {
    if (!activeCall || !activeCall.localStream) return;
    const videoTrack = activeCall.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setActiveCall(prev => prev ? { ...prev, isVideoOff: !videoTrack.enabled } : null);
    } else {
      setActiveCall(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null);
    }
  };

  const toggleScreenShare = async () => {
    if (!activeCall) return;
    if (activeCall.isScreenSharing) {
      // Revert to camera
      const cameraStream = await getLocalStream(activeCall.type === 'video', currentUser.name);
      setActiveCall(prev => prev ? { ...prev, isScreenSharing: false, localStream: cameraStream } : null);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setActiveCall(prev => prev ? { ...prev, isScreenSharing: true, localStream: displayStream } : null);
          displayStream.getVideoTracks()[0].onended = () => {
            toggleScreenShare();
          };
        }
      } catch {
        console.warn('Screen sharing not permitted');
      }
    }
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    // Switch active chat to a sensible default for the chosen user
    const firstChat = chats.find(c => c.participants.includes(userId));
    if (firstChat) {
      setActiveChatId(firstChat.id);
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, ...updates } : u));
  };

  const blockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        const blocked = u.blockedUsers || [];
        return { ...u, blockedUsers: Array.from(new Set([...blocked, userId])) };
      }
      return u;
    }));
  };

  const unblockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        const blocked = u.blockedUsers || [];
        return { ...u, blockedUsers: blocked.filter(id => id !== userId) };
      }
      return u;
    }));
  };

  const submitReport = (reportedUserId: string, reason: string, details: string) => {
    const reportedUser = users.find(u => u.id === reportedUserId);
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reportedUserId,
      reportedUserName: reportedUser?.name || reportedUserId,
      reporterUserId: currentUserId,
      reporterUserName: currentUser.name,
      reason,
      details,
      timestamp: Date.now(),
      status: 'pending',
    };
    setReports(prev => [newReport, ...prev]);
  };

  const togglePinChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isPinned: !c.isPinned } : c));
  };

  const toggleArchiveChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isArchived: !c.isArchived } : c));
  };

  const toggleMuteChat = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isMuted: !c.isMuted } : c));
  };

  const markChatAsRead = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    setMessages(prev => prev.map(m => m.chatId === chatId ? { ...m, status: 'read' } : m));
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        users,
        chats,
        activeChat,
        activeChatId,
        messages,
        statuses,
        callRecords,
        communities,
        reports,
        activeTab,
        searchQuery,
        typingUsers,
        activeCall,
        incomingCall,
        studioModalOpen,
        newChatModalOpen,
        authModalOpen,
        addMemberModalOpen,
        changePasswordModalOpen,
        isAuthenticated,
        setActiveTab,
        setActiveChatId,
        setSearchQuery,
        setStudioModalOpen,
        setNewChatModalOpen,
        setAuthModalOpen,
        setAddMemberModalOpen,
        setChangePasswordModalOpen,
        login,
        logout,
        changePassword,
        addNewMember,
        addMemberToGroup,
        removeMemberFromGroup,
        deleteGroup,
        switchUser,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleStarMessage,
        togglePinMessage,
        addReaction,
        setDisappearingTimer,
        createDirectChat,
        createGroupChat,
        createChannel,
        postStatus,
        viewStatus,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        updateUserProfile,
        blockUser,
        unblockUser,
        submitReport,
        broadcastTyping,
        togglePinChat,
        toggleArchiveChat,
        toggleMuteChat,
        markChatAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
