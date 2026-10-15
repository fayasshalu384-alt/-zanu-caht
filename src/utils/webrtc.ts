/**
 * WebRTC Calling Manager for ChatWave Voice & Video Calls.
 * Features real RTCPeerConnection + STUN servers, with fallback simulated media streams
 * if the browser environment does not have access to real camera/mic devices.
 */

export interface CallPeerState {
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

// Generate animated fallback video canvas stream if camera is unavailable or denied
export function createSyntheticMediaStream(name: string, isVideo: boolean): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  let hue = Math.floor(Math.random() * 360);
  let frame = 0;

  const draw = () => {
    if (!ctx) return;
    frame++;
    hue = (hue + 0.5) % 360;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, `hsl(${hue}, 40%, 15%)`);
    grad.addColorStop(1, `hsl(${(hue + 40) % 360}, 50%, 8%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Subtle wave ripples
    ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.25)`;
    ctx.lineWidth = 2;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      const radius = 70 + ((frame * 2 + r * 60) % 200);
      ctx.arc(320, 210, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Avatar Circle
    ctx.beginPath();
    ctx.arc(320, 210, 65, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 60%, 35%)`;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Initial letter
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.slice(0, 1).toUpperCase() || 'U', 320, 212);

    // Live Badge & Name
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(name, 320, 310);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('● WaveRTC Stream Active', 320, 338);

    requestAnimationFrame(draw);
  };

  draw();

  const stream = canvas.captureStream(25);

  // Generate synthetic quiet audio tone track using Web Audio API
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const actx = new AudioContextClass();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      const dest = actx.createMediaStreamDestination();
      osc.frequency.value = 440;
      gain.gain.value = 0.0001; // virtually inaudible test tone to establish valid audio track
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }
  } catch {
    // Ignore audio track generation error
  }

  if (!isVideo) {
    // Disable video track for voice calls
    stream.getVideoTracks().forEach(t => t.enabled = false);
  }

  return stream;
}

export async function getLocalStream(isVideo: boolean, userName: string): Promise<MediaStream> {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
      });
      return media;
    }
  } catch {
    console.warn('Real media devices not accessible; activating synthetic media stream.');
  }
  return createSyntheticMediaStream(userName, isVideo);
}

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};
