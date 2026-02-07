import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const quickLogin = async (email: string) => {
    setEmail(email);
    setPassword("demo");
    const result = await login(email, "demo");
    if (result.success) navigate("/dashboard");
  };

  const demoUsers = [
    { label: "Employee", email: "alice@company.com", role: "employee" as const },
    { label: "Manager", email: "frank@company.com", role: "manager" as const },
    { label: "Admin", email: "admin@company.com", role: "admin" as const },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#1e293b] p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ExpenseFlow
          </span>
        </div>

        <div className="space-y-6">
          <h2
            className="text-4xl font-bold leading-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Streamline your
            <br />
            expense approvals
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-slate-400">
            A production-grade internal expense management platform with
            multi-role workflows, approval lifecycles, and comprehensive
            reporting.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                3
              </p>
              <p className="text-[13px] text-slate-500">Role types</p>
            </div>
            <div>
              <p
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                4
              </p>
              <p className="text-[13px] text-slate-500">Status stages</p>
            </div>
            <div>
              <p
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                CSV
              </p>
              <p className="text-[13px] text-slate-500">Export ready</p>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-slate-600">
          © 2024 ExpenseFlow. Internal use only.
        </p>
      </div>

      {/* Right panel - Login form */}
      <div className="flex w-full flex-col items-center justify-center bg-[#fafaf9] p-8 lg:w-1/2">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e293b]">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-lg font-bold text-[#1e293b]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ExpenseFlow
            </span>
          </div>

          <div>
            <h2
              className="text-[24px] font-bold text-[#1e293b]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Welcome back
            </h2>
            <p className="mt-1 text-[14px] text-[#64748b]">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-[#e5e7eb] bg-white text-[14px] focus-visible:ring-[#1e293b]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-[#e5e7eb] bg-white text-[14px] focus-visible:ring-[#1e293b]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                Quick access (demo)
              </span>
              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => quickLogin(u.email)}
                  className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-center transition-all hover:border-[#1e293b] hover:shadow-sm"
                >
                  <p
                    className="text-[12px] font-semibold text-[#1e293b]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {u.label}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[10px] text-[#94a3b8]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {u.email.split("@")[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-[14px] text-[#64748b]">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#1e293b] hover:underline"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
