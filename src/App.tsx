import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import ExpenseFormPage from "@/pages/ExpenseFormPage";
import ExpenseListPage from "@/pages/ExpenseListPage";
import ExpenseDetailPage from "@/pages/ExpenseDetailPage";
import ApprovalsPage from "@/pages/ApprovalsPage";
import ApprovalReviewPage from "@/pages/ApprovalReviewPage";
import TeamExpensesPage from "@/pages/TeamExpensesPage";
import ReportsPage from "@/pages/ReportsPage";
import AllExpensesPage from "@/pages/AllExpensesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ExportPage from "@/pages/ExportPage";

function App() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-[#fafaf9]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1e293b] border-t-transparent" />
              <p className="text-[13px] text-[#94a3b8]">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Employee routes */}
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses" element={<ExpenseListPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailPage />} />

            {/* Manager routes */}
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/approvals/:id" element={<ApprovalReviewPage />} />
            <Route path="/team-expenses" element={<TeamExpensesPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Admin routes */}
            <Route path="/all-expenses" element={<AllExpensesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
