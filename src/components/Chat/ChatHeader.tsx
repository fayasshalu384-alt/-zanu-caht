import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  ShieldCheck,
  Clock,
  Ban,
  AlertTriangle,
  Info,
  Radio,
  Users,
} from 'lucide-react';

interface ChatHeaderProps {
  onOpenInfo: () => void;
  onToggleSearch: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenInfo, onToggleSearch }) => {
  const {
    activeChat,
    setActiveChatId,
    users,
    currentUser,
    typingUsers,
    startCall,
    setDisappearingTimer,
    blockUser,
    submitReport,
  } = useChat();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');

  if (!activeChat) return null;

  // Get peer user if direct chat
  const peerUserId = activeChat.type === 'direct'
    ? activeChat.participants.find(p => p !== currentUser.id)
    : null;
  const peerUser = peerUserId ? users.find(u => u.id === peerUserId) : null;

  const isTyping = (typingUsers[activeChat.id] || []).length > 0;

  const handleStartCall = (type: 'voice' | 'video') => {
    if (peerUser) {
      startCall(peerUser, type);
    } else {
      // Group call simulation
      const firstMember = users.find(u => activeChat.participants.includes(u.id) && u.id !== currentUser.id);
      if (firstMember) {
        startCall(firstMember, type);
      }
    }
  };

  const handleSetTimer = (seconds: number) => {
    setDisappearingTimer(activeChat.id, seconds);
    setShowDisappearingModal(false);
  };

  const handleSubmitReport = () => {
    if (peerUserId) {
      submitReport(peerUserId, reportReason, reportDetails);
      setShowReportModal(false);
      setReportDetails('');
    }
  };

  return (
    <div className="h-16 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-10 select-none">
      {/* Mobile Back Button */}
      <button
        onClick={() => setActiveChatId(null)}
        className="md:hidden p-2 -ml-2 mr-1 text-slate-400 hover:text-white rounded-full transition-colors"
        title="Back to Chats"
      >
        <span className="text-xl">←</span>
      </button>

      {/* Contact / Group Info */}
      <div
        onClick={onOpenInfo}
        className="flex items-center gap-3 cursor-pointer p-1 rounded-2xl hover:bg-slate-800/60 transition-colors flex-1 min-w-0 mr-2"
      >
        <div className="relative shrink-0">
          <img
            src={peerUser?.avatar || activeChat.avatar}
            alt={activeChat.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow"
          />
          {peerUser?.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
            {activeChat.name}
            <span title="End-to-End Encrypted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </span>
          </h3>
          <p className="text-xs text-slate-400 truncate">
            {isTyping ? (
              <span className="text-emerald-400 font-medium italic animate-pulse">typing...</span>
            ) : activeChat.type === 'direct' ? (
              peerUser?.online ? (
                <span className="text-emerald-400 font-medium">online</span>
              ) : (
                `last seen ${new Date(peerUser?.lastSeen || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              )
            ) : (
              `${activeChat.participants.length} members`
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 relative">
        <button
          onClick={() => handleStartCall('video')}
          className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
          title="Video Call"
        >
          <Video className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleStartCall('voice')}
          className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
          title="Voice Call"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSearch}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          title="Search in conversation"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Dropdown menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-12 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200 animate-in fade-in duration-100"
            onClick={() => setMenuOpen(false)}
          >
            <button
              onClick={onOpenInfo}
              className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-slate-400" /> View Info
            </button>
            <button
              onClick={() => setShowDisappearingModal(true)}
              className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-400" /> Disappearing Messages
            </button>
            {peerUserId && (
              <>
                <button
                  onClick={() => blockUser(peerUserId)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-800 text-rose-400 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" /> Block Contact
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-800 text-rose-400 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Report Contact
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Disappearing Messages Modal */}
      {showDisappearingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Disappearing Messages
            </h4>
            <p className="text-xs text-slate-400">
              When enabled, new messages sent in this chat will automatically disappear for both parties after the timer expires.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Off', val: 0 },
                { label: '24 Hours', val: 86400 },
                { label: '7 Days', val: 604800 },
                { label: '90 Days', val: 7776000 },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => handleSetTimer(item.val)}
                  className={`py-2 px-3 text-xs rounded-xl font-semibold border text-center transition-all ${
                    activeChat.disappearingTimer === item.val
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDisappearingModal(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Report Contact
            </h4>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Spam">Spam or Unsolicited Promo</option>
                <option value="Harassment">Harassment or Abuse</option>
                <option value="Impersonation">Impersonation</option>
                <option value="Other">Other Violation</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Details</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Describe what occurred..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
