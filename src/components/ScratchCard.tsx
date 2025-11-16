import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ScratchCardProps {
  content: React.ReactNode;
  onComplete?: () => void;
  scratchPercentage?: number;
  showPattern?: boolean;
}

// Anniversary themed graphics - each card gets one random graphic
const GRAPHICS = [
  { name: 'Diamond', symbol: '💎', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { name: 'Ring', symbol: '💍', path: 'M12 2c-2 0-4 1-5 3l-2 4c0 3 2 5 7 5s7-2 7-5l-2-4c-1-2-3-3-5-3z' },
  { name: 'Rose', symbol: '🌹', path: 'M12 2c-3 0-5 2-5 5 0 2 1 4 3 5v8h4v-8c2-1 3-3 3-5 0-3-2-5-5-5z' },
  { name: 'Heart', symbol: '❤️', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { name: 'Champagne', symbol: '🥂', path: 'M6 2l2 8c0 2 1.5 3 4 3s4-1 4-3l2-8H6zm4 13v5h4v-5M8 20h8' },
  { name: 'Bells', symbol: '🔔', path: 'M12 2v4M12 18v4M8 6c0-2 2-4 4-4s4 2 4 4v8c0 1-1 2-2 2h-4c-1 0-2-1-2-2V6z' },
];

export const ScratchCard = ({ 
  content, 
  onComplete, 
  scratchPercentage = 60,
  showPattern = true 
}: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  
  // Randomly select one graphic per card instance
  const selectedGraphic = useMemo(() => 
    GRAPHICS[Math.floor(Math.random() * GRAPHICS.length)], 
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    if (showPattern) {
      // Silver jubilee themed gradient background
      const silverGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      silverGradient.addColorStop(0, "hsl(0, 0%, 88%)");
      silverGradient.addColorStop(0.5, "hsl(0, 0%, 95%)");
      silverGradient.addColorStop(1, "hsl(0, 0%, 88%)");
      
      ctx.fillStyle = silverGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw visible graphic in center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const size = Math.min(rect.width, rect.height) * 0.4;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(size / 24, size / 24);
      
      // More visible gradient for the graphic
      ctx.strokeStyle = "hsl(0, 0%, 75%)"; // Darker silver for visibility
      ctx.fillStyle = "hsl(0, 0%, 82%)"; // Light fill
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.4; // More visible
      
      const path = new Path2D(selectedGraphic.path);
      ctx.fill(path);
      ctx.stroke(path);
      
      ctx.restore();

      // Decorative golden border
      ctx.strokeStyle = "hsl(43, 74%, 58%)";
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, rect.width - 8, rect.height - 8);

      // Add text with theme colors
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillStyle = "hsl(280, 40%, 45%)"; // Royal purple
      ctx.font = "bold 24px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("✨ Scratch Here! ✨", rect.width / 2, 20);
      
      ctx.font = "16px sans-serif";
      ctx.fillText("Reveal Your Prize", rect.width / 2, rect.height - 40);
      
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    } else {
      // Original metallic gradient coating
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.max(rect.width, rect.height) / 2;
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, "hsl(45, 80%, 65%)");
      gradient.addColorStop(0.3, "hsl(43, 74%, 49%)");
      gradient.addColorStop(0.5, "hsl(340, 65%, 75%)");
      gradient.addColorStop(0.7, "hsl(43, 74%, 49%)");
      gradient.addColorStop(1, "hsl(40, 70%, 45%)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, [showPattern, selectedGraphic]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Since ctx is scaled 2x, use display coordinates directly
    const currentX = x - rect.left;
    const currentY = y - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 60;

    // Draw continuous line if we have a last point
    if (lastPointRef.current && isScratching) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    }

    // Draw circle at current position for smooth coverage
    ctx.beginPath();
    ctx.arc(currentX, currentY, 30, 0, 2 * Math.PI);
    ctx.fill();

    lastPointRef.current = { x: currentX, y: currentY };

    checkCompletion();
  };

  const checkCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    const percentScratched = (transparent / (pixels.length / 4)) * 100;

    if (percentScratched > scratchPercentage && !isComplete) {
      setIsComplete(true);
      onComplete?.();
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsScratching(true);
    lastPointRef.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setIsScratching(false);
    lastPointRef.current = null;
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
      <div className={cn(
        "absolute inset-0 flex items-center justify-center",
        isComplete && "animate-scratch-reveal"
      )}>
        {content}
      </div>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 w-full h-full cursor-pointer touch-none",
          isComplete && "pointer-events-none opacity-0 transition-opacity duration-500"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};
