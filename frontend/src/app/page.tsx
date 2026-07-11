"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { api, Listing, Category } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import CategoryBar from "@/components/CategoryBar";
import FiltersButton, { Filters } from "@/components/FiltersModal";
import { useToast } from "@/contexts/ToastContext";

const LOAD = 12;

export default function HomePage() {
  const { show } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [sort, setSort] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({});
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const doSearch = useCallback(
    (offset: number, reset: boolean) => {
      (offset === 0 ? setLoading : setLoadingMore)(true);
      setError(null);
      api
        .listings({
          city: searchCity || undefined,
          category_id: activeCat ?? undefined,
          min_price: filters.min_price,
          max_price: filters.max_price,
          property_type: filters.property_type,
          room_type: filters.room_type,
          guests: filters.guests,
          amenities: filters.amenities,
          sort: sort || undefined,
          limit: LOAD,
          offset,
        })
        .then((data) => {
          setListings((prev) => (reset ? data : [...prev, ...data]));
          setOffset(offset + data.length);
        })
        .catch((e) => {
          setError(e.message);
          show(e.message, "error");
        })
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [searchCity, activeCat, filters, sort, show],
  );

  // Refetch whenever filters/category/sort/city change
  useEffect(() => {
    doSearch(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCity, activeCat, filters, sort]);

  // Infinite scroll
  useEffect(() => {
    function onScroll() {
      if (loading || loadingMore || listings.length < LOAD) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
      if (nearBottom) doSearch(offset, false);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset, loading, loadingMore, listings.length, doSearch]);

  return (
    <div>
      <CategoryBar categories={categories} active={activeCat} onChange={setActiveCat} />

      {/* toolbar: search + sort + filters */}
      <div className="mx-auto flex max-w-[1760px] flex-wrap items-center gap-3 px-6 py-4 lg:px-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchCity(city);
          }}
          className="flex flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm focus-within:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-400 sm:max-w-xs"
        >
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-sm outline-none"
          />
          {searchCity && (
            <button type="button" onClick={() => { setCity(""); setSearchCity(""); }} aria-label="Clear search">
              <X className="h-4 w-4 text-neutral-400 hover:text-neutral-700" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="">Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
          <FiltersButton filters={filters} onApply={setFilters} />
        </div>
      </div>

      <div className="mx-auto max-w-[1760px] px-6 pb-20 lg:px-10">
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="py-24 text-center text-neutral-500">{error}</div>
        ) : listings.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lg font-semibold">No homes found</p>
            <p className="text-neutral-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
            {loadingMore && <SkeletonGrid count={4} />}
            {!loadingMore && listings.length >= LOAD && listings.length === offset && (
              <div className="py-10 text-center text-sm text-neutral-400">You&apos;ve reached the end · {listings.length} stays</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex animate-pulse flex-col gap-2">
          <div className="aspect-square rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}