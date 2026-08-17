"use client";

import Image from "next/image";

interface ImagePreviewDialogProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export function ImagePreviewDialog({ src, alt = "", onClose }: ImagePreviewDialogProps) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="ປິດ"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
      >
        ✕
      </button>
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={800}
          className="max-h-[85vh] w-auto rounded-card object-contain"
        />
      </div>
    </div>
  );
}
