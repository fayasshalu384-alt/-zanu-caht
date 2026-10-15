import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatInfoDrawer } from './ChatInfoDrawer';
import { Message } from '../../types/chat';
import { ShieldCheck, MessageSquarePlus, Sparkles } from 'lucide-react';

export const ChatArea: React.FC = () => {
  const { activeChat, setNewChatModalOpen, setStudioModalOpen } = useChat();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [inChatSearchFilter, setInChatSearchFilter] = useState('');

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center border-l border-slate-800/80">
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-6 shadow-2xl">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Zanu Chat Web</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
          Send and receive end-to-end encrypted messages, make crystal-clear WebRTC voice & video calls, share 24h stories, and create studio AI artwork with Gemini.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewChatModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 text-xs transition-transform active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" /> Start New Chat
          </button>
          <button
            onClick={() => setStudioModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-2xl border border-emerald-500/30 text-xs transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Wave Studio AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Conversation Column */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
        <ChatHeader
          onOpenInfo={() => setShowInfoDrawer(!showInfoDrawer)}
          onToggleSearch={() => setShowSearch(!showSearch)}
        />

        {/* In-chat search bar */}
        {showSearch && (
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs">
            <input
              type="text"
              value={inChatSearchFilter}
              onChange={(e) => setInChatSearchFilter(e.target.value)}
              placeholder="Search in this chat..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-4 py-1.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setInChatSearchFilter('');
              }}
              className="text-slate-400 hover:text-white px-2 py-1"
            >
              Done
            </button>
          </div>
        )}

        <MessageList
          onReply={(msg) => setReplyingTo(msg)}
          searchFilter={inChatSearchFilter}
        />

        <MessageInput
          replyingTo={replyingTo}
          onClearReply={() => setReplyingTo(null)}
        />
      </div>

      {/* Slide-over Info Drawer */}
      {showInfoDrawer && (
        <ChatInfoDrawer onClose={() => setShowInfoDrawer(false)} />
      )}
    </div>
  );
};
