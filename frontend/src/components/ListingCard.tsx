"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Listing, api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [idx, setIdx] = useState(0);
  const [wished, setWished] = useState(listing.is_wishlisted);
  const [pop, setPop] = useState(false);
  const { user } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

  const photos = listing.photos.length ? listing.photos : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"];

  async function toggleWish(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      show("Please log in to save to wishlist", "info");
      router.push("/login");
      return;
    }
    try {
      if (wished) {
        await api.removeWishlist(listing.id);
        setWished(false);
        show("Removed from wishlist", "info");
      } else {
        await api.addWishlist(listing.id);
        setWished(true);
        setPop(true);
        setTimeout(() => setPop(false), 300);
        show("Saved to wishlist", "success");
      }
    } catch (err) {
      show((err as Error).message, "error");
    }
  }

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  }
  function next(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <Link href={`/listings/${listing.id}`} className="group flex flex-col gap-2">
      <div
        className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (dx > 40) prev(e as unknown as React.MouseEvent);
          if (dx < -40) next(e as unknown as React.MouseEvent);
          touchStartX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[idx]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-1.5 shadow-md opacity-0 transition group-hover:opacity-100 hover:scale-110 md:flex"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-1.5 shadow-md opacity-0 transition group-hover:opacity-100 hover:scale-110 md:flex"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-white transition",
                    i === idx ? "opacity-100" : "opacity-50",
                  )}
                />
              ))}
            </div>
          </>
        )}
        <button
          onClick={toggleWish}
          className="absolute right-3 top-3 transition hover:scale-110"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={cn(
              "h-7 w-7 stroke-white drop-shadow-md",
              pop && "heart-pop",
              wished ? "fill-rose-500 stroke-rose-500" : "fill-black/20",
            )}
          />
        </button>
        {listing.host.is_superhost && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-md">
            Superhost
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 text-sm">
        <p className="truncate font-semibold">{listing.city}, {listing.country}</p>
        {listing.rating_count > 0 && (
          <span className="flex shrink-0 items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current" />
            {listing.rating_avg.toFixed(2)}
          </span>
        )}
      </div>
      <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{listing.title}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{listing.property_type}</p>
      <p className="text-sm">
        <span className="font-semibold">{formatPrice(listing.price_per_night)}</span> night
      </p>
    </Link>
  );
}