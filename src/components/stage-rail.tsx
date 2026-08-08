import { STAGE_RAIL, type StageRailId } from "@/lib/rti-data";

/**
 * Compact horizontal rail: Complaint -> Escalation -> RTI -> First appeal -> Second appeal.
 * Completed steps are filled, the current step is outlined, future steps are muted.
 */
export function StageRail({
  current,
  completed = [],
}: {
  current: StageRailId;
  completed?: StageRailId[];
}) {
  const order = STAGE_RAIL.map((s) => s.id);
  const currentIndex = order.indexOf(current);

  return (
    <ol className="flex min-w-0 flex-wrap gap-1.5 sm:flex-nowrap">
      {STAGE_RAIL.map((s, i) => {
        const done = completed.includes(s.id) || i < currentIndex;
        const isCurrent = s.id === current;
        return (
          <li
            key={s.id}
            className={`min-w-0 flex-1 basis-[46%] border px-2 py-1.5 sm:basis-0 ${
              isCurrent
                ? "border-foreground bg-background"
                : done
                  ? "border-foreground bg-foreground text-background"
                  : "border-dashed border-muted-foreground/50 text-muted-foreground"
            }`}
          >
            <p className="truncate font-display text-[11px] font-bold uppercase tracking-tight">
              {s.label}
            </p>
            <p
              className={`mt-0.5 text-[10px] leading-tight ${
                done ? "text-background/80" : "text-muted-foreground"
              }`}
            >
              {s.deadline}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
