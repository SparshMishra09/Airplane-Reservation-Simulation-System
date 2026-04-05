"use client";

import { useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";

// ... (airport coords)
const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
  // Indian Airports
  DEL: { lat: 28.5562, lng: 77.1000 },
  BOM: { lat: 19.0896, lng: 72.8656 },
  BLR: { lat: 13.1986, lng: 77.7066 },
  MAA: { lat: 12.9941, lng: 80.1709 },
  CCU: { lat: 22.6547, lng: 88.4467 },
  HYD: { lat: 17.2403, lng: 78.4294 },
  GOI: { lat: 15.3800, lng: 73.8300 },
  AMD: { lat: 23.0734, lng: 72.6347 },
  PNQ: { lat: 18.5822, lng: 73.9197 },
  COK: { lat: 10.1520, lng: 76.4019 },
  JAI: { lat: 26.8242, lng: 75.8122 },
  GAU: { lat: 26.1061, lng: 91.5859 },
  LKO: { lat: 26.7606, lng: 80.8893 },
  IXC: { lat: 30.6735, lng: 76.7885 },
  PAT: { lat: 25.5908, lng: 85.0882 },
  SXR: { lat: 33.9870, lng: 74.7741 },
  TRV: { lat: 8.4821, lng: 76.9200 },
  VNS: { lat: 25.4522, lng: 82.8593 },
  IXB: { lat: 26.6812, lng: 88.3286 },
  RPR: { lat: 21.1804, lng: 81.7388 },
  // Demo Airports
  DXB: { lat: 25.2528, lng: 55.3644 },
  LHR: { lat: 51.4700, lng: -0.4543 },
  JFK: { lat: 40.6413, lng: -73.7781 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  NRT: { lat: 35.7720, lng: 140.3929 },
  SIN: { lat: 1.3644, lng: 103.9915 },
  SYD: { lat: -33.9399, lng: 151.1753 },
  FRA: { lat: 50.0379, lng: 8.5622 },
  AMS: { lat: 52.3105, lng: 4.7683 },
  HKG: { lat: 22.3080, lng: 113.9185 },
};

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  // Convert lat/lng to radians
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  // Standard conversion for Three.js SphereGeometry
  // x = -r * sin(phi) * cos(theta)
  // y =  r * cos(phi)
  // z =  r * sin(phi) * sin(theta)
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function Marker({ position, color }: { position: THREE.Vector3; color: string }) {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (haloRef.current) {
      // Pulse effect
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.3;
      haloRef.current.scale.set(s, s, s);
      const material = haloRef.current.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = 0.4 - (s - 1) * 0.5;
      }
    }
  });

  return (
    <group position={position}>
      {/* Core point */}
      <mesh>
        <sphereGeometry args={[0.04, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          roughness={0}
          metalness={1}
        />
      </mesh>
      {/* Glowing Halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      {/* Ground Ring */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[0.06, 0.07, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function FlightRoute({ from, to }: { from: string; to: string }) {
  const flightPath = useMemo(() => {
    if (!from || !to || !AIRPORT_COORDS[from] || !AIRPORT_COORDS[to]) return null;

    const start = latLngToVector3(AIRPORT_COORDS[from].lat, AIRPORT_COORDS[from].lng, 2.02);
    const end = latLngToVector3(AIRPORT_COORDS[to].lat, AIRPORT_COORDS[to].lng, 2.02);

    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    midPoint.normalize().multiplyScalar(2.02 + Math.min(distance * 0.4, 1.5));

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    return curve.getPoints(50);
  }, [from, to]);

  const fromPos = useMemo(() => 
    from && AIRPORT_COORDS[from] ? latLngToVector3(AIRPORT_COORDS[from].lat, AIRPORT_COORDS[from].lng, 2.02) : null
  , [from]);

  const toPos = useMemo(() => 
    to && AIRPORT_COORDS[to] ? latLngToVector3(AIRPORT_COORDS[to].lat, AIRPORT_COORDS[to].lng, 2.02) : null
  , [to]);

  if (!fromPos || !toPos) return null;

  return (
    <group>
      <Marker position={fromPos} color="#fbbf24" />
      <Marker position={toPos} color="#f59e0b" />
      {flightPath && (
        <line>
          <bufferGeometry>
            {/* @ts-ignore - existing prop shape works at runtime */}
            <bufferAttribute
              attach="attributes-position"
              count={flightPath.length}
              array={new Float32Array(flightPath.flatMap(v => [v.x, v.y, v.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#fbbf24"
            linewidth={3}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </line>
      )}
    </group>
  );
}

function Earth({ routes, autoRotate }: { routes: { from: string; to: string }[]; autoRotate: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const [colorMap, bumpMap] = useLoader(THREE.TextureLoader, [
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    "https://unpkg.com/three-globe/example/img/earth-topology.png",
  ]) as THREE.Texture[];

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={earthRef} rotation-y={0}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.4}
          metalness={0.1}
          emissive="#111"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {routes.map((route, i) => (
        <FlightRoute key={`${route.from}-${route.to}-${i}`} from={route.from} to={route.to} />
      ))}
    </group>
  );
}

function LoadingGlobe() {
  // ... (keep LoadingGlobe as is)
  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#0c4a6e" wireframe />
      <Html center>
        <div className="flex flex-col items-center gap-2 text-sky-100">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mapping</span>
        </div>
      </Html>
    </mesh>
  );
}

function CameraController({ focusPoint }: { focusPoint: THREE.Vector3 | null }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (focusPoint) {
      // Smoothly interpolate camera position to focus point
      camera.position.lerp(focusPoint, 0.05);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

export function EarthModel({ 
  from, 
  to, 
  routes,
  className,
  autoFocus = false
}: { 
  from?: string; 
  to?: string; 
  routes?: { from: string; to: string }[];
  className?: string;
  autoFocus?: boolean;
}) {
  const activeRoutes = useMemo(() => {
    if (routes && routes.length > 0) return routes;
    if (from && to) return [{ from, to }];
    return [];
  }, [from, to, routes]);

  const focusPoint = useMemo(() => {
    if (!autoFocus || activeRoutes.length === 0) return null;
    
    const points: THREE.Vector3[] = [];
    activeRoutes.forEach(r => {
      if (AIRPORT_COORDS[r.from]) points.push(latLngToVector3(AIRPORT_COORDS[r.from].lat, AIRPORT_COORDS[r.from].lng, 2));
      if (AIRPORT_COORDS[r.to]) points.push(latLngToVector3(AIRPORT_COORDS[r.to].lat, AIRPORT_COORDS[r.to].lng, 2));
    });

    if (points.length === 0) return null;
    
    const center = new THREE.Vector3(0, 0, 0);
    points.forEach(p => center.add(p));
    center.divideScalar(points.length);
    // Position camera at a good distance from the calculated center
    return center.normalize().multiplyScalar(4.5);
  }, [activeRoutes, autoFocus]);

  return (
    <div className={`rounded-3xl overflow-hidden bg-[#010409] border border-white/10 shadow-2xl relative ${className || "h-[400px] w-full"}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={2.5} />
        <hemisphereLight intensity={1.2} groundColor="#000" color="#fff" />
        <pointLight position={[10, 10, 10]} intensity={4.5} color="#fff" />
        <directionalLight position={[-10, 10, 5]} intensity={3.0} color="#fff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Suspense fallback={<LoadingGlobe />}>
          <Earth routes={activeRoutes} autoRotate={!autoFocus} />
        </Suspense>
        <CameraController focusPoint={focusPoint} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={2.5} 
          maxDistance={8}
          autoRotate={false}
          makeDefault
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">3D Route Visualization</p>
        </div>
        {activeRoutes.length === 1 && (
          <div className="bg-primary/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/40">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{activeRoutes[0].from} ✈ {activeRoutes[0].to}</p>
          </div>
        )}
        {activeRoutes.length > 1 && (
          <div className="bg-primary/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/40">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{activeRoutes.length} Active Routes</p>
          </div>
        )}
      </div>
    </div>
  );
}

