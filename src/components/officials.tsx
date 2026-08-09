/**
 * Shared UI for the Bengaluru civic officials dataset.
 * Data: https://github.com/Vonter/city-officials (non-code data: CC BY 4.0).
 */
import { useEffect, useState } from "react";
import { CivicIcon, civicRoleFor } from "@/components/civic-icons";
import {
  officialsForWard,
  OFFICIALS_CAVEAT,
  OFFICIALS_CREDIT,
  OFFICIALS_SOURCE,
  type Official,
  type WardOfficials,
} from "@/lib/officials";

/** Coarse grouping so a resident can scan by the kind of problem. */
const GROUPS: { label: string; match: RegExp }[] = [
  { label: "Roads & works", match: /road|engineer|infrastructur|storm|drain/i },
  { label: "Waste & health", match: /marshal|garbage|solid waste|health|sanit/i },
  { label: "Electrical & lights", match: /electric|street light|light/i },
  { label: "Revenue, tax & khata", match: /revenue|tax|khata|assessment/i },
  { label: "Animals", match: /veterinar|animal|dog/i },
  { label: "Ward office", match: /.*/ },
];

/** Category keyword → designation matcher, for the complaint stage. */
const CATEGORY_FILTERS: { match: RegExp; roles: RegExp }[] = [
  { match: /road|pothole|footpath|pavement|drain/i, roles: /road|engineer|drain/i },
  { match: /garbage|waste|litter|sanit|sweep/i, roles: /marshal|garbage|solid waste|health inspector/i },
  { match: /light|lamp|electric|power/i, roles: /electric|light/i },
  { match: /dog|stray|animal|cattle|monkey/i, roles: /veterinar|animal/i },
  { match: /tax|khata|property|revenue|assess/i, roles: /revenue|tax|khata/i },
  { match: /water|sewer|drainage|sewage/i, roles: /engineer|water|sewer/i },
];

export function relevantOfficials(officials: Official[], category?: string | undefined): Official[] {
  if (!category) return officials;
  const rule = CATEGORY_FILTERS.find((f) => f.match.test(category));
  if (!rule) return officials;
  const hit = officials.filter((o) => rule.roles.test(`${o.designation ?? ""} ${o.name ?? ""}`));
  return hit.length ? hit : officials;
}

export function useWardOfficials(wardName: string | undefined) {
  const [data, setData] = useState<WardOfficials | null>(null);
  const [loading, setLoading] = useState(Boolean(wardName));

  useEffect(() => {
    let alive = true;
    if (!wardName) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    officialsForWard(wardName)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setData(null);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [wardName]);

  return { data, loading };
}

export function OfficialsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="mt-2 space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="border-b border-border pb-2">
          <span className="block h-3 w-28 animate-pulse rounded bg-muted" />
          <span className="mt-1.5 block h-3 w-40 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}

export function OfficialsCredit() {
  return (
    <p className="mt-2 text-[11px] text-muted-foreground">
      <a href={OFFICIALS_SOURCE} target="_blank" rel="noreferrer" className="underline">
        {OFFICIALS_CREDIT}
      </a>
    </p>
  );
}

function OfficialRow({ o }: { o: Official }) {
  const { lang, t } = useLang();
  const kn = lang === "kn";
  const designation = kn && o.designationKn?.trim() ? o.designationKn : o.designation;
  const designationAlt = kn && o.designationKn?.trim() ? o.designation : null;
  const name = kn && o.nameKn?.trim() ? o.nameKn : o.name;
  const nameAlt = kn && o.nameKn?.trim() ? o.name : o.nameKn;

  return (
    <li className="group flex items-start gap-2 border-b border-border py-1.5">
      <CivicIcon
        role={civicRoleFor(o.designation)}
        size={40}
        className="mt-0.5 h-[34px] w-[34px] sm:h-10 sm:w-10"
      />
      <div className="min-w-0 flex-1">
        <p
          lang={kn ? "kn" : undefined}
          className={`text-[11px] uppercase tracking-wide text-muted-foreground ${kn ? `${KN_TEXT} normal-case` : ""}`}
        >
          {designation || t("official")}
        </p>
        {designationAlt ? (
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{designationAlt}</p>
        ) : null}
        <p lang={kn ? "kn" : undefined} className={`text-sm ${kn ? KN_TEXT : "leading-tight"}`}>
          {name || "—"}
        </p>
        {nameAlt && nameAlt !== name ? (
          <p className="text-xs leading-tight text-muted-foreground">{nameAlt}</p>
        ) : null}
        {o.phone ? (
          <p className="mt-0.5 flex flex-wrap gap-x-3">
            {o.phone
              .split(/[,/]/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p) => (
                <a key={p} href={`tel:${p.replace(/\s+/g, "")}`} className="font-mono text-xs underline">
                  {p}
                </a>
              ))}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/** Grouped, scannable list of officials. */
export function OfficialsList({
  officials,
  grouped = true,
}: {
  officials: Official[];
  grouped?: boolean;
}) {
  if (!officials.length) {
    return <p className="mt-2 text-xs text-muted-foreground">No officials listed for this ward.</p>;
  }
  if (!grouped) {
    return (
      <ul className="mt-2">
        {officials.map((o, i) => (
          <OfficialRow key={`${o.designation}-${o.name}-${i}`} o={o} />
        ))}
      </ul>
    );
  }

  const used = new Set<Official>();
  const buckets = GROUPS.map((g) => {
    const items = officials.filter((o) => !used.has(o) && g.match.test(o.designation ?? ""));
    items.forEach((o) => used.add(o));
    return { label: g.label, items };
  }).filter((b) => b.items.length);

  return (
    <div className="mt-2 space-y-3">
      {buckets.map((b) => (
        <div key={b.label}>
          <p className="rule-heading">{b.label}</p>
          <ul>
            {b.items.map((o, i) => (
              <OfficialRow key={`${o.designation}-${o.name}-${i}`} o={o} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function OfficialsCaveat() {
  return <p className="mt-2 text-[11px] text-muted-foreground">{OFFICIALS_CAVEAT}</p>;
}
