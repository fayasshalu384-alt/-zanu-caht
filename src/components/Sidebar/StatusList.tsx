import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { StatusItem } from '../../types/chat';
import { Plus, Sparkles, Image as ImageIcon, Type, Eye } from 'lucide-react';
import { StatusViewerModal } from '../Modals/StatusViewerModal';

export const StatusList: React.FC = () => {
  const { currentUser, statuses, postStatus, setStudioModalOpen } = useChat();
  const [activeStoryToView, setActiveStoryToView] = useState<StatusItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [textStatus, setTextStatus] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#065f46');

  // Filter 24h active statuses
  const now = Date.now();
  const activeStatuses = statuses.filter(s => s.expiresAt > now);

  const myStatuses = activeStatuses.filter(s => s.userId === currentUser.id);
  const otherStatuses = activeStatuses.filter(s => s.userId !== currentUser.id);

  // Group by user
  const groupedByUser = otherStatuses.reduce<Record<string, StatusItem[]>>((acc, s) => {
    if (!acc[s.userId]) acc[s.userId] = [];
    acc[s.userId].push(s);
    return acc;
  }, {});

  const bgColors = ['#065f46', '#1e3a8a', '#831843', '#581c87', '#7c2d12', '#18181b'];

  const handleCreateTextStatus = () => {
    if (!textStatus.trim()) return;
    postStatus('text', textStatus.trim(), undefined, selectedBgColor);
    setTextStatus('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6 bg-slate-900/60">
      {/* My Status */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">My Status</h4>
        <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <div
            onClick={() => myStatuses.length > 0 && setActiveStoryToView(myStatuses[0])}
            className="flex items-center gap-3 cursor-pointer group flex-1"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className={`w-12 h-12 rounded-full object-cover ${
                  myStatuses.length > 0 ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' : 'border border-slate-700'
                }`}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateModal(true);
                }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-sm shadow hover:scale-110 transition-transform"
                title="Add status"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                My Status
              </h5>
              <p className="text-xs text-slate-400">
                {myStatuses.length > 0
                  ? `${myStatuses.length} active updates • Tap to view`
                  : 'Tap + to share a 24h photo or text story'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Add text status"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStudioModalOpen(true)}
              className="p-2 text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
              title="Create with Wave Studio AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Updates from Contacts */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Recent Updates ({Object.keys(groupedByUser).length})
        </h4>

        {Object.keys(groupedByUser).length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">
            No updates from contacts yet today.
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedByUser).map(([userId, items]) => {
              const latest = items[0];
              const allViewed = items.every(it => it.viewers.includes(currentUser.id));
              return (
                <div
                  key={userId}
                  onClick={() => setActiveStoryToView(latest)}
                  className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="relative">
                    <img
                      src={latest.userAvatar}
                      alt={latest.userName}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ${
                        allViewed ? 'ring-slate-600' : 'ring-emerald-500'
                      } ring-offset-2 ring-offset-slate-900`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-white truncate">{latest.userName}</h5>
                    <p className="text-xs text-slate-400 font-mono">
                      {new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {items.length} stories
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Text Status Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Status Update</h3>
            <div
              className="w-full h-44 rounded-2xl flex items-center justify-center p-6 text-center transition-colors"
              style={{ backgroundColor: selectedBgColor }}
            >
              <textarea
                value={textStatus}
                onChange={(e) => setTextStatus(e.target.value)}
                placeholder="Type your 24-hour status story..."
                rows={3}
                className="w-full bg-transparent text-white font-bold text-lg text-center placeholder:text-white/60 focus:outline-none resize-none"
              />
            </div>

            {/* Color picker */}
            <div className="flex items-center justify-center gap-2">
              {bgColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedBgColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selectedBgColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTextStatus}
                disabled={!textStatus.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow"
              >
                Post Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Story Viewer */}
      {activeStoryToView && (
        <StatusViewerModal
          status={activeStoryToView}
          onClose={() => setActiveStoryToView(null)}
        />
      )}
    </div>
  );
};
