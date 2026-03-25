package com.creditflow.checkout_gateway

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

// Using excludeName with strings prevents compile-time import errors
@SpringBootApplication(excludeName = [
    "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
    "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
])
class CheckoutGatewayApplication

fun main(args: Array<String>) {
    runApplication<CheckoutGatewayApplication>(*args)
}