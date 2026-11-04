import React, { createContext, useContext, useState, useEffect } from "react";

import {
  Product,
  ProductCategory,
  CartItem,
  ToastMessage,
  User,
  LoginRequest,
  RegisterRequest,
} from "@/types";
import { PRODUCTS } from "@/data/mockData";
import {
  getAuthToken,
  setAuthToken,
  loginApi,
  registerApi,
  fetchCurrentUser,
  fetchServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
  syncServerCart,
} from "@/services/api";

interface ShopContextType {
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
  toggleWishlist: (productId: string) => void;
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

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load initial cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("homenest_cart");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load initial wishlist from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("homenest_wishlist");

      return saved ? JSON.parse(saved) : ["prod-1", "prod-2"];
    } catch {
      return ["prod-1", "prod-2"];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("all");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  // Check auth and sync cart on initial mount
  useEffect(() => {
    const token = getAuthToken();

    if (token) {
      fetchCurrentUser()
        .then((user) => {
          setCurrentUser(user);
          // fetch and sync server cart
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
        })
        .catch(() => {
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
  }, []);

  // Sync cart to localStorage (for offline/guest resilience)
  useEffect(() => {
    try {
      localStorage.setItem("homenest_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("homenest_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const showToast = (
    title: string,
    description?: string,
    type: "success" | "info" | "warning" = "success",
  ) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, title, description, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1) => {
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
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);

    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (currentUser) {
      removeServerCartItem(productId).catch(console.error);
    }
    if (item) {
      showToast("Đã xóa khỏi giỏ hàng", item.product.name, "info");
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
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
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser) {
      clearServerCart().catch(console.error);
    }
    showToast("Đã làm trống giỏ hàng", undefined, "info");
  };

  const login = async (data: LoginRequest) => {
    const res = await loginApi(data);

    setCurrentUser(res.user);
    setIsAuthOpen(false);

    // Merge guest cart items into user's persistent cart
    try {
      const guestItems = cart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));
      const synced = await syncServerCart(guestItems);

      if (synced && synced.items) {
        setCart(
          synced.items.map((it) => ({
            product: it.product,
            quantity: it.quantity,
          })),
        );
      }
      showToast(
        "Đăng nhập thành công!",
        `Chào mừng ${res.user.fullName}. Giỏ hàng đã đồng bộ.`,
        "success",
      );
    } catch {
      showToast(
        "Đăng nhập thành công!",
        `Chào mừng ${res.user.fullName}`,
        "success",
      );
    }
  };

  const register = async (data: RegisterRequest) => {
    const res = await registerApi(data);

    setCurrentUser(res.user);
    setIsAuthOpen(false);

    // Merge guest cart items
    try {
      const guestItems = cart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));
      const synced = await syncServerCart(guestItems);

      if (synced && synced.items) {
        setCart(
          synced.items.map((it) => ({
            product: it.product,
            quantity: it.quantity,
          })),
        );
      }
      showToast(
        "Đăng ký thành công!",
        `Tài khoản ${res.user.email} đã được kích hoạt.`,
        "success",
      );
    } catch {
      showToast(
        "Đăng ký thành công!",
        `Chào mừng ${res.user.fullName}`,
        "success",
      );
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setCart([]);
    showToast("Đã đăng xuất", "Hẹn gặp lại bạn!", "info");
  };

  const toggleWishlist = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    const isFav = wishlist.includes(productId);

    if (isFav) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast(
        "Đã xóa khỏi yêu thích",
        product ? product.name : undefined,
        "info",
      );
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast(
        "Đã lưu vào danh sách yêu thích",
        product ? product.name : undefined,
        "success",
      );
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        searchQuery,
        selectedCategory,
        toasts,
        isCartOpen,
        isCheckoutOpen,
        isLookupOpen,
        isAuthOpen,
        currentUser,
        quickViewProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        setSearchQuery,
        setSelectedCategory,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsLookupOpen,
        setIsAuthOpen,
        setQuickViewProduct,
        login,
        register,
        logout,
        showToast,
        removeToast,
        totalCartItems,
        totalCartPrice,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }

  return context;
};
