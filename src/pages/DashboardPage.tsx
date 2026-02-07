import { useAuth } from "@/context/AuthContext";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "employee":
      return <EmployeeDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return null;
  }
}
