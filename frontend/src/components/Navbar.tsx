import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Ticket,
  Crown,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar: React.FC = () => {
  const {
    totalCartItems,
    wishlist,
    setIsCartOpen,
    setIsLookupOpen,
    setIsAdminOrdersOpen,
    setIsAdminProductsOpen,
    setIsAdminPromotionsOpen,
    setIsVoucherWalletOpen,
    setIsAuthOpen,
    currentUser,
    logout,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useShop();

  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Trang chủ", href: "#hero" },
    { label: "Danh mục", href: "#categories" },
    { label: "Sản phẩm", href: "#products" },
    { label: "Khuyến mãi", href: "#promotions" },
    { label: "Về chúng tôi", href: "#about" },
  ];

  const scrollToOrNavigate = (href: string) => {
    if (location.pathname !== "/") {
      navigate(href === "#hero" ? "/" : `/${href}`);
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else if (href === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    scrollToOrNavigate(href);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      if (location.pathname !== "/") {
        navigate("/#products");
      } else {
        const prodSection = document.getElementById("products");
        if (prodSection && window.scrollY < 400) {
          prodSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800"
          : "bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Brand */}
          <a
            className="flex items-center gap-2.5 group shrink-0"
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                HomeNest
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-1">
                Gia Dụng Thông Minh
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Search bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner"
              placeholder="Tìm nồi chiên, robot hút bụi..."
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Icons & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <ThemeSwitch />

            {/* Voucher Wallet & VIP Club Trigger */}
            <button
              aria-label="Kho Voucher & Hội viên VIP"
              title="Kho Voucher & Hội viên VIP"
              className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => setIsVoucherWalletOpen(true)}
            >
              <Ticket className="w-5 h-5" />
              {currentUser?.vipActive && (
                <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 text-[9px] font-black bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-sm">
                  VIP
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              aria-label="Danh sách yêu thích"
              className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                scrollToOrNavigate("#products");
                showToast(
                  "Yêu thích",
                  `Bạn có ${wishlist.length} sản phẩm đã lưu`,
                  "info",
                );
              }}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center animate-in zoom-in">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              aria-label="Giỏ hàng"
              className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-emerald-600 text-white rounded-full flex items-center justify-center animate-in zoom-in">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div className="relative hidden sm:block">
              <button
                aria-label="Tài khoản người dùng"
                className="flex items-center gap-1 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {currentUser ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {currentUser.fullName
                      ? currentUser.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {currentUser
                          ? currentUser.fullName
                          : "Xin chào, Quý khách!"}
                      </p>
                      {currentUser?.vipActive && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black shrink-0">
                          <Crown className="w-2.5 h-2.5" />
                          {currentUser.vipTier === "VIP_YEARLY"
                            ? "VIP -8%"
                            : "VIP -5%"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser ? currentUser.email : "Thành viên HomeNest"}
                    </p>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsVoucherWalletOpen(true);
                    }}
                  >
                    <span>Kho Voucher & Thẻ VIP</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      Mở kho
                    </span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLookupOpen(true);
                    }}
                  >
                    <span>
                      {currentUser ? "Đơn hàng của tôi" : "Tra cứu đơn hàng"}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {currentUser ? "Xem đơn" : "Tra cứu"}
                    </span>
                  </button>
                  {currentUser?.role === "ROLE_ADMIN" && (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center justify-between"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAdminProductsOpen(true);
                        }}
                      >
                        <span>Quản trị sản phẩm & kho</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          ADMIN
                        </span>
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-xs text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center justify-between"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAdminOrdersOpen(true);
                        }}
                      >
                        <span>Quản trị đơn hàng</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                          ADMIN
                        </span>
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-xs text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center justify-between"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAdminPromotionsOpen(true);
                        }}
                      >
                        <span>Quản trị Voucher & Sự kiện</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                          ADMIN
                        </span>
                      </button>
                    </>
                  )}
                  <a
                    className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    href="#promotions"
                    onClick={(e) => {
                      setIsUserMenuOpen(false);
                      handleNavClick(e, "#promotions");
                    }}
                  >
                    Voucher & Ưu đãi
                  </a>
                  {currentUser ? (
                    <button
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 border-t border-slate-100 dark:border-slate-700 mt-1"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                    >
                      Đăng xuất
                    </button>
                  ) : (
                    <button
                      className="w-full text-left px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 border-t border-slate-100 dark:border-slate-700 mt-1"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsAuthOpen(true);
                      }}
                    >
                      Đăng nhập / Đăng ký
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CTA "Mua sắm ngay" */}
            <div className="hidden sm:block">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-full cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                onPress={() => scrollToOrNavigate("#products")}
              >
                Mua sắm ngay
              </Button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
              placeholder="Tìm sản phẩm gia dụng..."
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="text-base font-medium text-slate-800 dark:text-slate-100 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {currentUser.fullName}
                  </p>
                  <p className="text-slate-400">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-rose-500 font-semibold hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Button
                className="w-full bg-slate-900 dark:bg-slate-700 text-white font-medium py-2.5 rounded-xl cursor-pointer"
                onPress={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
              >
                Đăng nhập / Đăng ký
              </Button>
            )}
            {currentUser?.role === "ROLE_ADMIN" && (
              <>
                <Button
                  variant="outline"
                  className="w-full text-emerald-700 dark:text-emerald-300 border-emerald-300 font-semibold py-2.5 rounded-xl cursor-pointer"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    setIsAdminProductsOpen(true);
                  }}
                >
                  Quản trị sản phẩm & kho (Admin)
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-amber-700 dark:text-amber-300 border-amber-300 font-semibold py-2.5 rounded-xl cursor-pointer"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    setIsAdminOrdersOpen(true);
                  }}
                >
                  Quản trị đơn hàng (Admin)
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-rose-700 dark:text-rose-300 border-rose-300 font-semibold py-2.5 rounded-xl cursor-pointer"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    setIsAdminPromotionsOpen(true);
                  }}
                >
                  Quản trị Voucher & Sự kiện (Admin)
                </Button>
              </>
            )}
            <Button
              variant="outline"
              className="w-full text-amber-700 dark:text-amber-300 border-amber-300 font-semibold py-2.5 rounded-xl cursor-pointer"
              onPress={() => {
                setIsMobileMenuOpen(false);
                setIsVoucherWalletOpen(true);
              }}
            >
              Kho Voucher & Hội viên VIP
            </Button>
            <Button
              variant="outline"
              className="w-full text-slate-700 dark:text-slate-200 font-medium py-2.5 rounded-xl cursor-pointer"
              onPress={() => {
                setIsMobileMenuOpen(false);
                setIsLookupOpen(true);
              }}
            >
              {currentUser ? "Đơn hàng của tôi & Tra cứu" : "Tra cứu đơn hàng"}
            </Button>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl cursor-pointer"
              onPress={() => {
                setIsMobileMenuOpen(false);
                scrollToOrNavigate("#products");
              }}
            >
              Mua sắm ngay
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
