import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Users2, Plus, ChevronRight, Hash } from 'lucide-react';

export const CommunitiesList: React.FC = () => {
  const { communities, chats, setActiveChatId, setActiveTab } = useChat();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Communities</h4>
          <p className="text-[11px] text-slate-500">Organize multiple related groups under one umbrella</p>
        </div>
      </div>

      <div className="space-y-4">
        {communities.map((community) => {
          const subGroups = chats.filter(c => community.groups.includes(c.id));
          return (
            <div
              key={community.id}
              className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-3"
            >
              {/* Community Header */}
              <div className="flex items-center gap-3">
                <img
                  src={community.avatar}
                  alt={community.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-white truncate">{community.name}</h5>
                  <p className="text-xs text-slate-400 line-clamp-1">{community.description}</p>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {community.membersCount} active members
                  </span>
                </div>
              </div>

              {/* Sub-groups */}
              <div className="border-t border-slate-800/60 pt-2 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase px-2">Sub-Groups</span>
                {subGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      setActiveChatId(group.id);
                      setActiveTab('chats');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <Hash className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {group.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
