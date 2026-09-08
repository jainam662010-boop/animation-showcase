import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

// ===== Scroll effect - rotating cubes =====
function ScrollScene() {
  const group = useRef()
  const cubes = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    pos: [(Math.random() - .5) * 4, (Math.random() - .5) * 3, (Math.random() - .5) * 2],
    rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    color: new THREE.Color().setHSL(.6 + Math.random() * .15, .6, .5 + Math.random() * .2),
    speed: .3 + Math.random() * .5
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!group.current) return
    group.current.rotation.y = t * .1
    group.current.children.forEach((child, i) => {
      child.rotation.x = t * cubes[i].speed
      child.rotation.z = t * cubes[i].speed * .5
      child.position.y = cubes[i].pos[1] + Math.sin(t + i) * .3
    })
  })

  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot}>
          <boxGeometry args={[.5 + Math.random() * .5, .5 + Math.random() * .5, .5 + Math.random() * .5]} />
          <meshStandardMaterial color={c.color} transparent opacity={.8} />
        </mesh>
      ))}
      <ambientLight intensity={.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
    </group>
  )
}

// ===== Globe scene =====
function GlobeScene() {
  const globe = useRef()
  const dots = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!globe.current) return
    globe.current.rotation.y = t * .2
    if (dots.current) dots.current.rotation.y = t * .2
  })

  const dotPositions = useMemo(() => {
    const positions = []
    const cities = [
      [40, -74], [51, 0], [35, 139], [-34, 151], [1.3, 103.8],
      [48, 2], [55, 37], [19, 72], [34, 118], [-23, -46],
      [52, 13], [41, 29], [37, 127], [22, 114], [30, 31]
    ]
    cities.forEach(([lat, lon]) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      positions.push(-1.5 * Math.sin(phi) * Math.cos(theta), 1.5 * Math.cos(phi), 1.5 * Math.sin(phi) * Math.sin(theta))
    })
    return new Float32Array(positions)
  }, [])

  return (
    <group>
      <mesh ref={globe}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial color="#2563eb" wireframe transparent opacity={.15} />
      </mesh>
      <points ref={dots}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={dotPositions} count={15} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={.08} color="#2563eb" />
      </points>
      <ambientLight intensity={.3} />
      <pointLight position={[5, 5, 5]} intensity={.8} />
    </group>
  )
}

// ===== Scroll Tunnel — camera flies through rings on scroll =====
function ScrollTunnelScene() {
  const group = useRef()
  const rings = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    z: -i * 2,
    radius: 1.2 + Math.sin(i * .3) * .4,
    color: new THREE.Color().setHSL(.6 + (i / 30) * .15, .7, .55)
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!group.current) return
    const scroll = (Math.sin(t * .15) + 1) / 2
    const camZ = scroll * 30
    group.current.position.z = camZ
    group.current.children.forEach((child, i) => {
      child.rotation.z = t * .3 + i * .2
      const dist = Math.abs(child.position.z + camZ)
      child.scale.setScalar(Math.max(.3, 1 - dist * .03))
    })
  })

  return (
    <group ref={group}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, 0, r.z]}>
          <torusGeometry args={[r.radius, .04, 8, 32]} />
          <meshStandardMaterial color={r.color} emissive={r.color} emissiveIntensity={.3} />
        </mesh>
      ))}
      <ambientLight intensity={.3} />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#60a5fa" />
    </group>
  )
}

// ===== Scroll Particles — particles converge into shape =====
function ScrollParticlesScene() {
  const points = useRef()
  const count = 400

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const arr2 = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const r = 1.5
      arr2[i * 3] = Math.cos(a) * r
      arr2[i * 3 + 1] = Math.sin(a) * r
      arr2[i * 3 + 2] = Math.sin(a * 2) * .3
      arr[i * 3] = (Math.random() - .5) * 6
      arr[i * 3 + 1] = (Math.random() - .5) * 6
      arr[i * 3 + 2] = (Math.random() - .5) * 6
    }
    return { scattered: arr, target: arr2 }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!points.current) return
    const progress = (Math.sin(t * .4) + 1) / 2
    const pos = points.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3] = positions.scattered[i * 3] + (positions.target[i * 3] - positions.scattered[i * 3]) * progress
      pos[i * 3 + 1] = positions.scattered[i * 3 + 1] + (positions.target[i * 3 + 1] - positions.scattered[i * 3 + 1]) * progress
      pos[i * 3 + 2] = positions.scattered[i * 3 + 2] + (positions.target[i * 3 + 2] - positions.scattered[i * 3 + 2]) * progress
    }
    points.current.geometry.attributes.position.needsUpdate = true
    points.current.rotation.z = t * .1
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions.scattered} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={.04} color="#60a5fa" transparent opacity={.8} />
    </points>
  )
}

// ===== Scroll Morph — cube morphs to sphere to torus =====
function ScrollMorphScene() {
  const mesh = useRef()
  const geoRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!mesh.current) return
    const phase = (t * .3) % 3
    const s = mesh.current
    if (phase < 1) {
      s.rotation.x = t * .5
      s.rotation.y = t * .3
      s.scale.setScalar(1 + Math.sin(t * 2) * .1)
    } else if (phase < 2) {
      s.rotation.x = t * .4
      s.rotation.y = t * .6
      s.scale.setScalar(1.2 + Math.sin(t * 3) * .15)
    } else {
      s.rotation.x = t * .6
      s.rotation.y = t * .2
      s.scale.setScalar(.9 + Math.sin(t * 2.5) * .1)
    }
  })

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#60a5fa" wireframe transparent opacity={.6} />
      </mesh>
      <ambientLight intensity={.4} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#a78bfa" />
      <pointLight position={[-3, -2, 2]} intensity={.8} color="#60a5fa" />
    </group>
  )
}

