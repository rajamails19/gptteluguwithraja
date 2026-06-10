interface Props {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 rounded-full transition-all duration-500",
            i === current
              ? "w-8 bg-primary"
              : i < current
                ? "w-1.5 bg-primary/60"
                : "w-1.5 bg-foreground/15",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
