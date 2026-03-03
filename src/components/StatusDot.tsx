export function StatusDot({ status, label }: { status: "live" | "pending" | "recovered" | "inactive"; label?: string }) {
  const colors: Record<string, string> = {
    live: "bg-status-success",
    pending: "bg-status-pending",
    recovered: "bg-status-warning",
    inactive: "bg-muted-foreground",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${colors[status]} ${status === "live" ? "live-indicator" : ""}`} />
      {label}
    </span>
  );
}
