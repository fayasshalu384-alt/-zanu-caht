import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Radio, Plus, CheckCircle, Bell, BellOff, Users } from 'lucide-react';

export const ChannelsList: React.FC = () => {
  const { chats, currentUser, setActiveChatId, setActiveTab, setNewChatModalOpen, toggleMuteChat } = useChat();

  const channels = chats.filter(c => c.type === 'channel');

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Broadcast Channels</h4>
          <p className="text-[11px] text-slate-500">Stay updated on topics you care about</p>
        </div>
        <button
          onClick={() => setNewChatModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Create
        </button>
      </div>

      <div className="space-y-2">
        {channels.map((channel) => {
          const isFollower = channel.participants.includes(currentUser.id);
          return (
            <div
              key={channel.id}
              onClick={() => {
                setActiveChatId(channel.id);
                setActiveTab('chats');
              }}
              className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 rounded-2xl cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow"
                  />
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 text-white rounded-full">
                    <Radio className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-white group-hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                    {channel.name}
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  </h5>
                  <p className="text-xs text-slate-400 line-clamp-1">{channel.description || 'Official broadcast channel'}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    {channel.participants.length * 2840} followers
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMuteChat(channel.id);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
                  title={channel.isMuted ? 'Unmute notifications' : 'Mute notifications'}
                >
                  {channel.isMuted ? <BellOff className="w-4 h-4 text-slate-500" /> : <Bell className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
