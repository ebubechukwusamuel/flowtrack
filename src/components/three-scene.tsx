"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, MeshTransmissionMaterial } from "@react-three/drei"
import type * as THREE from "three"

function FloatingShape({ position, color, type = "torus", ...props }: {
  position: [number, number, number]
  color: string
  type?: "torus" | "icosahedron" | "octahedron"
  [key: string]: unknown
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.x = t * 0.1 + pointer.y * 0.3
    meshRef.current.rotation.y = t * 0.15 + pointer.x * 0.5
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.3
  })

  const Geometry = type === "torus"
    ? (props: Record<string, unknown>) => <torusKnotGeometry args={[1, 0.3, 128, 16]} {...props} />
    : type === "icosahedron"
    ? (props: Record<string, unknown>) => <icosahedronGeometry args={[1, 1]} {...props} />
    : (props: Record<string, unknown>) => <octahedronGeometry args={[1]} {...props} />

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={0.6}>
        <Geometry />
        <MeshDistortMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          distort={0.15}
          speed={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

function GlowingSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.05
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.08
  })

  return (
    <mesh ref={meshRef} position={position} scale={0.4}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.5}
        chromaticAberration={0.1}
        anisotropicBlur={0.1}
        toneMapped={false}
      />
    </mesh>
  )
}

function WireframeGrid() {
  return (
    <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color="#1e1b4b" wireframe transparent opacity={0.08} />
    </mesh>
  )
}

function Scene() {
  const shapes = useMemo(() => [
    { position: [-6, 1, -4] as [number, number, number], color: "#818cf8", type: "torus" as const },
    { position: [5, -1, -3] as [number, number, number], color: "#a78bfa", type: "icosahedron" as const },
    { position: [7, 2, -6] as [number, number, number], color: "#6366f1", type: "octahedron" as const },
    { position: [-5, -2, -5] as [number, number, number], color: "#8b5cf6", type: "torus" as const },
  ], [])

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#818cf8" />
      <pointLight position={[-10, -5, 5]} intensity={0.8} color="#6366f1" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />

      <GlowingSphere position={[0, 0, -8]} />

      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}

      <WireframeGrid />

      <fog attach="fog" args={["#0a0a0f", 12, 22]} />
    </>
  )
}

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
