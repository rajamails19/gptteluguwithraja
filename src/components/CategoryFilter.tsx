import { CATEGORIES, type Category } from "@/data/stories";

interface Props {
  active: Category | "All";
  onChange: (c: Category | "All") => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  const items: Array<Category | "All"> = ["All", ...CATEGORIES];
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-2">
        {items.map((c) => {
          const isActive = c === active;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-foreground/70 hover:text-foreground border border-border hover:border-foreground/30",
              ].join(" ")}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
