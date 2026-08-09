import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import asset from "@/assets/gba-wards-3d.json.asset.json";
import { portalZoneForGbaZone, PORTAL_AUTHORITIES } from "@/lib/rti-data";
import { WardMap } from "@/components/ward-map";
import { acquireGlSlot, CORP_COLOR, loadWards } from "@/lib/ward-3d";
import { loadOfficials } from "@/lib/officials";
import {
  OfficialsCaveat,
  OfficialsCredit,
  OfficialsList,
  OfficialsSkeleton,
  useWardOfficials,
} from "@/components/officials";
import { T, useAuthorityLabel, useCorporationShort, useLang } from "@/lib/i18n";

type RawWard = {
  id: string;
  n: string;
  kn: string;
  c: string;
  z: string;
  a: string;
  pop: number;
  w: string;
  p: number[][][][];
};

export type WardInfo = {
  id: string;
  name: string;
  nameKn: string;
  corporation: string;
  zone: string;
  assembly: string;
  population: number;
  number: string;
};

export { CORP_COLOR } from "@/lib/ward-3d";

const GREY = "#a9a396";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function WardMap3D() {
  const { t } = useLang();
  const corpShort = useCorporationShort();
  const legendWardCount = t("mapLegendWardCount");
  const mountRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const focusRef = useRef<((id: string) => void) | null>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<{ w: WardInfo; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<WardInfo | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => setWebgl(hasWebGL()), []);

  // Stacked (mobile) layout: bring the panel into view when a ward is picked.
  useEffect(() => {
    if (!selected || !panelRef.current) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [selected]);

  useEffect(() => {
    if (webgl !== true) return;
    const release = acquireGlSlot();
    if (!release) return;
    const mount = mountRef.current;
    if (!mount) {
      release();
      return;
    }

    let disposed = false;
    const cleanups: (() => void)[] = [() => release()];

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const raw: { wards: RawWard[] } = await fetch(asset.url).then((r) => r.json());
      if (disposed) return;

      const small = window.innerWidth < 768;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#f3efe6");

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
      camera.position.set(60, 78, 92);

      const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
      renderer.shadowMap.enabled = false;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "none";

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = 40;
      controls.maxDistance = 260;
      controls.maxPolarAngle = Math.PI / 2 - 0.06;
      controls.target.set(0, 0, 0);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xbfb8a8, 1.05));
      const dir = new THREE.DirectionalLight(0xffffff, 0.75);
      dir.position.set(60, 120, 40);
      dir.castShadow = false;
      scene.add(dir);

      // projection
      let minLon = 1e9,
        maxLon = -1e9,
        minLat = 1e9,
        maxLat = -1e9;
      for (const w of raw.wards)
        for (const poly of w.p)
          for (const ring of poly)
            for (const [lon, lat] of ring) {
              if (lon! < minLon) minLon = lon!;
              if (lon! > maxLon) maxLon = lon!;
              if (lat! < minLat) minLat = lat!;
              if (lat! > maxLat) maxLat = lat!;
            }
      const lon0 = (minLon + maxLon) / 2;
      const lat0 = (minLat + maxLat) / 2;
      const k = Math.cos((lat0 * Math.PI) / 180);
      const spanX = (maxLon - minLon) * k;
      const spanY = maxLat - minLat;
      const SCALE = 100 / Math.max(spanX, spanY);
      const px = (lon: number) => (lon - lon0) * k * SCALE;
      const py = (lat: number) => (lat - lat0) * SCALE;

      const pops = raw.wards.map((w) => w.pop).filter((p) => p > 0);
      const minPop = Math.min(...pops);
      const maxPop = Math.max(...pops);

      type WardMesh = InstanceType<typeof THREE.Mesh> & {
        userData: {
          info: WardInfo;
          zone: string;
          corp: string;
          baseColor: InstanceType<typeof THREE.Color>;
          delay: number;
          targetY: number;
          center: { x: number; z: number };
        };
      };


      const meshes: WardMesh[] = [];
      const corpCounts: Record<string, number> = {};

      for (const w of raw.wards) {
        const shapes: InstanceType<typeof THREE.Shape>[] = [];
        for (const poly of w.p) {
          const outer = poly[0];
          if (!outer || outer.length < 3) continue;
          const shape = new THREE.Shape();
          outer.forEach(([lon, lat], i) => {
            const x = px(lon!);
            const y = py(lat!);
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          });
          for (let h = 1; h < poly.length; h++) {
            const ring = poly[h]!;
            const path = new THREE.Path();
            ring.forEach(([lon, lat], i) => {
              const x = px(lon!);
              const y = py(lat!);
              if (i === 0) path.moveTo(x, y);
              else path.lineTo(x, y);
            });
            shape.holes.push(path);
          }
          shapes.push(shape);
        }
        if (!shapes.length) continue;

        const t = maxPop > minPop ? (Math.max(w.pop, minPop) - minPop) / (maxPop - minPop) : 0;
        const depth = 0.5 + t * 5.5;
        const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false });
        geo.computeBoundingBox();
        const color = new THREE.Color(CORP_COLOR[w.c] ?? GREY);
        const mat = new THREE.MeshLambertMaterial({
          color: color.clone(),
          transparent: true,
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geo, mat) as unknown as WardMesh;
        mesh.rotation.x = -Math.PI / 2;
        mesh.scale.z = 0.001;

        const bb = geo.boundingBox!;
        const cx = (bb.min.x + bb.max.x) / 2;
        const cy = (bb.min.y + bb.max.y) / 2;
        const dist = Math.hypot(cx, cy);

        mesh.userData = {
          info: {
            id: w.id,
            name: w.n,
            nameKn: w.kn,
            corporation: `Bengaluru ${w.c} City Corporation`,
            zone: w.z,
            assembly: w.a,
            population: w.pop,
            number: w.w,
          },
          zone: w.z,
          corp: w.c,
          baseColor: color,
          delay: Math.min(dist / 70, 1) * 0.45,
          targetY: 0,
          center: { x: cx, z: -cy },
        };
        corpCounts[w.c] = (corpCounts[w.c] ?? 0) + 1;
        scene.add(mesh);
        meshes.push(mesh);
      }
      setCounts(corpCounts);

      // ---- interaction
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let hoveredId: string | null = null;
      let selectedId: string | null = null;
      let pointerActive = false;
      let lastClient = { x: 0, y: 0 };

      function pick() {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(meshes, false)[0];
        return (hit?.object as WardMesh | undefined) ?? null;
      }

      function onPointerMove(e: PointerEvent) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        lastClient = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        pointerActive = true;
      }
      function onPointerLeave() {
        pointerActive = false;
        hoveredId = null;
        for (const m of meshes) m.userData.targetY = 0;
        setHover(null);
      }
      function onClick() {
        const m = pick();
        if (!m) return;
        selectedId = m.userData.info.id;
        setSelected(m.userData.info);
      }
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerleave", onPointerLeave);
      renderer.domElement.addEventListener("click", onClick);

      // ---- imperative focus (used by the ward search)
      type Focus = {
        t0: number;
        from: InstanceType<typeof THREE.Vector3>;
        to: InstanceType<typeof THREE.Vector3>;
        camFrom: InstanceType<typeof THREE.Vector3>;
        camTo: InstanceType<typeof THREE.Vector3>;
      };
      let focus: Focus | null = null;
      let flashId: string | null = null;
      let flashUntil = 0;

      focusRef.current = (id: string) => {
        const m = meshes.find((mm) => mm.userData.info.id === id);
        if (!m) return;
        selectedId = id;
        flashId = id;
        flashUntil = performance.now() + 1400;
        const c = m.userData.center;
        const to = new THREE.Vector3(c.x, 0, c.z);
        const delta = to.clone().sub(controls.target);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          controls.target.copy(to);
          camera.position.add(delta);
          focus = null;
        } else {
          focus = {
            t0: performance.now(),
            from: controls.target.clone(),
            to,
            camFrom: camera.position.clone(),
            camTo: camera.position.clone().add(delta),
          };
        }
      };


      // ---- sizing
      function resize() {
        const w = mount!.clientWidth;
        const h = mount!.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      // ---- loop gating
      let visible = !document.hidden;
      let onScreen = true;
      let rafId = 0;
      let running = false;
      const introStart = performance.now() + 120;

      function loop() {
        if (!running) return;
        rafId = requestAnimationFrame(loop);
        const now = performance.now();

        // intro
        for (const m of meshes) {
          const p = (now - introStart) / 1000 - m.userData.delay;
          const s = Math.max(0.001, Math.min(1, easeInOut(Math.max(0, Math.min(1, p / 1.2)))));
          if (m.scale.z < 1) m.scale.z = s;
        }

        // hover
        if (pointerActive) {
          const m = pick();
          const id = m?.userData.info.id ?? null;
          if (id !== hoveredId) {
            hoveredId = id;
            for (const mm of meshes) mm.userData.targetY = mm.userData.info.id === id ? 0.6 : 0;
            setHover(m ? { w: m.userData.info, x: lastClient.x, y: lastClient.y } : null);
          } else if (m) {
            setHover((h) => (h ? { ...h, x: lastClient.x, y: lastClient.y } : h));
          }
        }
        const flashing = flashId && now < flashUntil ? flashId : null;
        for (const m of meshes) {
          const isFlash = m.userData.info.id === flashing;
          const target =
            m.userData.targetY +
            (m.userData.info.id === selectedId ? 0.35 : 0) +
            (isFlash ? 0.5 : 0);
          m.position.y += (target - m.position.y) * 0.18;
          const mat = m.material as InstanceType<typeof THREE.MeshLambertMaterial>;
          const wantEmissive =
            m.userData.info.id === selectedId || m.userData.info.id === hoveredId;
          const pulse = isFlash ? 0.16 + 0.2 * Math.abs(Math.sin(now / 160)) : 0;
          mat.emissive.setScalar(Math.max(wantEmissive ? 0.14 : 0, pulse));
        }

        // eased camera focus from the search
        if (focus) {
          const p = Math.min(1, (now - focus.t0) / 600);
          const e = easeInOut(p);
          controls.target.lerpVectors(focus.from, focus.to, e);
          camera.position.lerpVectors(focus.camFrom, focus.camTo, e);
          if (p >= 1) focus = null;
        }

        controls.update();
        renderer.render(scene, camera);
      }

      function sync() {
        const should = visible && onScreen;
        if (should && !running) {
          running = true;
          rafId = requestAnimationFrame(loop);
        } else if (!should && running) {
          running = false;
          cancelAnimationFrame(rafId);
        }
      }
      const onVis = () => {
        visible = !document.hidden;
        sync();
      };
      document.addEventListener("visibilitychange", onVis);
      const io = new IntersectionObserver(
        (entries) => {
          onScreen = entries[0]?.isIntersecting ?? true;
          sync();
        },
        { threshold: 0.01 },
      );
      io.observe(mount);
      sync();
      setReady(true);

      cleanups.push(() => {
        running = false;
        focusRef.current = null;
        cancelAnimationFrame(rafId);
        document.removeEventListener("visibilitychange", onVis);
        io.disconnect();
        ro.disconnect();
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
        renderer.domElement.removeEventListener("click", onClick);
        controls.dispose();
        for (const m of meshes) {
          m.geometry.dispose();
          (m.material as InstanceType<typeof THREE.MeshLambertMaterial>).dispose();
          scene.remove(m);
        }
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      });
    })();

    return () => {
      disposed = true;
      for (const c of cleanups) c();
    };
  }, [webgl]);

  const legend = useMemo(
    () =>
      Object.keys(CORP_COLOR).map((c) => ({
        color: CORP_COLOR[c]!,
        label: `${t("bengaluruWord")} ${corpShort(`Bengaluru ${c} City Corporation`)}`,
        note: legendWardCount.replace("{n}", String(counts[c] ?? 0)),
      })),
    [counts, t, corpShort, legendWardCount],
  );

  if (webgl === false) {
    return (
      <div className="p-6">
        <p className="mb-3 text-xs text-muted-foreground">
          <T id="mapNoWebgl" />
        </p>
        <WardMap selectedId="" onSelect={() => undefined} />
      </div>
    );
  }

  const pickWard = (w: WardInfo) => {
    setSelected(w);
    focusRef.current?.(w.id);
  };

  return (
    <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* Search sits first on mobile (above the stacked map) and top-right on desktop. */}
      <div className="order-1 border-b border-border p-5 lg:order-none lg:col-start-2 lg:row-start-1">
        <WardSearch onPick={pickWard} />
      </div>

      {/* Sticky only in the two-column (lg) layout; stacked mobile keeps its normal flow. */}
      <div className="order-2 min-w-0 border-b border-border lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-[var(--map-header-h,0px)] lg:flex lg:h-[calc(100svh-var(--map-header-h,0px))] lg:flex-col lg:self-start lg:border-b-0 lg:border-r">
        <div className="relative lg:min-h-0 lg:flex-1">
          <div
            ref={mountRef}
            role="img"
            aria-label={t("mapCanvasAriaLabel")}
            className="h-[360px] w-full sm:h-[520px] lg:h-full lg:min-h-0"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              <T id="mapBuildingCity" />
            </div>
          )}
          {hover && (
            <div
              className="pointer-events-none absolute z-10 border border-foreground bg-background px-2 py-1"
              style={{ left: Math.min(hover.x + 12, 9999), top: hover.y + 12 }}
            >
              <p className="font-display text-xs font-bold">{hover.w.name}</p>
              <p className="mono-stamp">
                {t("mapWardLabel")} {hover.w.number} · {corpShort(hover.w.corporation)}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border p-3 lg:shrink-0">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3" style={{ backgroundColor: l.color }} />
              <span className="text-[11px]">{l.label}</span>
              <span className="mono-stamp">{l.note}</span>
            </span>
          ))}
        </div>
        <p className="border-t border-border p-3 text-[11px] text-muted-foreground sm:hidden">
          <T id="mapRotateHint" />
        </p>
      </div>

      <aside
        ref={panelRef}
        className="order-3 min-w-0 self-start p-5 lg:order-none lg:col-start-2 lg:row-start-2"
      >
        {!selected && (
          <>
            <p className="rule-heading">
              <T id="mapWardDetailHeading" />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <T id="mapWardDetailHint" />
            </p>
          </>
        )}
        {selected && <WardPanel ward={selected} />}
      </aside>
    </div>
  );
}

