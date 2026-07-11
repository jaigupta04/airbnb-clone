"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Category } from "@/lib/api";
import ListingForm from "@/components/ListingForm";
import { useAuth } from "@/contexts/AuthContext";

export default function NewListingPage() {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    if (!mounted) return;
    if (user === null) router.push("/login?redirect=/host/new");
    if (user && !user.is_host) {
      router.push("/host");
    }
    api.categories().then(setCats).catch(() => {});
  }, [user, router, mounted]);

  if (!mounted || !user) return null;

  return <ListingForm existing={null} categories={cats} />;
}