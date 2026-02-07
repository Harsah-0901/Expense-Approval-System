import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { expenseStore, getUserById } from "@/data/store";
import { ExpenseCategory, Expense } from "@/types/expense";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Upload, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ExpenseFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      errs.amount = "Amount must be greater than 0";
    }
    if (parseFloat(amount) > 10000) {
      errs.amount = "Amount cannot exceed $10,000";
    }
    if (!category) {
      errs.category = "Please select a category";
    }
    if (!date) {
      errs.date = "Please select a date";
    }
    if (!description.trim()) {
      errs.description = "Description is required";
    }
    if (description.trim().length < 10) {
      errs.description = "Description must be at least 10 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));

    const manager = user.managerId ? getUserById(user.managerId) : undefined;
    const id = expenseStore.getNextId();
    const now = new Date().toISOString();

    const expense: Expense = {
      id,
      employeeId: user.id,
      employeeName: user.name,
      department: user.department,
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      date,
      description: description.trim(),
      receiptName: receiptName || undefined,
      status: "PENDING",
      managerId: user.managerId,
      managerName: manager?.name,
      submittedAt: now,
      auditTrail: [
        {
          id: `aud-${id}-1`,
          expenseId: id,
          action: "Submitted",
          toStatus: "PENDING",
          performedBy: user.id,
          performedByName: user.name,
          timestamp: now,
        },
      ],
    };

    expenseStore.add(expense);
    setIsSubmitting(false);
    toast.success("Expense submitted successfully!", {
      description: `${id} — $${parseFloat(amount).toFixed(2)} for ${category}`,
    });
    navigate("/expenses");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Submit Expense" description="Create a new expense report for approval">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-[#e5e7eb] text-[13px]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-[560px]">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Amount ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((p) => ({ ...p, amount: "" }));
                }}
                className={`h-10 border-[#e5e7eb] bg-white text-[15px] ${
                  errors.amount ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              {errors.amount && (
                <p className="text-[12px] text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v as ExpenseCategory);
                  if (errors.category) setErrors((p) => ({ ...p, category: "" }));
                }}
              >
                <SelectTrigger
                  className={`h-10 border-[#e5e7eb] bg-white text-[14px] ${
                    errors.category ? "border-red-400" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel">🛫 Travel</SelectItem>
                  <SelectItem value="Food">🍽️ Food</SelectItem>
                  <SelectItem value="Office">🏢 Office</SelectItem>
                  <SelectItem value="Other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-[12px] text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Expense Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((p) => ({ ...p, date: "" }));
                }}
                className={`h-10 border-[#e5e7eb] bg-white text-[14px] ${
                  errors.date ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              {errors.date && (
                <p className="text-[12px] text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the expense (at least 10 characters)"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((p) => ({ ...p, description: "" }));
                }}
                className={`min-h-[100px] border-[#e5e7eb] bg-white text-[14px] ${
                  errors.description ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              {errors.description && (
                <p className="text-[12px] text-red-500">{errors.description}</p>
              )}
              <p className="text-[11px] text-[#94a3b8]">
                {description.length}/500 characters
              </p>
            </div>

            {/* Receipt Upload (simulated) */}
            <div className="space-y-2">
              <Label
                className="text-[13px] font-medium text-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Receipt (optional)
              </Label>
              <div
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#e5e7eb] bg-[#fafaf9] px-6 py-8 transition-colors hover:border-[#94a3b8]"
                onClick={() => {
                  // Simulate file upload
                  setReceiptName("receipt-" + Date.now() + ".pdf");
                }}
              >
                {receiptName ? (
                  <div className="flex items-center gap-2 text-[13px] text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {receiptName}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptName("");
                      }}
                      className="ml-2 text-[11px] text-[#94a3b8] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-[#94a3b8]" />
                    <p className="mt-2 text-[13px] font-medium text-[#64748b]">
                      Click to upload receipt
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                      PDF, PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 flex-1 bg-[#1e293b] text-[13px] font-semibold hover:bg-[#334155]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isSubmitting ? "Submitting..." : "Submit Expense"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="h-10 border-[#e5e7eb] text-[13px]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
