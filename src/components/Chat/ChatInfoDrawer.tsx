import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  X,
  ShieldCheck,
  Clock,
  Image as ImageIcon,
  FileText,
  Link,
  Users,
  UserPlus,
  Ban,
  QrCode,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface ChatInfoDrawerProps {
  onClose: () => void;
}

export const ChatInfoDrawer: React.FC<ChatInfoDrawerProps> = ({ onClose }) => {
  const {
    activeChat,
    currentUser,
    users,
    messages,
    blockUser,
    addMemberToGroup,
    removeMemberFromGroup,
    deleteGroup,
    setAddMemberModalOpen,
  } = useChat();
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs'>('media');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAddMemberPicker, setShowAddMemberPicker] = useState(false);

  if (!activeChat) return null;

  const peerUserId = activeChat.type === 'direct'
    ? activeChat.participants.find(p => p !== currentUser.id)
    : null;
  const peerUser = peerUserId ? users.find(u => u.id === peerUserId) : null;

  // Shared media in this chat
  const chatMessages = messages.filter(m => m.chatId === activeChat.id);
  const mediaItems = chatMessages.filter(m => m.type === 'image' && m.mediaUrl);
  const docItems = chatMessages.filter(m => m.type === 'document' && m.mediaUrl);

  const participants = users.filter(u => activeChat.participants.includes(u.id));
  const availableUsersToAdd = users.filter(u => !activeChat.participants.includes(u.id));

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col h-full shrink-0 z-20 animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">Contact Info</h4>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center">
          <img
            src={peerUser?.avatar || activeChat.avatar}
            alt={activeChat.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-xl mb-3"
          />
          <h3 className="text-base font-bold text-white mb-0.5">{activeChat.name}</h3>
          <p className="text-xs text-slate-400 font-mono">
            {peerUser?.phone || `${activeChat.participants.length} participants`}
          </p>
          <p className="text-xs text-slate-300 mt-2 italic px-4">
            "{peerUser?.about || activeChat.description || 'Welcome to ChatWave'}"
          </p>
        </div>

        {/* Encryption Safety Verification */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Encryption Verification</span>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" /> View QR
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Messages and calls are end-to-end encrypted. Tap to verify the 60-digit safety key.
          </p>
        </div>

        {/* Media & Docs Gallery */}
        <div className="space-y-3">
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveMediaTab('media')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeMediaTab === 'media' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'
              }`}
            >
              Media ({mediaItems.length})
            </button>
            <button
              onClick={() => setActiveMediaTab('docs')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeMediaTab === 'docs' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'
              }`}
            >
              Docs ({docItems.length})
            </button>
          </div>

          {activeMediaTab === 'media' ? (
            mediaItems.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-2">No shared photos or videos</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaItems.map(m => (
                  <img
                    key={m.id}
                    src={m.mediaUrl}
                    alt="Shared media"
                    className="w-full h-20 object-cover rounded-xl border border-slate-800 hover:opacity-90 cursor-pointer"
                  />
                ))}
              </div>
            )
          ) : (
            docItems.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-2">No documents shared</p>
            ) : (
              <div className="space-y-1.5">
                {docItems.map(d => (
                  <div key={d.id} className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl text-xs">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white truncate flex-1">{d.mediaName || 'Document'}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Group Participants (if group) */}
        {activeChat.type !== 'direct' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Participants ({participants.length})
              </span>
              <button
                onClick={() => setShowAddMemberPicker(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded-lg"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            {/* Add Member Picker inline */}
            {showAddMemberPicker && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Select contact to add:</span>
                  <button onClick={() => setShowAddMemberPicker(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {availableUsersToAdd.length === 0 ? (
                  <div className="text-[11px] text-slate-400 py-1 text-center">
                    All contacts are already in this group.
                    <button
                      onClick={() => {
                        setShowAddMemberPicker(false);
                        setAddMemberModalOpen(true);
                      }}
                      className="text-emerald-400 block mx-auto mt-1 font-semibold hover:underline"
                    >
                      + Add New Member to Web
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {availableUsersToAdd.map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          addMemberToGroup(activeChat.id, u.id);
                          setShowAddMemberPicker(false);
                        }}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                        <span className="text-emerald-400 text-[11px] font-semibold">+ Add</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              {participants.map(user => {
                const isAdmin = activeChat.admins?.includes(user.id);
                const isMe = user.id === currentUser.id;
                return (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">
                          {user.name} {isMe && '(You)'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">{user.about?.slice(0, 20)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAdmin && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-1.5 py-0.5 rounded font-mono">
                          Admin
                        </span>
                      )}
                      {!isMe && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${user.name} from this group?`)) {
                              removeMemberFromGroup(activeChat.id, user.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Remove from group"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delete / Exit Group */}
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete and exit "${activeChat.name}"?`)) {
                  deleteGroup(activeChat.id);
                  onClose();
                }
              }}
              className="w-full mt-2 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete & Leave Group
            </button>
          </div>
        )}

        {/* Block button */}
        {peerUserId && (
          <button
            onClick={() => {
              blockUser(peerUserId);
              onClose();
            }}
            className="w-full py-2.5 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4" /> Block {activeChat.name}
          </button>
        )}
      </div>

      {/* Safety QR Code Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Verify Security Code
            </h4>
            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
              {/* Simulated crisp QR code representation */}
              <div className="w-48 h-48 bg-slate-950 p-2 grid grid-cols-6 grid-rows-6 gap-1 rounded-xl">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      (i % 2 === 0 || i % 5 === 0) && i !== 14 && i !== 21 ? 'bg-white' : 'bg-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="font-mono text-xs text-emerald-400 tracking-wider">
              84920 18492 01849 20184 92018 49201 84920 18492 01849 20184
            </p>
            <p className="text-xs text-slate-400">
              Compare this 60-digit number or scan this code with your contact to verify that messages are end-to-end encrypted.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
