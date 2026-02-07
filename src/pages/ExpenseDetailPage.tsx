import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { expenseStore } from "@/data/store";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import CategoryBadge from "@/components/shared/CategoryBadge";
import StatusTimeline from "@/components/shared/StatusTimeline";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Calendar, FileText, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const expense = useMemo(() => {
    if (!id) return undefined;
    return expenseStore.getById(id);
  }, [id]);

  if (!expense) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-[15px] text-[#64748b]">Expense not found</p>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-[#e5e7eb] text-[13px]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={expense.id}
        description={expense.description}
      >
        <StatusBadge status={expense.status} />
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-[#e5e7eb] text-[13px]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <h3
              className="mb-4 text-[15px] font-semibold text-[#1e293b]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Expense Details
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Amount</p>
                <p
                  className="text-[24px] font-bold text-[#1e293b]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ${expense.amount.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Category</p>
                <CategoryBadge category={expense.category} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Expense Date</p>
                <p
                  className="flex items-center gap-1.5 text-[14px] text-[#334155]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Calendar className="h-3.5 w-3.5 text-[#94a3b8]" />
                  {format(parseISO(expense.date), "MMMM dd, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Submitted</p>
                <p
                  className="text-[14px] text-[#334155]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {format(parseISO(expense.submittedAt), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            </div>

            <Separator className="my-5 bg-[#f1f5f9]" />

            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Description</p>
              <p className="text-[14px] leading-relaxed text-[#334155]">
                {expense.description}
              </p>
            </div>

            {expense.receiptName && (
              <>
                <Separator className="my-5 bg-[#f1f5f9]" />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Receipt</p>
                  <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2">
                    <FileText className="h-4 w-4 text-[#64748b]" />
                    <span
                      className="text-[13px] text-[#334155]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {expense.receiptName}
                    </span>
                  </div>
                </div>
              </>
            )}

            {expense.rejectionComment && (
              <>
                <Separator className="my-5 bg-[#f1f5f9]" />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-red-400">
                    Rejection Reason
                  </p>
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <p className="text-[13px] text-red-700">
                      {expense.rejectionComment}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Employee & Manager info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                Submitted By
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9]">
                  <User className="h-4 w-4 text-[#64748b]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1e293b]">{expense.employeeName}</p>
                  <p className="text-[11px] text-[#94a3b8]">{expense.department}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                Assigned Manager
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9]">
                  <User className="h-4 w-4 text-[#64748b]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1e293b]">
                    {expense.managerName || "Unassigned"}
                  </p>
                  <p className="text-[11px] text-[#94a3b8]">Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail sidebar */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3
            className="mb-4 text-[15px] font-semibold text-[#1e293b]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Status Timeline
          </h3>
          <StatusTimeline auditTrail={expense.auditTrail} />
        </div>
      </div>
    </div>
  );
}
