import { useEffect, useState } from "react";
import { Pencil, Plus, ShieldAlert, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import DataTable from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteMember, fetchMembers } from "../../store/slices/membersSlice";
import type { User } from "../../types";
import MemberFormDialog from "./MemberFormDialog";

function MembersPage() {
  const dispatch = useAppDispatch();
  const { items: members, loading } = useAppSelector((state) => state.members);
  const { isAdmin } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAdmin) dispatch(fetchMembers());
  }, [dispatch, isAdmin]);

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="You don't have access to member management."
      />
    );
  }

  const openCreate = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const openEdit = (member: User) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(deleteMember(deleteTarget.id));
    setDeleting(false);

    if (deleteMember.fulfilled.match(result)) {
      toast.success("Member deleted");
      setDeleteTarget(null);
    } else {
      toast.error((result.payload as string) ?? "Failed to delete member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">Manage library members and admins</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            loading={loading}
            rows={members}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Add your first member to start lending books."
                action={
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="size-4" />
                    Add Member
                  </Button>
                }
              />
            }
            columns={[
              { header: "Name", cell: (row) => <span className="font-medium text-foreground">{row.full_name}</span> },
              { header: "Email", cell: (row) => row.email },
              {
                header: "Role",
                cell: (row) => <Badge variant={row.role === "Admin" ? "dark" : "neutral"}>{row.role}</Badge>,
              },
              { header: "Joined", cell: (row) => new Date(row.created_at).toLocaleDateString() },
              {
                header: "",
                className: "text-right",
                cell: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit member">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)} title="Delete member">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <MemberFormDialog open={formOpen} onOpenChange={setFormOpen} member={editingMember} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.full_name}"?`}
        description="This cannot be undone. Members with borrow history cannot be deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default MembersPage;
