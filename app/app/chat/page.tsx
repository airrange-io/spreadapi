'use client';

import dynamic from 'next/dynamic';
import { Layout, Spin } from 'antd';

// Lazy load the chat component
const ChatWrapperBubbles = dynamic(() => import('./ChatWrapperBubbles'), {
  loading: () => (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="default" />
    </Layout>
  ),
  ssr: false
});

export default function ChatPage() {
  return <ChatWrapperBubbles />;
}