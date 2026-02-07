import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/layout/AppSidebar";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafaf9]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
