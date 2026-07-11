"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronLeft, ChevronRight, Heart, MapPin, Share, Users, KeyRound } from "lucide-react";
import { api, Listing, Review, PriceBreakdown } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import DateRangePicker from "@/components/DateRangePicker";
import { cn, formatPrice, nightsLabel } from "@/lib/utils";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listingId = Number(id);
  const router = useRouter();
  const { user } = useAuth();
  const { show } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [showLightbox, setShowLightbox] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [price, setPrice] = useState<PriceBreakdown | null>(null);
  const [booking, setBooking] = useState(false);
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listing(listingId)
      .then((l) => { setListing(l); setWished(l.is_wishlisted); })
      .catch((e) => show(e.message, "error"))
      .finally(() => setLoading(false));
    api.listingReviews(listingId).then(setReviews).catch(() => {});
    api.availability(listingId).then((a) => setUnavailable(a.unavailable)).catch(() => {});
  }, [listingId, show]);

  useEffect(() => {
    if (checkIn && checkOut) {
      api.priceBreakdown(listingId, checkIn, checkOut).then(setPrice).catch(() => setPrice(null));
    } else {
      setPrice(null);
    }
  }, [checkIn, checkOut, listingId]);

  async function toggleWish() {
    if (!user) { show("Please log in to save", "info"); router.push("/login?redirect=/listings/" + listingId); return; }
    try {
      if (wished) { await api.removeWishlist(listingId); setWished(false); show("Removed from wishlist", "info"); }
      else { await api.addWishlist(listingId); setWished(true); show("Saved to wishlist", "success"); }
    } catch (e) { show((e as Error).message, "error"); }
  }

  async function reserve() {
    if (!user) { show("Please log in to book", "info"); router.push("/login?redirect=/listings/" + listingId); return; }
    if (!checkIn || !checkOut) { show("Please select your dates", "info"); return; }
    if (guests > (listing?.max_guests || 0)) { show(`Max ${listing?.max_guests} guests`, "error"); return; }
    setBooking(true);
    try {
      const b = await api.createBooking({ listing_id: listingId, check_in: checkIn, check_out: checkOut, guests });
      show("Booking confirmed!", "success");
      router.push("/trips?booked=" + b.id);
    } catch (e) {
      show((e as Error).message, "error");
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <div className="py-24 text-center text-neutral-400">Loading…</div>;
  if (!listing) return <div className="py-24 text-center text-neutral-400">Listing not found.</div>;

  const photos = listing.photos.length ? listing.photos : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-6 lg:px-10">
      {/* Title block */}
      <div className="mb-3">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            {listing.rating_count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" /> {listing.rating_avg.toFixed(2)} · {listing.rating_count} reviews
              </span>
            )}
            <span>·</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {listing.city}, {listing.country}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm underline hover:bg-neutral-100 dark:hover:bg-neutral-800"><Share className="h-4 w-4" /> Share</button>
            <button onClick={toggleWish} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm underline hover:bg-neutral-100 dark:hover:bg-neutral-800"><Heart className={cn("h-4 w-4", wished && "fill-rose-500 stroke-rose-500")} /> {wished ? "Saved" : "Save"}</button>
          </div>
        </div>
      </div>

      {/* Photo gallery: 5-tile grid like Airbnb */}
      <div className="relative grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[0]} alt={listing.title} className="col-span-4 h-64 w-full object-cover md:col-span-2 md:row-span-2 md:h-full" />
        {photos.slice(1, 5).map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={p} alt={`${listing.title} ${i + 2}`} className={cn("hidden w-full object-cover md:block", i === 0 && "col-start-3 row-start-1", i === 1 && "col-start-4 row-start-1", i === 2 && "col-start-3 row-start-2", i === 3 && "col-start-4 row-start-2", "h-full")} />
        ))}
        {photos.length > 1 && (
          <button
            onClick={() => setShowLightbox(true)}
            className="absolute bottom-4 right-4 rounded-lg border border-neutral-800 bg-white px-3 py-1.5 text-xs font-semibold shadow-md dark:bg-neutral-900"
          >
            Show all photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && photos.length > 0 && (
        <PhotoLightbox photos={photos} title={listing.title} onClose={() => setShowLightbox(false)} />
      )}

      {/* Two column: info + booking widget */}
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="order-2 space-y-8 lg:order-1">
          {/* host + property summary */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {listing.property_type} hosted by {listing.host.name}
                </h2>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                {listing.host.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.host.avatar_url} alt={listing.host.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold">{listing.host.name.charAt(0)}</span>
                )}
              </div>
            </div>
            {listing.host.is_superhost && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                ⭐ {listing.host.name} is a Superhost
              </div>
            )}
            <div className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <p className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Self check-in with keypad</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {listing.max_guests} guests maximum</p>
            </div>
          </div>

          {/* description */}
          <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
            <p className="whitespace-pre-line text-neutral-800 dark:text-neutral-200">{listing.description}</p>
          </div>

          {/* amenities */}
          <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 text-lg font-semibold">What this place offers</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {listing.amenities.length ? (
                listing.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-3 text-sm">{amenityIcon(a)} {a}</span>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No amenities listed</p>
              )}
            </div>
          </div>

          {/* reviews */}
          <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
            <div className="mb-4 flex items-center gap-2">
              {listing.rating_count > 0 && (
                <>
                  <Star className="h-5 w-5 fill-current" />
                  <h2 className="text-lg font-semibold">
                    {listing.rating_avg.toFixed(2)} · {listing.rating_count} review{listing.rating_count === 1 ? "" : "s"}
                  </h2>
                </>
              )}
              {listing.rating_count === 0 && <h2 className="text-lg font-semibold">No reviews yet</h2>}
            </div>
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                  <div className="mb-1 flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      {r.author_avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.author_avatar} alt={r.author_name || ""} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{r.author_name}</p>
                      <p className="text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking widget */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-20 rounded-2xl border border-neutral-200 p-5 shadow-lg dark:border-neutral-700 dark:shadow-neutral-950/50">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-xl font-semibold">
                {formatPrice(listing.price_per_night)} <span className="text-base font-normal">night</span>
              </p>
              {listing.rating_count > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-current" /> {listing.rating_avg.toFixed(2)} · {listing.rating_count}
                </span>
              )}
            </div>

            <div className="mb-4 overflow-hidden rounded-xl border border-neutral-300 dark:border-neutral-700">
              <div className="grid grid-cols-2">
                <div className="border-r border-neutral-300 p-3 dark:border-neutral-700">
                  <p className="text-xs font-semibold uppercase">Check-in</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{checkIn || "Add date"}</p>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold uppercase">Checkout</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{checkOut || "Add date"}</p>
                </div>
              </div>
              <div className="border-t border-neutral-300 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase">Guests</p>
                <input
                  type="number" min={1} max={listing.max_guests} value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(listing.max_guests, Number(e.target.value))))}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <button
              onClick={reserve}
              disabled={booking || !checkIn || !checkOut}
              className="w-full rounded-xl bg-rose-500 py-3.5 text-base font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
            >
              {booking ? "Reserving…" : "Reserve"}
            </button>
            <p className="mt-3 text-center text-xs text-neutral-500">You won&apos;t be charged yet</p>

            {price ? (
              <div className="mt-5 space-y-2 text-sm">
                <Row label={`${formatPrice(listing.price_per_night)} × ${price.nights} ${price.nights === 1 ? "night" : "nights"}`} value={formatPrice(price.nightly_total)} />
                <Row label="Cleaning fee" value={formatPrice(price.cleaning_fee)} />
                <Row label="Service fee" value={formatPrice(price.service_fee)} />
                <div className="flex justify-between border-t border-neutral-200 pt-3 font-semibold dark:border-neutral-700">
                  <span>Total</span>
                  <span>{formatPrice(price.total)}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Availability calendar */}
          <div className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
            <h3 className="mb-3 text-base font-semibold">Select dates</h3>
            <DateRangePicker
              unavailable={unavailable}
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckIn={setCheckIn}
              onCheckOut={setCheckOut}
            />
            {checkIn && checkOut && (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                {nightsLabel((new Date(checkOut + "T00:00:00").getTime() - new Date(checkIn + "T00:00:00").getTime()) / 86400000)} selected
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Static map placeholder */}
      <div className="mt-12 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <h2 className="mb-4 text-lg font-semibold">Where you&apos;ll be</h2>
        <div className="relative h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-neutral-800 dark:to-neutral-900">
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 h-8 w-8" />
              <p className="font-medium">{listing.city}, {listing.country}</p>
              <p className="text-sm">{listing.lat?.toFixed(2)}, {listing.lng?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PhotoLightbox({ photos, title, onClose }: { photos: string[]; title: string; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="fixed inset-0 z-[90] bg-black/95 animate-fadein" onClick={onClose}>
      <div className="flex h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20">Close ✕</button>
        {photos.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i === 0 ? photos.length - 1 : i - 1))} className="absolute left-6 text-white hover:scale-110">
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button onClick={() => setIdx((i) => (i === photos.length - 1 ? 0 : i + 1))} className="absolute right-6 text-white hover:scale-110">
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[idx]} alt={`${title} ${idx + 1}`} className="max-h-[90vh] max-w-[90vw] object-contain" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white">
          {idx + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}

function amenityIcon(a: string): string {
  const map: Record<string, string> = {
    "Wifi": "📡", "Kitchen": "🍳", "Free parking": "🅿️", "Pool": "🏊", "Hot tub": "🛁",
    "Air conditioning": "❄️", "Washer": "🧺", "Dryer": "🌀", "TV": "📺", "Fireplace": "🔥",
    "Gym": "🏋️", "Breakfast": "🥐", "Workspace": "💼", "Beach access": "🏖️",
    "Mountain view": "⛰️", "Garden": "🌳", "Patio": "🪑", "BBQ grill": "🔥", "Heating": "🌡️", "EV charger": "🔌",
  };
  return map[a.trim()] || "✨";
}