import { useState } from "react";
import { mockUsers } from "@/data/mockData";
import { TierBadge } from "@/components/TierBadge";
import type { PlatformUser, UserStatus, Tier } from "@/types";
import { toast } from "sonner";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";

export default function RepManagement() {
  const [users, setUsers] = useState<PlatformUser[]>(mockUsers.filter((u) => u.role === "SALES_REP"));

  const pendingUsers = users.filter((u) => u.status === "PENDING");
  const activeUsers = users.filter((u) => u.status === "ACTIVE");
  const inactiveUsers = users.filter((u) => u.status === "INACTIVE");

  const updateStatus = (id: string, status: UserStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    toast.success(`Rep ${status === "ACTIVE" ? "approved" : "deactivated"}`);
  };

  const updateTier = (id: string, tier: Tier) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, tier } : u)));
    toast.success("Tier updated");
  };

  const renderUserRow = (user: PlatformUser, showActions = false) => (
    <tr key={user.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
      <td className="px-5 py-3">
        <div>
          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </td>
      <td className="px-5 py-3"><TierBadge tier={user.tier} /></td>
      <td className="px-5 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          user.status === "ACTIVE" ? "bg-status-success/10 text-status-success" :
          user.status === "PENDING" ? "bg-status-pending/10 text-status-pending" :
          "bg-muted text-muted-foreground"
        }`}>{user.status}</span>
      </td>
      <td className="px-5 py-3 text-sm text-muted-foreground">{user.createdAt}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2 justify-end">
          {user.status === "PENDING" && (
            <>
              <button onClick={() => updateStatus(user.id, "ACTIVE")} className="p-1.5 rounded-md hover:bg-status-success/10 text-status-success transition-colors" title="Approve">
                <CheckCircle className="h-4 w-4" />
              </button>
              <button onClick={() => updateStatus(user.id, "INACTIVE")} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Reject">
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {user.status === "ACTIVE" && (
            <select
              value={user.tier}
              onChange={(e) => updateTier(user.id, e.target.value as Tier)}
              className="text-xs rounded border border-border bg-secondary px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="BRONZE">Bronze</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          )}
        </div>
      </td>
    </tr>
  );

  const renderTable = (title: string, usersList: PlatformUser[], icon: React.ReactNode) => (
    <div className="glass-card overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-foreground">{title} ({usersList.length})</h2>
      </div>
      {usersList.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rep</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tier</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
              <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>{usersList.map((u) => renderUserRow(u))}</tbody>
        </table>
      ) : (
        <p className="px-5 py-4 text-sm text-muted-foreground">No reps in this category</p>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rep Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve reps, manage tiers, and monitor the sales force</p>
      </div>

      {renderTable("Pending Approval", pendingUsers, <UserCheck className="h-4 w-4 text-status-pending" />)}
      {renderTable("Active Reps", activeUsers, <CheckCircle className="h-4 w-4 text-status-success" />)}
      {renderTable("Inactive Reps", inactiveUsers, <XCircle className="h-4 w-4 text-muted-foreground" />)}
    </div>
  );
}
