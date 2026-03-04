import { useState, useMemo, useEffect } from "react";
import { apiService } from "@/services/api";
import { TierBadge } from "@/components/TierBadge";
import { PerformanceTracker, PerformanceLeaderboard } from "@/components/admin/PerformanceTracker";
import { TrainingResources, TrainingSummary } from "@/components/admin/TrainingResources";
import type { PlatformUser, UserStatus, Tier } from "@/types";
import { toast } from "sonner";
import { CheckCircle, XCircle, UserCheck, Search, Filter, TrendingUp, Award, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RepManagement() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [tierFilter, setTierFilter] = useState<Tier | "ALL">("ALL");
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [completedTrainingModules, setCompletedTrainingModules] = useState<Record<string, string[]>>({});

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getUsers("SALES_REP");
      setUsers(data);
    } catch (error) {
      console.error("Failed to load reps:", error);
      toast.error("Failed to load sales reps");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Generate mock performance metrics for reps
  const generatePerformanceMetrics = (user: PlatformUser) => {
    return {
      totalRecoveries: Math.floor(Math.random() * 50) + 10,
      recoveryRate: Math.random() * 20 + 15, // 15-35%
      averageResponseTime: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
      totalRevenue: Math.floor(Math.random() * 15000) + 3000, // $3k-$18k
      customerSatisfaction: Math.random() * 15 + 80, // 80-95%
      weeklyProgress: Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)),
      monthlyTarget: 10000,
      rank: Math.floor(Math.random() * 10) + 1,
      totalReps: users.length
    };
  };

  const handleModuleComplete = (repId: string, moduleId: string) => {
    setCompletedTrainingModules(prev => ({
      ...prev,
      [repId]: [...(prev[repId] || []), moduleId]
    }));
    toast.success("Training module marked as complete");
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = searchTerm === "" ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      const matchesTier = tierFilter === "ALL" || user.tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [users, searchTerm, statusFilter, tierFilter]);

  const pendingUsers = filteredUsers.filter((u) => u.status === "PENDING");
  const activeUsers = filteredUsers.filter((u) => u.status === "ACTIVE");
  const inactiveUsers = filteredUsers.filter((u) => u.status === "INACTIVE");

  const updateStatus = async (id: string, status: UserStatus) => {
    try {
      if (status === "ACTIVE") {
        await apiService.approveUser(id);
      } else if (status === "INACTIVE") {
        await apiService.rejectUser(id);
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      toast.success(`Rep ${status === "ACTIVE" ? "approved" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update rep status");
    }
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
      <td className="px-5 py-3"><TierBadge tier={user.tier as any} /></td>
      <td className="px-5 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.status === "ACTIVE" ? "bg-status-success/10 text-status-success" :
          user.status === "PENDING" ? "bg-status-pending/10 text-status-pending" :
            "bg-muted text-muted-foreground"
          }`}>{user.status}</span>
      </td>
      <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
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

      {/* Search and Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reps by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | "ALL")}
              className="px-3 py-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as Tier | "ALL")}
              className="px-3 py-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="ALL">All Tiers</option>
              <option value="BRONZE">Bronze</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>
        </div>
        {(searchTerm || statusFilter !== "ALL" || tierFilter !== "ALL") && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>Showing {filteredUsers.length} of {users.length} reps</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setTierFilter("ALL");
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {renderTable("Pending Approval", pendingUsers, <UserCheck className="h-4 w-4 text-status-pending" />)}
      {renderTable("Active Reps", activeUsers, <CheckCircle className="h-4 w-4 text-status-success" />)}
      {renderTable("Inactive Reps", inactiveUsers, <XCircle className="h-4 w-4 text-muted-foreground" />)}
    </div>
  );
}
