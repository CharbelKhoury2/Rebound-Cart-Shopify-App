export function StatusDot({ status, label }: { status: "live" | "pending" | "recovered" | "inactive"; label?: string }) {
  const colors: Record<string, string> = {
    live: "bg-green",
    pending: "bg-gray", 
    recovered: "bg-yellow",
    inactive: "bg-gray",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray">
      <span className={`h-2 w-2 rounded-full ${colors[status]} ${status === "live" ? "live-indicator" : ""}`} />
      {label}
    </span>
  );
}
