import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function FloatingShape() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1.5, 0.4, 128, 16]} />
      <meshStandardMaterial 
        color="#a78bfa"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function SecondaryShape() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.25;
      meshRef.current.position.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 1.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[2, -1, -2]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#14b8a6"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 w-screen h-screen">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-teal-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.2),transparent_40%)]" />
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#14b8a6" />
        <FloatingShape />
        <SecondaryShape />
      </Canvas>
    </div>
  );
}