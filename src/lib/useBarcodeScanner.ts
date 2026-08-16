"use client";

import { useEffect, useRef } from "react";

/**
 * Listens for rapid keystroke bursts ending in Enter — the signature of a USB/Bluetooth
 * barcode scanner acting as a keyboard. Ignores normal typing (keystrokes with human-like
 * gaps) so it doesn't interfere with text inputs elsewhere on the page.
 */
export function useBarcodeScanner(onScan: (code: string) => void) {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (gap > 50) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        const code = bufferRef.current;
        bufferRef.current = "";
        if (code.length >= 3) {
          onScan(code);
        }
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan]);
}
