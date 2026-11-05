/**
 * Main API barrel/facade exporting all specialized domain services.
 * Maintains 100% backward compatibility with existing imports.
 */

export * from "@/services/tokenStorage";
export * from "@/services/httpClient";
export * from "@/services/catalogApi";
export * from "@/services/promoApi";
export * from "@/services/contentApi";
export * from "@/services/orderApi";
export * from "@/services/authApi";
export * from "@/services/cartApi";
