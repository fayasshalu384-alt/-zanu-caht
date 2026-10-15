import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ShieldAlert, CheckCircle, Ban, AlertTriangle, Users, MessageSquare, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { reports, users, chats, messages, blockUser } = useChat();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 bg-slate-900/60">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" /> Admin & Moderation Portal
        </h4>
        <p className="text-xs text-slate-400">Security audit, spam detection & abuse review</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
          <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{users.length}</span>
          <span className="text-[10px] text-slate-400">Users</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
          <MessageSquare className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{messages.length}</span>
          <span className="text-[10px] text-slate-400">Messages</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
          <Activity className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{chats.length}</span>
          <span className="text-[10px] text-slate-400">Channels</span>
        </div>
      </div>

      {/* Abuse Reports */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> User Reports ({reports.length})
        </h5>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">No outstanding reports.</p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">{report.reason}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(report.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">{report.details}</p>
              <div className="text-[11px] text-slate-400">
                Reported: <span className="text-white font-medium">{report.reportedUserName}</span> by{' '}
                <span className="text-white font-medium">{report.reporterUserName}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => blockUser(report.reportedUserId)}
                  className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Ban className="w-3 h-3" /> Block User
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
