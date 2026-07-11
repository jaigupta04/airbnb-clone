export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("airbnb_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("airbnb_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("airbnb_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("airbnb_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(u: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("airbnb_user", JSON.stringify(u));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("airbnb_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  // ---- auth ----
  signup: (body: { name: string; email: string; password: string; is_host?: boolean }) =>
    request<TokenResp>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<TokenResp>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<User>("/auth/me"),

  // ---- listings ----
  listings: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
    });
    return request<Listing[]>(`/listings?${q.toString()}`);
  },
  listing: (id: number) => request<Listing>(`/listings/${id}`),
  createListing: (body: ListingInput) =>
    request<Listing>("/listings", { method: "POST", body: JSON.stringify(body) }),
  updateListing: (id: number, body: Partial<ListingInput>) =>
    request<Listing>(`/listings/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteListing: (id: number) =>
    request<void>(`/listings/${id}`, { method: "DELETE" }),
  hostListings: () => request<Listing[]>("/listings/host/my"),
  availability: (id: number) => request<{ unavailable: string[] }>(`/listings/${id}/availability`),

  // ---- categories ----
  categories: () => request<Category[]>("/categories"),

  // ---- bookings ----
  priceBreakdown: (listingId: number, checkIn: string, checkOut: string) =>
    request<PriceBreakdown>(`/bookings/price?listing_id=${listingId}&check_in=${checkIn}&check_out=${checkOut}`, { method: "POST" }),
  createBooking: (body: { listing_id: number; check_in: string; check_out: string; guests: number }) =>
    request<Booking>("/bookings", { method: "POST", body: JSON.stringify(body) }),
  myTrips: () => request<(Booking & { listing: Listing })[]>("/bookings/my-trips"),
  hostBookings: () => request<HostBooking[]>("/bookings/host"),
  cancelBooking: (id: number) => request<void>(`/bookings/${id}`, { method: "DELETE" }),

  // ---- reviews ----
  listingReviews: (listingId: number) => request<Review[]>(`/reviews/listing/${listingId}`),
  createReview: (bookingId: number, body: { rating: number; comment: string }) =>
    request<Review>(`/reviews?booking_id=${bookingId}`, { method: "POST", body: JSON.stringify(body) }),

  // ---- wishlist ----
  wishlist: () => request<Listing[]>("/wishlist"),
  addWishlist: (listingId: number) =>
    request<{ ok: boolean }>(`/wishlist/${listingId}`, { method: "POST" }),
  removeWishlist: (listingId: number) =>
    request<void>(`/wishlist/${listingId}`, { method: "DELETE" }),
};

// ---- Types ----
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  is_host: boolean;
  is_superhost: boolean;
  created_at: string;
}

export interface TokenResp {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface Host {
  id: number;
  name: string;
  avatar_url: string | null;
  is_superhost: boolean;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  price_per_night: number;
  cleaning_fee: number;
  bedrooms: number;
  beds: number;
  baths: number;
  max_guests: number;
  amenities: string[];
  photos: string[];
  rating_avg: number;
  rating_count: number;
  host: Host;
  categories: Category[];
  is_wishlisted: boolean;
  created_at: string;
}

export interface ListingInput {
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  price_per_night: number;
  cleaning_fee: number;
  bedrooms: number;
  beds: number;
  baths: number;
  max_guests: number;
  amenities: string[];
  photos: string[];
  category_ids: number[];
}

export interface PriceBreakdown {
  nights: number;
  nightly_total: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_total: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
  status: string;
  created_at: string;
}

export interface HostBooking {
  id: number;
  listing_id: number;
  listing_title: string;
  guest_name: string;
  guest_avatar: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  total: number;
  guests: number;
  status: string;
}

export interface Review {
  id: number;
  listing_id: number;
  author_id: number;
  author_name: string | null;
  author_avatar: string | null;
  booking_id: number | null;
  rating: number;
  comment: string;
  created_at: string;
}

export function listingInput(l: Listing): ListingInput {
  return {
    title: l.title, description: l.description, property_type: l.property_type, room_type: l.room_type,
    city: l.city, country: l.country, lat: l.lat, lng: l.lng,
    price_per_night: l.price_per_night, cleaning_fee: l.cleaning_fee,
    bedrooms: l.bedrooms, beds: l.beds, baths: l.baths, max_guests: l.max_guests,
    amenities: l.amenities, photos: l.photos, category_ids: l.categories.map((c) => c.id),
  };
}