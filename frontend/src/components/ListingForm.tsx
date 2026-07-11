"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Listing, Category, listingInput } from "@/lib/api";
import { PROPERTY_TYPES, ROOM_TYPES, DEFAULT_AMENITIES, cn } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import { X } from "lucide-react";

const PHOTO_SUGGESTIONS = [
  "https://images.unsplash.com/photo-1564013799959-ab0169600b54?w=1200",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  "https://images.unsplash.com/photo-1512917774083-464c07219638?w=1200",
  "https://images.unsplash.com/photo-1580587771575-6d9b6b0c6ef2?w=1200",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b6ef4?w=1200",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068d8c5?w=1200",
];

export default function ListingForm({ existing, categories }: { existing: Listing | null; categories: Category[] }) {
  const { show } = useToast();
  const router = useRouter();

  const [form, setForm] = useState(() => existing ? { ...listingInput(existing) } : {
    title: "", description: "", property_type: "Apartment", room_type: "Entire place",
    city: "", country: "", lat: null, lng: null,
    price_per_night: 100, cleaning_fee: 50, bedrooms: 1, beds: 1, baths: 1, max_guests: 2,
    amenities: [], photos: [], category_ids: [],
  });

  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"basics" | "amenities" | "photos" | "pricing" | "location">("basics");

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addPhoto() {
    if (!photoUrl.trim()) return;
    set("photos", [...form.photos, photoUrl.trim()]);
    setPhotoUrl("");
  }
  function removePhoto(i: number) {
    set("photos", form.photos.filter((_, idx) => idx !== i));
  }

  function toggleAmenity(a: string) {
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);
  }
  function toggleCategory(id: number) {
    set("category_ids", form.category_ids.includes(id) ? form.category_ids.filter((x) => x !== id) : [...form.category_ids, id]);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const readers = files.map((f) => new Promise<string>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.readAsDataURL(f);
    }));
    Promise.all(readers).then((urls) => {
      setUploadPreview((p) => [...p, ...urls]);
      set("photos", [...form.photos, ...urls]);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.photos.length === 0) { show("Add at least one photo", "error"); return; }
    if (form.title.length < 5) { show("Title must be at least 5 characters", "error"); return; }
    setSaving(true);
    try {
      if (existing) {
        await api.updateListing(existing.id, form);
        show("Listing updated!", "success");
      } else {
        const created = await api.createListing(form);
        show("Listing created!", "success");
        router.push("/host");
        return;
      }
      router.push("/host");
      router.refresh();
    } catch (err) {
      show((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "basics", label: "Basics" },
    { id: "amenities", label: "Amenities" },
    { id: "photos", label: "Photos" },
    { id: "pricing", label: "Pricing" },
    { id: "location", label: "Location" },
  ] as const;

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-2 text-2xl font-semibold">{existing ? "Edit listing" : "Create a new listing"}</h1>
      <p className="mb-6 text-sm text-neutral-500">{existing ? "Update your listing details." : "Welcome, host! Let's get your place listed."}</p>

      {/* tabs */}
      <div className="scrollbar-hide mb-8 flex gap-1 overflow-x-auto border-b border-neutral-100 dark:border-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition",
              tab === t.id ? "border-rose-500 text-neutral-900 dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basics" && (
        <div className="space-y-5">
          <Input label="Title" value={form.title} onChange={(v) => set("title", v)} placeholder="Cozy cabin in the woods" />
          <TextArea label="Description" value={form.description} onChange={(v) => set("description", v)} placeholder="Describe what makes your place special…" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Property type" value={form.property_type} onChange={(v) => set("property_type", v)} options={PROPERTY_TYPES} />
            <Select label="Room type" value={form.room_type} onChange={(v) => set("room_type", v)} options={ROOM_TYPES} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Num label="Bedrooms" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} />
            <Num label="Beds" value={form.beds} onChange={(v) => set("beds", v)} />
            <Num label="Baths" value={form.baths} onChange={(v) => set("baths", v)} />
            <Num label="Max guests" value={form.max_guests} onChange={(v) => set("max_guests", v)} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const sel = form.category_ids.includes(c.id);
                return (
                  <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                    className={cn("rounded-full border px-3 py-1.5 text-xs transition",
                      sel ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700")}>
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "amenities" && (
        <div>
          <p className="mb-4 text-sm text-neutral-500">Choose amenities available at your place.</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_AMENITIES.map((a) => {
              const sel = form.amenities.includes(a);
              return (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={cn("rounded-full border px-4 py-2 text-sm transition",
                    sel ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700")}>
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div>
          <p className="mb-3 text-sm text-neutral-500">Add photos by URL or upload from your device (stored as data URLs).</p>
          <div className="mb-4 flex gap-2">
            <input
              type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://image-url.jpg"
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800"
            />
            <button type="button" onClick={addPhoto} className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Add</button>
          </div>
          <label className="mb-4 block cursor-pointer rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 hover:border-neutral-900 dark:border-neutral-700">
            <input type="file" accept="image/*" multiple onChange={onFile} className="hidden" />
            📷 Click to upload image(s)
          </label>

          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.photos.map((p, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow-md hover:bg-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
            <p className="mb-2 font-medium">Suggested stock photos:</p>
            <div className="flex flex-wrap gap-2">
              {PHOTO_SUGGESTIONS.map((p) => (
                <button key={p} type="button" onClick={() => set("photos", [...form.photos, p])}
                  className="overflow-hidden rounded-lg border border-neutral-200 hover:ring-2 hover:ring-rose-400 dark:border-neutral-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="Suggested" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "pricing" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Num label="Price per night ($)" value={form.price_per_night} onChange={(v) => set("price_per_night", v)} />
          <Num label="Cleaning fee ($)" value={form.cleaning_fee} onChange={(v) => set("cleaning_fee", v)} />
        </div>
      )}

      {tab === "location" && (
        <div className="space-y-5">
          <Input label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Lake Tahoe" />
          <Input label="Country" value={form.country} onChange={(v) => set("country", v)} placeholder="United States" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Num label="Latitude" value={form.lat ?? 0} onChange={(v) => set("lat", v)} allowDecimal />
            <Num label="Longitude" value={form.lng ?? 0} onChange={(v) => set("lng", v)} allowDecimal />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <button type="button" onClick={() => router.push("/host")} className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
          {saving ? "Saving…" : existing ? "Save changes" : "Create listing"}
        </button>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800" />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Num({ label, value, onChange, allowDecimal }: { label: string; value: number; onChange: (v: number) => void; allowDecimal?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input type="number" value={value} step={allowDecimal ? "any" : "1"}
        onChange={(e) => onChange(allowDecimal ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800" />
    </label>
  );
}