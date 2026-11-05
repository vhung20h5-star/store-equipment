import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { CartItem, Product } from "@/types";
import {
  fetchServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
  syncServerCart,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncCartWithServer: (guestItems?: { productId: string; quantity: number }[]) => Promise<void>;
  totalCartItems: number;
  totalCartPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Load initial cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("homenest_cart");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch server cart on mount if logged in
  useEffect(() => {
    if (currentUser) {
      fetchServerCart()
        .then((serverCart) => {
          if (serverCart && serverCart.items) {
            setCart(
              serverCart.items.map((it) => ({
                product: it.product,
                quantity: it.quantity,
              })),
            );
          }
        })
        .catch(console.error);
    }
  }, [currentUser]);

  // Sync cart to localStorage (offline/guest resilience)
  useEffect(() => {
    try {
      localStorage.setItem("homenest_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);

        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }

        return [...prev, { product, quantity }];
      });

      if (currentUser) {
        addServerCartItem(product.id, quantity).catch(console.error);
      }

      showToast(
        "Đã thêm vào giỏ hàng!",
        `${product.name} (x${quantity})`,
        "success",
      );
    },
    [currentUser, showToast],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const item = cart.find((i) => i.product.id === productId);

      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      if (currentUser) {
        removeServerCartItem(productId).catch(console.error);
      }
      if (item) {
        showToast("Đã xóa khỏi giỏ hàng", item.product.name, "info");
      }
    },
    [cart, currentUser, showToast],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);

        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      );
      if (currentUser) {
        updateServerCartItem(productId, quantity).catch(console.error);
      }
    },
    [currentUser, removeFromCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    if (currentUser) {
      clearServerCart().catch(console.error);
    }
    showToast("Đã làm trống giỏ hàng", undefined, "info");
  }, [currentUser, showToast]);

  const syncCartWithServer = useCallback(
    async (guestItems?: { productId: string; quantity: number }[]) => {
      const itemsToSync =
        guestItems ??
        cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        }));

      const synced = await syncServerCart(itemsToSync);

      if (synced && synced.items) {
        setCart(
          synced.items.map((it) => ({
            product: it.product,
            quantity: it.quantity,
          })),
        );
      }
    },
    [cart],
  );

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartWithServer,
        totalCartItems,
        totalCartPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

