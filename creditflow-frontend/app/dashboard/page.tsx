"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import {
  Zap,
  TrendingDown,
  Calendar,
  CreditCard,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
  BarChart3,
  DollarSign,
} from "lucide-react";
import type { ActiveLoan, UserDashboardData } from "@/types";
import { fetchDashboardData } from "@/services/checkoutService";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

function StatusBadge({ status }: { status: ActiveLoan["status"] }) {
  const map: Record<ActiveLoan["status"], { icon: typeof CheckCircle2; label: string; cls: string }> = {
    current:  { icon: CheckCircle2, label: "Current",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    overdue:  { icon: AlertTriangle, label: "Overdue", cls: "bg-red-50 text-red-700 border-red-200" },
    paid_off: { icon: CheckCircle2, label: "Paid Off", cls: "bg-slate-50 text-slate-500 border-slate-200" },
  };
  const { icon: Icon, label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: "indigo" | "emerald" }) {
  const pct = total === 0 ? 100 : Math.min(100, (value / total) * 100);
  const colorClass = color === "emerald" ? "bg-emerald-500" : "bg-indigo-500";
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse">
      <div className="h-3 bg-slate-100 rounded-full w-1/3" />
      <div className="h-8 bg-slate-100 rounded-full w-1/2" />
      <div className="h-3 bg-slate-100 rounded-full w-2/3" />
    </div>
  );
}

const DashboardPage: FC = () => {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData("user_123")
      .then(setData)
      .catch(() => setError("Failed to load dashboard. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = data?.activeLoans.filter((l) => l.status !== "paid_off").length ?? 0;
  const paidCount   = data?.activeLoans.filter((l) => l.status === "paid_off").length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Store</span>
            </a>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-black text-slate-900 text-[15px] tracking-tight">
                Credit<span className="text-indigo-600">Flow</span>
              </span>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                {data.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{data.name}</p>
                <p className="text-xs text-slate-400">{data.userId}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payment Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track your loans, payments, and credit activity.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700 flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Summary cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : data ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Outstanding</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(data.totalOutstandingBalance)}</p>
                <p className="text-xs text-slate-400 mt-1">across {activeCount} active loan{activeCount !== 1 ? "s" : ""}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-200 hover:shadow-md hover:shadow-amber-50 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  {data.nextPaymentDue && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      daysUntil(data.nextPaymentDue.date) <= 3
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {daysUntil(data.nextPaymentDue.date)}d
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Next Payment</p>
                {data.nextPaymentDue ? (
                  <>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(data.nextPaymentDue.amount)}</p>
                    <p className="text-xs text-slate-400 mt-1">Due {formatDate(data.nextPaymentDue.date)}</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-emerald-600">All paid up!</p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Good</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Credit Score</p>
                <p className="text-2xl font-black text-slate-900 mb-2">{data.creditScore}</p>
                <ProgressBar value={data.creditScore - 300} total={550} color="emerald" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-50 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-violet-600" />
                  </div>
                  <CreditCard className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Loans</p>
                <p className="text-2xl font-black text-slate-900">{data.activeLoans.length}</p>
                <p className="text-xs text-slate-400 mt-1">{activeCount} active · {paidCount} paid off</p>
              </div>
            </>
          ) : null}
        </div>

        {/* ── Loans table ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Active Loans</h2>
              <p className="text-xs text-slate-400 mt-0.5">All your CreditFlow purchases</p>
            </div>
            {!loading && (
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                {data?.activeLoans.length ?? 0} total
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading your loans...</span>
            </div>
          ) : !data || data.activeLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CreditCard className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-semibold text-slate-400 text-sm">No loans yet</p>
              <a href="/" className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Go shopping →</a>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Item", "Total", "Paid", "Remaining", "Next Payment", "Status"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.activeLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{loan.itemName}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{loan.id}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{formatCurrency(loan.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <span className="font-medium text-emerald-600">{formatCurrency(loan.amountPaid)}</span>
                            <ProgressBar value={loan.amountPaid} total={loan.totalAmount} color="emerald" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {loan.remainingBalance > 0 ? formatCurrency(loan.remainingBalance) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          {loan.nextPaymentDate ? (
                            <div>
                              <p className="font-semibold text-slate-800">{formatCurrency(loan.nextPaymentAmount)}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatDate(loan.nextPaymentDate)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={loan.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {data.activeLoans.map((loan) => (
                  <div key={loan.id} className="px-5 py-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{loan.itemName}</p>
                        <p className="text-xs text-slate-400 font-mono">{loan.id}</p>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Total</p>
                        <p className="font-semibold text-slate-700">{formatCurrency(loan.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Paid</p>
                        <p className="font-semibold text-emerald-600">{formatCurrency(loan.amountPaid)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Left</p>
                        <p className="font-semibold text-slate-700">
                          {loan.remainingBalance > 0 ? formatCurrency(loan.remainingBalance) : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span>{Math.round((loan.amountPaid / loan.totalAmount) * 100)}%</span>
                      </div>
                      <ProgressBar value={loan.amountPaid} total={loan.totalAmount} color="emerald" />
                    </div>
                    {loan.nextPaymentDate && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        Next: {formatCurrency(loan.nextPaymentAmount)} due {formatDate(loan.nextPaymentDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && data && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="/"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-indigo-200" />
              Make a New Purchase
            </a>
            <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Manage Payment Methods
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;