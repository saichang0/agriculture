"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

// Shared camera-reading logic behind both the in-app CameraScannerDialog modal
// and the standalone /scan/[sessionId] page a phone opens via QR code.
export function useCameraScanner(active: boolean, onScan: (code: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    // TRY_HARDER improves detection of real-world (angled, low-contrast) 1D barcodes
    // at the cost of scan speed — acceptable since this only runs while the dialog is open.
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.QR_CODE,
    ]);
    const reader = new BrowserMultiFormatReader(hints);
    setError(null);

    reader
      .decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // @ts-expect-error -- advanced focus constraints aren't in the lib.dom typings yet
            advanced: [{ focusMode: "continuous" }],
          },
        },
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
