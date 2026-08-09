import { useEffect, useRef, useState } from "react";
import {
  acquireGlSlot,
  addLights,
  disposeScene,
  easeInOut,
  extrudeWard,
  gateLoop,
  hasWebGL,
  loadWards,
  makeProjection,
  makeRenderer,
  PAPER,
  popDepth,
  popRange,
  prefersReducedMotion,
  type RawWard,
} from "@/lib/ward-3d";

type Props = {
  /** Colour for each ward, as a CSS hex string. */
  colorFor: (ward: RawWard) => string;
  /** Changing this string re-applies colours without rebuilding geometry. */
  colorKey?: string;
  /** Slow ambient orbit, one rotation per ~90s. */
  spin?: boolean;
  /** Ward click handler. Omit for a purely decorative surface. */
  onWardClick?: (ward: RawWard) => void;
  className?: string;
  /** Rendered when WebGL is unavailable or another 3D surface owns the context. */
  fallback?: React.ReactNode;
  /** Accessible label describing the (decorative but data-bearing) surface. */
  ariaLabel?: string;
  /** Seconds for one full orbit. */
  orbitSeconds?: number;
  /** Staggered rise animation on first paint. */
  intro?: boolean;
  /** Frame cap for the render loop. */
  maxFps?: number;
};

/**
 * A whole-city view of the 369 GBA wards, extruded by population.
 * Shared by the landing hero (ambient, no interaction) and the dashboard
 * (muted city with lit wards). Only one WebGL context is ever mounted.
 */
export function WardCity3D({
  colorFor,
  colorKey = "",
  spin = false,
  onWardClick,
  className,
  fallback,
  ariaLabel,
  orbitSeconds = 90,
  intro = true,
  maxFps = 60,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const colorForRef = useRef(colorFor);
  const clickRef = useRef(onWardClick);
  const recolorRef = useRef<(() => void) | null>(null);
  const [state, setState] = useState<"init" | "ok" | "off">("init");

  colorForRef.current = colorFor;
  clickRef.current = onWardClick;

  useEffect(() => {
    recolorRef.current?.();
  }, [colorKey]);

  useEffect(() => {
    if (!hasWebGL()) {
      setState("off");
      return;
    }
    const release = acquireGlSlot();
    if (!release) {
      setState("off");
      return;
    }
    const mount = mountRef.current;
    if (!mount) {
      release();
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await import("three");
        const wards = await loadWards();
        if (disposed) return;

        const still = prefersReducedMotion() || window.innerWidth < 768;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(PAPER);
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
        const DIR = new THREE.Vector3(0, 0.78, 0.62).normalize();
        const HALF = 56;
        const fitCamera = () => {
          const vHalf = Math.tan((camera.fov * Math.PI) / 180 / 2);
          const dist = Math.max(HALF / vHalf, HALF / (vHalf * Math.max(camera.aspect, 0.2))) * 1.02;
          camera.position.copy(DIR).multiplyScalar(dist);
          camera.lookAt(0, 0, 0);
        };
        fitCamera();

        const renderer = makeRenderer(THREE, mount);
        addLights(THREE, scene);

        const proj = makeProjection(wards, 100);
        const range = popRange(wards);
        const meshes: InstanceType<typeof THREE.Mesh>[] = [];
        const pivot = new THREE.Group();
        scene.add(pivot);

        for (const w of wards) {
          const geo = extrudeWard(THREE, w, proj, popDepth(w.pop, range));
          if (!geo) continue;
          const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(colorForRef.current(w)) });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.scale.z = still || !intro ? 1 : 0.001;
          mesh.userData = { ward: w };
          pivot.add(mesh);
          meshes.push(mesh);
        }

        const recolor = () => {
          for (const m of meshes) {
            const mat = m.material as InstanceType<typeof THREE.MeshLambertMaterial>;
            mat.color.set(colorForRef.current((m.userData as { ward: RawWard }).ward));
          }
          renderer.render(scene, camera);
        };
        recolorRef.current = recolor;

        const resize = () => {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          fitCamera();
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        // pointer picking, only when a click handler is supplied
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const onClick = (e: MouseEvent) => {
          if (!clickRef.current) return;
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(meshes, false)[0];
          if (hit) clickRef.current((hit.object.userData as { ward: RawWard }).ward);
        };
        if (onWardClick) renderer.domElement.addEventListener("click", onClick);
        renderer.domElement.style.cursor = onWardClick ? "pointer" : "default";

        setState("ok");

        let stopLoop: (() => void) | null = null;
        if (still) {
          renderer.render(scene, camera);
        } else {
          const start = performance.now() + (intro ? 120 : 0);
          const minDelta = 1000 / Math.max(1, maxFps);
          let last = 0;
          stopLoop = gateLoop(mount, (now) => {
            if (now - last < minDelta) return;
            last = now;
            const t = (now - start) / 1000;
            if (intro) {
              for (const m of meshes) {
                if (m.scale.z < 1) m.scale.z = Math.max(0.001, easeInOut(Math.max(0, Math.min(1, t / 1.4))));
              }
            }
            if (spin) pivot.rotation.y = ((t % orbitSeconds) / orbitSeconds) * Math.PI * 2;
            renderer.render(scene, camera);
          });
        }


        cleanup = () => {
          stopLoop?.();
          ro.disconnect();
          renderer.domElement.removeEventListener("click", onClick);
          recolorRef.current = null;
          disposeScene(scene);
          renderer.dispose();
          if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
      } catch {
        setState("off");
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin]);

  if (state === "off") return <>{fallback ?? null}</>;
  return (
    <div
      ref={mountRef}
      className={className}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : "true"}
    />
  );
}
