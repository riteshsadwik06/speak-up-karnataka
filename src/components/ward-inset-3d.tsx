import { useEffect, useRef, useState } from "react";
import asset from "@/assets/gba-wards-3d.json.asset.json";
import { CORP_COLOR } from "@/components/ward-map-3d";

type RawWard = { id: string; c: string; p: number[][][][] };

/**
 * A cheap, non-interactive inset of a single ward: one extruded shape, no
 * OrbitControls, no raycasting, one render. Skipped entirely under 640px.
 */
export function WardInset3D({ wardId, corporation }: { wardId: string; corporation?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.innerWidth >= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!show || !wardId) return;
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await import("three");
        const raw: { wards: RawWard[] } = await fetch(asset.url).then((r) => r.json());
        if (disposed) return;
        const w = raw.wards.find((x) => x.id === wardId);
        if (!w) return;

        let minLon = 1e9,
          maxLon = -1e9,
          minLat = 1e9,
          maxLat = -1e9;
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
        const scale = 40 / Math.max((maxLon - minLon) * k, maxLat - minLat, 1e-6);

        const shapes: InstanceType<typeof THREE.Shape>[] = [];
        for (const poly of w.p) {
          const outer = poly[0];
          if (!outer || outer.length < 3) continue;
          const shape = new THREE.Shape();
          outer.forEach(([lon, lat], i) => {
            const x = (lon! - lon0) * k * scale;
            const y = (lat! - lat0) * scale;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          });
          for (let h = 1; h < poly.length; h++) {
            const path = new THREE.Path();
            poly[h]!.forEach(([lon, lat], i) => {
              const x = (lon! - lon0) * k * scale;
              const y = (lat! - lat0) * scale;
              if (i === 0) path.moveTo(x, y);
              else path.lineTo(x, y);
            });
            shape.holes.push(path);
          }
          shapes.push(shape);
        }
        if (!shapes.length) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#f3efe6");
        const width = mount.clientWidth || 260;
        const height = 150;
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
        camera.position.set(0, 46, 46);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0xbfb8a8, 1.1));
        const dir = new THREE.DirectionalLight(0xffffff, 0.7);
        dir.position.set(30, 60, 20);
        scene.add(dir);

        const geo = new THREE.ExtrudeGeometry(shapes, { depth: 3, bevelEnabled: false });
        geo.center();
        const mat = new THREE.MeshLambertMaterial({
          color: new THREE.Color(CORP_COLOR[corporation ?? w.c] ?? CORP_COLOR[w.c] ?? "#1f1d1a"),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -0.35;
        scene.add(mesh);
        renderer.render(scene, camera);

        cleanup = () => {
          geo.dispose();
          mat.dispose();
          scene.remove(mesh);
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
    };
  }, [show, wardId, corporation]);

  if (!show || !wardId) return null;
  return <div ref={mountRef} className="h-[150px] w-full border border-border" />;
}
