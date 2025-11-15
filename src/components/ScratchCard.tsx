import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import anniversaryPattern from "@/assets/anniversary-pattern.png";

interface ScratchCardProps {
  content: React.ReactNode;
  onComplete?: () => void;
  scratchPercentage?: number;
  showPattern?: boolean; // To show anniversary pattern instead of metallic coating
}

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
      // Load and draw the anniversary pattern
      const img = new Image();
      img.src = anniversaryPattern;
      img.onload = () => {
        // Create a silver background first
        const silverGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        silverGradient.addColorStop(0, "hsl(0, 0%, 85%)");
        silverGradient.addColorStop(0.5, "hsl(0, 0%, 95%)");
        silverGradient.addColorStop(1, "hsl(0, 0%, 85%)");
        
        ctx.fillStyle = silverGradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Draw the pattern tiled across the card
        const patternSize = Math.min(rect.width, rect.height) * 0.8;
        const x = (rect.width - patternSize) / 2;
        const y = (rect.height - patternSize) / 2;
        
        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, x, y, patternSize, patternSize);
        ctx.globalAlpha = 1;

        // Add decorative border
        ctx.strokeStyle = "hsl(43, 74%, 58%)"; // Gold
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, rect.width - 8, rect.height - 8);

        // Add text
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = "hsl(280, 40%, 35%)"; // Deep maroon
        ctx.font = "bold 24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("✨ Scratch Here! ✨", rect.width / 2, 20);
        
        ctx.font = "16px sans-serif";
        ctx.fillText("Reveal Your Prize", rect.width / 2, rect.height - 40);
        
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      };
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
  }, [showPattern]);

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
