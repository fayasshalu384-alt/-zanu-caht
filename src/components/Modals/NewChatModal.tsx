import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, Users, MessageSquarePlus, Megaphone, Globe, Check, Search, UserPlus } from 'lucide-react';

export const NewChatModal: React.FC = () => {
  const {
    newChatModalOpen,
    setNewChatModalOpen,
    setAddMemberModalOpen,
    users,
    currentUser,
    createDirectChat,
    createGroupChat,
    createChannel,
  } = useChat();

  const [tab, setTab] = useState<'direct' | 'group' | 'channel'>('direct');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!newChatModalOpen) return null;

  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const filteredUsers = otherUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleStartDirect = (userId: string) => {
    createDirectChat(userId);
    setNewChatModalOpen(false);
  };

  const handleCreateGroup = () => {
    if (!title.trim() || selectedUsers.length === 0) return;
    createGroupChat(title.trim(), selectedUsers, description.trim());
    setNewChatModalOpen(false);
  };

  const handleCreateChannel = () => {
    if (!title.trim()) return;
    createChannel(title.trim(), description.trim());
    setNewChatModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">New Conversation</h3>
          <button
            onClick={() => setNewChatModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setTab('direct')}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'direct'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" /> Direct
          </button>
          <button
            onClick={() => setTab('group')}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'group'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Group
          </button>
          <button
            onClick={() => setTab('channel')}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'channel'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Channel
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(tab === 'group' || tab === 'channel') && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {tab === 'group' ? 'Group Name' : 'Channel Name'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={tab === 'group' ? 'e.g. Weekend Hackers 🚀' : 'e.g. AI Trends Daily 📢'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this conversation about?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* User search bar */}
          {(tab === 'direct' || tab === 'group') && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contacts</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewChatModalOpen(false);
                    setAddMemberModalOpen(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-xl transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> + Add Member to Web
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts by name or phone..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Contacts list */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => tab === 'direct' ? handleStartDirect(user.id) : handleToggleUser(user.id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border border-emerald-500/40'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-white">{user.name}</h4>
                          <p className="text-xs text-slate-400">{user.about || user.phone}</p>
                        </div>
                      </div>

                      {tab === 'group' && (
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer for Group / Channel */}
        {(tab === 'group' || tab === 'channel') && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
            <button
              onClick={tab === 'group' ? handleCreateGroup : handleCreateChannel}
              disabled={!title.trim() || (tab === 'group' && selectedUsers.length === 0)}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              {tab === 'group' ? `Create Group (${selectedUsers.length} members)` : 'Create Channel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