// ------------------------------------------------------------------ ward search

type SearchEntry = { info: WardInfo; oldWard?: string; keys: string[] };

/** Lowercase, strip punctuation, collapse spacing: "K.R. Pura" === "kr pura". */
function normalise(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function useWardSearchIndex() {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      const [wards, officials] = await Promise.all([
        loadWards(),
        loadOfficials().catch(() => null),
      ]);
      if (!alive) return;
      const olds: Record<string, string | undefined> = {};
      if (officials)
        for (const [name, block] of Object.entries(officials.wards))
          olds[normalise(name)] = block.oldBbmpWard;
      setEntries(
        wards.map((w) => {
          const info: WardInfo = {
            id: w.id,
            name: w.n,
            nameKn: w.kn,
            corporation: `Bengaluru ${w.c} City Corporation`,
            zone: w.z,
            assembly: w.a,
            population: w.pop,
            number: w.w,
          };
          const oldWard = olds[normalise(w.n)];
          return {
            info,
            ...(oldWard ? { oldWard } : {}),
            // priority order: name, Kannada name, number, old BBMP ward, corporation, assembly
            keys: [
              normalise(w.n),
              normalise(w.kn),
              normalise(w.w),
              normalise(oldWard ?? ""),
              normalise(`Bengaluru ${w.c} City Corporation`),
              normalise(w.a),
            ],
          };
        }),
      );
    })();
    return () => {
      alive = false;
    };
  }, []);
  return entries;
}

