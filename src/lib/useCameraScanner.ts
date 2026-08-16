"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

// Shared camera-reading logic behind both the in-app CameraScannerDialog modal
// and the standalone /scan/[sessionId] page a phone opens via QR code.
export function useCameraScanner(active: boolean, onScan: (code: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    setError(null);

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current!,
        (result) => {
          if (cancelled || !result) return;
          onScan(result.getText());
          // NotFoundException fires continuously while no code is in frame — expected, not an error.
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error && err.name === "NotAllowedError"
            ? "ກະລຸນາອະນຸຍາດການໃຊ້ກ້ອງເພື່ອສະແກນ"
            : "ບໍ່ສາມາດເປີດກ້ອງໄດ້"
        );
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onScan]);

  return { videoRef, error };
}
