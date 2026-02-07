import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { expenseStore } from "@/data/store";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import CategoryBadge from "@/components/shared/CategoryBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const expenses = useMemo(() => {
    if (!user) return [];
    return expenseStore.getByEmployee(user.id);
  }, [user]);

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const pending = expenses.filter((e) => e.status === "PENDING").length;
    const approved = expenses.filter((e) => e.status === "APPROVED" || e.status === "PAID").length;
    const rejected = expenses.filter((e) => e.status === "REJECTED").length;
    return { total, pending, approved, rejected, count: expenses.length };
  }, [expenses]);

  const chartData = useMemo(() => {
    const months: Record<string, number> = {};
    expenses.forEach((e) => {
      const m = format(parseISO(e.date), "MMM yyyy");
      months[m] = (months[m] || 0) + e.amount;
    });
    return Object.entries(months)
      .map(([month, total]) => ({ month, total: Math.round(total) }))
      .reverse()
      .slice(-6);
  }, [expenses]);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Track your expenses and submissions"
      >
        <Button
          onClick={() => navigate("/expenses/new")}
          className="bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          New Expense
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expenses"
          value={`$${stats.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${stats.count} submissions`}
          icon={<DollarSign className="h-5 w-5 text-[#334155]" />}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting review"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          subtitle="Accepted expenses"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          subtitle="Declined expenses"
          icon={<XCircle className="h-5 w-5 text-red-500" />}
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Chart */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 lg:col-span-2">
          <h3
            className="mb-4 text-[15px] font-semibold text-[#1e293b]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Monthly Spending
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value}`, "Total"]}
                />
                <Bar dataKey="total" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-[13px] text-[#94a3b8]">
              No data yet
            </div>
          )}
        </div>

        {/* Recent expenses */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="text-[15px] font-semibold text-[#1e293b]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Recent Expenses
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/expenses")}
              className="text-[12px] text-[#64748b]"
            >
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[#f1f5f9]">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">ID</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Category</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Amount</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExpenses.map((exp) => (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer border-[#f1f5f9] transition-all hover:translate-y-[-1px] hover:shadow-sm"
                  onClick={() => navigate(`/expenses/${exp.id}`)}
                >
                  <TableCell
                    className="text-[12px] font-medium text-[#334155]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {exp.id}
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
                    {format(parseISO(exp.date), "MMM dd")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={exp.status} />
                  </TableCell>
                </TableRow>
              ))}
              {recentExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[13px] text-[#94a3b8]">
                    No expenses yet. Submit your first expense!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