const OLD_WARD_KEY = 3;

function WardSearch({ onPick }: { onPick: (w: WardInfo) => void }) {
  const { t, lang } = useLang();
  const corpShort = useCorporationShort();
  const entries = useWardSearchIndex();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => {
    const q = normalise(query);
    if (q.length < 1) return [];
    const scored: { e: SearchEntry; rank: number; starts: boolean }[] = [];
    for (const e of entries) {
      const rank = e.keys.findIndex((k) => k.length > 0 && k.includes(q));
      if (rank < 0) continue;
      scored.push({ e, rank, starts: e.keys[rank]!.startsWith(q) });
    }
    scored.sort(
      (a, b) =>
        a.rank - b.rank ||
        Number(b.starts) - Number(a.starts) ||
        a.e.info.name.localeCompare(b.e.info.name),
    );
    return scored.slice(0, 8);
  }, [entries, query]);

  useEffect(() => setActive(0), [query]);

  const choose = (i: number) => {
    const hit = results[i];
    if (!hit) return;
    onPick(hit.e.info);
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      choose(active);
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      setQuery("");
      inputRef.current?.focus();
    }
  };

  const open = query.trim().length > 0;
  const activeId = results[active] ? `ward-opt-${results[active]!.e.info.id}` : undefined;

  return (
    <div>
      <label className="rule-heading block text-foreground" htmlFor="ward-search" lang={lang}>
        {t("mapSearchLabel")}
      </label>
      <div className="mt-1.5 flex items-start gap-2">
        <input
          id="ward-search"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("mapSearchPlaceholder")}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="ward-search-results"
          aria-autocomplete="list"
          {...(activeId ? { "aria-activedescendant": activeId } : {})}
          className="min-w-0 flex-1 border border-border bg-background px-2 py-1.5 text-sm"
        />
        {open && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label={t("mapSearchClear")}
            className="shrink-0 border border-border px-1.5 py-1 text-[10px] uppercase hover:bg-secondary"
          >
            ✕
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground" lang={lang}>
        {t("mapSearchHint")}
      </p>

      {open && (
        <ul
          id="ward-search-results"
          role="listbox"
          aria-label={t("mapSearchResultsLabel")}
          className="mt-2 border border-border"
        >
          {results.map((r, i) => {
            const w = r.e.info;
            const primary = lang === "kn" ? w.nameKn : w.name;
            const secondary = lang === "kn" ? w.name : w.nameKn;
            return (
              <li key={w.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  id={`ward-opt-${w.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`block w-full px-2 py-1.5 text-left ${
                    i === active ? "bg-secondary" : "hover:bg-secondary"
                  }`}
                >
                  <span className="block text-sm leading-tight">{primary}</span>
                  <span className="block text-xs text-muted-foreground">{secondary}</span>
                  <span className="mono-stamp mt-0.5 block">
                    {t("mapWardLabel")} {w.number} · {corpShort(w.corporation)}
                  </span>
                  {r.rank === OLD_WARD_KEY && r.e.oldWard && (
                    <span className="mt-0.5 block text-[11px] text-muted-foreground" lang={lang}>
                      {t("mapSearchWasBbmp").replace("{ward}", r.e.oldWard)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {!results.length && (
            <li className="px-2 py-2">
              <p className="text-sm" lang={lang}>
                {t("mapSearchNoResults")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground" lang={lang}>
                {t("mapSearchNoResultsHint")}
              </p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}


function WardPanel({ ward }: { ward: WardInfo }) {
  const { t, lang } = useLang();
  const authorityLabel = useAuthorityLabel();
  const portal = portalZoneForGbaZone(ward.zone);
  const { data, loading } = useWardOfficials(ward.name);
  const oldWard = data?.oldBbmpWard;

  return (
    <div>
      <p className="rule-heading">
        {t("mapWardLabel")} {ward.number}
      </p>
      <h3 className="mt-1 font-display text-lg leading-tight">{ward.name}</h3>
      <p className="text-sm text-muted-foreground">{ward.nameKn}</p>

      <dl className="mt-4 space-y-2 text-xs">
        {[
          [t("mapDlCorporation"), authorityLabel(ward.corporation)],
          [t("mapDlAssembly"), ward.assembly],
          [t("mapDlGbaZone"), ward.zone],
          [t("mapDlPopulation"), ward.population ? ward.population.toLocaleString("en-IN") : "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-border pb-1.5">
            <dt className="rule-heading">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border border-foreground p-3">
        <p className="rule-heading text-foreground">
          <T id="mapOnPortalHeading" />
        </p>
        {portal ? (
          <>
            <div className="mt-1.5 flex items-start gap-2">
              <span className="mono-stamp min-w-0 flex-1 break-words leading-snug">{portal}</span>
              <CopyZone value={portal} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground" lang={lang}>
              <T id="mapMatchedFromZone" />
            </p>
          </>
        ) : (
          <>
            <p className="mt-1.5 text-xs" lang={lang}>
              {t("mapNoVerifiedMapping").replace("{ward}", ward.name)}
            </p>
            <p className="mt-2 text-xs" lang={lang}>
              {t("mapGbaZoneLine")
                .replace("{zone}", ward.zone)
                .replace("{corp}", authorityLabel(ward.corporation))}
            </p>
            {oldWard ? (
              <p className="mt-2 text-xs" lang={lang}>
                {t("mapOldWardHint")
                  .split("{ward}")
                  .flatMap((part, i, arr) =>
                    i < arr.length - 1 ? [part, <strong key={i}>{oldWard}</strong>] : [part],
                  )}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground" lang={lang}>
              <T id="mapSection63Note" />
            </p>
            <ZonePicker />
          </>
        )}
      </div>

      <div className="mt-4 border border-border p-3">
        <p className="rule-heading text-foreground">
          <T id="mapOfficialsHeading" />
        </p>
        {loading ? (
          <OfficialsSkeleton />
        ) : (
          <>
            {oldWard ? (
              <p className="mt-1.5 text-xs" lang={lang}>
                {t("mapOldWardUnderBbmp")
                  .split("{ward}")
                  .flatMap((part, i, arr) =>
                    i < arr.length - 1 ? [part, <strong key={i}>{oldWard}</strong>] : [part],
                  )}
              </p>
            ) : null}
            <OfficialsList officials={data?.officials ?? []} />
            <OfficialsCaveat />
            <OfficialsCredit />
          </>
        )}
      </div>

      <Link
        to="/new"
        search={{ ward: ward.id, stage: "complaint" }}
        className="mt-4 block bg-foreground px-4 py-2 text-center font-display text-sm font-bold uppercase text-background"
      >
        <T id="mapReportProblemCta" />
      </Link>
      <Link
        to="/new"
        search={{ ward: ward.id }}
        className="mt-2 block border border-foreground px-4 py-2 text-center font-display text-sm font-bold uppercase"
      >
        <T id="mapDraftRtiCta" />
      </Link>
    </div>
  );
}

function ZonePicker() {
  const { t, lang } = useLang();
  const zones = PORTAL_AUTHORITIES.bbmpZones;
  const [zone, setZone] = useState<string>(zones[0]!);
  return (
    <div className="mt-3">
      <label className="rule-heading block text-foreground" htmlFor="bbmp-zone" lang={lang}>
        <T id="mapChooseBbmpZone" />
      </label>
      <div className="mt-1.5 flex items-start gap-2">
        <select
          id="bbmp-zone"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          aria-label={t("mapChooseBbmpZone")}
          className="mono-stamp min-w-0 flex-1 border border-border bg-background px-1.5 py-1 leading-snug"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <CopyZone value={zone} />
      </div>
    </div>
  );
}

function CopyZone({ value }: { value: string }) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      className="shrink-0 border border-border px-1.5 py-0.5 text-[10px] uppercase hover:bg-secondary"
    >
      {done ? t("copied") : t("copy")}
    </button>
  );
}
