"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";

export default function ReviewForm({ bookingId, onDone }: { bookingId: number; onDone: () => void }) {
  const { show } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { show("Please pick a star rating", "error"); return; }
    setSubmitting(true);
    try {
      await api.createReview(bookingId, { rating, comment });
      show("Review submitted!", "success");
      setRating(0); setComment("");
      onDone();
    } catch (err) {
      show((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
      <h4 className="mb-3 text-sm font-semibold">Write a review</h4>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star className={cn("h-6 w-6 transition", (hover || rating) >= n ? "fill-rose-500 stroke-rose-500" : "stroke-neutral-300 dark:stroke-neutral-600")} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        required
        placeholder="Share your experience…"
        className="mb-3 w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}