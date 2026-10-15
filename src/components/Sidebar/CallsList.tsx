import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall } from 'lucide-react';

export const CallsList: React.FC = () => {
  const { callRecords, users, startCall } = useChat();

  const handleCallBack = (peerId: string, type: 'voice' | 'video') => {
    const target = users.find(u => u.id === peerId);
    if (target) {
      startCall(target, type);
    }
  };

  const formatDuration = (sec: number) => {
    if (sec === 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Call History</h4>
          <p className="text-[11px] text-slate-500">Real-time WebRTC voice & video calls</p>
        </div>
      </div>

      <div className="space-y-2">
        {callRecords.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-6 text-center">
            No call logs yet. Select a chat to start a voice or video call!
          </p>
        ) : (
          callRecords.map((call) => {
            const isMissed = call.status === 'missed';
            return (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={call.peerAvatar}
                    alt={call.peerName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow"
                  />
                  <div>
                    <h5 className={`text-sm font-semibold ${isMissed ? 'text-rose-400' : 'text-white'}`}>
                      {call.peerName}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      {call.status === 'missed' ? (
                        <PhoneMissed className="w-3 h-3 text-rose-500" />
                      ) : call.direction === 'incoming' ? (
                        <PhoneIncoming className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <PhoneOutgoing className="w-3 h-3 text-cyan-400" />
                      )}
                      <span>
                        {new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {call.duration > 0 && <span>({formatDuration(call.duration)})</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCallBack(call.peerId, 'voice')}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
                    title="Start Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCallBack(call.peerId, 'video')}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
