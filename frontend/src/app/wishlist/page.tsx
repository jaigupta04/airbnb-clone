"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Listing } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ListingCard from "@/components/ListingCard";

export default function WishlistPage() {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;
    if (user === null) {
      router.push("/login?redirect=/wishlist");
      return;
    }
    api.wishlist()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router, mounted]);

  if (!mounted || !user) return null;

  return (
    <div className="mx-auto max-w-[1760px] px-6 py-10 lg:px-10">
      <h1 className="mb-6 text-2xl font-semibold">Your wishlist</h1>
      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-neutral-700">
          <p className="text-lg font-semibold">No saved homes yet</p>
          <p className="mb-4 text-neutral-500">Tap the heart icon on any home to save it here.</p>
          <button onClick={() => router.push("/")} className="rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white hover:bg-rose-600">
            Explore homes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}