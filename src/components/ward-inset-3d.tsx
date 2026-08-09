import { useEffect, useRef, useState } from "react";
import {
  acquireGlSlot,
  addLights,
  CORP_COLOR,
  disposeScene,
  hasWebGL,
  loadWards,
  makeProjection,
  makeRenderer,
  PAPER,
} from "@/lib/ward-3d";

/**
 * A cheap, non-interactive inset of a single ward: one extruded shape, no
 * OrbitControls, no raycasting, one render. Skipped entirely under 640px, and
 * skipped when another 3D surface already owns the page's WebGL context.
 */
export function WardInset3D({
  wardId,
  corporation,
  height = 150,
}: {
  wardId: string;
  corporation?: string;
  height?: number;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.innerWidth >= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!show || !wardId || !hasWebGL()) return;
    const release = acquireGlSlot();
    if (!release) return;
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
        const w = wards.find((x) => x.id === wardId);
        if (!w) return;

        const proj = makeProjection([w], 40);
        const shapes: InstanceType<typeof THREE.Shape>[] = [];
        for (const poly of w.p) {
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
        if (!shapes.length) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(PAPER);
        const width = mount.clientWidth || 260;
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
        camera.position.set(0, 46, 46);
        camera.lookAt(0, 0, 0);

        const renderer = makeRenderer(THREE, mount, { antialias: true });
        renderer.setSize(width, height, false);
        addLights(THREE, scene);

        const geo = new THREE.ExtrudeGeometry(shapes, { depth: 3, bevelEnabled: false });
        geo.center();
        const key = (corporation ?? "").replace("Bengaluru ", "").replace(" City Corporation", "") || w.c;
        const mat = new THREE.MeshLambertMaterial({
          color: new THREE.Color(CORP_COLOR[key] ?? CORP_COLOR[w.c] ?? CORP_COLOR["Central"]!),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -0.35;
        scene.add(mesh);
        renderer.render(scene, camera);

        cleanup = () => {
          disposeScene(scene);
          renderer.dispose();
          if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
      } catch {
        /* inset is decorative — never break the flow */
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
      release();
    };
  }, [show, wardId, corporation, height]);

  if (!show || !wardId) return null;
  return <div ref={mountRef} className="w-full border border-border" style={{ height }} />;
}
