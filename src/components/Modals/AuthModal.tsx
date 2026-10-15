import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, User, Phone, Mail, KeyRound, ShieldCheck, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    currentUser,
    users,
    switchUser,
    updateUserProfile,
  } = useChat();

  const [mode, setMode] = useState<'switch' | 'login' | 'otp' | 'profile'>('switch');
  const [phoneNumber, setPhoneNumber] = useState('+1 555-0199');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [about, setAbout] = useState(currentUser.about);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSendOtp = () => {
    setOtpSent(true);
    setMode('otp');
  };

  const handleVerifyOtp = () => {
    setSuccessNotice('Phone verified successfully! Logged in as Wave User.');
    setTimeout(() => {
      setAuthModalOpen(false);
      setSuccessNotice(null);
    }, 1200);
  };

  const handleSaveProfile = () => {
    updateUserProfile({ name, about, avatar: avatarUrl });
    setSuccessNotice('Profile updated!');
    setTimeout(() => {
      setAuthModalOpen(false);
      setSuccessNotice(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">
            {mode === 'switch' ? 'Switch Account / Testing' : mode === 'profile' ? 'Edit Profile' : 'Authentication'}
          </h3>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'switch' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Switch User
          </button>
          <button
            onClick={() => setMode('profile')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'profile' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'login' || mode === 'otp' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Phone / OTP
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {successNotice && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {successNotice}
            </div>
          )}

          {/* Switch Account */}
          {mode === 'switch' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-3">
                Select an active persona to test real-time two-way messaging, calling, and presence:
              </p>
              {users.map((u) => {
                const isActive = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setSuccessNotice(`Switched to ${u.name}`);
                      setTimeout(() => setAuthModalOpen(false), 800);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        {u.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                          {u.isAdmin && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{u.phone} • {u.about.slice(0, 30)}...</p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 hover:text-white">Switch</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit Profile */}
          {mode === 'profile' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-2">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
                />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Avatar Image URL..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">About / Status</label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Phone Login & OTP */}
          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555 0199"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-colors"
              >
                Send 6-Digit OTP Code
              </button>
            </div>
          )}

          {mode === 'otp' && (
            <div className="space-y-4 text-center">
              <KeyRound className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Enter Verification Code</h4>
                <p className="text-xs text-slate-400">Sent to {phoneNumber} (Demo code: 123456)</p>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-48 mx-auto text-center font-mono text-xl tracking-widest bg-slate-950 border border-slate-800 rounded-xl py-2 text-white focus:outline-none focus:border-emerald-500"
              />

              <button
                onClick={handleVerifyOtp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-colors"
              >
                Verify & Enter ChatWave
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
