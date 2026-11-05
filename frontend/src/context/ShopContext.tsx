import React from "react";

import {
  Product,
  ProductCategory,
  CartItem,
  ToastMessage,
  User,
  LoginRequest,
  RegisterRequest,
} from "@/types";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider, useCart } from "@/context/CartContext";
import { WishlistProvider, useWishlist } from "@/context/WishlistContext";
import { UIProvider, useUI } from "@/context/UIContext";

export * from "@/context/ToastContext";
export * from "@/context/AuthContext";
export * from "@/context/CartContext";
export * from "@/context/WishlistContext";
export * from "@/context/UIContext";

export interface ShopContextType {
  cart: CartItem[];
  wishlist: string[];
  searchQuery: string;
  selectedCategory: ProductCategory;
  toasts: ToastMessage[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isLookupOpen: boolean;
  isAuthOpen: boolean;
  currentUser: User | null;
  quickViewProduct: Product | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: ProductCategory) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsLookupOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  showToast: (
    title: string,
    description?: string,
    type?: "success" | "info" | "warning",
  ) => void;
  removeToast: (id: string) => void;
  totalCartItems: number;
  totalCartPrice: number;
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <UIProvider>{children}</UIProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export const useShop = (): ShopContextType => {
  const toast = useToast();
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();

  const login = async (data: LoginRequest): Promise<void> => {
    const user = await auth.login(data);

    ui.setIsAuthOpen(false);

    try {
      await cart.syncCartWithServer();
      toast.showToast(
        "Đăng nhập thành công!",
        `Chào mừng ${user.fullName}. Giỏ hàng đã đồng bộ.`,
        "success",
      );
    } catch {
      toast.showToast(
        "Đăng nhập thành công!",
        `Chào mừng ${user.fullName}`,
        "success",
      );
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    const user = await auth.register(data);

    ui.setIsAuthOpen(false);

    try {
      await cart.syncCartWithServer();
      toast.showToast(
        "Đăng ký thành công!",
        `Tài khoản ${user.email} đã được kích hoạt.`,
        "success",
      );
    } catch {
      toast.showToast(
        "Đăng ký thành công!",
        `Chào mừng ${user.fullName}`,
        "success",
      );
    }
  };

  const logout = (): void => {
    auth.logout();
    cart.clearCart();
  };

  return {
    cart: cart.cart,
    wishlist: wishlist.wishlist,
    searchQuery: ui.searchQuery,
    selectedCategory: ui.selectedCategory,
    toasts: toast.toasts,
    isCartOpen: ui.isCartOpen,
    isCheckoutOpen: ui.isCheckoutOpen,
    isLookupOpen: ui.isLookupOpen,
    isAuthOpen: ui.isAuthOpen,
    currentUser: auth.currentUser,
    quickViewProduct: ui.quickViewProduct,
    addToCart: cart.addToCart,
    removeFromCart: cart.removeFromCart,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
    toggleWishlist: wishlist.toggleWishlist,
    isInWishlist: wishlist.isInWishlist,
    setSearchQuery: ui.setSearchQuery,
    setSelectedCategory: ui.setSelectedCategory,
    setIsCartOpen: ui.setIsCartOpen,
    setIsCheckoutOpen: ui.setIsCheckoutOpen,
    setIsLookupOpen: ui.setIsLookupOpen,
    setIsAuthOpen: ui.setIsAuthOpen,
    setQuickViewProduct: ui.setQuickViewProduct,
    login,
    register,
    logout,
    showToast: toast.showToast,
    removeToast: toast.removeToast,
    totalCartItems: cart.totalCartItems,
    totalCartPrice: cart.totalCartPrice,
  };
};
