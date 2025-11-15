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

    // Create gradient scratch surface
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "hsl(43, 74%, 49%)");
    gradient.addColorStop(0.5, "hsl(340, 55%, 82%)");
    gradient.addColorStop(1, "hsl(43, 74%, 49%)");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add texture
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 100; i++) {
      ctx.fillRect(
        Math.random() * rect.width,
        Math.random() * rect.height,
        2,
        2
      );
    }

    // Add text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch Here!", rect.width / 2, rect.height / 2 - 20);
    
    ctx.font = "16px sans-serif";
    ctx.fillText("👆", rect.width / 2, rect.height / 2 + 20);
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(
      (x - rect.left) * scaleX,
      (y - rect.top) * scaleY,
      30 * scaleX,
      0,
      2 * Math.PI
    );
    ctx.fill();

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
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setIsScratching(false);
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
