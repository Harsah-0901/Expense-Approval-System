import { User, Expense, ExpenseStatus, ExpenseCategory, AuditEntry } from "@/types/expense";
import { format, subDays, subMonths } from "date-fns";

// ── Seed Users ──────────────────────────────────────────────────────
export const USERS: User[] = [
  {
    id: "emp-001",
    email: "alice@company.com",
    name: "Alice Johnson",
    role: "employee",
    managerId: "mgr-001",
    department: "Engineering",
  },
  {
    id: "emp-002",
    email: "bob@company.com",
    name: "Bob Williams",
    role: "employee",
    managerId: "mgr-001",
    department: "Engineering",
  },
  {
    id: "emp-003",
    email: "carol@company.com",
    name: "Carol Davis",
    role: "employee",
    managerId: "mgr-002",
    department: "Marketing",
  },
  {
    id: "emp-004",
    email: "david@company.com",
    name: "David Lee",
    role: "employee",
    managerId: "mgr-002",
    department: "Marketing",
  },
  {
    id: "emp-005",
    email: "emma@company.com",
    name: "Emma Wilson",
    role: "employee",
    managerId: "mgr-001",
    department: "Engineering",
  },
  {
    id: "mgr-001",
    email: "frank@company.com",
    name: "Frank Martinez",
    role: "manager",
    department: "Engineering",
  },
  {
    id: "mgr-002",
    email: "grace@company.com",
    name: "Grace Chen",
    role: "manager",
    department: "Marketing",
  },
  {
    id: "adm-001",
    email: "admin@company.com",
    name: "Henry Admin",
    role: "admin",
    department: "Operations",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────
let expenseCounter = 0;

function createId(): string {
  expenseCounter++;
  return `EXP-${String(expenseCounter).padStart(4, "0")}`;
}

function randomCategory(): ExpenseCategory {
  const cats: ExpenseCategory[] = ["Travel", "Food", "Office", "Other"];
  return cats[Math.floor(Math.random() * cats.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ── Seed Expenses ───────────────────────────────────────────────────
function generateSeedExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const now = new Date();

  const employees = USERS.filter((u) => u.role === "employee");

  employees.forEach((emp) => {
    const manager = USERS.find((u) => u.id === emp.managerId);
    // Each employee gets 4-6 expenses
    const count = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const expDate = subDays(now, daysAgo);
      const submittedDate = subDays(now, daysAgo - 1);
      const category = randomCategory();
      const id = createId();

      let status: ExpenseStatus = "PENDING";
      const auditTrail: AuditEntry[] = [
        {
          id: `aud-${id}-1`,
          expenseId: id,
          action: "Submitted",
          toStatus: "PENDING",
          performedBy: emp.id,
          performedByName: emp.name,
          timestamp: format(submittedDate, "yyyy-MM-dd'T'HH:mm:ss"),
        },
      ];

      // Older expenses should have progressed through the lifecycle
      if (daysAgo > 60) {
        const rand = Math.random();
        if (rand < 0.5) {
          status = "PAID";
          auditTrail.push(
            {
              id: `aud-${id}-2`,
              expenseId: id,
              action: "Approved",
              fromStatus: "PENDING",
              toStatus: "APPROVED",
              performedBy: manager?.id || "",
              performedByName: manager?.name || "",
              comment: "Looks good, approved.",
              timestamp: format(subDays(submittedDate, -2), "yyyy-MM-dd'T'HH:mm:ss"),
            },
            {
              id: `aud-${id}-3`,
              expenseId: id,
              action: "Paid",
              fromStatus: "APPROVED",
              toStatus: "PAID",
              performedBy: "adm-001",
              performedByName: "Henry Admin",
              timestamp: format(subDays(submittedDate, -5), "yyyy-MM-dd'T'HH:mm:ss"),
            }
          );
        } else if (rand < 0.8) {
          status = "APPROVED";
          auditTrail.push({
            id: `aud-${id}-2`,
            expenseId: id,
            action: "Approved",
            fromStatus: "PENDING",
            toStatus: "APPROVED",
            performedBy: manager?.id || "",
            performedByName: manager?.name || "",
            timestamp: format(subDays(submittedDate, -2), "yyyy-MM-dd'T'HH:mm:ss"),
          });
        } else {
          status = "REJECTED";
          auditTrail.push({
            id: `aud-${id}-2`,
            expenseId: id,
            action: "Rejected",
            fromStatus: "PENDING",
            toStatus: "REJECTED",
            performedBy: manager?.id || "",
            performedByName: manager?.name || "",
            comment: "Missing proper documentation. Please resubmit.",
            timestamp: format(subDays(submittedDate, -2), "yyyy-MM-dd'T'HH:mm:ss"),
          });
        }
      } else if (daysAgo > 30) {
        const rand = Math.random();
        if (rand < 0.4) {
          status = "APPROVED";
          auditTrail.push({
            id: `aud-${id}-2`,
            expenseId: id,
            action: "Approved",
            fromStatus: "PENDING",
            toStatus: "APPROVED",
            performedBy: manager?.id || "",
            performedByName: manager?.name || "",
            timestamp: format(subDays(submittedDate, -3), "yyyy-MM-dd'T'HH:mm:ss"),
          });
        } else if (rand < 0.6) {
          status = "REJECTED";
          auditTrail.push({
            id: `aud-${id}-2`,
            expenseId: id,
            action: "Rejected",
            fromStatus: "PENDING",
            toStatus: "REJECTED",
            performedBy: manager?.id || "",
            performedByName: manager?.name || "",
            comment: "Amount exceeds policy limit for this category.",
            timestamp: format(subDays(submittedDate, -1), "yyyy-MM-dd'T'HH:mm:ss"),
          });
        }
        // else stays PENDING
      }

      const amountRanges: Record<ExpenseCategory, [number, number]> = {
        Travel: [150, 2500],
        Food: [15, 120],
        Office: [25, 500],
        Other: [10, 800],
      };

      const expense: Expense = {
        id,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        amount: randomAmount(...amountRanges[category]),
        category,
        date: format(expDate, "yyyy-MM-dd"),
        description: getDescription(category),
        status,
        managerId: emp.managerId,
        managerName: manager?.name,
        submittedAt: format(submittedDate, "yyyy-MM-dd'T'HH:mm:ss"),
        approvedAt:
          status === "APPROVED" || status === "PAID"
            ? format(subDays(submittedDate, -2), "yyyy-MM-dd'T'HH:mm:ss")
            : undefined,
        rejectedAt:
          status === "REJECTED"
            ? format(subDays(submittedDate, -2), "yyyy-MM-dd'T'HH:mm:ss")
            : undefined,
        paidAt:
          status === "PAID"
            ? format(subDays(submittedDate, -5), "yyyy-MM-dd'T'HH:mm:ss")
            : undefined,
        rejectionComment:
          status === "REJECTED"
            ? auditTrail.find((a) => a.action === "Rejected")?.comment
            : undefined,
        auditTrail,
      };

      expenses.push(expense);
    }
  });

  return expenses.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

function getDescription(category: ExpenseCategory): string {
  const descriptions: Record<ExpenseCategory, string[]> = {
    Travel: [
      "Client meeting travel - round trip airfare",
      "Uber to downtown office for team sync",
      "Hotel accommodation for 2-night conference",
      "Flight tickets for quarterly offsite",
      "Mileage reimbursement for site visit",
    ],
    Food: [
      "Team lunch at Italian restaurant",
      "Client dinner — new partnership discussion",
      "Working lunch during deadline sprint",
      "Coffee supplies for team meeting room",
      "Catering for department all-hands",
    ],
    Office: [
      "Ergonomic keyboard and mouse set",
      "Monitor stand and cable management",
      "Whiteboard markers and sticky notes",
      "Standing desk converter",
      "External SSD for project backups",
    ],
    Other: [
      "Professional development course subscription",
      "Conference registration fee",
      "Team building event — escape room",
      "Software license renewal",
      "Emergency equipment replacement",
    ],
  };
  const opts = descriptions[category];
  return opts[Math.floor(Math.random() * opts.length)];
}

// ── In-Memory Store ─────────────────────────────────────────────────
class ExpenseStore {
  private expenses: Expense[];

  constructor() {
    this.expenses = generateSeedExpenses();
  }

  getAll(): Expense[] {
    return [...this.expenses];
  }

  getById(id: string): Expense | undefined {
    return this.expenses.find((e) => e.id === id);
  }

  getByEmployee(employeeId: string): Expense[] {
    return this.expenses.filter((e) => e.employeeId === employeeId);
  }

  getByManager(managerId: string): Expense[] {
    return this.expenses.filter((e) => e.managerId === managerId);
  }

  getPendingForManager(managerId: string): Expense[] {
    return this.expenses.filter(
      (e) => e.managerId === managerId && e.status === "PENDING"
    );
  }

  add(expense: Expense): void {
    this.expenses = [expense, ...this.expenses];
  }

  update(id: string, updates: Partial<Expense>): Expense | undefined {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    this.expenses[idx] = { ...this.expenses[idx], ...updates };
    return this.expenses[idx];
  }

  getNextId(): string {
    return createId();
  }
}

export const expenseStore = new ExpenseStore();

// ── Valid Status Transitions ────────────────────────────────────────
const VALID_TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["PAID"],
  REJECTED: [],
  PAID: [],
};

export function isValidTransition(
  from: ExpenseStatus,
  to: ExpenseStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getTeamMembers(managerId: string): User[] {
  return USERS.filter((u) => u.managerId === managerId);
}
