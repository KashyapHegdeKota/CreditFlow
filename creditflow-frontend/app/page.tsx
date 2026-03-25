"use client";

import { useState } from "react";
import type { FC } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Zap,
  Star,
  Shield,
  TrendingUp,
  ChevronRight,
  Truck,
} from "lucide-react";
import type { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import CheckoutModal from "@/components/CheckoutModal";

const PRODUCTS: Omit<CartItem, "quantity">[] = [
  {
    id: "prod_macbook",
    name: 'MacBook Pro 14"',
    description: "M3 Pro chip · 18 GB RAM · 512 GB SSD · Liquid Retina XDR",
    price: 1249.0,
    image: "💻",
    category: "Electronics",
  },
  {
    id: "prod_bike",
    name: "Trek Marlin 7",
    description: "29″ Mountain Bike · Alpha Gold Aluminum · Shimano Deore 2×10",
    price: 849.0,
    image: "🚵",
    category: "Sports",
  },
  {
    id: "prod_sneakers",
    name: "Nike Air Max 270",
    description: "React foam midsole · Max Air heel unit · Mesh upper",
    price: 249.0,
    image: "👟",
    category: "Footwear",
  },
  {
    id: "prod_camera",
    name: "Sony α7C II",
    description: "33 MP full-frame · 4K 60fps · AI autofocus · 5-axis IBIS",
    price: 2198.0,
    image: "📷",
    category: "Photography",
  },
];

const StorefrontPage: FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function addToCart(product: Omit<CartItem, "quantity">) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
          .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight">
              Credit<span className="text-indigo-600">Flow</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Shop</a>
            <a href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-slate-900 transition-colors">How It Works</a>
          </nav>

          <button
            onClick={() => cartCount > 0 && setIsModalOpen(true)}
            className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="mb-10 rounded-2xl bg-indigo-600 p-8 text-white overflow-hidden relative">
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-4 border-white opacity-10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full border-4 border-white opacity-10 pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              0% APR · Instant Approval
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
              Buy now.<br />Pay smarter.
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
              Split any purchase into 4 interest-free payments. No hidden fees, no credit impact, no catch.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Products ──────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Featured Products</h2>
              <span className="text-sm text-slate-400">{PRODUCTS.length} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCTS.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                const installmentAmt = formatCurrency(Math.ceil((product.price * 0.75) / 3));
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 overflow-hidden"
                  >
                    <div className="h-36 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-6xl relative overflow-hidden">
                      <span className="group-hover:scale-110 transition-transform duration-300 select-none">
                        {product.image}
                      </span>
                      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200">
                        {product.category}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-amber-50 rounded-full px-2 py-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-amber-600">4.8</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 text-[15px] mb-1 leading-snug">{product.name}</h3>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{product.description}</p>

                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className="text-xl font-black text-slate-900">{formatCurrency(product.price)}</p>
                          <p className="text-xs text-indigo-600 font-medium">
                            or {installmentAmt}/mo × 4 with <span className="font-bold">CreditFlow</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          Free ship
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className={[
                          "w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2",
                          inCart
                            ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-100"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 hover:-translate-y-0.5",
                        ].join(" ")}
                      >
                        <Plus className="w-4 h-4" />
                        {inCart ? `Add Another (${inCart.quantity} in cart)` : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Cart sidebar ──────────────────────────────────────── */}
          <div className="w-full lg:w-80 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-slate-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Cart Summary</h3>
                </div>
                {cartCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>

              <div className="px-5 py-4 space-y-3 min-h-[120px]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Your cart is empty</p>
                    <p className="text-xs text-slate-300 mt-1">Add products to get started</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-lg flex-shrink-0 select-none">
                        {item.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3 text-slate-600" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3 text-slate-300 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-800">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Shipping</span>
                      <span className="font-medium text-emerald-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-black text-slate-900 text-base">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
                    <p className="font-semibold mb-0.5">Pay with CreditFlow</p>
                    <p className="text-indigo-500">
                      4 payments of <strong>{formatCurrency(cartTotal / 4)}</strong> · 0% APR
                    </p>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-200"
                  >
                    <Zap className="w-4 h-4 fill-indigo-200" />
                    Pay with CreditFlow
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secure</span>
                    <span>·</span>
                    <span>0% interest</span>
                    <span>·</span>
                    <span>No fees</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: "🔒", label: "256-bit SSL" },
                { icon: "⚡", label: "Instant Decision" },
                { icon: "💳", label: "0% APR" },
              ].map((b) => (
                <div key={b.label} className="bg-white rounded-xl border border-slate-200 py-3 flex flex-col items-center gap-1 text-center">
                  <span className="text-lg select-none">{b.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-black text-slate-900 text-sm">
              Credit<span className="text-indigo-600">Flow</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            © 2025 CreditFlow Inc. · Buy Now Pay Later · All rights reserved
          </p>
        </div>
      </footer>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItems={cart}
        totalAmount={cartTotal}
      />
    </div>
  );
};

export default StorefrontPage;