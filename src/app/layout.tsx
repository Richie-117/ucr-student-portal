import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Division of Television Studies | University College of Rathmalana (UCR)',
  description:
    'Official student portal for the Division of Television Studies at University College of Rathmalana (UCR), powered by University of Vocational Technology (UoVT). Offering TPOPT and TPRPT Higher National Diploma pathways.',
  keywords: [
    'University College of Rathmalana',
    'UCR',
    'UoVT',
    'Television Studies',
    'TPOPT',
    'TPRPT',
    'Digital Media',
    'Television Production',
    'Post Production',
    'Student Portal',
  ],
  authors: [{ name: 'Division of Television Studies, UCR' }],
  icons: {
    icon: '/images/ucr.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} bg-[#06111F] text-[#F8FAFC] min-h-screen flex flex-col antialiased selection:bg-ucr-orange selection:text-white`}>
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
