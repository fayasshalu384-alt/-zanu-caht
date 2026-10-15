import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { StatusItem } from '../../types/chat';
import { X, ChevronLeft, ChevronRight, Send, Eye, ShieldCheck } from 'lucide-react';

interface StatusViewerModalProps {
  status: StatusItem | null;
  onClose: () => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({ status, onClose }) => {
  const { currentUser, statuses, viewStatus, sendMessage, createDirectChat } = useChat();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  // Filter statuses by the same user or list of active statuses
  const userStatuses = statuses.filter(s => status && s.userId === status.userId);
  const activeStatus = userStatuses[currentIndex] || status;

  useEffect(() => {
    if (activeStatus) {
      viewStatus(activeStatus.id);
    }
  }, [activeStatus, viewStatus]);

  useEffect(() => {
    if (!activeStatus || isPaused) return;

    const interval = 50; // update every 50ms
    const totalDuration = 5000; // 5 seconds per story
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < userStatuses.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStatus, isPaused, currentIndex, userStatuses.length, onClose]);

  if (!activeStatus) return null;

  const handleNext = () => {
    if (currentIndex < userStatuses.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    createDirectChat(activeStatus.userId);
    await sendMessage(`Replied to status: "${replyText}"`);
    setReplyText('');
    setReplySuccess(true);
    setTimeout(() => setReplySuccess(false), 2000);
  };

  const isOwnStatus = activeStatus.userId === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 select-none">
      <div
        className="relative w-full max-w-md h-[90vh] max-h-[780px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-3 inset-x-4 z-30 flex gap-1.5">
          {userStatuses.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top User Info Bar */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeStatus.userAvatar}
              alt={activeStatus.userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow"
            />
            <div>
              <h4 className="text-sm font-semibold text-white drop-shadow flex items-center gap-1.5">
                {activeStatus.userName}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <p className="text-[11px] text-slate-300 drop-shadow">
                {new Date(activeStatus.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Content */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {activeStatus.type === 'image' ? (
            <img
              src={activeStatus.content}
              alt="Story"
              className="w-full h-full object-contain"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-8 text-center"
              style={{ backgroundColor: activeStatus.backgroundColor || '#065f46' }}
            >
              <p className="text-2xl font-bold text-white tracking-wide leading-relaxed font-sans">
                {activeStatus.content}
              </p>
            </div>
          )}

          {/* Caption Overlay */}
          {activeStatus.caption && (
            <div className="absolute bottom-20 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center z-20">
              <p className="text-white text-sm font-medium drop-shadow">{activeStatus.caption}</p>
            </div>
          )}

          {/* Left / Right Tap zones */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer flex items-center justify-start p-4 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white/70 drop-shadow" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer flex items-center justify-end p-4 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white/70 drop-shadow" />
          </button>
        </div>

        {/* Bottom Bar: Reply or Viewer count */}
        <div className="p-3 bg-black/80 backdrop-blur-md z-30 border-t border-white/10">
          {isOwnStatus ? (
            <div className="flex items-center justify-center gap-2 text-slate-300 text-xs py-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Viewed by {activeStatus.viewers.length} contacts</span>
            </div>
          ) : (
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                placeholder="Reply to status..."
                className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-full px-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-full transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
              {replySuccess && (
                <span className="absolute -top-7 left-4 text-[11px] text-emerald-400 font-medium">
                  Reply sent to chat!
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
