import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface CloudToastProps {
  message: string;
  onRemove: () => void;
  delay: number;
}

export const CloudToast = ({ message, onRemove, delay }: CloudToastProps) => {
  const [position] = useState(() => ({
    top: Math.random() * 60 + 10, // 10-70% from top
    left: Math.random() * 70 + 10, // 10-80% from left
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000 + delay); // 5 seconds + staggered delay

    return () => clearTimeout(timer);
  }, [onRemove, delay]);

  return (
    <div
      className="fixed pointer-events-none animate-float-up"
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        zIndex: 100,
        animationDelay: `${delay}ms`,
        animationDuration: `${5000 + delay}ms`,
      }}
    >
      {/* Cloud shape */}
      <div className="relative animate-bounce-gentle">
        {/* Cloud body using rounded divs to create cloud shape */}
        <div className="relative bg-white rounded-full shadow-2xl">
          {/* Main cloud circles */}
          <div className="flex items-end">
            <div className="w-16 h-16 bg-white rounded-full border-2 border-coral/20"></div>
            <div className="w-20 h-20 bg-white rounded-full -ml-6 border-2 border-coral/20"></div>
            <div className="w-16 h-16 bg-white rounded-full -ml-6 border-2 border-coral/20"></div>
          </div>
          {/* Cloud base */}
          <div className="absolute -bottom-3 left-2 right-2 h-8 bg-white border-2 border-t-0 border-coral/20 rounded-b-full"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-[200px]">
              <Heart className="w-4 h-4 text-coral mx-auto mb-1 animate-float" />
              <p className="text-xs text-navy font-sans line-clamp-3 leading-tight">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
