"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Listing, HostBooking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export default function HostPage() {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "bookings">("listings");

  useEffect(() => {
    if (!mounted) return;
    if (user === null) {
      router.push("/login?redirect=/host");
      return;
    }
    if (user && !user.is_host) {
      show("You need a host account to access this page", "info");
    }
    refresh();
  }, [user, router, show, mounted]);

  function refresh() {
    setLoading(true);
    Promise.all([api.hostListings(), api.hostBookings()])
      .then(([l, b]) => { setListings(l); setBookings(b); })
      .catch((e) => show(e.message, "error"))
      .finally(() => setLoading(false));
  }

  async function del(id: number) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api.deleteListing(id);
      show("Listing deleted", "info");
      refresh();
    } catch (e) { show((e as Error).message, "error"); }
  }

  if (!mounted || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Host dashboard</h1>
        <button onClick={() => router.push("/host/new")} className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
          <Plus className="h-4 w-4" /> New listing
        </button>
      </div>

      <div className="mb-6 flex gap-1 border-b border-neutral-100 dark:border-neutral-800">
        <TabBtn id="listings" active={tab} onClick={setTab}>My listings ({listings.length})</TabBtn>
        <TabBtn id="bookings" active={tab} onClick={setTab}>Bookings ({bookings.length})</TabBtn>
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : tab === "listings" ? (
        listings.length === 0 ? (
          <EmptyState title="No listings yet" desc="Create your first listing to start hosting." action="Create listing" onClick={() => router.push("/host/new")} />
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-700">
                <button onClick={() => router.push(`/listings/${l.id}`)} className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={(l.photos[0] as string) || undefined} alt={l.title} className="h-full w-full object-cover" />
                </button>
                <div className="flex-1">
                  <button onClick={() => router.push(`/listings/${l.id}`)} className="text-left">
                    <p className="font-semibold hover:underline">{l.title}</p>
                    <p className="text-sm text-neutral-500">{l.city}, {l.country} · {l.property_type}</p>
                  </button>
                  <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-semibold">{formatPrice(l.price_per_night)}</span> / night
                    {l.rating_count > 0 && <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-current" /> {l.rating_avg.toFixed(2)}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => router.push(`/host/${l.id}/edit`)} className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(l.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings yet" desc="When guests book your places, their trips will show up here." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 sm:flex dark:bg-neutral-700">
                {b.guest_avatar && <img src={b.guest_avatar} alt={b.guest_name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{b.listing_title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.nights} nights
                </p>
                <p className="text-sm font-medium">{formatPrice(b.total)} · {b.guests} guests</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium",
                b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                b.status === "cancelled" ? "bg-red-100 text-red-700" :
                "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300")}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ id, active, onClick, children }: { id: "listings" | "bookings"; active: string; onClick: (t: "listings" | "bookings") => void; children: React.ReactNode }) {
  return (
    <button onClick={() => onClick(id)} className={cn("border-b-2 px-4 py-2.5 text-sm font-medium transition", active === id ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-800")}>
      {children}
    </button>
  );
}

function EmptyState({ title, desc, action, onClick }: { title: string; desc: string; action?: string; onClick?: () => void }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-neutral-700">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mb-4 text-neutral-500">{desc}</p>
      {action && onClick && <button onClick={onClick} className="rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white hover:bg-rose-600">{action}</button>}
    </div>
  );
}