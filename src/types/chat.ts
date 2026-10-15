export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'voice_note' 
  | 'document' 
  | 'contact' 
  | 'sticker' 
  | 'call_log';

export interface UserSettings {
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
    disappearingDefault: number; // 0, 86400 (24h), 604800 (7d), 7776000 (90d)
  };
  theme: 'dark' | 'light';
  notifications: boolean;
  soundEnabled: boolean;
  wallpaper: string;
  e2eeEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  about: string;
  online: boolean;
  lastSeen: number;
  blockedUsers?: string[];
  settings: UserSettings;
  isAdmin?: boolean;
  password?: string;
  mustChangePassword?: boolean;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ContactCardData {
  name: string;
  phone: string;
  avatar?: string;
  email?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  mediaDuration?: number; // seconds for voice note/video
  timestamp: number;
  status: MessageStatus;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
    type: MessageType;
  };
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isStarred?: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedForUsers?: string[];
  expiresAt?: number;
  isForwarded?: boolean;
  contactCard?: ContactCardData;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatar: string;
  description?: string;
  participants: string[]; // user IDs
  admins: string[]; // user IDs
  lastMessage?: Message;
  unreadCount?: number;
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  disappearingTimer: number; // 0 = off, 86400 = 24h, 604800 = 7d, 7776000 = 90d
  draft?: string;
  communityId?: string;
  createdAt: number;
}

export interface StatusItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'image' | 'video';
  content: string; // text or image/video url
  caption?: string;
  backgroundColor?: string;
  timestamp: number;
  expiresAt: number;
  viewers: string[]; // array of userIds
}

export interface CallRecord {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar: string;
  direction: 'incoming' | 'outgoing';
  type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'rejected';
  duration: number; // in seconds
  timestamp: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  creatorId: string;
  groups: string[]; // chat IDs
  membersCount: number;
}

export interface ReportItem {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterUserId: string;
  reporterUserName: string;
  reason: string;
  details: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'dismissed';
}
