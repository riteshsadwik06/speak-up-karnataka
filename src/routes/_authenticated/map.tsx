import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { WardMap3D } from "@/components/ward-map-3d";

export const Route = createFileRoute("/_authenticated/map")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bengaluru, as it is and as the portal sees it — Vicharane" },
      {
        name: "description",
        content:
          "A 3D map of all 369 Greater Bengaluru Authority wards, and the legacy BBMP zones the RTI portal still files them under.",
      },
      { property: "og:title", content: "Bengaluru, as it is and as the portal sees it" },
      {
        property: "og:description",
        content: "Five city corporations, 369 wards — and only four zones the RTI portal can match.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [mode, setMode] = useState<"gba" | "portal">("gba");

  return (
    <AppShell bare>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-6">
        <div>
          <h2 className="font-display text-2xl leading-tight">Bengaluru, as it is and as the portal sees it</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The city is now the Greater Bengaluru Authority — five corporations, 369 wards. The RTI portal still
            lists the nine legacy BBMP zones. Height is population.
          </p>
        </div>
        <div className="flex border border-foreground">
          {(
            [
              ["gba", "GBA (today)"],
              ["portal", "RTI portal (still BBMP)"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-tight transition-colors ${
                mode === k ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <WardMap3D mode={mode} />
    </AppShell>
  );
}
