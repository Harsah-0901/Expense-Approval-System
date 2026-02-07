import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { expenseStore } from "@/data/store";
import { ExpenseStatus, ExpenseCategory, Expense } from "@/types/expense";
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
import { PlusCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";

const PAGE_SIZE = 10;

export default function ExpenseListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<"date" | "amount" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allExpenses = useMemo(() => {
    if (!user) return [];
    return expenseStore.getByEmployee(user.id);
  }, [user]);

  const filtered = useMemo(() => {
    let result = allExpenses;

    if (statusFilter !== "ALL") {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (categoryFilter !== "ALL") {
      result = result.filter((e) => e.category === categoryFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    if (dateFrom || dateTo) {
      result = result.filter((e) => {
        const d = parseISO(e.date);
        if (dateFrom && dateTo) {
          return isWithinInterval(d, {
            start: parseISO(dateFrom),
            end: parseISO(dateTo),
          });
        }
        if (dateFrom) return d >= parseISO(dateFrom);
        if (dateTo) return d <= parseISO(dateTo);
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "amount") {
        cmp = a.amount - b.amount;
      } else {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [allExpenses, statusFilter, categoryFilter, search, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Expenses" description={`${filtered.length} expense records`}>
        <Button
          onClick={() => navigate("/expenses/new")}
          className="bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          New Expense
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Search ID, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 border-[#e5e7eb] bg-white pl-9 text-[13px]"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as ExpenseStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[140px] border-[#e5e7eb] bg-white text-[13px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v as ExpenseCategory | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[140px] border-[#e5e7eb] bg-white text-[13px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="h-9 w-[150px] border-[#e5e7eb] bg-white text-[12px]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        <span className="text-[12px] text-[#94a3b8]">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="h-9 w-[150px] border-[#e5e7eb] bg-white text-[12px]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#f1f5f9] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                ID
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                Description
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                Category
              </TableHead>
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] hover:text-[#334155]"
                onClick={() => handleSort("amount")}
              >
                Amount {sortField === "amount" && (sortDir === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] hover:text-[#334155]"
                onClick={() => handleSort("date")}
              >
                Date {sortField === "date" && (sortDir === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] hover:text-[#334155]"
                onClick={() => handleSort("status")}
              >
                Status {sortField === "status" && (sortDir === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((exp, idx) => (
              <TableRow
                key={exp.id}
                className={`cursor-pointer border-[#f1f5f9] transition-all hover:translate-y-[-1px] hover:shadow-sm ${
                  idx % 2 === 1 ? "bg-[#fafaf9]" : ""
                }`}
                onClick={() => navigate(`/expenses/${exp.id}`)}
              >
                <TableCell
                  className="text-[12px] font-medium text-[#334155]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {exp.id}
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-[13px] text-[#334155]">
                  {exp.description}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={exp.category} />
                </TableCell>
                <TableCell
                  className="text-[13px] font-semibold text-[#1e293b]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ${exp.amount.toFixed(2)}
                </TableCell>
                <TableCell
                  className="text-[12px] text-[#64748b]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {format(parseISO(exp.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <StatusBadge status={exp.status} />
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[13px] text-[#94a3b8]">
                  No expenses found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#f1f5f9] px-4 py-3">
            <p
              className="text-[12px] text-[#94a3b8]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#e5e7eb]"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 text-[12px] ${
                    p === page ? "bg-[#1e293b]" : "border-[#e5e7eb]"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#e5e7eb]"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
