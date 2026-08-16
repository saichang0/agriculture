"use client";

import { useEffect, useState } from "react";
import { useMutation, useSubscription } from "@apollo/client/react";
import QRCode from "qrcode";
import { CREATE_SCAN_SESSION, SCAN_RECEIVED } from "@/lib/scan-session-queries";

interface RemoteScanButtonProps {
  onScan: (code: string) => void;
  className?: string;
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}

// Lets a cashier pair the tab they're working in with their phone's camera:
// creates a short-lived session, shows it as a QR code the phone scans to open
// /scan/[sessionId], then listens over a GraphQL subscription for the barcode
// the phone submits and hands it back to the caller.
export function RemoteScanButton({ onScan, className }: RemoteScanButtonProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [createScanSession, { loading: creating, error: createError }] = useMutation(CREATE_SCAN_SESSION);

  const { data: scanData } = useSubscription(SCAN_RECEIVED, {
    variables: { sessionId: sessionId ?? "" },
    skip: !sessionId,
  });

  useEffect(() => {
    if (scanData?.scanReceived) {
      onScan(scanData.scanReceived);
      setOpen(false);
      setSessionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanData]);

  async function handleOpen() {
    setOpen(true);
    const { data } = await createScanSession();
    const id = data?.createScanSession;
    if (!id) return;
    setSessionId(id);

    const scanUrl = `${window.location.origin}/scan/${id}`;
    const dataUrl = await QRCode.toDataURL(scanUrl, { width: 240, margin: 1 });
    setQrDataUrl(dataUrl);
  }

  function handleClose() {
    setOpen(false);
    setSessionId(null);
    setQrDataUrl(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          className ??
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-muted"
        }
        title="ສະແກນຈາກໂທລະສັບ"
      >
        <IconPhone />
      </button>

      {open && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-card border border-border bg-surface p-6 shadow-lg">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">ສະແກນຈາກໂທລະສັບ</h2>
              <button type="button" onClick={handleClose} className="text-text-muted hover:text-text-primary">
                ✕
              </button>
            </div>

            <p className="text-center text-sm text-text-secondary">
              ໃຊ້ກ້ອງໂທລະສັບສະແກນ QR ນີ້ ເພື່ອເປີດໜ້າສະແກນ barcode
            </p>

            <div className="flex h-60 w-60 items-center justify-center rounded-control bg-surface-muted">
              {creating || !qrDataUrl ? (
                <span className="text-sm text-text-secondary">ກຳລັງສ້າງ QR...</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR code ສະແກນ barcode" width={240} height={240} />
              )}
            </div>

            {createError && (
              <div className="w-full rounded-control bg-danger-bg px-3.5 py-2.5 text-center text-sm text-danger">
                {createError.message}
              </div>
            )}

            <p className="text-xs text-text-secondary">ກຳລັງລໍຖ້າຮັບຄ່າຈາກໂທລະສັບ...</p>
          </div>
        </div>
      )}
    </>
  );
}
