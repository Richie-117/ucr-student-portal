'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/lib/types';
import { Maximize2, X, Calendar } from 'lucide-react';

interface HomeGalleryLightboxProps {
  items: GalleryItem[];
}

export default function HomeGalleryLightbox({ items }: HomeGalleryLightboxProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-surface/30">
        <p className="text-text-muted text-sm">No gallery photos currently displayed on Home.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-surface/50 cursor-pointer transition-all duration-300 hover:border-ucr-orange/40 hover:shadow-card hover:-translate-y-1"
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 transition-opacity group-hover:opacity-95" />

            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <span className="text-xs font-semibold text-ucr-orange uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                Production Studio
              </span>
              <h4 className="text-white font-medium text-sm line-clamp-2 leading-snug group-hover:text-orange-200 transition-colors">
                {item.title}
              </h4>
              {item.eventDate && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-muted">
                  <Calendar className="w-3 h-3" />
                  <span>{item.eventDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#091728] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              aria-label="Close image modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative h-72 sm:h-96 md:h-[480px] w-full">
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                fill
                className="object-contain bg-black/40"
              />
            </div>
            <div className="p-5 border-t border-white/10 bg-surface">
              <h3 className="text-white font-bold text-base sm:text-lg">{selectedItem.title}</h3>
              {selectedItem.eventDate && (
                <p className="text-xs text-text-muted mt-1">Recorded: {selectedItem.eventDate}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
