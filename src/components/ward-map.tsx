import { useEffect, useMemo, useState } from "react";
import { WARDS } from "@/lib/wards";
import { T, useLang } from "@/lib/i18n";

type Shapes = { width: number; height: number; shapes: { ward_id: string; d: string }[] };

const CORP_TONE: Record<string, string> = {
  "Bengaluru Central City Corporation": "color-mix(in oklch, var(--accent) 18%, var(--muted))",
};

export function WardMap({
  selectedId,
  onSelect,
  highlightIds,
}: {
  selectedId: string;
  onSelect: (wardId: string) => void;
  highlightIds?: string[] | undefined;
}) {
  const [data, setData] = useState<Shapes | null>(null);
  const [hover, setHover] = useState<string>("");
  const { t } = useLang();

  useEffect(() => {
    let alive = true;
    fetch("/data/ward-shapes.json")
      .then((r) => r.json())
      .then((j: Shapes) => alive && setData(j))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const byId = useMemo(() => new Map(WARDS.map((w) => [w.ward_id, w])), []);
  const highlight = useMemo(
    () => (highlightIds ? new Set(highlightIds) : null),
    [highlightIds],
  );

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border bg-secondary/40 text-xs text-muted-foreground">
        <T id="wardMapLoading" />
      </div>
    );
  }

  const active = hover || selectedId;
  const activeWard = active ? byId.get(active) : undefined;

  return (
    <div className="relative rounded-md border border-border bg-secondary/30 p-2">
      <svg
        viewBox={`0 0 ${data.width} ${data.height}`}
        className="mx-auto h-auto max-h-[460px] w-full"
        role="img"
        aria-label={t("wardMapAriaLabel")}
      >
        {data.shapes.map((s) => {
          const isSelected = s.ward_id === selectedId;
          const isHover = s.ward_id === hover;
          const dimmed = highlight ? !highlight.has(s.ward_id) : false;
          return (
            <path
              key={s.ward_id}
              d={s.d}
              onClick={() => onSelect(s.ward_id === selectedId ? "" : s.ward_id)}
              onMouseEnter={() => setHover(s.ward_id)}
              onMouseLeave={() => setHover("")}
              className="cursor-pointer"
              fill={
                isSelected
                  ? "var(--accent)"
                  : isHover
                    ? "color-mix(in oklch, var(--accent) 40%, var(--muted))"
                    : dimmed
                      ? "color-mix(in oklch, var(--muted) 60%, var(--background))"
                      : CORP_TONE[byId.get(s.ward_id)?.corporation ?? ""] ?? "var(--muted)"
              }
              stroke="var(--border)"
              strokeWidth={isSelected ? 2.5 : 0.7}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute left-3 top-3 max-w-[70%] rounded-md bg-background/90 px-2 py-1 text-xs shadow-sm">
        {activeWard ? (
          <>
            <span className="font-medium">{activeWard.ward_name}</span>
            <span className="block text-[10px] text-muted-foreground">
              {activeWard.ward_name_kn} · {activeWard.zone_name}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            <T id="tapWardToSelect" />
          </span>
        )}
      </div>
    </div>
  );
}
