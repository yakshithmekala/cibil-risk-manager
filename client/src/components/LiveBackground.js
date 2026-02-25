import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleBackground = () => {
    const ref = useRef();
    const [sphere] = useMemo(() => {
        const arr = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            const r = 10;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            arr[i * 3 + 2] = r * Math.cos(phi);
        }
        return [arr];
    }, []);

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;

        // Parallax movement for particles
        ref.current.position.x = state.mouse.x * 0.5;
        ref.current.position.y = state.mouse.y * 0.5;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#6366f1"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
};

const AnimatedShape = ({ color, position, speed, distort }) => {
    const mesh = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        mesh.current.rotation.x = time * 0.2;
        mesh.current.rotation.y = time * 0.3;

        // Large parallax reaction
        const targetX = position[0] + (state.mouse.x * 3);
        const targetY = position[1] + (state.mouse.y * 3);

        mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, 0.05);
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetY, 0.05);
    });

    return (
        <Float speed={speed} rotationIntensity={1} floatIntensity={1}>
            <Sphere ref={mesh} args={[1, 100, 100]} position={position} scale={0.7}>
                <MeshDistortMaterial
                    color={color}
                    speed={speed}
                    distort={distort}
                    radius={1}
                    emissive={color}
                    emissiveIntensity={1}
                    roughness={0}
                    metalness={1}
                />
            </Sphere>
        </Float>
    );
};

const MouseLight = () => {
    const light = useRef();
    useFrame((state) => {
        const x = (state.mouse.x * 10);
        const y = (state.mouse.y * 10);
        light.current.position.set(x, y, 5);
    });
    return <pointLight ref={light} intensity={10} color="#6366f1" distance={20} />;
};

const LiveBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -2,
            background: '#020617',
            pointerEvents: 'none'
        }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                <ambientLight intensity={0.4} />
                <MouseLight />

                <ParticleBackground />

                <AnimatedShape color="#6366f1" position={[-5, 3, -2]} speed={2} distort={0.5} />
                <AnimatedShape color="#8b5cf6" position={[5, -4, -4]} speed={1.5} distort={0.6} />
                <AnimatedShape color="#ec4899" position={[-2, -5, -6]} speed={2.5} distort={0.4} />

                <fog attach="fog" args={['#020617', 5, 30]} />
            </Canvas>
        </div>
    );
};

export default LiveBackground;
