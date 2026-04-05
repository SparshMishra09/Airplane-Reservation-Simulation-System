"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Float, Environment, useTexture, ContactShadows, useFBX, Center, Grid } from "@react-three/drei";
import * as THREE from "three";

function ExternalPlane({ scrollY }: { scrollY: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  
  // Load the FBX model
  const fbx = useFBX("/assets/3d plane/jet/jet.fbx");
  
  // Load textures
  const textures = useTexture({
    main: "/assets/3d plane/jet/atlasjet-texture/atlasjet-white.png",
    accent: "/assets/3d plane/jet/atlasjet-texture/atlasjet-black.png",
    window: "/assets/3d plane/jet/atlasjet-texture/window.png",
    wide: "/assets/3d plane/jet/atlasjet-texture/wide.png",
  });

  // Optimize textures
  useMemo(() => {
    Object.values(textures).forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 16;
      t.flipY = false;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
  }, [textures]);

  // Apply materials
  useMemo(() => {
    fbx.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        const meshName = child.name.toLowerCase();
        // Upgrade from Standard to Physical Material for ultra-premium automotive clearcoat finish
        const newMat = new THREE.MeshPhysicalMaterial({
          map: textures.main,
          roughness: 0.3, // Baseline roughness
          metalness: 0.6,
          clearcoat: 1.0, // Premium glossy protective layer
          clearcoatRoughness: 0.1, // Highly polished
          side: THREE.DoubleSide,
          envMapIntensity: 2.5,
        });

        if (meshName.includes('window') || meshName.includes('glass')) {
          newMat.map = textures.window;
          newMat.metalness = 0.9;
          newMat.roughness = 0.05;
          newMat.clearcoat = 1.0;
          newMat.transparent = true;
          newMat.opacity = 0.95;
        } else if (meshName.includes('wheel') || meshName.includes('tire') || meshName.includes('tyre') || meshName.includes('gear')) {
          // Tires and landing gear detailing
          newMat.map = null; // No UV texture map for wheels
          newMat.color = new THREE.Color("#111827"); // Deep rubber black
          newMat.roughness = 0.9; // Rubber absorbs light
          newMat.metalness = 0.1;
          newMat.clearcoat = 0.0;
        } else if (meshName.includes('rim') || meshName.includes('strut')) {
          // Landing gear metal struts and rims
          newMat.map = null;
          newMat.color = new THREE.Color("#94a3b8"); // Slate silver
          newMat.metalness = 0.9;
          newMat.roughness = 0.2;
        } else if (meshName.includes('blade') || meshName.includes('fan')) {
          // Engine fan blades
          newMat.map = null;
          newMat.color = new THREE.Color("#020617"); // Dark titanium
          newMat.metalness = 0.8;
          newMat.roughness = 0.3;
        } else if (meshName.includes('engine') || meshName.includes('exhaust')) {
          newMat.map = textures.accent;
          newMat.metalness = 1.0;
          newMat.emissive = new THREE.Color("#fbbf24"); // Warm runway ambient
          newMat.emissiveIntensity = 2.0;
        } else if (meshName.includes('wing') || meshName.includes('body')) {
          newMat.map = textures.wide;
        }

        child.material = newMat;
      }
    });
  }, [fbx, textures]);

  // Calculate global scale
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return 4.5 / maxDim;
  }, [fbx]);

  useFrame((state) => {
    if (meshRef.current) {
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
      const scrollMax = typeof document !== 'undefined' ? document.documentElement.scrollHeight - screenHeight : 4000;
      const scrollPercent = scrollY / Math.max(scrollMax, 1);
      
      // Dynamic Flight Path Generation based on Scroll
      // We want the plane to gracefully swing out, bank, and dip exactly matching the page narrative Sections
      
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;
      let targetRotX = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
      let targetRotY = Math.PI; // default facing forward
      let targetRotZ = 0;
      
      // Calculate Scroll Delta for Banking effect
      const scrollDelta = scrollY - (meshRef.current.userData.lastScroll || scrollY);
      meshRef.current.userData.lastScroll = scrollY;
      
      if (scrollPercent < 0.25) {
        // Section 1: Hero to Stats - Taking off/Climbing slightly, flying right
        const p = scrollPercent / 0.25;
        targetX = p * 4; // Fly to the right
        targetY = p * 1.5; // Climb up
        targetZ = p * 2; // Come closer
        targetRotZ = -p * 0.3; // Bank slightly
        targetRotY = Math.PI + (p * 0.3); // Turn right
        targetRotX += p * 0.2; // Pitch up
      } else if (scrollPercent < 0.6) {
        // Section 2: Stats to Mission - Cruising, swinging left
        const p = (scrollPercent - 0.25) / 0.35;
        // Start from Section 1 end state
        const startX = 4, startY = 1.5, startZ = 2;
        targetX = startX - (p * 8); // Swing from right (4) to left (-4)
        targetY = startY - (p * 1); // Descend slightly
        targetZ = startZ + (p * 3); // Fly closer
        targetRotY = (Math.PI + 0.3) - (p * 0.6); // Turn from right turn into left turn
        targetRotZ = 0.3 + (scrollDelta * 0.015); // Bank based on downward velocity + baseline left bank
      } else if (scrollPercent < 0.9) {
        // Section 3: Mission to Values - Coming in for a runway "approach" pass
        const p = (scrollPercent - 0.6) / 0.3;
        const startX = -4, startY = 0.5, startZ = 5;
        targetX = startX + (p * 4); // Center it back
        targetY = startY - (p * 2.5); // Descend for landing pass
        targetZ = startZ - (p * 3); // Move away
        targetRotY = (Math.PI - 0.3) + (p * 0.3); // Straighten out
        targetRotZ = p * -0.1; // Smooth out
        targetRotX -= p * 0.2; // Pitch down slightly on approach
      } else {
        // Section 4: Finale - Touching down or hovering center stage
        const p = Math.min((scrollPercent - 0.9) / 0.1, 1);
        targetX = 0;
        targetY = -2;
        targetZ = 2 + (p * 3); // Zoom into the camera directly
        targetRotY = Math.PI;
        targetRotX = 0;
        targetRotZ = 0;
      }
      
      // Smoothly interpolate all values for that ultra-premium buttery feel
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.03);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.03);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.03);
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.03);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.03);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.04);
      
      const time = state.clock.getElapsedTime();

      // Engine glow pulsing
      if (engineGlowRef.current) {
        engineGlowRef.current.intensity = 15 + Math.sin(time * 20) * 5;
      }
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <Center>
          <primitive object={fbx} scale={scale} />
        </Center>
        
        {/* Warm engine glow acting as ambient engine reflection */}
        <pointLight ref={engineGlowRef} position={[0, -0.5, -1.8]} color="#f59e0b" distance={8} />
      </Float>
    </group>
  );
}

