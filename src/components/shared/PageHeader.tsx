import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-start justify-between", className)}>
      <div>
        <h1
          className="text-[32px] font-bold tracking-tight text-[#1e293b]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[15px] text-[#64748b]">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
