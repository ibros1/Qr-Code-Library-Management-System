import { useState } from "react";
import toast from "react-hot-toast";
import { QrCode } from "lucide-react";

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
                <StatusBadge status={copy.status} />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookCopiesDialog;
