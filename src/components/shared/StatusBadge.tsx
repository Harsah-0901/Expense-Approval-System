import { ExpenseStatus } from "@/types/expense";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ExpenseStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
  PAID: {
    label: "Paid",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-300",
  },
};

interface StatusBadgeProps {
  status: ExpenseStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        config.bg,
        config.text,
        config.border,
        className
      )}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {config.label}
    </span>
  );
}
