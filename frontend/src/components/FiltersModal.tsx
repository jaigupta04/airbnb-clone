"use client";

import { useState, useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { PROPERTY_TYPES, ROOM_TYPES, cn } from "@/lib/utils";

export interface Filters {
  min_price?: number;
  max_price?: number;
  property_type?: string;
  room_type?: string;
  guests?: number;
  amenities?: string;
}

export default function FiltersButton({
  filters,
  onApply,
}: {
  filters: Filters;
  onApply: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState<string>(filters.min_price?.toString() || "");
  const [max, setMax] = useState<string>(filters.max_price?.toString() || "");
  const [ptype, setPtype] = useState<string>(filters.property_type || "");
  const [rtype, setRtype] = useState<string>(filters.room_type || "");
  const [guests, setGuests] = useState<string>(filters.guests?.toString() || "");
  const [amen, setAmen] = useState<string[]>(filters.amenities ? filters.amenities.split(",") : []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function apply() {
    onApply({
      min_price: min ? Number(min) : undefined,
      max_price: max ? Number(max) : undefined,
      property_type: ptype || undefined,
      room_type: rtype || undefined,
      guests: guests ? Number(guests) : undefined,
      amenities: amen.length ? amen.join(",") : undefined,
    });
    setOpen(false);
  }

  function clear() {
    setMin(""); setMax(""); setPtype(""); setRtype(""); setGuests(""); setAmen([]);
    onApply({});
    setOpen(false);
  }

  const amenityList = [
    "Wifi", "Kitchen", "Free parking", "Pool", "Hot tub", "Air conditioning",
    "Washer", "TV", "Fireplace", "Gym", "Breakfast", "Workspace",
    "Beach access", "Mountain view", "Garden", "BBQ grill", "Heating", "EV charger",
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition hover:shadow-md",
          "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 md:items-center" onClick={() => setOpen(false)}>
          <div
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 md:max-w-lg md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-7">
              <div>
                <h3 className="mb-3 text-base font-semibold">Price range</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    type="number" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold">Property type</h3>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPtype(ptype === p ? "" : p)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm transition",
                        ptype === p
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold">Room type</h3>
                <div className="flex flex-wrap gap-2">
                  {ROOM_TYPES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRtype(rtype === r ? "" : r)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm transition",
                        rtype === r
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold">Guests</h3>
                <input
                  type="number" min={1} placeholder="Number of guests" value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenityList.map((a) => {
                    const sel = amen.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => setAmen((prev) => (sel ? prev.filter((x) => x !== a) : [...prev, a]))}
                        className={cn(
                          "rounded-full border px-3.5 py-2 text-sm transition",
                          sel
                            ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                            : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700",
                        )}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t border-neutral-100 bg-white pt-4 dark:border-neutral-800 dark:bg-neutral-900">
              <button onClick={clear} className="text-sm font-semibold underline">
                Clear all
              </button>
              <button
                onClick={apply}
                className="rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}