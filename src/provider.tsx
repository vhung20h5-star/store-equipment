import React from "react";
import { ShopProvider } from "@/context/ShopContext";

export function Provider({ children }: { children: React.ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}