export function AboutPlaneScene({ scrollY }: { scrollY: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas dpr={[1, 2]} shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Darker premium ambient for terminal aesthetic */}
        <ambientLight intensity={0.4} />
        
        {/* Studio lighting for the plane */}
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.4} 
          penumbra={1} 
          intensity={1200} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
          color="#f8fafc" 
          decay={1}
        />
        
        {/* Airport terminal accent rim mapping - Amber / Slate tones */}
        <pointLight position={[-10, 5, -10]} intensity={600} color="#fbbf24" decay={1} />
        <pointLight position={[10, -5, 5]} intensity={500} color="#38bdf8" decay={1} />
        <directionalLight position={[0, 10, 0]} intensity={2} color="#f1f5f9" />
        
        {/* Remove stars. Add a subtle grid/tarmac runway reference */}
        <Grid 
          position={[0, -5, 0]} 
          args={[30, 30]} 
          cellColor="#334155" 
          sectionColor="#0f172a" 
          fadeDistance={30} 
          cellThickness={1} 
          sectionThickness={1.5} 
          infiniteGrid
        />
        
        <Suspense fallback={null}>
          <ExternalPlane scrollY={scrollY} />
          {/* Use airport/night environment preset or dawn for better metals */}
          <Environment preset="night" environmentIntensity={1.0} blur={0.8} />
          
          <ContactShadows 
            position={[0, -4.9, 0]} 
            opacity={0.6} 
            scale={20} 
            blur={2.5} 
            far={10} 
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
