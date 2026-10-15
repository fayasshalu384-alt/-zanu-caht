import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Maximize2, ShieldCheck, User } from 'lucide-react';

export const CallModal: React.FC = () => {
  const { activeCall, endCall, toggleMute, toggleVideo, toggleScreenShare } = useChat();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activeCall?.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = activeCall.localStream;
    }
  }, [activeCall?.localStream]);

  useEffect(() => {
    if (activeCall?.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = activeCall.remoteStream;
    }
  }, [activeCall?.remoteStream]);

  if (!activeCall) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideo = activeCall.type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[720px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={activeCall.peerUser.avatar}
              alt={activeCall.peerUser.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow"
            />
            <div>
              <h3 className="font-semibold text-white text-base tracking-wide flex items-center gap-2">
                {activeCall.peerUser.name}
                <span className="flex items-center gap-1 text-[11px] font-normal text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-700/50">
                  <ShieldCheck className="w-3 h-3" /> E2EE Call
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {activeCall.status === 'connected' ? (
                  <span className="text-emerald-400 font-mono font-medium">{formatDuration(activeCall.duration)}</span>
                ) : (
                  <span className="animate-pulse">{activeCall.status === 'calling' ? 'Calling...' : 'Ringing...'}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              WaveRTC HD 1080p
            </span>
          </div>
        </div>

        {/* Call Viewport */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <>
              {/* Remote Video Stream or Placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                {activeCall.remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-center p-6">
                    <div className="relative mb-6">
                      <img
                        src={activeCall.peerUser.avatar}
                        alt={activeCall.peerUser.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/80 shadow-2xl animate-pulse"
                      />
                      <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-30" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{activeCall.peerUser.name}</h2>
                    <p className="text-slate-400 text-sm max-w-sm">
                      {activeCall.status === 'connected'
                        ? 'Connected. Audio stream active.'
                        : 'Establishing secure peer-to-peer WebRTC connection...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Local Video Thumbnail (PiP) */}
              <div className="absolute bottom-24 right-6 w-44 h-60 bg-slate-800 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl z-10">
                {activeCall.isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                    <User className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs">Camera Off</span>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                )}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-1.5 py-0.5 rounded">
                  You
                </div>
              </div>
            </>
          ) : (
            /* Voice Call UI */
            <div className="flex flex-col items-center text-center p-8">
              <div className="relative mb-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20">
                  <img
                    src={activeCall.peerUser.avatar}
                    alt={activeCall.peerUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {activeCall.status === 'connected' && (
                  <div className="absolute -inset-3 rounded-full border-2 border-emerald-400/40 animate-pulse pointer-events-none" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{activeCall.peerUser.name}</h2>
              <p className="text-emerald-400 font-mono text-sm tracking-wider mb-6">
                {activeCall.status === 'connected' ? `In call • ${formatDuration(activeCall.duration)}` : 'Calling...'}
              </p>
              <div className="flex items-center gap-1.5 py-2 px-4 bg-slate-800/80 rounded-full border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Opus High-Fidelity Audio • End-to-End Encrypted
              </div>
            </div>
          )}
        </div>

        {/* Call Controls Bar */}
        <div className="h-20 bg-slate-900 border-t border-slate-800/80 flex items-center justify-center gap-4 px-6 z-20">
          <button
            onClick={toggleMute}
            title={activeCall.isMuted ? 'Unmute' : 'Mute'}
            className={`p-3.5 rounded-full transition-all duration-150 ${
              activeCall.isMuted
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {isVideo && (
            <button
              onClick={toggleVideo}
              title={activeCall.isVideoOff ? 'Turn camera on' : 'Turn camera off'}
              className={`p-3.5 rounded-full transition-all duration-150 ${
                activeCall.isVideoOff
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          {isVideo && (
            <button
              onClick={toggleScreenShare}
              title="Share screen"
              className={`p-3.5 rounded-full transition-all duration-150 ${
                activeCall.isScreenSharing
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Monitor className="w-6 h-6" />
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={endCall}
            title="End Call"
            className="p-3.5 bg-rose-600 text-white hover:bg-rose-700 rounded-full shadow-lg shadow-rose-600/30 transition-transform active:scale-95 ml-2"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useChat();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Animated glowing border */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />

        <div className="relative inline-block mb-4">
          <img
            src={incomingCall.caller.avatar}
            alt={incomingCall.caller.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-xl mx-auto"
          />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-40" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{incomingCall.caller.name}</h3>
        <p className="text-slate-400 text-xs mb-6 flex items-center justify-center gap-1.5">
          {incomingCall.type === 'video' ? <Video className="w-4 h-4 text-emerald-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call...
        </p>

        <div className="flex items-center justify-center gap-8">
          {/* Decline */}
          <button
            onClick={rejectCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform group-active:scale-90">
              <PhoneOff className="w-7 h-7" />
            </div>
            <span className="text-xs text-slate-300 font-medium">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform group-active:scale-90 animate-bounce">
              {incomingCall.type === 'video' ? <Video className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </div>
            <span className="text-xs text-emerald-400 font-medium">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
