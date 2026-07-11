"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  unavailable: string[];
  checkIn: string | null;
  checkOut: string | null;
  onCheckIn: (d: string | null) => void;
  onCheckOut: (d: string | null) => void;
  minDate?: string;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DateRangePicker({
  unavailable, checkIn, checkOut, onCheckIn, onCheckOut, minDate,
}: Props) {
  const today = useMemo(() => new Date(minDate || iso(new Date())), [minDate]);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [month2, setMonth2] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 1));

  const blocked = useMemo(() => new Set(unavailable), [unavailable]);
  const checkInD = checkIn ? new Date(checkIn + "T00:00:00") : null;
  const checkOutD = checkOut ? new Date(checkOut + "T00:00:00") : null;

  function selectDate(date: Date) {
    const ds = iso(date);
    if (blocked.has(ds)) return;
    if (iso(today) > ds) return;

    if (!checkIn || (checkIn && checkOut)) {
      onCheckIn(ds);
      onCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (new Date(checkIn + "T00:00:00") >= date) {
        onCheckIn(ds);
        onCheckOut(null);
      } else {
        // ensure no blocked dates in range
        let ok = true;
        let cur = new Date(checkIn + "T00:00:00");
        cur.setDate(cur.getDate() + 1);
        while (cur < date) {
          if (blocked.has(iso(cur))) { ok = false; break; }
          cur.setDate(cur.getDate() + 1);
        }
        if (ok) onCheckOut(ds);
      }
    }
  }

  function prevMonth() {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    if (d.getFullYear() < today.getFullYear() || (d.getFullYear() === today.getFullYear() && d.getMonth() < today.getMonth())) return;
setViewMonth(d);
    setMonth2(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function nextMonth() {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    setViewMonth(d);
    setMonth2(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <MonthGrid
        month={viewMonth}
        blocked={blocked}
        today={today}
        checkIn={checkInD}
        checkOut={checkOutD}
        onSelect={selectDate}
        prevBtn={<button onClick={prevMonth} className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"><ChevronLeft className="h-5 w-5" /></button>}
        nextBtn={<button onClick={nextMonth} className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"><ChevronRight className="h-5 w-5" /></button>}
      />
      <MonthGrid
        month={month2}
        blocked={blocked}
        today={today}
        checkIn={checkInD}
        checkOut={checkOutD}
        onSelect={selectDate}
        prevBtn={<button onClick={prevMonth} className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"><ChevronLeft className="h-5 w-5" /></button>}
        nextBtn={<button onClick={nextMonth} className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"><ChevronRight className="h-5 w-5" /></button>}
      />
    </div>
  );
}

function MonthGrid({
  month, blocked, today, checkIn, checkOut, onSelect, prevBtn, nextBtn,
}: {
  month: Date;
  blocked: Set<string>;
  today: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  onSelect: (d: Date) => void;
  prevBtn: React.ReactNode;
  nextBtn: React.ReactNode;
}) {
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  function inRange(date: Date): boolean {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  }

  const isStart = (date: Date) => checkIn && iso(date) === iso(checkIn);
  const isEnd = (date: Date) => checkOut && iso(date) === iso(checkOut);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{monthName}</span>
        <div className="flex gap-1">
          {prevBtn}
          {nextBtn}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-neutral-500">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span key={d} className="py-1 font-medium">{d}</span>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <span key={`o${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const ds = iso(date);
          const unavailable = blocked.has(ds) || iso(today) > ds;
          const start = isStart(date);
          const end = isEnd(date);
          const range = inRange(date);
          return (
            <button
              key={ds}
              disabled={unavailable}
              onClick={() => onSelect(date)}
              className={cn(
                "relative h-10 rounded-full text-sm transition",
                unavailable && "cursor-not-allowed text-neutral-300 line-through dark:text-neutral-700",
                !unavailable && !start && !end && !range && "hover:border hover:border-neutral-900 dark:hover:border-neutral-300",
                (start || end) && "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
                range && "bg-neutral-200 dark:bg-neutral-700",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}