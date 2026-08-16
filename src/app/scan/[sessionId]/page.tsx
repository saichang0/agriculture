"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useCameraScanner } from "@/lib/useCameraScanner";
import { SUBMIT_SCAN } from "@/lib/scan-session-queries";

export default function ScanSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [submitScan] = useMutation(SUBMIT_SCAN);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [lastCode, setLastCode] = useState<string | null>(null);

  const handleScan = useCallback(
    async (code: string) => {
      setLastCode(code);
      try {
        const { data } = await submitScan({ variables: { sessionId, code } });
        setStatus(data?.submitScan ? "sent" : "error");
      } catch {
        setStatus("error");
      }
      setTimeout(() => setStatus("idle"), 1500);
    },
    [sessionId, submitScan]
  );

  const { videoRef, error } = useCameraScanner(true, handleScan);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="px-5 pt-6 pb-3 text-center">
        <h1 className="text-lg font-semibold text-white">ສະແກນ barcode</h1>
        <p className="mt-1 text-sm text-white/70">ວາງລະຫັດສິນຄ້າໃຫ້ຢູ່ໃນກອບ ຄອມຈະຮັບຄ່າອັດຕະໂນມັດ</p>
      </div>

      <div className="relative mx-5 aspect-square overflow-hidden rounded-card bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        {!error && (
          <div className="pointer-events-none absolute inset-8 rounded-card border-2 border-white/70" />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-6 text-center">
        {status === "sent" && lastCode && (
          <div className="rounded-control bg-success-bg px-4 py-3 text-sm font-medium text-success">
            ສົ່ງລະຫັດ &ldquo;{lastCode}&rdquo; ໄປຫາຄອມແລ້ວ ✓
          </div>
        )}
        {status === "error" && (
          <div className="rounded-control bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
            ບໍ່ສາມາດສົ່ງໄດ້ — session ອາດໝົດອາຍຸ, ກະລຸນາສະແກນ QR ໃໝ່
          </div>
        )}
        {status === "idle" && <p className="text-sm text-white/50">ພ້ອມສະແກນ</p>}
      </div>
    </div>
  );
}
