// ============================================================
// CreditFlow — Shared TypeScript Interfaces
// ============================================================

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

export interface PaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: "upcoming" | "paid" | "overdue";
}

export interface LoanSchedule {
  loanId: string;
  userId: string;
  totalAmount: number;
  downPayment: number;
  financedAmount: number;
  apr: number;
  installments: PaymentInstallment[];
  approvedAt: string;
  status: "approved" | "denied" | "pending";
  decisionReason?: string;
}

export interface ActiveLoan {
  id: string;
  itemName: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  status: "current" | "overdue" | "paid_off";
  installments: PaymentInstallment[];
  startDate: string;
}

export interface UserDashboardData {
  userId: string;
  name: string;
  totalOutstandingBalance: number;
  nextPaymentDue: {
    amount: number;
    date: string;
    loanId: string;
  } | null;
  creditScore: number;
  activeLoans: ActiveLoan[];
}

export interface CheckoutRequest {
  userId: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export interface CheckoutResponse {
  success: boolean;
  loanSchedule?: LoanSchedule;
  error?: string;
}

export type CheckoutStep =
  | "idle"
  | "input"
  | "connecting"
  | "evaluating"
  | "generating"
  | "approved"
  | "denied"
  | "confirmed";