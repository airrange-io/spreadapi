import React from 'react';
import Footer from '@/components/product/Footer';
import '../product/product.css';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="blog-layout">
        {children}
      </main>
      <Footer />
    </>
  );
}