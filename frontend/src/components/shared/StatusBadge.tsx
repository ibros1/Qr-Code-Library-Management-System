import { Badge } from "../ui/badge";
import type { CopyStatus, TransactionStatus } from "../../types";

type Status = CopyStatus | TransactionStatus | "Paid" | "Unpaid";

const statusVariant: Record<Status, "success" | "warning" | "danger" | "neutral"> = {
  Available: "success",
  Borrowed: "warning",
  Returned: "success",
  Overdue: "danger",
  Paid: "success",
  Unpaid: "danger",
};

function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={statusVariant[status] ?? "neutral"}>{status}</Badge>;
}

export default StatusBadge;
