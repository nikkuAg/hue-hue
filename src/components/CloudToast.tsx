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
  const [tailSide] = useState(() => (Math.random() > 0.5 ? 'left' : 'right'));
  const [position] = useState(() => ({
    top: Math.random() * 50 + 5, // Reduced range: 5% to 55% to prevent bottom overflow
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
      className="fixed pointer-events-none z-50 animate-cloud-float-gentle max-h-[90vh] overflow-visible"
      style={{
        top: `${position.top}%`,
        [side]: `${position.horizontal}rem`,
        animationDelay: `${delay}ms`,
        animationDuration: `${position.floatDuration}s`,
        '--float-distance': `${position.floatDistance}px`,
      } as React.CSSProperties & { '--float-distance': string }}
    >
      {/* Thought bubble shape */}
      <div className="relative animate-scale-in">
        {/* Main thought bubble */}
        <div className="relative bg-white border-2 border-coral/40 rounded-3xl shadow-elegant px-8 py-6 min-w-[240px] max-w-[360px] w-auto">
          {/* Content */}
          <div className="text-center">
            <Heart className="w-6 h-6 text-coral mx-auto mb-3 animate-float" />
            <p className="text-base text-navy font-sans leading-relaxed font-medium break-words" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: message.length > 100 ? 5 : message.length > 50 ? 4 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {message}
            </p>
          </div>
        </div>
        
        {/* Thought bubble tail - small circles */}
        <div className={`absolute -bottom-6 ${tailSide === 'left' ? 'left-8' : 'right-8'} flex flex-col gap-1.5`}>
          <div className="w-4 h-4 bg-white border-2 border-coral/40 rounded-full shadow-lg"></div>
          <div className={`w-2.5 h-2.5 bg-white border-2 border-coral/40 rounded-full shadow-lg ${tailSide === 'left' ? 'ml-2' : 'mr-2'}`}></div>
          <div className={`w-1.5 h-1.5 bg-white border-2 border-coral/40 rounded-full shadow-md ${tailSide === 'left' ? 'ml-3' : 'mr-3'}`}></div>
        </div>
      </div>
    </div>
  );
};
