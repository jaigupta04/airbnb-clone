"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api, Category, Listing } from "@/lib/api";
import ListingForm from "@/components/ListingForm";
import { useAuth } from "@/contexts/AuthContext";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listingId = Number(id);
  const { user, mounted } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    if (!mounted) return;
    if (user === null) router.push(`/login?redirect=/host/${listingId}/edit`);
    api.listing(listingId).then(setListing).catch(() => router.push("/host"));
    api.categories().then(setCats).catch(() => {});
  }, [listingId, user, router, mounted]);

  if (!mounted || !user || !listing) return <div className="py-24 text-center text-neutral-400">Loading…</div>;

  if (listing.host.id !== user.id) {
    return <div className="py-24 text-center text-neutral-400">You don&apos;t have access to edit this listing.</div>;
  }

  return <ListingForm existing={listing} categories={cats} />;
}