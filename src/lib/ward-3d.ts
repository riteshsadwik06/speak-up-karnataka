/**
 * Shared setup for every 3D ward surface (city map, landing hero, dashboard
 * city strip, single-ward inset): asset caching, projection, geometry
 * building, lighting, renderer creation, render-loop gating and disposal.
 *
 * Only ONE WebGL canvas may be live at a time — acquireGlSlot() enforces it.
 */
import asset from "@/assets/gba-wards-3d.json.asset.json";

export type ThreeNS = typeof import("three");

export type RawWard = {
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

/** Corporation colours. Muted, earthy, and none equal to the ink or paper token. */
export const CORP_COLOR: Record<string, string> = {
  Central: "#5c3a52", // deep plum — distinct from the rust at low saturation
  North: "#8a6220",
  East: "#2c5c4f",
  South: "#8c3626",
  West: "#3b4a6b",
};

export const NEUTRAL = "#a9a396";
export const PAPER = "#f3efe6";

// ---------------------------------------------------------------- asset cache
let wardsPromise: Promise<RawWard[]> | null = null;

export function loadWards(): Promise<RawWard[]> {
  wardsPromise ??= fetch(asset.url)
    .then((r) => r.json())
    .then((j: { wards: RawWard[] }) => j.wards)
    .catch((e) => {
      wardsPromise = null;
      throw e;
    });
  return wardsPromise;
}

// ------------------------------------------------------------------ capability
export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ------------------------------------------------------- one WebGL context only
let glSlotTaken = false;

/** Returns a release fn, or null when another 3D surface already holds the slot. */
export function acquireGlSlot(): (() => void) | null {
  if (glSlotTaken) return null;
  glSlotTaken = true;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    glSlotTaken = false;
  };
}

// ------------------------------------------------------------------ projection
export type Projection = { px: (lon: number) => number; py: (lat: number) => number };

export function makeProjection(wards: RawWard[], size = 100): Projection {
  let minLon = 1e9,
    maxLon = -1e9,
    minLat = 1e9,
    maxLat = -1e9;
  for (const w of wards)
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
  const scale = size / Math.max((maxLon - minLon) * k, maxLat - minLat, 1e-6);
  return {
    px: (lon: number) => (lon - lon0) * k * scale,
    py: (lat: number) => (lat - lat0) * scale,
  };
}

export function popRange(wards: RawWard[]) {
  const pops = wards.map((w) => w.pop).filter((p) => p > 0);
  const min = pops.length ? Math.min(...pops) : 0;
  const max = pops.length ? Math.max(...pops) : 1;
  return { min, max };
}

// -------------------------------------------------------------------- geometry
export function wardShapes(THREE: ThreeNS, ward: RawWard, proj: Projection) {
  const shapes: InstanceType<ThreeNS["Shape"]>[] = [];
  for (const poly of ward.p) {
    const outer = poly[0];
    if (!outer || outer.length < 3) continue;
    const shape = new THREE.Shape();
    outer.forEach(([lon, lat], i) => {
      const x = proj.px(lon!);
      const y = proj.py(lat!);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    for (let h = 1; h < poly.length; h++) {
      const path = new THREE.Path();
      poly[h]!.forEach(([lon, lat], i) => {
        const x = proj.px(lon!);
        const y = proj.py(lat!);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      shape.holes.push(path);
    }
    shapes.push(shape);
  }
  return shapes;
}

export function extrudeWard(THREE: ThreeNS, ward: RawWard, proj: Projection, depth: number) {
  const shapes = wardShapes(THREE, ward, proj);
  if (!shapes.length) return null;
  const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false });
  geo.computeBoundingBox();
  return geo;
}

export function popDepth(pop: number, range: { min: number; max: number }, lo = 0.5, hi = 6) {
  const t = range.max > range.min ? (Math.max(pop, range.min) - range.min) / (range.max - range.min) : 0;
  return lo + t * (hi - lo);
}

// -------------------------------------------------------------------- lighting
export function addLights(THREE: ThreeNS, scene: InstanceType<ThreeNS["Scene"]>) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfb8a8, 1.05));
  const dir = new THREE.DirectionalLight(0xffffff, 0.75);
  dir.position.set(60, 120, 40);
  dir.castShadow = false;
  scene.add(dir);
}

// -------------------------------------------------------------------- renderer
export function makeRenderer(THREE: ThreeNS, mount: HTMLElement, opts: { antialias?: boolean } = {}) {
  const small = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ antialias: opts.antialias ?? !small, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  renderer.shadowMap.enabled = false;
  const el = renderer.domElement;
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.display = "block";
  el.style.touchAction = "none";
  mount.appendChild(el);
  return renderer;
}

export function disposeScene(scene: InstanceType<ThreeNS["Scene"]>) {
  const kill = (o: unknown) => {
    const m = o as { geometry?: { dispose(): void }; material?: { dispose(): void } | { dispose(): void }[] };
    m.geometry?.dispose();
    if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
    else m.material?.dispose();
  };
  scene.traverse(kill);
  scene.clear();
}

// ------------------------------------------------------------------ loop gating
/**
 * Runs `frame` on rAF only while the mount is on-screen and the tab is visible.
 */
export function gateLoop(mount: HTMLElement, frame: (now: number) => void) {
  let visible = !document.hidden;
  let onScreen = false;
  let running = false;
  let rafId = 0;

  const loop = () => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    frame(performance.now());
  };
  const sync = () => {
    const should = visible && onScreen;
    if (should && !running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(rafId);
    }
  };
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

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
    document.removeEventListener("visibilitychange", onVis);
    io.disconnect();
  };
}

export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
