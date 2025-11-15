import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScratchCardProps {
  content: React.ReactNode;
  onComplete?: () => void;
  scratchPercentage?: number;
}

export const ScratchCard = ({ 
  content, 
  onComplete, 
  scratchPercentage = 60 
}: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

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

    // Create radial gradient for metallic effect
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

    // Add shimmer effect
    const shimmer = ctx.createLinearGradient(0, 0, rect.width, 0);
    shimmer.addColorStop(0, "rgba(255, 255, 255, 0)");
    shimmer.addColorStop(0.4, "rgba(255, 255, 255, 0)");
    shimmer.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    shimmer.addColorStop(0.6, "rgba(255, 255, 255, 0)");
    shimmer.addColorStop(1, "rgba(255, 255, 255, 0)");
    
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add sparkle texture
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add decorative border
    ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, rect.width - 4, rect.height - 4);

    // Add inner border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, rect.width - 16, rect.height - 16);

    // Add text with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = "bold 28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ Scratch Here! ✨", rect.width / 2, rect.height / 2 - 25);
    
    ctx.font = "18px sans-serif";
    ctx.fillText("Reveal Your Fortune", rect.width / 2, rect.height / 2 + 15);
    
    ctx.font = "32px sans-serif";
    ctx.fillText("👆", rect.width / 2, rect.height / 2 + 50);
    
    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (x - rect.left) * scaleX;
    const currentY = (y - rect.top) * scaleY;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 60 * scaleX;

    // Draw continuous line if we have a last point
    if (lastPointRef.current && isScratching) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    }

    // Draw circle at current position for smooth coverage
    ctx.beginPath();
    ctx.arc(currentX, currentY, 30 * scaleX, 0, 2 * Math.PI);
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
