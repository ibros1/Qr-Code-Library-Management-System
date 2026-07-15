import { useState } from "react";
import toast from "react-hot-toast";
import { QrCode, Printer } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import StatusBadge from "../../components/shared/StatusBadge";
import EmptyState from "../../components/shared/EmptyState";
import { useAppDispatch } from "../../store/hooks";
import { generateBookCopy } from "../../store/slices/booksSlice";
import type { Book } from "../../types";

const API_URL = import.meta.env.VITE_API_URL;

interface BookCopiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
}

function BookCopiesDialog({ open, onOpenChange, book }: BookCopiesDialogProps) {
  const dispatch = useAppDispatch();
  const [generating, setGenerating] = useState(false);

  if (!book) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await dispatch(generateBookCopy(book.id));
    setGenerating(false);

    if (generateBookCopy.fulfilled.match(result)) {
      toast.success("QR copy generated");
    } else {
      toast.error((result.payload as string) ?? "Failed to generate QR copy");
    }
  };

  const handlePrint = (qrCode: string) => {
    const qrImageUrl = `${API_URL}/qr_codes/${qrCode}.png`;
    
    // Clean up existing iframe if any
    const oldIframe = document.getElementById("print-iframe");
    if (oldIframe) {
      oldIframe.remove();
    }

    // Create a new hidden iframe
    const iframe = document.createElement("iframe");
    iframe.id = "print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      toast.error("Failed to initiate print document.");
      return;
    }

    doc.write(`
      <html>
        <head>
          <title>Print QR - ${book.title}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: white;
            }
            .container {
              text-align: center;
              border: 1px solid #ccc;
              border-radius: 8px;
              padding: 20px;
              max-width: 250px;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .author {
              font-size: 11px;
              color: #666;
              margin-bottom: 12px;
            }
            .qr-img {
              width: 180px;
              height: 180px;
              object-fit: contain;
            }
            .code {
              font-family: monospace;
              font-size: 11px;
              color: #666;
              margin-top: 8px;
            }
            @media print {
              body {
                min-height: auto;
              }
              .container {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">${book.title}</div>
            <div class="author">By ${book.author}</div>
            <img class="qr-img" src="${qrImageUrl}" />
            <div class="code">${qrCode}</div>
          </div>
          <script>
            const img = document.querySelector('.qr-img');
            if (img.complete) {
              window.focus();
              window.print();
            } else {
              img.onload = () => {
                window.focus();
                window.print();
              };
              img.onerror = () => {
                alert('Failed to load QR code image for printing.');
              };
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{book.title} — Copies</DialogTitle>
          <DialogDescription>Each copy has its own QR code used for borrow/return scanning.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleGenerate} disabled={generating}>
            <QrCode className="size-4" />
            {generating ? "Generating…" : "Generate New Copy"}
          </Button>
        </div>

        {book.copies.length === 0 ? (
          <EmptyState icon={QrCode} title="No copies yet" description="Generate the first QR copy for this book." />
        ) : (
          <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {book.copies.map((copy) => (
              <div key={copy.id} className="flex flex-col items-center gap-2 rounded-lg border border-border p-3">
                <img
                  src={`${API_URL}/qr_codes/${copy.qr_code}.png`}
                  alt={`QR code ${copy.qr_code}`}
                  className="size-24 rounded-md border border-border object-contain"
                />
                <span className="font-mono text-[11px] text-muted-foreground">{copy.qr_code}</span>
                <div className="flex items-center gap-1.5 w-full mt-1">
                  <div className="flex-1">
                    <StatusBadge status={copy.status} />
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7 shrink-0"
                    onClick={() => handlePrint(copy.qr_code)}
                    title="Print QR Code"
                  >
                    <Printer className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookCopiesDialog;
