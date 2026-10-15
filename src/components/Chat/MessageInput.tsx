import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Message, MessageType } from '../../types/chat';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Sparkles,
  Image as ImageIcon,
  FileText,
  UserCheck,
  Camera,
  Trash2,
  Square,
  Check,
} from 'lucide-react';

interface MessageInputProps {
  replyingTo: Message | null;
  onClearReply: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ replyingTo, onClearReply }) => {
  const {
    activeChat,
    sendMessage,
    broadcastTyping,
    setStudioModalOpen,
  } = useChat();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Emoji list
  const emojiCategories = [
    '😀', '😂', '😍', '😎', '🥳', '🔥', '✨', '🚀', '💯', '👍',
    '❤️', '👏', '🎉', '☕', '💡', '🌟', '🎧', '⚡', '💻', '🎨'
  ];

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    broadcastTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      broadcastTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    const msgText = text.trim();
    setText('');
    broadcastTyping(false);

    const replyMeta = replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.senderName || 'Contact',
      text: replyingTo.text,
      type: replyingTo.type,
    } : undefined;

    onClearReply();
    await sendMessage(msgText, 'text', undefined, undefined, replyMeta);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Start real or synthetic audio recording for voice note
  const startRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    recordTimerRef.current = window.setInterval(() => {
      setRecordingSeconds(sec => sec + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.start();
      }
    } catch {
      console.warn('Real microphone unavailable, will use synthetic audio note.');
    }
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const finishAndSendRecording = async () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    const duration = recordingSeconds;
    setIsRecording(false);
    setRecordingSeconds(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        await sendMessage('Voice message', 'voice_note', audioUrl, { duration });
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback audio URL
      await sendMessage('Voice message', 'voice_note', 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg', { duration: duration || 3 });
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      await sendMessage(
        file.name,
        type,
        result,
        { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }
      );
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800 relative z-20 shrink-0">
      {/* Replying To Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between p-2.5 mb-2 bg-slate-800/80 border-l-4 border-emerald-500 rounded-xl text-xs">
          <div className="truncate">
            <span className="font-semibold text-emerald-400 block text-[11px]">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-slate-300 truncate block text-[11px]">
              {replyingTo.text}
            </span>
          </div>
          <button onClick={onClearReply} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-30 w-72 animate-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
            <span>Emojis & Stickers</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xl text-center max-h-52 overflow-y-auto p-1">
            {emojiCategories.map(em => (
              <button
                type="button"
                key={em}
                onClick={() => {
                  setText(prev => prev + em);
                  // Do not close/exit the emoji page on click as requested
                }}
                className="hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-slate-800 active:scale-95 cursor-pointer"
                title="Add emoji"
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Options Popup */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-30 w-52 space-y-1 animate-in zoom-in-95 duration-100 text-xs text-slate-200">
          {/* Wave Studio AI Image Generator */}
          <button
            onClick={() => {
              setShowAttachMenu(false);
              setStudioModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800 text-emerald-400 font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Wave Studio AI Art
          </button>

          {/* Photo & Video */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" /> Photos & Videos
          </button>

          {/* Document */}
          <button
            onClick={() => docInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-blue-400" /> Document / PDF
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={(e) => handleFileUpload(e, 'image')}
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileUpload(e, 'document')}
        className="hidden"
      />

      {/* Input Bar or Recording Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-slate-950 border border-rose-500/40 rounded-full px-4 py-2.5 animate-pulse">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Recording Voice Note... {recordingSeconds}s</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={finishAndSendRecording}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-transform active:scale-95"
              title="Send Voice Note"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="Emoji & Stickers"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment button */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="Attach media or Wave Studio AI"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Send or Voice Note Button */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-transform active:scale-95"
              title="Hold to Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
