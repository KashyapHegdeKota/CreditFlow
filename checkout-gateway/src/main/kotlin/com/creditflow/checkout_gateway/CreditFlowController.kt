package com.creditflow.checkout_gateway

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.OffsetDateTime
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = ["*"]) 
class CreditFlowController {

    // 1. Checkout Endpoint
    @PostMapping("/checkout")
    fun processCheckout(@RequestBody request: CheckoutRequest): ResponseEntity<CheckoutResponse> {
        println("Received checkout for user: ${request.userId} for $${request.totalAmount}")
        
        // Returning a synchronous mock success response for now
        val mockSchedule = LoanSchedule(
            loanId = "loan_${UUID.randomUUID().toString().take(8)}",
            userId = request.userId,
            totalAmount = request.totalAmount,
            downPayment = request.totalAmount * 0.25,
            financedAmount = request.totalAmount * 0.75,
            apr = 0.0,
            approvedAt = OffsetDateTime.now().toString(),
            status = "approved",
            installments = listOf(
                PaymentInstallment(1, OffsetDateTime.now().toString(), request.totalAmount * 0.25, "upcoming"),
                PaymentInstallment(2, OffsetDateTime.now().plusWeeks(2).toString(), request.totalAmount * 0.25, "upcoming")
            )
        )

        return ResponseEntity.ok(CheckoutResponse(success = true, loanSchedule = mockSchedule))
    }

    // 2. Confirm Loan Endpoint
    @PostMapping("/loans/{loanId}/confirm")
    fun confirmLoan(@PathVariable loanId: String): ResponseEntity<Void> {
        println("Confirmed loan contract: $loanId")
        return ResponseEntity.ok().build()
    }

    // 3. User Dashboard Endpoint
    @GetMapping("/users/{userId}/dashboard")
    fun getDashboardData(@PathVariable userId: String): ResponseEntity<UserDashboardData> {
        println("Fetching dashboard for user: $userId")
        
        val mockData = UserDashboardData(
            userId = userId,
            name = "Alex Rivera", 
            totalOutstandingBalance = 0.0,
            nextPaymentDue = null,
            creditScore = 742,
            activeLoans = emptyList()
        )
        return ResponseEntity.ok(mockData)
    }
}