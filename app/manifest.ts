import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpreadAPI',
    short_name: 'SpreadAPI',
    description: 'Spreadsheet = code.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#502D80',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['productivity', 'business'],
  };
}