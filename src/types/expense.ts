export type UserRole = "employee" | "manager" | "admin";

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export type ExpenseCategory = "Travel" | "Food" | "Office" | "Other";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  managerId?: string;
  department: string;
  avatar?: string;
}

export interface AuditEntry {
  id: string;
  expenseId: string;
  action: string;
  fromStatus?: ExpenseStatus;
  toStatus?: ExpenseStatus;
  performedBy: string;
  performedByName: string;
  comment?: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  receiptUrl?: string;
  receiptName?: string;
  status: ExpenseStatus;
  managerId?: string;
  managerName?: string;
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  rejectionComment?: string;
  approvalComment?: string;
  auditTrail: AuditEntry[];
}

export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  receipt?: File;
}

export interface ExpenseFilters {
  status?: ExpenseStatus | "ALL";
  category?: ExpenseCategory | "ALL";
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  search?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface MonthlySummary {
  month: string;
  total: number;
  count: number;
  categories: Record<ExpenseCategory, number>;
}
