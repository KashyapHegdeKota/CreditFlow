package com.creditflow.checkout_gateway

// Request & Response Envelopes
data class CheckoutRequest(val userId: String, val cartItems: List<CartItem>, val totalAmount: Double)
data class CheckoutResponse(val success: Boolean, val loanSchedule: LoanSchedule? = null, val error: String? = null)

// Core Domain Models
data class CartItem(
    val id: String, val name: String, val description: String, 
    val price: Double, val image: String, val category: String, val quantity: Int
)

data class LoanSchedule(
    val loanId: String, val userId: String, val totalAmount: Double,
    val downPayment: Double, val financedAmount: Double, val apr: Double,
    val installments: List<PaymentInstallment>, val approvedAt: String, val status: String
)

data class PaymentInstallment(
    val installmentNumber: Int, val dueDate: String, val amount: Double, val status: String
)

// Dashboard Models
data class UserDashboardData(
    val userId: String, val name: String, val totalOutstandingBalance: Double,
    val nextPaymentDue: NextPayment?, val creditScore: Int, val activeLoans: List<ActiveLoan>
)

data class NextPayment(val amount: Double, val date: String, val loanId: String)

data class ActiveLoan(
    val id: String, val itemName: String, val totalAmount: Double, val amountPaid: Double,
    val remainingBalance: Double, val nextPaymentDate: String?, val nextPaymentAmount: Double,
    val status: String, val installments: List<PaymentInstallment>, val startDate: String
)