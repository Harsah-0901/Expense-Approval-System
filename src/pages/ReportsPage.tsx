import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { expenseStore, getTeamMembers } from "@/data/store";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  Travel: "#3b82f6",
  Food: "#f97316",
  Office: "#a855f7",
  Other: "#64748b",
};

export default function ReportsPage() {
  const { user } = useAuth();
  const now = new Date();

  const [dateFrom, setDateFrom] = useState(format(subMonths(now, 3), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(now, "yyyy-MM-dd"));
  const [selectedEmployee, setSelectedEmployee] = useState<string>("ALL");

  const teamMembers = useMemo(() => {
    if (!user) return [];
    return getTeamMembers(user.id);
  }, [user]);

  const teamExpenses = useMemo(() => {
    if (!user) return [];
    return expenseStore.getByManager(user.id);
  }, [user]);

  const filtered = useMemo(() => {
    let result = teamExpenses;

    if (selectedEmployee !== "ALL") {
      result = result.filter((e) => e.employeeId === selectedEmployee);
    }

    if (dateFrom && dateTo) {
      result = result.filter((e) => {
        try {
          return isWithinInterval(parseISO(e.date), {
            start: parseISO(dateFrom),
            end: parseISO(dateTo),
          });
        } catch {
          return true;
        }
      });
    }

    return result;
  }, [teamExpenses, selectedEmployee, dateFrom, dateTo]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    filtered.forEach((e) => {
      const m = format(parseISO(e.date), "MMM yyyy");
      months[m] = (months[m] || 0) + e.amount;
    });
    return Object.entries(months)
      .map(([month, total]) => ({ month, total: Math.round(total) }))
      .reverse();
  }, [filtered]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    filtered.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [filtered]);

  const employeeData = useMemo(() => {
    const totals: Record<string, number> = {};
    filtered.forEach((e) => {
      totals[e.employeeName] = (totals[e.employeeName] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);
  const avgAmount = filtered.length > 0 ? totalAmount / filtered.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Reports"
        description="Analyze your team's expense patterns"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>From</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-[160px] border-[#e5e7eb] bg-white text-[12px]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>To</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-[160px] border-[#e5e7eb] bg-white text-[12px]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Employee</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="h-9 w-[180px] border-[#e5e7eb] bg-white text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Team Members</SelectItem>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Total</p>
            <p className="text-[20px] font-bold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Average</p>
            <p className="text-[20px] font-bold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ${avgAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">Count</p>
            <p className="text-[20px] font-bold text-[#1e293b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {filtered.length}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(value: number) => [`$${value}`, "Total"]} />
              <Line type="monotone" dataKey="total" stroke="#1e293b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(value: number) => [`$${value}`, "Total"]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee breakdown */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
        <h3 className="mb-4 text-[15px] font-semibold text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Expense by Employee</h3>
        <ResponsiveContainer width="100%" height={Math.max(150, employeeData.length * 50)}>
          <BarChart data={employeeData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} width={100} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(value: number) => [`$${value}`, "Total"]} />
            <Bar dataKey="value" fill="#334155" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
