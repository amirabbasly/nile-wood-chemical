"use client";

import { Product } from "./types";

const CART_KEY = "nile-wood-cart";

export type StoredCartItem = {
  productId: string;
  quantity: number;
};

export function readCart(): StoredCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToCart(product: Product, quantity = 1) {
  const current = readCart();
  const found = current.find((item) => item.productId === product.id);
  const next = found
    ? current.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    : [...current, { productId: product.id, quantity }];
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateCart(productId: string, quantity: number) {
  const next = readCart()
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}
