import { ReactNode } from "react";

export function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}
