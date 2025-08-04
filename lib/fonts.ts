import localFont from 'next/font/local';

// Optimize Satoshi font loading
export const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/Satoshi-Variable.woff2',
      weight: '300 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-VariableItalic.woff2',
      weight: '300 900',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-satoshi',
  preload: true,
});