'use client';

import dynamic from 'next/dynamic';
import { Layout, Spin } from 'antd';
import { useSearchParams } from 'next/navigation';

// Lazy load the chat components
const ChatWrapper = dynamic(() => import('./ChatWrapper'), {
  loading: () => (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="default" />
    </Layout>
  ),
  ssr: false
});

const ChatWrapperBubbles = dynamic(() => import('./ChatWrapperBubbles'), {
  loading: () => (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="default" />
    </Layout>
  ),
  ssr: false
});

export default function ChatPage() {
  const searchParams = useSearchParams();
  const useBubbles = searchParams.get('ui') === 'bubbles';
  
  return useBubbles ? <ChatWrapperBubbles /> : <ChatWrapper />;
}