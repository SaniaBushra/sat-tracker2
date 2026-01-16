import React, { useRef, Suspense, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Html, useTexture, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const GLOBE_RADIUS = 1.5;

function latLngToVector3(lat, lng, altKm = 0, type = 'satellite') {
  let radius = GLOBE_RADIUS;

  if (type === 'satellite') {
    radius = GLOBE_RADIUS + (altKm / 1000) * 0.5 + 0.05; 
  } else if (type === 'asteroid') {
    const logDist = Math.log10(Math.max(altKm, 10000));
    radius = 2.5 + (logDist - 4) * 1.2; 
  } else if (type === 'user') {
    radius = GLOBE_RADIUS + 0.01;
  }

  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return [x, y, z]
}

function Atmosphere() {
  return (
    <mesh scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.05}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function World({ satellites, asteroids, userPosition, focusOnUser, worldRef }) {
  useFrame((state, delta) => {
    if (worldRef.current && !focusOnUser) {
      worldRef.current.rotation.y += delta * 0.02
    }
  })

  const [colorMap, normalMap] = useTexture([
    '/textures/earth_daymap.jpg',
    '/textures/earth_normal_map.jpg',
  ])

  return (
    <group ref={worldRef}>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughness={0.7}
          metalness={0}
        />
      </mesh>

      <Atmosphere />

      {satellites?.map((sat, i) => (
        <Marker 
          key={`sat-${i}`} 
          position={latLngToVector3(sat.satlat, sat.satlng, sat.satalt, 'satellite')} 
          color="#00ff88" 
          size={0.02} 
          label={sat.satname}
          type="satellite"
        />
      ))}

      {asteroids?.map((ast, i) => {
        const randomLat = (i * 137) % 180 - 90; 
        const randomLng = (i * 291) % 360 - 180;
        const distanceKm = parseFloat(ast.miss_distance.kilometers);
        
        return (
          <Marker 
            key={`ast-${i}`} 
            position={latLngToVector3(randomLat, randomLng, distanceKm, 'asteroid')} 
            color={ast.hazardous ? "#ff2a2a" : "#ffaa00"} 
            size={ast.hazardous ? 0.05 : 0.03} 
            label={ast.name}
            type="asteroid"
            details={`Miss Dist: ${(distanceKm/1000000).toFixed(1)}M km`}
          />
        )
      })}

      {userPosition && (
        <UserPin position={latLngToVector3(userPosition.lat, userPosition.lng, 0, 'user')} />
      )}
    </group>
  )
}

function UserPin({ position }) {
  const groupRef = useRef()
  const ringRef = useRef()
  
  useFrame((state) => {
    if(groupRef.current) {
       groupRef.current.lookAt(state.camera.position) 
    }
    if(ringRef.current) {
      ringRef.current.scale.x = ringRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      ringRef.current.material.opacity = 0.6 - Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group position={position}>
       <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
         <ringGeometry args={[0.04, 0.06, 32]} />
         <meshBasicMaterial color="#0099ff" side={THREE.DoubleSide} transparent opacity={0.6} />
       </mesh>
       
      <mesh ref={groupRef}>
        <circleGeometry args={[0.03, 32]} />
        <meshBasicMaterial color="#0099ff" toneMapped={false} />
      </mesh>
      <pointLight color="#0099ff" distance={0.8} intensity={0.2} />
    </group>
  )
}

const Marker = React.memo(function Marker({ position, color, size, label, type, details }) {
  const [hovered, setHover] = useState(false)

  // Load asteroid texture
  const asteroidTexture = useTexture('/textures/10464_Asteroid_v1_diffuse.jpg')

  // Load satellite GLB model
  const satelliteModel = useGLTF('/textures/Deep Space 1.glb')

  return (
    <group position={position}>
      {type === 'satellite' ? (
        <primitive
          object={satelliteModel.scene.clone()}
          scale={[size * 0.5, size * 0.5, size * 0.5]}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        />
      ) : (
        <mesh
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          {type === 'asteroid' ?
            <dodecahedronGeometry args={[size, 0]} /> :
            <boxGeometry args={[size, size, size]} />
          }
          {type === 'asteroid' ? (
            <meshStandardMaterial
              map={asteroidTexture}
              color={hovered ? "#ffffff" : "#ffffff"} // White tint to show texture, adjust as needed
              toneMapped={false}
            />
          ) : (
            <meshBasicMaterial color={hovered ? "#ffffff" : color} toneMapped={false} />
          )}
        </mesh>
      )}

      {hovered && (
        <Html distanceFactor={3} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(10, 10, 16, 0.95)',
            border: `1px solid ${color}`,
            padding: '10px 12px',
            borderRadius: '6px',
            color: '#eee',
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transform: 'translate3d(-50%, -150%, 0)',
            boxShadow: `0 0 15px ${color}60`,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{fontWeight: 'bold', color: color, marginBottom: '4px'}}>{label}</div>
            {details && <div style={{fontSize: '9px', color: '#aaa'}}>{details}</div>}
          </div>
        </Html>
      )}
    </group>
  )
})

function CameraController({ userPosition, focusOnUser }) {
  const controlsRef = useRef()
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 6))
  const targetControlsTarget = useRef(new THREE.Vector3(0, 0, 0))
  const { invalidate } = useThree()
  const previousFocusState = useRef(focusOnUser)
  const originTarget = useRef(new THREE.Vector3(0, 0, 0)) // Reusable origin vector

  // Handle OrbitControls change events
  useEffect(() => {
    const controls = controlsRef.current
    if (controls) {
      const handleChange = () => invalidate()
      controls.addEventListener('change', handleChange)
      return () => controls.removeEventListener('change', handleChange)
    }
  }, [invalidate])

  useEffect(() => {
    if (focusOnUser && userPosition) {
      const [x, y, z] = latLngToVector3(userPosition.lat, userPosition.lng, 0, 'user')
      const userPosVector = new THREE.Vector3(x, y, z)
      
      const cameraDistance = 4
      const cameraOffset = userPosVector.clone().normalize().multiplyScalar(cameraDistance)
      
      targetCameraPosition.current.copy(cameraOffset)
      targetControlsTarget.current.copy(userPosVector)
    } else if (!focusOnUser && previousFocusState.current) {
      // When exiting focus mode, reset target to origin
      targetControlsTarget.current.set(0, 0, 0)
    }
    
    previousFocusState.current = focusOnUser
  }, [focusOnUser, userPosition])

  useFrame(({ camera }) => {
    if (controlsRef.current) {
      if (focusOnUser) {
        // Disable controls during camera animation
        controlsRef.current.enabled = false
        camera.position.lerp(targetCameraPosition.current, 0.05)
        controlsRef.current.target.lerp(targetControlsTarget.current, 0.05)
      } else {
        // Enable controls for manual rotation
        controlsRef.current.enabled = true
        // Smoothly lerp target back to origin to keep Earth centered
        controlsRef.current.target.lerp(originTarget.current, 0.1)
      }
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={2.5}
      maxDistance={12}
      enableDamping={true}
      dampingFactor={0.05}
      target={[0, 0, 0]}
    />
  )
}

export default function EarthGlobe({ satellites, asteroids, userPosition, focusOnUser }) {
  const worldRef = useRef()

  return (
    <div style={{ width: '100%', height: '100vh', background: '#020205' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }} 
        gl={{ 
          antialias: true, 
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <Stars radius={300} depth={60} count={8000} factor={6} saturation={0} fade />

        <ambientLight intensity={0.4} color="#ffffff" /> 
        <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-5, -2, -5]} intensity={0.3} color="#ffffff" />

        <Suspense fallback={null}>
          <World
            satellites={satellites}
            asteroids={asteroids}
            userPosition={userPosition}
            focusOnUser={focusOnUser}
            worldRef={worldRef}
          />
        </Suspense>

        <CameraController userPosition={userPosition} focusOnUser={focusOnUser} />
      </Canvas>
    </div>
  )
}
