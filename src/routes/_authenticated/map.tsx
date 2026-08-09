import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { WardMap3D } from "@/components/ward-map-3d";
import { T, useLang } from "@/lib/i18n";

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
        content:
          "Five city corporations, 369 wards — and only four zones the RTI portal can match.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { lang } = useLang();
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState(0);

  // Measure the real header height so the sticky offset never guesses.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.getBoundingClientRect().height));
    ro.observe(el);
    setHeaderH(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, []);

  return (
    <AppShell bare>
      <div style={{ "--map-header-h": `${headerH}px` } as CSSProperties}>
        <header
          ref={headerRef}
          className="border-b border-border bg-background p-6 lg:sticky lg:top-0 lg:z-20"
        >
          <h2 className="font-display text-2xl leading-tight" lang={lang}>
            <T id="mapPageTitle" />
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            <T id="mapPageIntro" />
          </p>
        </header>

        <WardMap3D />
      </div>
    </AppShell>
  );
}
