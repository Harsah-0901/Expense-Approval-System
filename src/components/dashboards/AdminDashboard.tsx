import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { expenseStore, USERS } from "@/data/store";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  FileDown,
  BarChart3,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
  PAID: "#6366f1",
};

const CATEGORY_COLORS: Record<string, string> = {
  Travel: "#3b82f6",
  Food: "#f97316",
  Office: "#a855f7",
  Other: "#64748b",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const allExpenses = useMemo(() => expenseStore.getAll(), []);

  const stats = useMemo(() => {
    const total = allExpenses.reduce((s, e) => s + e.amount, 0);
    const pending = allExpenses.filter((e) => e.status === "PENDING").length;
    const approved = allExpenses.filter((e) => e.status === "APPROVED").length;
    const paid = allExpenses.filter((e) => e.status === "PAID").length;
    const employees = USERS.filter((u) => u.role === "employee").length;
    return { total, pending, approved, paid, employees, count: allExpenses.length };
  }, [allExpenses]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    allExpenses.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allExpenses]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    allExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [allExpenses]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    allExpenses.forEach((e) => {
      const m = format(parseISO(e.date), "MMM yyyy");
      months[m] = (months[m] || 0) + e.amount;
    });
    return Object.entries(months)
      .map(([month, total]) => ({ month, total: Math.round(total) }))
      .reverse()
      .slice(-6);
  }, [allExpenses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="System-wide expense overview and analytics"
      >
        <Button
          variant="outline"
          onClick={() => navigate("/export")}
          className="border-[#e5e7eb] text-[13px] font-medium"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <FileDown className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
        <Button
          onClick={() => navigate("/analytics")}
          className="bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <BarChart3 className="mr-1.5 h-4 w-4" />
          Analytics
        </Button>
      </PageHeader>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={`$${stats.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${stats.count} total expenses`}
          icon={<DollarSign className="h-5 w-5 text-[#334155]" />}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting review"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title="Paid Out"
          value={stats.paid}
          subtitle="Completed payments"
          icon={<CheckCircle2 className="h-5 w-5 text-indigo-500" />}
        />
        <StatCard
          title="Employees"
          value={stats.employees}
          subtitle="Active users"
          icon={<Users className="h-5 w-5 text-emerald-500" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly trend */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 lg:col-span-2">
          <h3
            className="mb-4 text-[15px] font-semibold text-[#1e293b]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Monthly Expense Trend
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Total"]}
              />
              <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3
            className="mb-4 text-[15px] font-semibold text-[#1e293b]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
        <h3
          className="mb-4 text-[15px] font-semibold text-[#1e293b]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Category Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} width={60} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Total"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {categoryData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
