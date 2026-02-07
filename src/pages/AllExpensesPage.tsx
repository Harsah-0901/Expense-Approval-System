import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { expenseStore, USERS } from "@/data/store";
import { ExpenseStatus, ExpenseCategory } from "@/types/expense";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import CategoryBadge from "@/components/shared/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";

const PAGE_SIZE = 12;

export default function AllExpensesPage() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "ALL">("ALL");
  const [employeeFilter, setEmployeeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const allExpenses = useMemo(() => expenseStore.getAll(), []);
  const employees = useMemo(() => USERS.filter((u) => u.role === "employee"), []);

  const filtered = useMemo(() => {
    let result = allExpenses;
    if (statusFilter !== "ALL") result = result.filter((e) => e.status === statusFilter);
    if (categoryFilter !== "ALL") result = result.filter((e) => e.category === categoryFilter);
    if (employeeFilter !== "ALL") result = result.filter((e) => e.employeeId === employeeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.employeeName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    if (dateFrom || dateTo) {
      result = result.filter((e) => {
        const d = parseISO(e.date);
        if (dateFrom && dateTo) {
          try { return isWithinInterval(d, { start: parseISO(dateFrom), end: parseISO(dateTo) }); } catch { return true; }
        }
        if (dateFrom) return d >= parseISO(dateFrom);
        if (dateTo) return d <= parseISO(dateTo);
        return true;
      });
    }
    return result;
  }, [allExpenses, statusFilter, categoryFilter, employeeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="All Expenses" description={`System-wide view — ${filtered.length} records`} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Search ID, employee, description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 border-[#e5e7eb] bg-white pl-9 text-[13px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}>
          <SelectTrigger className="h-9 w-[130px] border-[#e5e7eb] bg-white text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as any); setPage(1); }}>
          <SelectTrigger className="h-9 w-[130px] border-[#e5e7eb] bg-white text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-[160px] border-[#e5e7eb] bg-white text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Employees</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="h-9 w-[140px] border-[#e5e7eb] bg-white text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
        <span className="text-[12px] text-[#94a3b8]">to</span>
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="h-9 w-[140px] border-[#e5e7eb] bg-white text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#f1f5f9] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">ID</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Employee</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Dept</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Category</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Amount</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Date</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((exp, idx) => (
              <TableRow
                key={exp.id}
                className={`cursor-pointer border-[#f1f5f9] transition-all hover:translate-y-[-1px] hover:shadow-sm ${idx % 2 === 1 ? "bg-[#fafaf9]" : ""}`}
                onClick={() => navigate(`/approvals/${exp.id}`)}
              >
                <TableCell className="text-[12px] font-medium text-[#334155]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exp.id}</TableCell>
                <TableCell className="text-[13px] font-medium text-[#334155]">{exp.employeeName}</TableCell>
                <TableCell className="text-[12px] text-[#64748b]">{exp.department}</TableCell>
                <TableCell><CategoryBadge category={exp.category} /></TableCell>
                <TableCell className="text-[13px] font-semibold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${exp.amount.toFixed(2)}</TableCell>
                <TableCell className="text-[12px] text-[#64748b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{format(parseISO(exp.date), "MMM dd, yyyy")}</TableCell>
                <TableCell><StatusBadge status={exp.status} /></TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-12 text-center text-[13px] text-[#94a3b8]">No expenses found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#f1f5f9] px-4 py-3">
            <p className="text-[12px] text-[#94a3b8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 border-[#e5e7eb]" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="icon"
                  className={`h-8 w-8 text-[12px] ${p === page ? "bg-[#1e293b]" : "border-[#e5e7eb]"}`}
                  onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8 border-[#e5e7eb]" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
