import React from 'react';
import { useChat } from '../../context/ChatContext';
import { SidebarHeader } from './SidebarHeader';
import { ChatList } from './ChatList';
import { StatusList } from './StatusList';
import { ChannelsList } from './ChannelsList';
import { CommunitiesList } from './CommunitiesList';
import { CallsList } from './CallsList';
import { SettingsPanel } from './SettingsPanel';
import { AdminDashboard } from './AdminDashboard';

export const Sidebar: React.FC = () => {
  const { activeTab, activeChatId } = useChat();

  return (
    <aside
      className={`w-full md:w-96 lg:w-[420px] h-full flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}
    >
      <SidebarHeader />

      {activeTab === 'chats' && <ChatList />}
      {activeTab === 'status' && <StatusList />}
      {activeTab === 'channels' && <ChannelsList />}
      {activeTab === 'communities' && <CommunitiesList />}
      {activeTab === 'calls' && <CallsList />}
      {activeTab === 'settings' && <SettingsPanel />}
      {activeTab === 'admin' && <AdminDashboard />}
    </aside>
  );
};
