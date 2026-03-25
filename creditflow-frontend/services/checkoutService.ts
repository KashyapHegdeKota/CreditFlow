// ============================================================
// CreditFlow — API Service Layer
// Connected to Kotlin Spring Boot Backend
// ============================================================

import {
  CheckoutRequest,
  CheckoutResponse,
  UserDashboardData,
} from "@/types";

// Note: Removed the trailing slash so routing works cleanly
// Also using 127.0.0.1 instead of localhost to prevent Node.js IPv6 resolution errors
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api/v1";

/**
 * POST /api/v1/checkout
 * Submits cart for credit evaluation and returns a payment schedule.
 */
export async function submitCheckout(
  request: CheckoutRequest
): Promise<CheckoutResponse> {
  try {
    const res = await fetch(`${BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message ?? "Checkout failed." };
    }

    // The Kotlin backend returns a full CheckoutResponse object, so we just return it
    return await res.json();
  } catch (error) {
    console.error("Fetch Error: Is the Spring Boot backend running?", error);
    return { success: false, error: "Failed to connect to the underwriting server." };
  }
}

/**
 * GET /api/v1/users/:userId/dashboard
 * Fetches aggregated ledger data for the dashboard.
 */
export async function fetchDashboardData(
  userId: string
): Promise<UserDashboardData> {
  const res = await fetch(`${BASE_URL}/users/${userId}/dashboard`);
  
  if (!res.ok) {
    throw new Error("Failed to load dashboard.");
  }
  
  return res.json();
}

/**
 * POST /api/v1/loans/:loanId/confirm
 * Confirms a loan contract after approval.
 */
export async function confirmLoanContract(loanId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/loans/${loanId}/confirm`, {
      method: "POST",
    });
    return res.ok;
  } catch (error) {
    console.error("Confirmation Error:", error);
    return false;
  }
}

export { BASE_URL };