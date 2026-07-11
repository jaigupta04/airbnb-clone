"use client";

import { Category } from "@/lib/api";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  beach: "🌴", mountain: "⛰️", cabin: "🛖", farm: "🌾", design: "🎨",
  city: "🏙️", mansion: "🏛️", omg: "✨", tiny: "🏠", tree: "🌳",
  snow: "❄️", tropical: "🌺", lake: "🏞️", castle: "🏰", boat: "⛵",
};

export default function CategoryBar({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: number | null;
  onChange: (id: number | null) => void;
}) {
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800">
      <div className="scrollbar-hide mx-auto flex max-w-[1760px] items-center gap-1 overflow-x-auto px-6 py-3 lg:px-10">
        <CatButton active={active === null} onClick={() => onChange(null)} label="All" icon="🏠" />
        {categories.map((c) => (
          <CatButton
            key={c.id}
            active={active === c.id}
            onClick={() => onChange(c.id)}
            label={c.name}
            icon={CATEGORY_ICONS[c.icon || ""] || "🏡"}
          />
        ))}
      </div>
    </div>
  );
}

function CatButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition hover:bg-neutral-100 dark:hover:bg-neutral-800",
        active && "text-neutral-900 dark:text-white",
        !active && "text-neutral-500 dark:text-neutral-400",
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
      <span className={cn("h-0.5 w-full rounded-full bg-rose-500 transition", active ? "opacity-100" : "opacity-0")} />
    </button>
  );
}