import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#e5e7eb] bg-white p-5 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className="text-[13px] font-medium uppercase tracking-wider text-[#94a3b8]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </p>
          <p
            className="text-[28px] font-bold tracking-tight text-[#1e293b]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[13px] text-[#94a3b8]">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-[12px] font-medium",
                trend.positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f5f9]">
          {icon}
        </div>
      </div>
    </div>
  );
}
