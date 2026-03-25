"use client";

import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Calendar,
  ChevronRight,
  Lock,
} from "lucide-react";
import type { CartItem, CheckoutStep, LoanSchedule } from "@/types";
import { submitCheckout, confirmLoanContract } from "@/services/checkoutService";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
}

const PROCESSING_STEPS: { key: string; label: string; duration: number }[] = [
  { key: "connecting",  label: "Connecting to Gateway...",      duration: 800  },
  { key: "evaluating",  label: "Evaluating Risk Profile...",    duration: 1200 },
  { key: "generating",  label: "Generating Payment Schedule...", duration: 1000 },
];

const CheckoutModal: FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
}) => {
  const [step, setStep] = useState<CheckoutStep>("input");
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [loanSchedule, setLoanSchedule] = useState<LoanSchedule | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("input");
      setUserId("");
      setUserIdError("");
      setLoanSchedule(null);
      setErrorMessage("");
      setCurrentProcessingStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setUserIdError("Please enter your User ID to continue.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUserIdError("User ID can only contain letters, numbers, _ and -");
      return;
    }

    setUserIdError("");
    setStep("connecting");
    setCurrentProcessingStep(0);

    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      await new Promise<void>((r) => setTimeout(r, PROCESSING_STEPS[i].duration));
      setCurrentProcessingStep(i + 1);
    }

    const result = await submitCheckout({ userId: trimmed, cartItems, totalAmount });

    if (result.success && result.loanSchedule) {
      setLoanSchedule(result.loanSchedule);
      setStep("approved");
    } else {
      setErrorMessage(result.error ?? "Something went wrong. Please try again.");
      setStep("denied");
    }
  }, [userId, cartItems, totalAmount]);

  const handleConfirm = useCallback(async () => {
    if (!loanSchedule) return;
    setIsConfirming(true);
    await confirmLoanContract(loanSchedule.loanId);
    setIsConfirming(false);
    setStep("confirmed");
  }, [loanSchedule]);

  if (!isOpen) return null;

  const isProcessing =
    step === "connecting" || step === "evaluating" || step === "generating";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm anim-fade-in"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden anim-slide-up">
        {/* Top colour bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-[15px] leading-tight tracking-tight">
                CreditFlow Checkout
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {formatCurrency(totalAmount)} total
              </p>
            </div>
          </div>
          {!isProcessing && step !== "confirmed" && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6 min-h-[320px] flex flex-col">

          {/* ── Step: INPUT ──────────────────────────────────────────── */}
          {step === "input" && (
            <div className="flex flex-col gap-5 anim-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Verify Your Identity</h3>
                <p className="text-sm text-slate-500">
                  Enter your User ID to initiate a credit check. No hard inquiry.
                </p>
              </div>

              {/* Cart summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[200px]">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="ml-1 text-slate-400">×{item.quantity}</span>
                      )}
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                  <span className="text-slate-700">Total</span>
                  <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* User ID input */}
              <div className="space-y-1.5">
                <label htmlFor="userId" className="text-sm font-semibold text-slate-700">
                  User ID
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); if (userIdError) setUserIdError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="e.g. user_123"
                  className={[
                    "w-full px-4 py-3 rounded-xl border text-sm font-mono transition-colors outline-none",
                    userIdError
                      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50",
                  ].join(" ")}
                />
                {userIdError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {userIdError}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  Try{" "}
                  <button
                    className="text-indigo-500 hover:underline font-medium"
                    onClick={() => setUserId("user_123")}
                  >
                    user_123
                  </button>{" "}
                  for a demo
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Check My Eligibility
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3 h-3" />
                256-bit encrypted · No hard credit pull · Instant decision
              </div>
            </div>
          )}

          {/* ── Step: PROCESSING ─────────────────────────────────────── */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center flex-1 gap-8 py-4 anim-fade-in">
              {/* Spinner rings */}
              <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-violet-300 border-b-transparent animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
                <Zap className="w-6 h-6 text-indigo-600 fill-indigo-100" />
              </div>

              {/* Step list */}
              <div className="w-full space-y-3">
                {PROCESSING_STEPS.map((s, idx) => {
                  const isDone   = currentProcessingStep > idx;
                  const isActive = currentProcessingStep === idx;
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className={[
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500",
                        isDone   ? "bg-emerald-500"            :
                        isActive ? "bg-indigo-600 animate-pulse" :
                                   "bg-slate-200",
                      ].join(" ")}>
                        {isDone   ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> :
                         isActive ? <Loader2 className="w-3 h-3 text-white animate-spin" /> :
                                    <div className="w-2 h-2 rounded-full bg-slate-400" />}
                      </div>
                      <span className={[
                        "text-sm font-medium transition-colors duration-300",
                        isDone   ? "text-emerald-600" :
                        isActive ? "text-slate-900"   :
                                   "text-slate-400",
                      ].join(" ")}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Skeleton hint */}
              <div className="w-full space-y-2 opacity-40">
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-1/2" />
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          )}

          {/* ── Step: APPROVED ───────────────────────────────────────── */}
          {step === "approved" && loanSchedule && (
            <div className="flex flex-col gap-5 anim-slide-right">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">You&apos;re Approved!</p>
                  <p className="text-xs text-emerald-600">0% APR · No hidden fees · Cancel anytime</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Payment Schedule
                </p>
                <div className="space-y-2">
                  {loanSchedule.installments.map((inst, i) => (
                    <div
                      key={inst.installmentNumber}
                      className={[
                        "flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                        i === 0 ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={[
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                          i === 0 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600",
                        ].join(" ")}>
                          {inst.installmentNumber}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {i === 0 ? "Due Today" : formatDate(inst.dueDate)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {i === 0 ? "Down payment" : `${i * 2} weeks from now`}
                          </div>
                        </div>
                      </div>
                      <span className={["font-bold text-sm", i === 0 ? "text-indigo-700" : "text-slate-700"].join(" ")}>
                        {formatCurrency(inst.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-200 hover:-translate-y-0.5"
              >
                {isConfirming
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Confirming...</>
                  : <><Lock className="w-4 h-4" />Confirm &amp; Sign Contract</>}
              </button>
            </div>
          )}

          {/* ── Step: DENIED ─────────────────────────────────────────── */}
          {step === "denied" && (
            <div className="flex flex-col items-center gap-5 text-center py-6 anim-fade-in">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Application Declined</h3>
                <p className="text-sm text-slate-500">{errorMessage}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 text-left w-full">
                <strong className="font-semibold">Tip:</strong> Try reducing your cart total or splitting across multiple orders.
              </div>
              <button
                onClick={() => setStep("input")}
                className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Step: CONFIRMED ──────────────────────────────────────── */}
          {step === "confirmed" && (
            <div className="flex flex-col items-center gap-5 text-center py-6 anim-fade-in">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Order Confirmed! 🎉</h3>
                <p className="text-sm text-slate-500 max-w-[260px] mx-auto">
                  Your contract is signed. Head to your dashboard to track payments.
                </p>
              </div>
              {loanSchedule && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 w-full text-sm">
                  <p className="text-slate-500 mb-1">Loan ID</p>
                  <p className="font-mono font-bold text-slate-800">{loanSchedule.loanId}</p>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Continue Shopping
                </button>
                <a
                  href="/dashboard"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                >
                  View Dashboard
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;