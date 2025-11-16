import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface CloudToastProps {
  message: string;
  onRemove: () => void;
  delay: number;
  index: number;
}

export const CloudToast = ({ message, onRemove, delay, index }: CloudToastProps) => {
  const [side] = useState(() => (Math.random() > 0.5 ? 'left' : 'right'));
  const [position] = useState(() => ({
    top: Math.random() * 70 + 10, // Random position between 10% and 80%
    horizontal: Math.random() * 2 + 0.5, // Random offset 0.5rem to 2.5rem from edge
    floatDistance: Math.random() * 20 + 15, // Random float distance 15-35px
    floatDuration: Math.random() * 3 + 8, // Random duration 8-11 seconds
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 10000); // Show for 10 seconds

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      className="fixed pointer-events-none z-50 animate-cloud-float-gentle"
      style={{
        top: `${position.top}%`,
        [side]: `${position.horizontal}rem`,
        animationDelay: `${delay}ms`,
        animationDuration: `${position.floatDuration}s`,
        '--float-distance': `${position.floatDistance}px`,
      } as React.CSSProperties & { '--float-distance': string }}
    >
      {/* Cloud shape */}
      <div className="relative">
        {/* Cloud body using rounded divs to create cloud shape */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          {/* Main cloud circles */}
          <div className="flex items-end">
            <div className="w-20 h-20 bg-white/95 rounded-full border-2 border-coral/30 shadow-lg"></div>
            <div className="w-24 h-24 bg-white/95 rounded-full -ml-7 border-2 border-coral/30 shadow-lg"></div>
            <div className="w-20 h-20 bg-white/95 rounded-full -ml-7 border-2 border-coral/30 shadow-lg"></div>
          </div>
          {/* Cloud base */}
          <div className="absolute -bottom-4 left-3 right-3 h-10 bg-white/95 border-2 border-t-0 border-coral/30 rounded-b-full shadow-lg"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center p-7">
            <div className="text-center max-w-[220px]">
              <Heart className="w-5 h-5 text-coral mx-auto mb-2 animate-float" />
              <p className="text-[13px] text-navy font-sans line-clamp-3 leading-snug font-medium">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
