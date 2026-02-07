import { AuditEntry } from "@/types/expense";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Banknote, FileText } from "lucide-react";

const actionIcons: Record<string, React.ReactNode> = {
  Submitted: <FileText className="h-4 w-4 text-[#64748b]" />,
  Approved: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Rejected: <XCircle className="h-4 w-4 text-red-500" />,
  Paid: <Banknote className="h-4 w-4 text-indigo-500" />,
};

interface StatusTimelineProps {
  auditTrail: AuditEntry[];
  className?: string;
}

export default function StatusTimeline({ auditTrail, className }: StatusTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {auditTrail.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3">
          {/* Line */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e5e7eb] bg-white">
              {actionIcons[entry.action] || <Clock className="h-4 w-4 text-[#94a3b8]" />}
            </div>
            {idx < auditTrail.length - 1 && (
              <div className="h-8 w-px bg-[#e5e7eb]" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 pt-1">
            <p
              className="text-[13px] font-semibold text-[#1e293b]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {entry.action}
            </p>
            <p className="text-[12px] text-[#94a3b8]">
              by {entry.performedByName} •{" "}
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {format(parseISO(entry.timestamp), "MMM dd, yyyy HH:mm")}
              </span>
            </p>
            {entry.comment && (
              <p className="mt-1 rounded-md bg-[#f8fafc] px-2.5 py-1.5 text-[12px] italic text-[#64748b]">
                "{entry.comment}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
