import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface Word {
  text: string;
  value: number;
}

interface WordCloud3DProps {
  words: Word[];
}

const WordItem = ({ word, position, size }: { word: string; position: [number, number, number]; size: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => Math.random() * 0.3 + 0.1, []);
  const axis = useMemo(() => new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize(), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotateOnAxis(axis, speed * 0.01);
      
      // Floating effect
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.2;
    }
  });

  const colors = ['#E97777', '#FF9F9F', '#FCDDB0', '#40A578', '#5B8E55'];
  const color = useMemo(() => colors[Math.floor(Math.random() * colors.length)], []);

  return (
    <mesh ref={meshRef} position={position}>
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.woff"
      >
        {word}
      </Text>
    </mesh>
  );
};

const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FFD700"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const WordCloud3D = ({ words }: WordCloud3DProps) => {
  const wordPositions = useMemo(() => {
    return words.map((word, index) => {
      const phi = Math.acos(-1 + (2 * index) / words.length);
      const theta = Math.sqrt(words.length * Math.PI) * phi;
      
      const radius = 5;
      return [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ] as [number, number, number];
    });
  }, [words]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#E97777" />
      
      <Particles />
      
      {words.map((word, index) => {
        const size = Math.min(Math.max(word.value * 0.15, 0.3), 1.2);
        return (
          <WordItem
            key={word.text + index}
            word={word.text}
            position={wordPositions[index]}
            size={size}
          />
        );
      })}
    </>
  );
};
