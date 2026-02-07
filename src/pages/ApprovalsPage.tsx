import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { expenseStore } from "@/data/store";
import { ExpenseCategory } from "@/types/expense";
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
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";

const PAGE_SIZE = 10;

export default function ApprovalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pendingExpenses = useMemo(() => {
    if (!user) return [];
    return expenseStore.getPendingForManager(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, forceUpdate]);

  const filtered = useMemo(() => {
    let result = pendingExpenses;

    if (categoryFilter !== "ALL") {
      result = result.filter((e) => e.category === categoryFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.employeeName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [pendingExpenses, categoryFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Approvals"
        description={`${filtered.length} expenses awaiting your review`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Search employee, ID, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 border-[#e5e7eb] bg-white pl-9 text-[13px]"
          />
        </div>
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
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#f1f5f9] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">ID</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Employee</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Description</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Category</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Amount</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Submitted</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((exp, idx) => (
              <TableRow
                key={exp.id}
                className={`border-[#f1f5f9] transition-all hover:translate-y-[-1px] hover:shadow-sm ${
                  idx % 2 === 1 ? "bg-[#fafaf9]" : ""
                }`}
              >
                <TableCell
                  className="text-[12px] font-medium text-[#334155]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {exp.id}
                </TableCell>
                <TableCell className="text-[13px] font-medium text-[#334155]">
                  {exp.employeeName}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-[13px] text-[#64748b]">
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
                  {format(parseISO(exp.submittedAt), "MMM dd")}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/approvals/${exp.id}`)}
                    className="h-7 bg-[#1e293b] text-[11px] font-semibold hover:bg-[#334155]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[13px] text-[#94a3b8]">
                  🎉 All caught up! No pending approvals.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#f1f5f9] px-4 py-3">
            <p
              className="text-[12px] text-[#94a3b8]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
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
