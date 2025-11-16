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

const WordItem = ({ word, position, size, color }: { 
  word: string; 
  position: [number, number, number]; 
  size: number;
  color: string;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const speed = useMemo(() => Math.random() * 0.5 + 0.3, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Make the text always face the camera
      meshRef.current.quaternion.copy(state.camera.quaternion);
      
      // Add subtle oscillation for liveliness
      const time = state.clock.getElapsedTime();
      const oscillation = Math.sin(time * speed) * 0.05;
      meshRef.current.rotation.z = oscillation;
      
      // Floating effect
      meshRef.current.position.y = position[1] + Math.sin(time * speed + position[0]) * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {word}
      </Text>
    </group>
  );
};

const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      const radius = 8 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
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
        size={0.08}
        color="#FFD700"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

export const WordCloud3D = ({ words }: WordCloud3DProps) => {
  const colors = ['#E97777', '#FF9F9F', '#FCDDB0', '#40A578', '#5B8E55', '#FF6B9D'];
  
  // Ensure minimum number of words for a full sphere (at least 30)
  const minWords = 30;
  const expandedWords = useMemo(() => {
    if (words.length === 0) return [];
    
    if (words.length < minWords) {
      // Repeat words to fill the sphere
      const expanded = [];
      let currentIndex = 0;
      
      for (let i = 0; i < minWords; i++) {
        expanded.push({
          ...words[currentIndex % words.length],
          // Add slight variation to repeated words
          displayText: words[currentIndex % words.length].text,
          originalIndex: currentIndex % words.length,
        });
        currentIndex++;
      }
      return expanded;
    }
    
    return words.map((word, index) => ({
      ...word,
      displayText: word.text,
      originalIndex: index,
    }));
  }, [words]);
  
  const wordPositions = useMemo(() => {
    if (expandedWords.length === 0) return [];
    
    return expandedWords.map((word, index) => {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(-1 + (2 * index) / expandedWords.length);
      const theta = Math.sqrt(expandedWords.length * Math.PI) * phi;
      
      const radius = 4.5;
      return {
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi),
        ] as [number, number, number],
        size: Math.min(Math.max(word.value * 0.12, 0.4), 1.0),
        color: colors[word.originalIndex % colors.length]
      };
    });
  }, [expandedWords]);

  if (words.length === 0) {
    return (
      <>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#E97777"
          anchorX="center"
          anchorY="middle"
        >
          No blessings yet
        </Text>
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#E97777" />
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#40A578" />
      
      <Particles />
      
      {expandedWords.map((word, index) => {
        const { position, size, color } = wordPositions[index];
        return (
          <WordItem
            key={`${word.displayText}-${index}`}
            word={word.displayText}
            position={position}
            size={size}
            color={color}
          />
        );
      })}
    </>
  );
};
