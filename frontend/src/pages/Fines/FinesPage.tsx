import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Receipt } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import DataTable from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchFines, payFine } from "../../store/slices/finesSlice";

function FinesPage() {
  const dispatch = useAppDispatch();
  const { items: fines, loading } = useAppSelector((state) => state.fines);
  const { isAdmin } = useAuth();
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchFines());
  }, [dispatch]);

  const handlePay = async (id: number) => {
    setPayingId(id);
    const result = await dispatch(payFine(id));
    setPayingId(null);

    if (payFine.fulfilled.match(result)) {
      toast.success("Fine marked as paid");
    } else {
      toast.error((result.payload as string) ?? "Failed to mark fine as paid");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Fines</h1>
        <p className="text-sm text-muted-foreground">$0.50/day charged automatically for late returns</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            loading={loading}
            rows={fines}
            rowKey={(row) => row.id}
            emptyState={<EmptyState icon={Receipt} title="No fines" description="Late returns will appear here automatically." />}
            columns={[
              {
                header: "Member",
                cell: (row) => row.borrow_transaction?.user?.full_name ?? `#${row.borrow_transaction?.user_id ?? "—"}`,
              },
              {
                header: "QR Code",
                cell: (row) => <span className="font-mono text-xs">{row.borrow_transaction?.book_copy?.qr_code ?? "—"}</span>,
              },
              { header: "Amount", cell: (row) => `$${Number(row.amount).toFixed(2)}` },
              { header: "Status", cell: (row) => <StatusBadge status={row.paid ? "Paid" : "Unpaid"} /> },
              {
                header: "",
                className: "text-right",
                cell: (row) =>
                  isAdmin && !row.paid ? (
                    <Button size="sm" onClick={() => handlePay(row.id)} disabled={payingId === row.id}>
                      {payingId === row.id ? "Marking…" : "Mark as Paid"}
                    </Button>
                  ) : null,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default FinesPage;
