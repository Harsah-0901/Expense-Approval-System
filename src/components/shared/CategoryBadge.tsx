import { ExpenseCategory } from "@/types/expense";
import { cn } from "@/lib/utils";
import { Plane, Utensils, Building2, Package } from "lucide-react";

const categoryConfig: Record<
  ExpenseCategory,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  Travel: {
    icon: <Plane className="h-3.5 w-3.5" />,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Food: {
    icon: <Utensils className="h-3.5 w-3.5" />,
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  Office: {
    icon: <Building2 className="h-3.5 w-3.5" />,
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  Other: {
    icon: <Package className="h-3.5 w-3.5" />,
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
};

interface CategoryBadgeProps {
  category: ExpenseCategory;
  className?: string;
}

export default function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium",
        config.bg,
        config.text,
        className
      )}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {config.icon}
      {category}
    </span>
  );
}
