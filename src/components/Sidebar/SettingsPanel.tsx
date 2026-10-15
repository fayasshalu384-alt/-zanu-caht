import React from 'react';
import { useChat } from '../../context/ChatContext';
import {
  ShieldCheck,
  Lock,
  Bell,
  Palette,
  Moon,
  Sun,
  KeyRound,
  Trash2,
  Download,
  UserX,
  Volume2,
  LogOut,
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { currentUser, updateUserProfile, users, unblockUser, setChangePasswordModalOpen, logout } = useChat();

  const handleToggleE2EE = () => {
    updateUserProfile({
      settings: {
        ...currentUser.settings,
        e2eeEnabled: !currentUser.settings.e2eeEnabled,
      },
    });
  };

  const handleToggleReadReceipts = () => {
    updateUserProfile({
      settings: {
        ...currentUser.settings,
        privacy: {
          ...currentUser.settings.privacy,
          readReceipts: !currentUser.settings.privacy.readReceipts,
        },
      },
    });
  };

  const handleToggleSounds = () => {
    updateUserProfile({
      settings: {
        ...currentUser.settings,
        soundEnabled: !currentUser.settings.soundEnabled,
      },
    });
  };

  const handleChangeDisappearingDefault = (val: number) => {
    updateUserProfile({
      settings: {
        ...currentUser.settings,
        privacy: {
          ...currentUser.settings.privacy,
          disappearingDefault: val,
        },
      },
    });
  };

  const blockedUsersList = users.filter(u => currentUser.blockedUsers?.includes(u.id));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6 bg-slate-900/60">
      <div>
        <h4 className="text-sm font-bold text-white mb-1">Settings & Privacy</h4>
        <p className="text-xs text-slate-400">Configure your security, preferences, and data controls</p>
      </div>

      {/* Security & End-to-End Encryption */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">End-to-End Encryption</h5>
              <p className="text-[11px] text-slate-400">Standard AES-GCM 256-bit encryption</p>
            </div>
          </div>
          <button
            onClick={handleToggleE2EE}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              currentUser.settings.e2eeEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          When enabled, 1-to-1 direct chats are encrypted on your device using native browser Web Crypto. Only you and your recipient possess the keys.
        </p>
      </div>

      {/* Privacy Controls */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-4">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Privacy
        </h5>

        {/* Read receipts */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Read Receipts (Blue Checkmarks)</span>
            <span className="text-[11px] text-slate-400">Allow contacts to see when you have read messages</span>
          </div>
          <button
            onClick={handleToggleReadReceipts}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              currentUser.settings.privacy.readReceipts ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        {/* Disappearing messages default */}
        <div>
          <span className="text-xs font-semibold text-white block mb-1">Default Disappearing Timer</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Off', val: 0 },
              { label: '24 Hours', val: 86400 },
              { label: '7 Days', val: 604800 },
              { label: '90 Days', val: 7776000 },
            ].map(item => (
              <button
                key={item.val}
                onClick={() => handleChangeDisappearingDefault(item.val)}
                className={`py-1.5 px-2 text-[11px] rounded-xl font-medium border text-center transition-all ${
                  currentUser.settings.privacy.disappearingDefault === item.val
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications & Audio Synthesizer */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-emerald-400" /> Notifications & Sounds
        </h5>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Sound Effects</span>
              <span className="text-[11px] text-slate-400">Message chimes & phone ringtones</span>
            </div>
          </div>
          <button
            onClick={handleToggleSounds}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              currentUser.settings.soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <UserX className="w-3.5 h-3.5 text-rose-400" /> Blocked Contacts ({blockedUsersList.length})
        </h5>
        {blockedUsersList.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No blocked contacts.</p>
        ) : (
          <div className="space-y-2">
            {blockedUsersList.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 bg-slate-900 rounded-xl">
                <span className="text-xs text-white">{u.name}</span>
                <button
                  onClick={() => unblockUser(u.id)}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Credentials & Password */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Account & Password
        </h5>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-semibold text-white block">Username</span>
            <span className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</span>
          </div>
          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full mt-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" /> Log Out
        </button>
      </div>

      {/* Storage and Data Reset */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-2">
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Data & Cache</h5>
        <button
          onClick={() => {
            if (confirm('Reset Zanu Chat local database back to default initial seed?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Reset Local State & Re-seed
        </button>
      </div>
    </div>
  );
};