// ===== Scroll Layers — parallax planes at different depths =====
function ScrollLayersScene() {
  const group = useRef()
  const layers = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    z: -i * 1.5,
    width: 2 + i * .5,
    height: 1.5 + i * .3,
    color: new THREE.Color().setHSL(.6 + i * .02, .5, .45 + i * .03),
    speed: .2 + i * .1
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      child.position.x = Math.sin(t * layers[i].speed + i) * (1 + i * .3)
      child.position.y = Math.cos(t * layers[i].speed * .7 + i) * (.5 + i * .15)
      child.rotation.z = Math.sin(t * .2 + i * .5) * .1
    })
  })

  return (
    <group ref={group}>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, 0, l.z]}>
          <planeGeometry args={[l.width, l.height]} />
          <meshStandardMaterial color={l.color} transparent opacity={.15 + i * .05} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <ambientLight intensity={.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
    </group>
  )
}

// ===== Scroll Grid — grid of cubes with wave distortion =====
function ScrollGridScene() {
  const group = useRef()
  const cubes = useMemo(() => {
    const arr = []
    for (let x = -3; x <= 3; x++) {
      for (let z = -2; z <= 2; z++) {
        arr.push({
          pos: [x * .8, 0, z * .8],
          baseY: 0,
          color: new THREE.Color().setHSL(.55 + (x + 3) * .03, .6, .5 + (z + 2) * .05)
        })
      }
    }
    return arr
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      const c = cubes[i]
      child.position.y = Math.sin(t * 1.5 + c.pos[0] * 2 + c.pos[2] * 1.5) * .5
      child.rotation.x = t * .5 + i * .1
      child.rotation.z = t * .3 + i * .15
      child.scale.setScalar(.8 + Math.sin(t * 2 + i * .5) * .2)
    })
  })

  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <boxGeometry args={[.35, .35, .35]} />
          <meshStandardMaterial color={c.color} transparent opacity={.7} />
        </mesh>
      ))}
      <ambientLight intensity={.4} />
      <pointLight position={[4, 5, 4]} intensity={1.2} color="#60a5fa" />
    </group>
  )
}

// ===== Scroll Spiral — helix of dots that rotates and spreads =====
function ScrollSpiralScene() {
  const points = useRef()
  const count = 300

  const { scattered, target } = useMemo(() => {
    const s = new Float32Array(count * 3)
    const t = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 6
      const y = (i / count) * 6 - 3
      const r = .8
      t[i * 3] = Math.cos(a) * r
      t[i * 3 + 1] = y
      t[i * 3 + 2] = Math.sin(a) * r
      s[i * 3] = (Math.random() - .5) * 5
      s[i * 3 + 1] = (Math.random() - .5) * 5
      s[i * 3 + 2] = (Math.random() - .5) * 5
    }
    return { scattered: s, target: t }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!points.current) return
    const progress = (Math.sin(t * .35) + 1) / 2
    const spread = 1 + Math.sin(t * .5) * .5
    const pos = points.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      const tx = target[i * 3] * spread
      const ty = target[i * 3 + 1]
      const tz = target[i * 3 + 2] * spread
      pos[i * 3] = scattered[i * 3] + (tx - scattered[i * 3]) * progress
      pos[i * 3 + 1] = scattered[i * 3 + 1] + (ty - scattered[i * 3 + 1]) * progress
      pos[i * 3 + 2] = scattered[i * 3 + 2] + (tz - scattered[i * 3 + 2]) * progress
    }
    points.current.geometry.attributes.position.needsUpdate = true
    points.current.rotation.y = t * .15
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={scattered} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={.045} color="#a78bfa" transparent opacity={.85} />
    </points>
  )
}

// ===== Main export =====
export default function ThreeEffects({ type }) {
  const scenes = {
    scroll: { Comp: ScrollScene, cam: [0, 0, 5], fov: 50 },
    globe: { Comp: GlobeScene, cam: [0, 0, 4], fov: 50 },
    scrollTunnel: { Comp: ScrollTunnelScene, cam: [0, 0, 3], fov: 60 },
    scrollParticles: { Comp: ScrollParticlesScene, cam: [0, 0, 4], fov: 50 },
    scrollMorph: { Comp: ScrollMorphScene, cam: [0, 0, 3.5], fov: 50 },
    scrollLayers: { Comp: ScrollLayersScene, cam: [0, 0, 4], fov: 50 },
    scrollGrid: { Comp: ScrollGridScene, cam: [0, 2, 6], fov: 45 },
    scrollSpiral: { Comp: ScrollSpiralScene, cam: [0, 0, 5], fov: 50 }
  }

  const scene = scenes[type]
  if (!scene) return null

  return <ThreeCanvas Scene={scene.Comp} cam={scene.cam} fov={scene.fov} />
}

function ThreeCanvas({ Scene, cam, fov }) {
  const [err, setErr] = useState(null)

  if (err) return <div style={{ color: '#ef4444', fontSize: 12, padding: 12 }}>WebGL Error: {err}</div>

  return (
    <Canvas
      camera={{ position: cam, fov }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => { if (!gl) setErr('No WebGL context') }}
    >
      <color attach="background" args={['#0f172a']} />
      <Scene />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
