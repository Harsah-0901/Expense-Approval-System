import { useState, useMemo } from "react";
import { expenseStore, USERS } from "@/data/store";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  Users as UsersIcon,
  BarChart3,
} from "lucide-react";
import { format, parseISO, isWithinInterval, subMonths } from "date-fns";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

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

const DEPT_COLORS = ["#1e293b", "#334155", "#64748b", "#94a3b8"];

export default function AnalyticsPage() {
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(format(subMonths(now, 6), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(now, "yyyy-MM-dd"));

  const allExpenses = useMemo(() => expenseStore.getAll(), []);

  const filtered = useMemo(() => {
    if (!dateFrom || !dateTo) return allExpenses;
    return allExpenses.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), {
          start: parseISO(dateFrom),
          end: parseISO(dateTo),
        });
      } catch {
        return true;
      }
    });
  }, [allExpenses, dateFrom, dateTo]);

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);
  const avgExpense = filtered.length > 0 ? totalAmount / filtered.length : 0;
  const approvalRate = filtered.length > 0
    ? (filtered.filter((e) => e.status === "APPROVED" || e.status === "PAID").length / filtered.length) * 100
    : 0;

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { total: number; count: number }> = {};
    filtered.forEach((e) => {
      const m = format(parseISO(e.date), "MMM yyyy");
      if (!months[m]) months[m] = { total: 0, count: 0 };
      months[m].total += e.amount;
      months[m].count++;
    });
    return Object.entries(months)
      .map(([month, data]) => ({ month, total: Math.round(data.total), count: data.count }))
      .reverse();
  }, [filtered]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    filtered.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [filtered]);

  const deptData = useMemo(() => {
    const totals: Record<string, number> = {};
    filtered.forEach((e) => { totals[e.department] = (totals[e.department] || 0) + e.amount; });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const topSpenders = useMemo(() => {
    const totals: Record<string, number> = {};
    filtered.forEach((e) => { totals[e.employeeName] = (totals[e.employeeName] || 0) + e.amount; });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Comprehensive expense analytics and insights" />

      {/* Date filters */}
      <div className="flex items-end gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-[160px] border-[#e5e7eb] text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-[160px] border-[#e5e7eb] text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
        </div>
        <p className="ml-auto text-[13px] text-[#94a3b8]">{filtered.length} expenses in range</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={`$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-[#334155]" />}
        />
        <StatCard
          title="Avg Expense"
          value={`$${avgExpense.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Approval Rate"
          value={`${approvalRate.toFixed(1)}%`}
          icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
        />
        <StatCard
          title="Unique Submitters"
          value={new Set(filtered.map((e) => e.employeeId)).size}
          icon={<UsersIcon className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 lg:col-span-2">
          <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Monthly Spend Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Total"]} />
              <Area type="monotone" dataKey="total" stroke="#1e293b" fill="#1e293b" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {statusData.map((entry) => (<Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(value: number) => [`$${value}`, "Total"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry) => (<Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Department Spend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} width={90} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(value: number) => [`$${value}`, "Total"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {deptData.map((_, idx) => (<Cell key={idx} fill={DEPT_COLORS[idx % DEPT_COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Spenders */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
        <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Top Spenders</h3>
        <div className="space-y-3">
          {topSpenders.map((spender, idx) => (
            <div key={spender.name} className="flex items-center gap-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f5f9] text-[12px] font-semibold text-[#334155]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {idx + 1}
              </span>
              <span className="flex-1 text-[13px] font-medium text-[#334155]">{spender.name}</span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-2 rounded-full bg-[#1e293b]"
                    style={{ width: `${(spender.value / (topSpenders[0]?.value || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[13px] font-semibold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                ${spender.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
