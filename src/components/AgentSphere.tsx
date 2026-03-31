"use client";
import { useEffect, useRef } from "react";

const NODE_COUNT = 110;
const SPHERE_R = 2.6;
const CONNECT_DIST = 1.45;
const FLOW_COUNT = 18;

export default function AgentSphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanupFn: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");

      const W = container.clientWidth;
      const H = container.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
      camera.position.z = 8.5;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // ── Fibonacci sphere node positions ──────────────────────
      const positions: import("three").Vector3[] = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        positions.push(new THREE.Vector3(
          SPHERE_R * Math.sin(phi) * Math.cos(theta),
          SPHERE_R * Math.sin(phi) * Math.sin(theta),
          SPHERE_R * Math.cos(phi)
        ));
      }

      const mainGroup = new THREE.Group();

      // ── Outer wireframe cage (makes 3D rotation obvious) ──────
      const cageGeo = new THREE.SphereGeometry(SPHERE_R, 18, 13);
      const cageMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
      });
      mainGroup.add(new THREE.Mesh(cageGeo, cageMat));

      // ── Connection lines ─────────────────────────────────────
      const edgePairs: [number, number][] = [];
      const lineVerts: number[] = [];
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) {
            edgePairs.push([i, j]);
            lineVerts.push(
              positions[i].x, positions[i].y, positions[i].z,
              positions[j].x, positions[j].y, positions[j].z
            );
          }
        }
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.35,
      });
      mainGroup.add(new THREE.LineSegments(lineGeo, lineMat));

      // ── Regular nodes ────────────────────────────────────────
      const dotArr = new Float32Array(NODE_COUNT * 3);
      positions.forEach((p, i) => {
        dotArr[i * 3] = p.x; dotArr[i * 3 + 1] = p.y; dotArr[i * 3 + 2] = p.z;
      });
      const dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute("position", new THREE.BufferAttribute(dotArr, 3));
      mainGroup.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
        color: 0x6366f1, size: 0.075, transparent: true, opacity: 0.9, sizeAttenuation: true,
      })));

      // ── Hub nodes (cyan, larger) ─────────────────────────────
      const hubArr: number[] = [];
      for (let i = 0; i < NODE_COUNT; i += 11) {
        hubArr.push(positions[i].x, positions[i].y, positions[i].z);
      }
      const hubGeo = new THREE.BufferGeometry();
      hubGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(hubArr), 3));
      mainGroup.add(new THREE.Points(hubGeo, new THREE.PointsMaterial({
        color: 0x06b6d4, size: 0.16, transparent: true, opacity: 1.0, sizeAttenuation: true,
      })));

      // ── Data-flow particles (dots that race along edges) ─────
      interface FlowParticle { edge: [number, number]; t: number; speed: number }
      const flows: FlowParticle[] = Array.from({ length: FLOW_COUNT }, () => ({
        edge: edgePairs[Math.floor(Math.random() * edgePairs.length)],
        t: Math.random(),
        speed: 0.012 + Math.random() * 0.018,
      }));
      const flowArr = new Float32Array(FLOW_COUNT * 3);
      const flowGeo = new THREE.BufferGeometry();
      flowGeo.setAttribute("position", new THREE.BufferAttribute(flowArr, 3));
      mainGroup.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({
        color: 0xffffff, size: 0.13, transparent: true, opacity: 1.0, sizeAttenuation: true,
      })));

      // Second flow layer — cyan tint
      const flowArr2 = new Float32Array(FLOW_COUNT * 3);
      const flowGeo2 = new THREE.BufferGeometry();
      flowGeo2.setAttribute("position", new THREE.BufferAttribute(flowArr2, 3));
      const flows2: FlowParticle[] = Array.from({ length: FLOW_COUNT }, () => ({
        edge: edgePairs[Math.floor(Math.random() * edgePairs.length)],
        t: Math.random(),
        speed: 0.008 + Math.random() * 0.014,
      }));
      mainGroup.add(new THREE.Points(flowGeo2, new THREE.PointsMaterial({
        color: 0x22d3ee, size: 0.10, transparent: true, opacity: 0.9, sizeAttenuation: true,
      })));

      scene.add(mainGroup);

      // ── Mouse parallax ────────────────────────────────────────
      let targetRotX = 0, targetRotY = 0;
      let smoothRotX = 0, smoothRotY = 0;
      const onMouseMove = (e: MouseEvent) => {
        targetRotX = -(e.clientY / window.innerHeight - 0.5) * 0.7;
        targetRotY =  (e.clientX / window.innerWidth  - 0.5) * 0.7;
      };
      window.addEventListener("mousemove", onMouseMove);

      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // ── Animation loop ────────────────────────────────────────
      let t = 0;
      let animId: number;

      const tick = () => {
        animId = requestAnimationFrame(tick);
        t += 0.005;

        // Base rotation (clearly visible)
        const baseY = t * 0.45;
        const baseX = Math.sin(t * 0.35) * 0.22;

        // Smooth mouse parallax
        smoothRotX += (targetRotX - smoothRotX) * 0.04;
        smoothRotY += (targetRotY - smoothRotY) * 0.04;

        mainGroup.rotation.y = baseY + smoothRotY;
        mainGroup.rotation.x = baseX + smoothRotX;

        // Update flow particles (layer 1)
        const pos1 = flowGeo.attributes.position as import("three").BufferAttribute;
        for (let i = 0; i < FLOW_COUNT; i++) {
          const f = flows[i];
          f.t += f.speed;
          if (f.t > 1) {
            f.t = 0;
            f.edge = edgePairs[Math.floor(Math.random() * edgePairs.length)];
          }
          const a = positions[f.edge[0]], b = positions[f.edge[1]];
          pos1.setXYZ(i, a.x + (b.x - a.x) * f.t, a.y + (b.y - a.y) * f.t, a.z + (b.z - a.z) * f.t);
        }
        pos1.needsUpdate = true;

        // Update flow particles (layer 2)
        const pos2 = flowGeo2.attributes.position as import("three").BufferAttribute;
        for (let i = 0; i < FLOW_COUNT; i++) {
          const f = flows2[i];
          f.t += f.speed;
          if (f.t > 1) {
            f.t = 0;
            f.edge = edgePairs[Math.floor(Math.random() * edgePairs.length)];
          }
          const a = positions[f.edge[0]], b = positions[f.edge[1]];
          pos2.setXYZ(i, a.x + (b.x - a.x) * f.t, a.y + (b.y - a.y) * f.t, a.z + (b.z - a.z) * f.t);
        }
        pos2.needsUpdate = true;

        // Pulse line opacity
        (lineMat as import("three").LineBasicMaterial).opacity = 0.25 + Math.sin(t * 1.2) * 0.1;

        renderer.render(scene, camera);
      };
      tick();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    })();

    return () => cleanupFn?.();
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
