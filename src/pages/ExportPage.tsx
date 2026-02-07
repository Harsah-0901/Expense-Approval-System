import { useState, useMemo } from "react";
import { expenseStore, USERS } from "@/data/store";
import { ExpenseStatus, ExpenseCategory } from "@/types/expense";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { parseISO, isWithinInterval, format, subMonths } from "date-fns";

const EXPORT_FIELDS = [
  { key: "id", label: "Expense ID" },
  { key: "employeeName", label: "Employee Name" },
  { key: "department", label: "Department" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "date", label: "Expense Date" },
  { key: "submittedAt", label: "Submitted Date" },
  { key: "description", label: "Description" },
  { key: "managerName", label: "Manager" },
  { key: "approvedAt", label: "Approved Date" },
  { key: "rejectedAt", label: "Rejected Date" },
  { key: "paidAt", label: "Paid Date" },
  { key: "rejectionComment", label: "Rejection Comment" },
] as const;

export default function ExportPage() {
  const now = new Date();
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "ALL">("ALL");
  const [employeeFilter, setEmployeeFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState(format(subMonths(now, 3), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(now, "yyyy-MM-dd"));
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(["id", "employeeName", "category", "amount", "status", "date", "submittedAt"])
  );
  const [exported, setExported] = useState(false);

  const employees = useMemo(() => USERS.filter((u) => u.role === "employee"), []);
  const allExpenses = useMemo(() => expenseStore.getAll(), []);

  const filtered = useMemo(() => {
    let result = allExpenses;
    if (statusFilter !== "ALL") result = result.filter((e) => e.status === statusFilter);
    if (categoryFilter !== "ALL") result = result.filter((e) => e.category === categoryFilter);
    if (employeeFilter !== "ALL") result = result.filter((e) => e.employeeId === employeeFilter);
    if (dateFrom && dateTo) {
      result = result.filter((e) => {
        try {
          return isWithinInterval(parseISO(e.date), { start: parseISO(dateFrom), end: parseISO(dateTo) });
        } catch { return true; }
      });
    }
    return result;
  }, [allExpenses, statusFilter, categoryFilter, employeeFilter, dateFrom, dateTo]);

  const toggleField = (key: string) => {
    const next = new Set(selectedFields);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedFields(next);
  };

  const handleExport = () => {
    if (selectedFields.size === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    const fields = EXPORT_FIELDS.filter((f) => selectedFields.has(f.key));
    const header = fields.map((f) => f.label).join(",");
    const rows = filtered.map((exp) =>
      fields
        .map((f) => {
          const val = (exp as any)[f.key];
          if (val === undefined || val === null) return "";
          const str = String(val);
          // Escape CSV
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    toast.success(`Exported ${filtered.length} records`, {
      description: `${selectedFields.size} fields included`,
    });
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Export Data" description="Configure and download expense reports as CSV" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Filters */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Data Filters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-9 border-[#e5e7eb] text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Category</Label>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                  <SelectTrigger className="h-9 border-[#e5e7eb] text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Employee</Label>
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="h-9 border-[#e5e7eb] text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Employees</SelectItem>
                    {employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div />
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Date From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 border-[#e5e7eb] text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Date To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 border-[#e5e7eb] text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Export Fields
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FIELDS.map((field) => (
                <label
                  key={field.key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#e5e7eb] px-3 py-2.5 transition-colors hover:bg-[#fafaf9]"
                >
                  <Checkbox
                    checked={selectedFields.has(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <span className="text-[13px] font-medium text-[#334155]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Export summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Export Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748b]">Records</span>
                <span className="text-[15px] font-bold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {filtered.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748b]">Fields</span>
                <span className="text-[15px] font-bold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {selectedFields.size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748b]">Total Amount</span>
                <span className="text-[15px] font-bold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  ${filtered.reduce((s, e) => s + e.amount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={filtered.length === 0 || selectedFields.size === 0}
              className="mt-6 h-10 w-full bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {exported ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <FileDown className="mr-1.5 h-4 w-4" />
                  Download CSV
                </>
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <p className="text-[12px] leading-relaxed text-[#64748b]">
              <strong className="text-[#334155]">Note:</strong> Export respects your role permissions. 
              Only data you have access to will be included in the export file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
