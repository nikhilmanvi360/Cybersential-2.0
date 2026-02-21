import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const Node = ({ position, label, isAlert, severity }) => {
    const mesh = useRef();

    // Color based on severity or type
    const color = useMemo(() => {
        if (isAlert) {
            if (severity === 'CRITICAL') return '#ff0000';
            if (severity === 'HIGH') return '#ff4d00';
            return '#ffcc00';
        }
        return '#00f2ff'; // Standard cyan
    }, [isAlert, severity]);

    useFrame((state) => {
        if (mesh.current) {
            const t = state.clock.getElapsedTime();
            mesh.current.position.y += Math.sin(t + position[0]) * 0.002;
            if (isAlert) {
                mesh.current.scale.setScalar(1 + Math.sin(t * 5) * 0.1);
            }
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position}>
                <Sphere ref={mesh} args={[0.3, 32, 32]}>
                    <MeshDistortMaterial
                        color={color}
                        speed={isAlert ? 4 : 2}
                        distort={0.4}
                        radius={1}
                        emissive={color}
                        emissiveIntensity={isAlert ? 2 : 1}
                    />
                </Sphere>
                <Text
                    position={[0, 0.6, 0]}
                    fontSize={0.2}
                    color="#00f2ff"
                    font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            </group>
        </Float>
    );
};

const Connection = ({ start, end, isAlert }) => {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

    return (
        <Line
            points={points}
            color={isAlert ? '#ff0000' : '#00f2ff'}
            lineWidth={1}
            transparent
            opacity={0.3}
        />
    );
};

const Grid = () => {
    return (
        <gridHelper args={[20, 20, '#00f2ff', '#004444']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -5]} />
    );
};

export default function NetworkTopology3D({ alerts = [] }) {
    const services = useMemo(() => [
        { id: 'auth', label: 'AUTH-CORE', pos: [-4, 2, 0] },
        { id: 'ml', label: 'ML-ENGINE', pos: [4, 2, 0] },
        { id: 'alert', label: 'ALERT-SVC', pos: [0, 4, 0] },
        { id: 'reporting', label: 'REPORTS', pos: [0, -2, 0] },
        { id: 'gateway', label: 'GATEWAY', pos: [0, 1, 3] },
    ], []);

    const alertNodes = useMemo(() => {
        return alerts.slice(0, 5).map((alert, i) => ({
            id: alert._id || i,
            label: alert.alertType,
            severity: alert.severity,
            pos: [Math.sin(i) * 5, Math.cos(i) * 5, -2],
            target: services.find(s => s.id === 'gateway').pos
        }));
    }, [alerts, services]);

    return (
        <div className="h-full w-full bg-sentinel-dark/40 rounded-lg overflow-hidden border border-sentinel-border shadow-2xl relative">
            <div className="absolute top-2 left-2 z-10 bg-sentinel-bg/80 border border-sentinel-cyan/30 px-2 py-1 rounded">
                <span className="text-[10px] font-mono text-sentinel-cyan tracking-widest">3D NEURAL TOPOLOGY GRID</span>
            </div>

            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                <color attach="background" args={['#020617']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <Grid />

                {services.map((s) => (
                    <Node key={s.id} position={s.pos} label={s.label} />
                ))}

                {alertNodes.map((a) => (
                    <React.Fragment key={a.id}>
                        <Node position={a.pos} label={a.label} isAlert severity={a.severity} />
                        <Connection start={a.pos} end={a.target} isAlert />
                    </React.Fragment>
                ))}

                <OrbitControls enablePan={false} maxDistance={15} minDistance={5} />
            </Canvas>
        </div>
    );
}
