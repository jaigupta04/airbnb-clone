import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function nightsLabel(n: number): string {
  return n === 1 ? "1 night" : `${n} nights`;
}

export const DEFAULT_AMENITIES = [
  "Wifi", "Kitchen", "Free parking", "Pool", "Hot tub", "Air conditioning",
  "Washer", "Dryer", "TV", "Fireplace", "Gym", "Breakfast", "Workspace",
  "Beach access", "Mountain view", "Garden", "Patio", "BBQ grill", "Heating", "EV charger",
];

export const PROPERTY_TYPES = [
  "Apartment", "House", "Villa", "Cabin", "Loft", "Cottage",
  "Bungalow", "Chalet", "Tiny home", "Treehouse", "Boat", "Castle",
  "Igloo", "Farm stay", "Boutique hotel room", "Campervan",
];

export const ROOM_TYPES = ["Entire place", "Private room", "Shared room"];