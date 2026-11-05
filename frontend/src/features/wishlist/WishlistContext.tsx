import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { useToast } from "@/context/ToastContext";

export interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showToast } = useToast();

  // Load initial wishlist from localStorage (empty array default, removing mock data dependency)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("homenest_wishlist");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("homenest_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const toggleWishlist = useCallback(
    (productId: string, productName?: string) => {
      const isFav = wishlist.includes(productId);

      if (isFav) {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        showToast(
          "Đã xóa khỏi yêu thích",
          productName || undefined,
          "info",
        );
      } else {
        setWishlist((prev) => [...prev, productId]);
        showToast(
          "Đã lưu vào danh sách yêu thích",
          productName || undefined,
          "success",
        );
      }
    },
    [wishlist, showToast],
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
};

