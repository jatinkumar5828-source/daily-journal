import React, { useRef, useState } from 'react';
import { PhotoAttachment } from '../types/journal';
import { ImagePlus, X, Maximize2, Trash2 } from 'lucide-react';

interface PhotoGalleryProps {
  photos: PhotoAttachment[];
  onAddPhotos: (newPhotos: PhotoAttachment[]) => void;
  onRemovePhoto: (id: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  onAddPhotos,
  onRemovePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: PhotoAttachment[] = [];
    const promises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const dataUrl = uploadEvent.target?.result as string;
          if (dataUrl) {
            newAttachments.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              date: '',
              dataUrl,
              createdAt: Date.now(),
            });
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
      promises.push(p);
    }

    Promise.all(promises).then(() => {
      if (newAttachments.length > 0) {
        onAddPhotos(newAttachments);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="mt-6 pt-5 border-t border-stone-200/70 dark:border-stone-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Day Photos ({photos.length})
          </span>
          <span className="text-2xs text-stone-400">
            Stored locally on your device
          </span>
        </div>

        {/* Add photo button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-200 transition-colors"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>Add Photos</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 dark:border-stone-800/80 rounded-2xl p-6 text-center hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-colors cursor-pointer group"
        >
          <ImagePlus className="w-7 h-7 mx-auto text-stone-400 group-hover:text-amber-500 transition-colors mb-2" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            No photos attached yet. Click to capture or attach photos from your day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-800/80 shadow-2xs"
            >
              <img
                src={photo.dataUrl}
                alt="Journal memory"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  title="View larger"
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-900 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Remove photo"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.dataUrl}
              alt="Full size journal memory"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
