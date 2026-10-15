# ChatWave 🌊

ChatWave is a modern, production-ready WhatsApp-inspired real-time messaging, WebRTC voice/video calling, and community platform built for web, mobile, and desktop with Progressive Web App (PWA) support.

---

## 🚀 Key Features

### 1. Real-Time Messaging & Chat
- **Instant Messaging**: Real-time communication via WebSockets (`/ws`) and `BroadcastChannel` fallback for reliable multi-client synchronization.
- **Direct & Group Chats**: 1-on-1 private messaging and multi-member group channels with admin roles.
- **Rich Message Types**:
  - Text with clickable links and link preview handling
  - Image and video previews with zoom lightbox
  - Voice notes with audio waveform visualization, duration tracking, and 1x / 1.5x / 2x speed playback
  - Documents and PDF attachments with file size indicators and download actions
  - Contact cards
- **Message Controls**:
  - Reply to specific messages (with quote bubble)
  - Edit sent messages with `(edited)` timestamp
  - Delete messages (Delete for me / Delete for everyone)
  - Star messages and Pin messages to chat header
  - Interactive emoji reactions (`👍`, `❤️`, `😂`, `😮`, `😢`, `🔥`, `🙏`)
  - Copy message text
- **Indicators**:
  - Live typing status indicator (`typing...`)
  - Sent (single grey checkmark), Delivered (double grey checkmark), and Read (double blue checkmark) status receipts
  - Online and last seen presence indicators

### 2. Real WebRTC Voice & Video Calls
- **One-to-One and Group Calls**: Audio and video calling using native `RTCPeerConnection` and Google STUN servers (`stun:stun.l.google.com:19302`).
- **Resilient Media Capture**: Real `getUserMedia` stream with an automated procedural video & audio generator fallback if camera/mic hardware is blocked or restricted.
- **Active Call Controls**:
  - Mute/Unmute microphone
  - Video camera toggle (on/off)
  - Screen sharing via `getDisplayMedia`
  - Real-time call duration timer
- **Audio Synthesizer**: Zero-asset Web Audio API synthetic ringtones for incoming calls, outgoing ringback tones, message sent pops, and received chimes.
- **Call History**: Completed, outgoing, incoming, and missed call logs with one-tap redial.

### 3. Wave Studio (AI Image & Sticker Generator)
- Powered by Google Gemini (`gemini-3-pro-image-preview` and `gemini-nano-banana-2.1`) via `@google/genai` TypeScript SDK on the server side (`POST /api/generate-image`).
- **Image Size Affordance**: Choose between `1K` (1024px), `2K` (2048px), and `4K` (3840px) resolution.
- **Aspect Ratio Affordance**: Choose between `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, and `21:9`.
- **In-Chat Integration**: One-click "Send to Chat as Sticker/Image", "Set as My Profile Avatar", "Share as 24h Status", or "Download".

### 4. Status & Stories (WhatsApp Status)
- Post 24-hour disappearing photo, video, or rich text status updates.
- Background color selector for text statuses.
- Segmented timer progress bar (5s auto-advance), pause on hold, and previous/next navigation.
- Direct reply to status which seamlessly initiates a chat message with quoted context.
- View count and viewers list for own status updates.

### 5. Channels & Communities
- **Broadcast Channels**: Follow public and private channels with follower metrics and announcement feeds.
- **Communities**: Group multiple related channels (e.g. Design, Code, Announcements) under unified community hubs.

### 6. Security, Privacy & Moderation
- **Client-Side E2EE**: Native Web Crypto API (`window.crypto.subtle`) AES-GCM 256-bit encryption with PBKDF2/SHA-256 key derivation.
- **Safety Number Verification**: 60-digit security code and QR code scanner simulation.
- **Privacy Settings**: Read receipts toggle, disappearing message timers (Off, 24h, 7d, 90d), and blocked contacts management.
- **Admin Moderation Portal**: User abuse reports, spam logs, and one-click user suspension/blocking.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Web Audio API, Web Crypto API, WebRTC.
- **Backend**: Express middleware & WebSocket Server (`ws`) mounted via Vite dev server.
- **AI SDK**: `@google/genai` SDK using `gemini-3-pro-image-preview` and `gemini-nano-banana-2.1`.

---

## 💻 Getting Started

### Installation
```bash
npm install
```

### Environment Variables
Configure your `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="YOUR_API_KEY"
APP_URL="YOUR_APP_URL"
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Multi-Account Testing
Click the active user profile avatar at the top left of the sidebar or open **Account / Switch User** to switch instantly between **Alex Chen**, **Sarah Connor**, **Marcus Brody**, **David Kim**, and **Elena Rostova** to test real-time two-way messaging and calling in real time across tabs!
