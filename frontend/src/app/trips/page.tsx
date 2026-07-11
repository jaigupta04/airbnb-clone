"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, Star } from "lucide-react";
import { api, Booking, Listing, Review } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ReviewForm from "@/components/ReviewForm";
import { formatPrice, formatDate, shortDate, nightsLabel } from "@/lib/utils";

export default function TripsPage() {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [trips, setTrips] = useState<(Booking & { listing: Listing })[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    if (user === null) {
      router.push("/login?redirect=/trips");
      return;
    }
    api.myTrips()
      .then(setTrips)
      .catch((e) => show(e.message, "error"))
      .finally(() => setLoading(false));
  }, [user, router, show, refreshKey, mounted]);

  async function cancel(id: number) {
    try {
      await api.cancelBooking(id);
      show("Booking cancelled", "info");
      setRefreshKey((k) => k + 1);
    } catch (e) { show((e as Error).message, "error"); }
  }

  if (!mounted || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <h1 className="mb-6 text-2xl font-semibold">My trips</h1>
      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-neutral-700">
          <p className="text-lg font-semibold">No trips yet</p>
          <p className="mb-4 text-neutral-500">Time to dust off your bags and start planning your next adventure.</p>
          <button onClick={() => router.push("/")} className="rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white hover:bg-rose-600">
            Start searching
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {trips.map((t) => {
            const canReview = t.status === "completed" && new Date(t.check_out) < new Date();
            return (
              <div key={t.id} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button onClick={() => router.push(`/listings/${t.listing_id}`)} className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-neutral-200 sm:w-48 dark:bg-neutral-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.listing.photos[0]} alt={t.listing.title} className="h-full w-full object-cover" />
                  </button>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <button onClick={() => router.push(`/listings/${t.listing_id}`)} className="text-left">
                        <p className="font-semibold hover:underline">{t.listing.title}</p>
                        <p className="text-sm text-neutral-500">{t.listing.city}, {t.listing.country}</p>
                      </button>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${t.status === "confirmed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : t.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <p><strong>Check in:</strong> {formatDate(t.check_in)}</p>
                      <p><strong>Check out:</strong> {formatDate(t.check_out)}</p>
                      <p>{nightsLabel(t.nights)} · {t.guests} {t.guests === 1 ? "guest" : "guests"} · Total {formatPrice(t.total)}</p>
                    </div>
                    <div className="mt-3 flex gap-3">
                      {t.status !== "cancelled" && (
                        <button onClick={() => cancel(t.id)} className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                          <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                      {canReview && (
                        <button onClick={() => setReviewing(reviewing === t.id ? null : t.id)} className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                          <Star className="mr-1 inline h-3.5 w-3.5" /> {reviewing === t.id ? "Hide review" : "Leave a review"}
                        </button>
                      )}
                    </div>
                    {reviewing === t.id && (
                      <div className="mt-4">
                        <ReviewForm bookingId={t.id} onDone={() => { setReviewing(null); setRefreshKey((k) => k + 1); }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}