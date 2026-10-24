import { Suspense } from 'react';
import type { Metadata } from 'next';
import ToolsPageClient from './ToolsPageClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Student List Generator | Tools | Division of Television Studies (UCR)',
  description:
    'Generate and export printable student lists for official examinations, attendance records, and faculty use. Features live document preview, custom column selections, and instant PDF download.',
};

export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06111F] flex items-center justify-center text-text-muted">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-ucr-orange" />
            <span className="text-sm">Loading Student List Generator...</span>
          </div>
        </div>
      }
    >
      <ToolsPageClient />
    </Suspense>
  );
}
