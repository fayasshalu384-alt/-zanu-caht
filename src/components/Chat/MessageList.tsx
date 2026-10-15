import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Message, MessageType } from '../../types/chat';
import {
  Check,
  CheckCheck,
  Smile,
  Reply,
  Star,
  Pin,
  Trash2,
  Edit2,
  Copy,
  Play,
  Pause,
  Download,
  FileText,
  UserCheck,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { decryptE2EEMessage } from '../../utils/crypto';

interface MessageListProps {
  onReply: (message: Message) => void;
  searchFilter?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ onReply, searchFilter }) => {
  const {
    messages,
    activeChat,
    currentUser,
    users,
    toggleStarMessage,
    togglePinMessage,
    addReaction,
    deleteMessage,
    editMessage,
  } = useChat();

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactionMenuMessageId, setReactionMenuMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [decryptedTexts, setDecryptedTexts] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Filter messages for active chat and not deleted for current user
  const chatMessages = messages.filter(
    m => m.chatId === activeChat?.id &&
    (!m.deletedForUsers || !m.deletedForUsers.includes(currentUser.id))
  );

  const displayedMessages = searchFilter
    ? chatMessages.filter(m => m.text.toLowerCase().includes(searchFilter.toLowerCase()))
    : chatMessages;

  const pinnedMessage = chatMessages.find(m => m.isPinned);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Decrypt encrypted messages
  useEffect(() => {
    if (!activeChat) return;
    const decryptAll = async () => {
      const updates: Record<string, string> = {};
      for (const msg of chatMessages) {
        if (msg.text.startsWith('enc:')) {
          updates[msg.id] = await decryptE2EEMessage(msg.text, activeChat.id);
        }
      }
      setDecryptedTexts(updates);
    };
    decryptAll();
  }, [chatMessages, activeChat]);

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🙏'];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSaveEdit = (messageId: string) => {
    if (!editText.trim()) return;
    editMessage(messageId, editText.trim());
    setEditingMessageId(null);
  };

  const toggleVoiceNote = (msgId: string, url?: string) => {
    if (!url) return;
    if (playingVoiceNoteId === msgId) {
      audioElementRef.current?.pause();
      setPlayingVoiceNoteId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(url);
      audio.playbackRate = playbackSpeed;
      audioElementRef.current = audio;
      audio.onended = () => setPlayingVoiceNoteId(null);
      audio.play().catch(() => setPlayingVoiceNoteId(null));
      setPlayingVoiceNoteId(msgId);
    }
  };

  const cyclePlaybackSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative chat-pattern-dark">
      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-slate-900/90 border-b border-emerald-500/30 flex items-center justify-between text-xs text-slate-300 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-emerald-400 rotate-45 shrink-0" />
            <span className="font-semibold text-emerald-400">Pinned:</span>
            <span className="truncate">{decryptedTexts[pinnedMessage.id] || pinnedMessage.text}</span>
          </div>
          <button
            onClick={() => togglePinMessage(pinnedMessage.id)}
            className="text-[11px] text-slate-400 hover:text-white underline ml-2"
          >
            Unpin
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* End-to-End Encryption Notice banner */}
        <div className="flex justify-center my-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-[11px] text-amber-300/80 font-medium text-center shadow-sm max-w-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
          </div>
        </div>

        {displayedMessages.map((msg) => {
          const isSentByMe = msg.senderId === currentUser.id;
          const isHovered = hoveredMessageId === msg.id;
          const textContent = decryptedTexts[msg.id] || msg.text;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => {
                setHoveredMessageId(null);
                setReactionMenuMessageId(null);
              }}
              className={`flex flex-col group ${isSentByMe ? 'items-end' : 'items-start'}`}
            >
              <div className="relative max-w-[85%] sm:max-w-[70%]">
                {/* Message Bubble Container */}
                <div
                  className={`relative p-2.5 rounded-2xl shadow-md text-slate-100 ${
                    isSentByMe
                      ? 'bg-[#005c4b] rounded-tr-xs'
                      : 'bg-[#202c33] rounded-tl-xs'
                  }`}
                >
                  {/* Sender Name in Groups */}
                  {!isSentByMe && activeChat?.type !== 'direct' && (
                    <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                      {msg.senderName}
                    </span>
                  )}

                  {/* Replied Message Preview */}
                  {msg.replyTo && (
                    <div className="mb-2 p-2 rounded-xl bg-black/25 border-l-4 border-emerald-400 text-xs">
                      <span className="font-semibold text-emerald-300 block text-[11px]">
                        {msg.replyTo.senderName}
                      </span>
                      <span className="text-slate-300 line-clamp-1 text-[11px]">
                        {msg.replyTo.text}
                      </span>
                    </div>
                  )}

                  {/* Content by Message Type */}
                  {/* 1. Image */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden cursor-pointer" onClick={() => setPreviewMediaUrl(msg.mediaUrl || null)}>
                      <img
                        src={msg.mediaUrl}
                        alt="Media attachment"
                        className="max-h-72 w-auto object-cover rounded-xl hover:opacity-95 transition-opacity"
                      />
                      {msg.mediaName && (
                        <div className="flex items-center justify-between text-[10px] text-slate-300/80 px-1 pt-1 font-mono">
                          <span>{msg.mediaName}</span>
                          <span>{msg.mediaSize}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Voice Note */}
                  {msg.type === 'voice_note' && (
                    <div className="flex items-center gap-3 p-1 min-w-[220px]">
                      <button
                        onClick={() => toggleVoiceNote(msg.id, msg.mediaUrl)}
                        className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow transition-transform active:scale-95 shrink-0"
                      >
                        {playingVoiceNoteId === msg.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      {/* Waveform Visualization Bars */}
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 50, 80, 60, 100, 45, 85, 30, 60, 95, 40].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              playingVoiceNoteId === msg.id ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400/60'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>

                      {/* Speed button */}
                      <button
                        onClick={cyclePlaybackSpeed}
                        className="text-[10px] font-mono font-bold bg-black/30 hover:bg-black/50 px-1.5 py-0.5 rounded text-white"
                      >
                        {playbackSpeed}x
                      </button>
                    </div>
                  )}

                  {/* 3. Document */}
                  {msg.type === 'document' && (
                    <div className="flex items-center gap-3 p-2 bg-black/25 rounded-xl mb-1 min-w-[200px]">
                      <div className="p-2.5 rounded-lg bg-emerald-600/30 text-emerald-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold text-white truncate">{msg.mediaName || 'Document.pdf'}</h5>
                        <span className="text-[10px] text-slate-300">{msg.mediaSize || '1.4 MB'}</span>
                      </div>
                      <a
                        href={msg.mediaUrl || '#'}
                        download={msg.mediaName || 'document'}
                        className="p-1.5 text-slate-300 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Text (with inline edit) */}
                  {editingMessageId === msg.id ? (
                    <div className="space-y-2 mt-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded text-white font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    msg.type === 'text' && (
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.isDeleted ? 'italic text-slate-400' : 'text-slate-100'
                      }`}>
                        {textContent}
                      </p>
                    )
                  )}

                  {/* Bottom Meta Bar: Stars, Pins, Disappearing icon, Timestamp, Checkmarks */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-300/80 select-none">
                    {msg.isPinned && <Pin className="w-2.5 h-2.5 text-emerald-300 rotate-45" />}
                    {msg.isStarred && <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />}
                    {msg.expiresAt && (
                      <span title="Disappearing message">
                        <Clock className="w-2.5 h-2.5 text-amber-300" />
                      </span>
                    )}

                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Status Checkmarks for Sender */}
                    {isSentByMe && (
                      msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )
                    )}
                  </div>
                </div>

                {/* Reactions Pill Display */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 -mb-1">
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                      if (!userIds || userIds.length === 0) return null;
                      const hasReacted = userIds.includes(currentUser.id);
                      return (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] border shadow-sm transition-transform active:scale-90 ${
                            hasReacted
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="font-mono text-[10px]">{userIds.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Hover Action Bar */}
                {isHovered && (
                  <div
                    className={`absolute -top-7 ${
                      isSentByMe ? 'right-0' : 'left-0'
                    } flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-full px-2 py-1 shadow-xl z-20 text-slate-300 animate-in fade-in duration-100`}
                  >
                    <button
                      onClick={() => setReactionMenuMessageId(reactionMenuMessageId === msg.id ? null : msg.id)}
                      className="p-1 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
                      title="React"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onReply(msg)}
                      className="p-1 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleStarMessage(msg.id)}
                      className="p-1 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors"
                      title={msg.isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => togglePinMessage(msg.id)}
                      className="p-1 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
                      title={msg.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`w-3.5 h-3.5 rotate-45 ${msg.isPinned ? 'text-emerald-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(textContent)}
                      className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {isSentByMe && (
                      <button
                        onClick={() => {
                          setEditingMessageId(msg.id);
                          setEditText(textContent);
                        }}
                        className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteMessage(msg.id, isSentByMe)}
                      className="p-1 hover:text-rose-400 hover:bg-slate-800 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Reaction Picker Popup */}
                {reactionMenuMessageId === msg.id && (
                  <div
                    className={`absolute -top-14 ${
                      isSentByMe ? 'right-0' : 'left-0'
                    } flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-full px-2.5 py-1.5 shadow-2xl z-30 animate-in zoom-in-95 duration-100`}
                  >
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addReaction(msg.id, emoji);
                          setReactionMenuMessageId(null);
                        }}
                        className="text-base hover:scale-125 transition-transform px-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Zoom Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <img
            src={previewMediaUrl}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
