import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraOff } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

const SCANNER_ELEMENT_ID = "qr-scanner-region";

// html5-qrcode's stop() throws synchronously (not a rejected promise) when the
// camera stream hasn't finished starting yet — a common race when a dialog is
// closed quickly. Swallow that so it never escapes as an uncaught render error.
function safeStop(scanner: Html5Qrcode): Promise<void> {
  try {
    return scanner.stop().catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (decodedText: string) => void;
  title?: string;
  description?: string;
}

function QRScannerDialog({
  open,
  onOpenChange,
  onScan,
  title = "Scan QR Code",
  description = "Point the camera at a book copy's QR code.",
}: QRScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let rafId = 0;
    // Synchronizing local error UI with the imperative camera lifecycle below —
    // there's no external-system event to key this off of besides the effect itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);

    // The dialog's DOM node (Radix portal) may not have committed yet on the
    // frame this effect runs, so poll a couple of frames instead of grabbing
    // the element synchronously — Html5Qrcode throws immediately if it's missing.
    const startScanning = () => {
      if (cancelled) return;

      if (!document.getElementById(SCANNER_ELEMENT_ID)) {
        rafId = requestAnimationFrame(startScanning);
        return;
      }

      let scanner: Html5Qrcode;
      try {
        scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      } catch {
        setError("Could not initialize the camera scanner.");
        return;
      }
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return;
            cancelled = true;
            safeStop(scanner).finally(() => onScanRef.current(decodedText));
          },
          () => undefined,
        )
        .catch(() => {
          if (!cancelled) setError("Could not access the camera. Check permissions and try again.");
        });
    };

    rafId = requestAnimationFrame(startScanning);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        safeStop(scanner).finally(() => {
          try {
            scanner.clear();
          } catch {
            // no-op — element may already be gone
          }
        });
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            <CameraOff className="size-6 text-muted-foreground" />
            {error}
          </div>
        ) : (
          <div id={SCANNER_ELEMENT_ID} className="mx-auto w-full overflow-hidden rounded-lg" />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default QRScannerDialog;
