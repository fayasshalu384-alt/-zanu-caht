/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChatProvider } from './context/ChatContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { CallModal, IncomingCallModal } from './components/Modals/CallModal';
import { WaveStudioModal } from './components/Modals/WaveStudioModal';
import { NewChatModal } from './components/Modals/NewChatModal';
import { AuthModal } from './components/Modals/AuthModal';
import { AddMemberModal } from './components/Modals/AddMemberModal';
import { ChangePasswordModal } from './components/Modals/ChangePasswordModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { useChat } from './context/ChatContext';

function ChatWaveApp() {
  const { isAuthenticated } = useChat();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Chat Conversation View */}
      <ChatArea />

      {/* Global Overlays & Modals */}
      <CallModal />
      <IncomingCallModal />
      <WaveStudioModal />
      <NewChatModal />
      <AuthModal />
      <AddMemberModal />
      <ChangePasswordModal />
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <ChatWaveApp />
    </ChatProvider>
  );
}
