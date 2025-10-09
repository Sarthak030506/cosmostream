import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CosmoStream - Space & Astronomy Video Platform',
  description:
    'Stream high-quality space, astronomy, and astrophysics content. Interactive sky maps, live mission tracking, and educational tools.',
  keywords: [
    'space',
    'astronomy',
    'astrophysics',
    'video streaming',
    'sky map',
    'NASA',
    'education',
  ],
  authors: [{ name: 'CosmoStream' }],
  openGraph: {
    title: 'CosmoStream',
    description: 'Your gateway to the cosmos',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-gray-950 text-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
