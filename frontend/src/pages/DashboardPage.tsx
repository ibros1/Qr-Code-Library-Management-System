import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, BookCheck, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import { dashboardApi, getApiErrorMessage } from "../services/api";
import type { DashboardStats } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import StatCard from "../components/shared/StatCard";
import StatusBadge from "../components/shared/StatusBadge";
import DataTable from "../components/shared/DataTable";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import EmptyState from "../components/shared/EmptyState";

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardApi
      .stats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((error) => toast.error(getApiErrorMessage(error, "Failed to load dashboard")))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const chartData = stats
    ? [
        { name: "Available", value: stats.available_copies },
        { name: "Borrowed", value: stats.borrowed_copies },
        { name: "Overdue", value: stats.overdue_count },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your library at a glance</p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Books" value={stats?.total_books ?? 0} icon={BookOpen} tone="slate" />
          <StatCard label="Available" value={stats?.available_copies ?? 0} icon={BookCheck} tone="emerald" />
          <StatCard label="Borrowed" value={stats?.borrowed_copies ?? 0} icon={Clock} tone="orange" />
          <StatCard label="Overdue" value={stats?.overdue_count ?? 0} icon={AlertTriangle} tone="red" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Copy Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-foreground">{stats?.available_copies ?? 0}</span> copies ready to
              borrow right now.
            </p>
            <p>
              <span className="font-medium text-foreground">{stats?.overdue_count ?? 0}</span> transactions are
              currently overdue and may incur a $0.50/day fine.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            loading={loading}
            rows={stats?.recent_activity ?? []}
            rowKey={(row) => row.id}
            emptyState={<EmptyState icon={Clock} title="No activity yet" description="Borrow and return records will show up here." />}
            columns={[
              { header: "Member", cell: (row) => row.user?.full_name ?? `#${row.user_id}` },
              { header: "QR Code", cell: (row) => <span className="font-mono text-xs">{row.book_copy?.qr_code ?? "—"}</span> },
              { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
              { header: "Borrowed", cell: (row) => new Date(row.borrow_date).toLocaleDateString() },
              { header: "Due", cell: (row) => new Date(row.due_date).toLocaleDateString() },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
