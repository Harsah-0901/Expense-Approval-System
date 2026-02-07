import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { expenseStore, isValidTransition } from "@/data/store";
import { ExpenseStatus } from "@/types/expense";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import CategoryBadge from "@/components/shared/CategoryBadge";
import StatusTimeline from "@/components/shared/StatusTimeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export default function ApprovalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const expense = useMemo(() => {
    if (!id) return undefined;
    return expenseStore.getById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshKey]);

  if (!expense || !user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-[15px] text-[#64748b]">Expense not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="border-[#e5e7eb] text-[13px]">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const canApprove = expense.status === "PENDING" && isValidTransition("PENDING", "APPROVED");
  const canReject = expense.status === "PENDING" && isValidTransition("PENDING", "REJECTED");
  const canMarkPaid = expense.status === "APPROVED" && isValidTransition("APPROVED", "PAID") && user.role === "admin";

  const handleApprove = () => {
    const now = new Date().toISOString();
    const newAudit = {
      id: `aud-${expense.id}-${expense.auditTrail.length + 1}`,
      expenseId: expense.id,
      action: "Approved",
      fromStatus: "PENDING" as ExpenseStatus,
      toStatus: "APPROVED" as ExpenseStatus,
      performedBy: user.id,
      performedByName: user.name,
      comment: approveComment || undefined,
      timestamp: now,
    };

    expenseStore.update(expense.id, {
      status: "APPROVED",
      approvedAt: now,
      approvalComment: approveComment || undefined,
      auditTrail: [...expense.auditTrail, newAudit],
    });

    setApproveDialogOpen(false);
    setRefreshKey((k) => k + 1);
    toast.success("Expense approved!", {
      description: `${expense.id} — $${expense.amount.toFixed(2)}`,
    });
  };

  const handleReject = () => {
    if (!rejectComment.trim()) {
      setRejectError("Rejection comment is required");
      return;
    }

    const now = new Date().toISOString();
    const newAudit = {
      id: `aud-${expense.id}-${expense.auditTrail.length + 1}`,
      expenseId: expense.id,
      action: "Rejected",
      fromStatus: "PENDING" as ExpenseStatus,
      toStatus: "REJECTED" as ExpenseStatus,
      performedBy: user.id,
      performedByName: user.name,
      comment: rejectComment.trim(),
      timestamp: now,
    };

    expenseStore.update(expense.id, {
      status: "REJECTED",
      rejectedAt: now,
      rejectionComment: rejectComment.trim(),
      auditTrail: [...expense.auditTrail, newAudit],
    });

    setRejectDialogOpen(false);
    setRefreshKey((k) => k + 1);
    toast.error("Expense rejected", {
      description: `${expense.id} — $${expense.amount.toFixed(2)}`,
    });
  };

  const handleMarkPaid = () => {
    const now = new Date().toISOString();
    const newAudit = {
      id: `aud-${expense.id}-${expense.auditTrail.length + 1}`,
      expenseId: expense.id,
      action: "Paid",
      fromStatus: "APPROVED" as ExpenseStatus,
      toStatus: "PAID" as ExpenseStatus,
      performedBy: user.id,
      performedByName: user.name,
      timestamp: now,
    };

    expenseStore.update(expense.id, {
      status: "PAID",
      paidAt: now,
      auditTrail: [...expense.auditTrail, newAudit],
    });

    setRefreshKey((k) => k + 1);
    toast.success("Expense marked as paid!", {
      description: `${expense.id} — $${expense.amount.toFixed(2)}`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Review ${expense.id}`} description={expense.description}>
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
        {/* Main detail */}
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
                <p className="flex items-center gap-1.5 text-[14px] text-[#334155]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <Calendar className="h-3.5 w-3.5 text-[#94a3b8]" />
                  {format(parseISO(expense.date), "MMMM dd, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Employee</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f5f9]">
                    <User className="h-3 w-3 text-[#64748b]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#334155]">{expense.employeeName}</span>
                </div>
              </div>
            </div>

            <Separator className="my-5 bg-[#f1f5f9]" />

            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Description</p>
              <p className="text-[14px] leading-relaxed text-[#334155]">{expense.description}</p>
            </div>

            {expense.receiptName && (
              <>
                <Separator className="my-5 bg-[#f1f5f9]" />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Receipt</p>
                  <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2">
                    <FileText className="h-4 w-4 text-[#64748b]" />
                    <span className="text-[13px] text-[#334155]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
                  <p className="text-[11px] font-medium uppercase tracking-wider text-red-400">Rejection Reason</p>
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <p className="text-[13px] text-red-700">{expense.rejectionComment}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          {(canApprove || canReject || canMarkPaid) && (
            <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-5">
              <h3
                className="mr-auto text-[15px] font-semibold text-[#1e293b]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Actions
              </h3>

              {canApprove && (
                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-emerald-600 text-[13px] font-semibold hover:bg-emerald-700"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Approve Expense
                      </DialogTitle>
                      <DialogDescription>
                        Approve {expense.id} for ${expense.amount.toFixed(2)} submitted by{" "}
                        {expense.employeeName}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label className="text-[13px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Comment (optional)
                      </Label>
                      <Textarea
                        value={approveComment}
                        onChange={(e) => setApproveComment(e.target.value)}
                        placeholder="Add an optional comment..."
                        className="border-[#e5e7eb] text-[14px]"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setApproveDialogOpen(false)}
                        className="border-[#e5e7eb] text-[13px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApprove}
                        className="bg-emerald-600 text-[13px] font-semibold hover:bg-emerald-700"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Confirm Approval
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {canReject && (
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="text-[13px] font-semibold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Reject Expense
                      </DialogTitle>
                      <DialogDescription>
                        Reject {expense.id} for ${expense.amount.toFixed(2)} submitted by{" "}
                        {expense.employeeName}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label className="text-[13px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Rejection Reason <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={rejectComment}
                        onChange={(e) => {
                          setRejectComment(e.target.value);
                          setRejectError("");
                        }}
                        placeholder="Provide a reason for rejection..."
                        className={`border-[#e5e7eb] text-[14px] ${rejectError ? "border-red-400" : ""}`}
                      />
                      {rejectError && (
                        <p className="flex items-center gap-1 text-[12px] text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {rejectError}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setRejectDialogOpen(false)}
                        className="border-[#e5e7eb] text-[13px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        className="text-[13px] font-semibold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Confirm Rejection
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {canMarkPaid && (
                <Button
                  onClick={handleMarkPaid}
                  className="bg-indigo-600 text-[13px] font-semibold hover:bg-indigo-700"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Banknote className="mr-1.5 h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3
            className="mb-4 text-[15px] font-semibold text-[#1e293b]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Audit Trail
          </h3>
          <StatusTimeline auditTrail={expense.auditTrail} />
        </div>
      </div>
    </div>
  );
}
