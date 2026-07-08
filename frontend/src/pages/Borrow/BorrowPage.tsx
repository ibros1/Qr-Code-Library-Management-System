import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDownToLine, ArrowUpFromLine, QrCode } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import DataTable from "../../components/shared/DataTable";
import type { DataTableColumn } from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import StatusBadge from "../../components/shared/StatusBadge";
import QRScannerDialog from "../../components/shared/QRScannerDialog";
import MemberCombobox from "../../components/shared/MemberCombobox";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { checkoutBook, fetchTransactions, returnBook } from "../../store/slices/borrowSlice";
import { fetchMembers } from "../../store/slices/membersSlice";
import type { BorrowTransaction } from "../../types";

type ScanMode = "borrow" | "return" | null;

function extractQrCode(decodedText: string): string {
  try {
    const parsed = JSON.parse(decodedText);
    if (parsed && typeof parsed.qr_code === "string") return parsed.qr_code;
  } catch {
    // not JSON — fall through and use the raw scanned text
  }
  return decodedText;
}

function BorrowPage() {
  const dispatch = useAppDispatch();
  const { isAdmin, user } = useAuth();
  const { items: transactions, loading } = useAppSelector((state) => state.borrow);
  const { items: members } = useAppSelector((state) => state.members);

  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
    if (isAdmin) dispatch(fetchMembers());
  }, [dispatch, isAdmin]);

  const visibleTransactions = useMemo(
    () => (isAdmin ? transactions : transactions.filter((t) => t.user_id === user?.id)),
    [transactions, isAdmin, user],
  );

  const columns = useMemo<DataTableColumn<BorrowTransaction>[]>(() => {
    const cols: DataTableColumn<BorrowTransaction>[] = [];
    if (isAdmin) {
      cols.push({ header: "Member", cell: (row) => row.user?.full_name ?? `#${row.user_id}` });
    }
    cols.push(
      { header: "QR Code", cell: (row) => <span className="font-mono text-xs">{row.book_copy?.qr_code ?? "—"}</span> },
      { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
      { header: "Borrowed", cell: (row) => new Date(row.borrow_date).toLocaleDateString() },
      { header: "Due", cell: (row) => new Date(row.due_date).toLocaleDateString() },
      { header: "Returned", cell: (row) => (row.return_date ? new Date(row.return_date).toLocaleDateString() : "—") },
    );
    return cols;
  }, [isAdmin]);

  const handleScan = async (decodedText: string) => {
    const qrCode = extractQrCode(decodedText);
    setScanMode(null);
    setProcessing(true);

    if (scanMode === "borrow") {
      const result = await dispatch(
        checkoutBook({ qrCode, userId: isAdmin ? Number(selectedMemberId) : undefined }),
      );
      if (checkoutBook.fulfilled.match(result)) {
        toast.success("Book checked out");
      } else {
        toast.error((result.payload as string) ?? "Checkout failed");
      }
    } else if (scanMode === "return") {
      const result = await dispatch(returnBook(qrCode));
      if (returnBook.fulfilled.match(result)) {
        toast.success("Book returned");
      } else {
        toast.error((result.payload as string) ?? "Return failed");
      }
    }

    setProcessing(false);
  };

  const canScanBorrow = isAdmin ? Boolean(selectedMemberId) : true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Borrow / Return</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Scan a book copy's QR code to check it out or return it"
            : "Scan a book copy's QR code to borrow or return it yourself"}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          {isAdmin && (
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Member</label>
              <MemberCombobox members={members} value={selectedMemberId} onChange={setSelectedMemberId} />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" disabled={!canScanBorrow || processing} onClick={() => setScanMode("borrow")}>
              <ArrowUpFromLine className="size-4" />
              Scan to Borrow
            </Button>
            <Button variant="default" disabled={processing} onClick={() => setScanMode("return")}>
              <ArrowDownToLine className="size-4" />
              Scan to Return
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            loading={loading}
            rows={visibleTransactions}
            rowKey={(row) => row.id}
            emptyState={<EmptyState icon={QrCode} title="No borrow records yet" description="Scan a QR code to check out a book." />}
            columns={columns}
          />
        </CardContent>
      </Card>

      <QRScannerDialog
        open={scanMode !== null}
        onOpenChange={(open) => !open && setScanMode(null)}
        onScan={handleScan}
        title={scanMode === "borrow" ? "Scan to Borrow" : "Scan to Return"}
        description={
          scanMode === "borrow"
            ? "Scan the book copy's QR code to check it out."
            : "Scan the book copy's QR code to return it."
        }
      />
    </div>
  );
}

export default BorrowPage;
