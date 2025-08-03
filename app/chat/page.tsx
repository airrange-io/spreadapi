'use client';

import dynamic from 'next/dynamic';
import { Layout, Spin } from 'antd';

// Lazy load the entire chat component and its dependencies
const ChatWrapper = dynamic(() => import('./ChatWrapper'), {
  loading: () => (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </Layout>
  ),
  ssr: false // Disable SSR for chat functionality
});

export default function ChatPage() {
  return <ChatWrapper />;
}