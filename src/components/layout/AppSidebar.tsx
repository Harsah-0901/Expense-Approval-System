import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  CheckSquare,
  BarChart3,
  FileDown,
  Users,
  LogOut,
  ChevronDown,
  Shield,
  DollarSign,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const employeeNav: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Submit Expense", path: "/expenses/new", icon: <PlusCircle className="h-4 w-4" /> },
    { label: "My Expenses", path: "/expenses", icon: <Receipt className="h-4 w-4" /> },
  ];

  const managerNav: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Pending Approvals", path: "/approvals", icon: <CheckSquare className="h-4 w-4" /> },
    { label: "Team Expenses", path: "/team-expenses", icon: <Users className="h-4 w-4" /> },
    { label: "Reports", path: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const adminNav: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "All Expenses", path: "/all-expenses", icon: <Receipt className="h-4 w-4" /> },
    { label: "Analytics", path: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Export Data", path: "/export", icon: <FileDown className="h-4 w-4" /> },
  ];

  const navItems =
    user.role === "admin"
      ? adminNav
      : user.role === "manager"
      ? managerNav
      : employeeNav;

  const roleLabel =
    user.role === "admin" ? "Administrator" : user.role === "manager" ? "Manager" : "Employee";

  const roleIcon =
    user.role === "admin" ? (
      <Shield className="h-3 w-3" />
    ) : user.role === "manager" ? (
      <CheckSquare className="h-3 w-3" />
    ) : (
      <DollarSign className="h-3 w-3" />
    );

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-[#e5e7eb] bg-[#f8fafc]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e293b]">
          <DollarSign className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            ExpenseFlow
          </h1>
        </div>
      </div>

      <Separator className="bg-[#e5e7eb]" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#1e293b] text-white shadow-sm"
                    : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155]"
                )}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator className="bg-[#e5e7eb]" />

      {/* User section */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f1f5f9]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#334155] text-[11px] font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[13px] font-medium text-[#1e293b]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {user.name}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                  {roleIcon}
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
