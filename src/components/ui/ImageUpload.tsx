"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { Spinner } from "./Spinner";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "ຮູບໜ້າປົກ" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex w-48 flex-col gap-3">
      <span className="text-sm font-medium text-text-secondary">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-card border border-border bg-surface-muted transition-colors hover:border-primary disabled:cursor-not-allowed"
      >
        {uploading ? (
          <Spinner className="h-8 w-8 text-text-muted" />
        ) : value ? (
          <>
            <Image src={value} alt="ຮູບສິນຄ້າ" fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
              <span className="text-sm font-medium">ປ່ຽນຮູບ</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span className="text-xs">ເລືອກຮູບ</span>
          </div>
        )}
      </button>

      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-left text-sm text-danger hover:underline"
        >
          ລຶບຮູບ
        </button>
      )}

      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
