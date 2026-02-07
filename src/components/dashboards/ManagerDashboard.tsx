import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { expenseStore, getTeamMembers } from "@/data/store";
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
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6366f1"];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const teamExpenses = useMemo(() => {
    if (!user) return [];
    return expenseStore.getByManager(user.id);
  }, [user]);

  const pendingExpenses = useMemo(() => {
    return teamExpenses.filter((e) => e.status === "PENDING");
  }, [teamExpenses]);

  const teamMembers = useMemo(() => {
    if (!user) return [];
    return getTeamMembers(user.id);
  }, [user]);

  const stats = useMemo(() => {
    const total = teamExpenses.reduce((s, e) => s + e.amount, 0);
    const pending = teamExpenses.filter((e) => e.status === "PENDING").length;
    const approved = teamExpenses.filter(
      (e) => e.status === "APPROVED" || e.status === "PAID"
    ).length;
    const rejected = teamExpenses.filter((e) => e.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [teamExpenses]);

  const statusChartData = useMemo(() => {
    return [
      { name: "Pending", value: stats.pending },
      { name: "Approved", value: stats.approved },
      { name: "Rejected", value: stats.rejected },
    ].filter((d) => d.value > 0);
  }, [stats]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description={`${user?.department || ""} team overview`}
      >
        <Button
          onClick={() => navigate("/approvals")}
          className="bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Review Pending ({stats.pending})
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Total"
          value={`$${stats.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${teamExpenses.length} total expenses`}
          icon={<DollarSign className="h-5 w-5 text-[#334155]" />}
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          subtitle="Requires action"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          trend={
            stats.pending > 0
              ? { value: `${stats.pending} awaiting`, positive: false }
              : undefined
          }
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          subtitle="Accepted this period"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Team Members"
          value={teamMembers.length}
          subtitle="Direct reports"
          icon={<Users className="h-5 w-5 text-indigo-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Status chart */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 lg:col-span-2">
          <h3
            className="mb-4 text-[15px] font-semibold text-[#1e293b]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Status Breakdown
          </h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-[13px] text-[#94a3b8]">
              No data
            </div>
          )}
        </div>

        {/* Pending approvals list */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="text-[15px] font-semibold text-[#1e293b]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pending Approvals
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/approvals")}
              className="text-[12px] text-[#64748b]"
            >
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[#f1f5f9]">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Employee</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Category</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Amount</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Submitted</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingExpenses.slice(0, 5).map((exp) => (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer border-[#f1f5f9] transition-all hover:translate-y-[-1px] hover:shadow-sm"
                  onClick={() => navigate(`/approvals/${exp.id}`)}
                >
                  <TableCell className="text-[13px] font-medium text-[#334155]">
                    {exp.employeeName}
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
                    <StatusBadge status={exp.status} />
                  </TableCell>
                </TableRow>
              ))}
              {pendingExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[13px] text-[#94a3b8]">
                    🎉 All caught up! No pending approvals.
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
