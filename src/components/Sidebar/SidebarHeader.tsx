import React from 'react';
import { useChat } from '../../context/ChatContext';
import {
  MessageSquare,
  CircleDot,
  Radio,
  Users2,
  Phone,
  Settings,
  ShieldAlert,
  Sparkles,
  Plus,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export const SidebarHeader: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setStudioModalOpen,
    setNewChatModalOpen,
    setAuthModalOpen,
    setAddMemberModalOpen,
  } = useChat();

  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'status', label: 'Status', icon: CircleDot },
    { id: 'channels', label: 'Channels', icon: Radio },
    { id: 'communities', label: 'Communities', icon: Users2 },
    { id: 'calls', label: 'Calls', icon: Phone },
  ] as const;

  return (
    <div className="flex flex-col border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md shrink-0">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* User avatar & Quick Profile switch button */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-800/70 transition-all group text-left"
          title="Account / Switch User"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800/50">
                Zanu Chat
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">Switch profile ▾</span>
          </div>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Wave Studio AI Image Generator button */}
          <button
            onClick={() => setStudioModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Wave Studio AI Image Generator"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Wave Studio</span>
          </button>

          {/* Add Member Button */}
          <button
            onClick={() => setAddMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-full text-xs font-semibold transition-all"
            title="Add Member to Web"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">Add Member</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={() => setNewChatModalOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="New Conversation"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Admin Panel (if admin) */}
          {currentUser.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2 rounded-full transition-colors ${
                activeTab === 'admin'
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Admin Moderation"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => setActiveTab(activeTab === 'settings' ? 'chats' : 'settings')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'settings'
                ? 'text-emerald-400 bg-emerald-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between px-2 overflow-x-auto no-scrollbar border-t border-slate-800/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-2 flex flex-col items-center gap-1 relative text-xs font-medium transition-all ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px]">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
