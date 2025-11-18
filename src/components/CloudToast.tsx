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
  const [bubbleShape] = useState(() => Math.floor(Math.random() * 5)); // 5 different shapes
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
      {/* Thought bubble shape - randomized */}
      <div className="relative animate-scale-in">
        {/* Shape 0: Fluffy cloud */}
        {bubbleShape === 0 && (
          <>
            <div className="relative bg-white border-2 border-coral/40 shadow-elegant px-8 py-6 min-w-[240px] max-w-[360px] w-auto"
                 style={{ borderRadius: '60% 40% 70% 30% / 60% 30% 70% 40%' }}>
              <div className="text-center">
                <Heart className="w-6 h-6 text-coral mx-auto mb-3 animate-float" />
                <p className="text-base text-navy font-sans leading-relaxed font-medium break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: message.length > 100 ? 5 : message.length > 50 ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{message}</p>
              </div>
            </div>
            <div className={`absolute -bottom-4 ${tailSide === 'left' ? 'left-8' : 'right-8'} flex flex-col gap-1`}>
              <div className="w-3 h-3 bg-white border-2 border-coral/40 rounded-full shadow-lg"></div>
              <div className={`w-2 h-2 bg-white border-2 border-coral/40 rounded-full shadow-lg ${tailSide === 'left' ? 'ml-2' : 'mr-2'}`}></div>
            </div>
          </>
        )}

        {/* Shape 1: Rounded oval */}
        {bubbleShape === 1 && (
          <>
            <div className="relative bg-white border-2 border-coral/40 rounded-[50%] shadow-elegant px-8 py-6 min-w-[240px] max-w-[360px] w-auto">
              <div className="text-center">
                <Heart className="w-6 h-6 text-coral mx-auto mb-3 animate-float" />
                <p className="text-base text-navy font-sans leading-relaxed font-medium break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: message.length > 100 ? 5 : message.length > 50 ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{message}</p>
              </div>
            </div>
            <div className={`absolute -bottom-5 ${tailSide === 'left' ? 'left-12' : 'right-12'} w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-white`}
                 style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              <div className={`absolute -top-[22px] ${tailSide === 'left' ? '-left-[17px]' : '-left-[17px]'} w-0 h-0 border-l-[17px] border-l-transparent border-r-[17px] border-r-transparent border-t-[22px] border-t-coral/40`}></div>
            </div>
          </>
        )}

        {/* Shape 2: Thought bubble with circles */}
        {bubbleShape === 2 && (
          <>
            <div className="relative bg-white border-2 border-coral/40 rounded-3xl shadow-elegant px-8 py-6 min-w-[240px] max-w-[360px] w-auto">
              <div className="text-center">
                <Heart className="w-6 h-6 text-coral mx-auto mb-3 animate-float" />
                <p className="text-base text-navy font-sans leading-relaxed font-medium break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: message.length > 100 ? 5 : message.length > 50 ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{message}</p>
              </div>
            </div>
            <div className={`absolute -bottom-6 ${tailSide === 'left' ? 'left-8' : 'right-8'} flex flex-col gap-1.5`}>
              <div className="w-4 h-4 bg-white border-2 border-coral/40 rounded-full shadow-lg"></div>
              <div className={`w-2.5 h-2.5 bg-white border-2 border-coral/40 rounded-full shadow-lg ${tailSide === 'left' ? 'ml-2' : 'mr-2'}`}></div>
              <div className={`w-1.5 h-1.5 bg-white border-2 border-coral/40 rounded-full shadow-md ${tailSide === 'left' ? 'ml-3' : 'mr-3'}`}></div>
            </div>
          </>
        )}

        {/* Shape 3: Scalloped cloud */}
        {bubbleShape === 3 && (
          <>
            <div className="relative bg-white border-2 border-coral/40 shadow-elegant px-8 py-6 min-w-[240px] max-w-[360px] w-auto"
                 style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}>
              <div className="text-center">
                <Heart className="w-6 h-6 text-coral mx-auto mb-3 animate-float" />
                <p className="text-base text-navy font-sans leading-relaxed font-medium break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: message.length > 100 ? 5 : message.length > 50 ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{message}</p>
              </div>
            </div>
            <div className={`absolute -bottom-4 ${tailSide === 'left' ? 'left-10' : 'right-10'} flex flex-col gap-1`}>
              <div className="w-3 h-3 bg-white border-2 border-coral/40 rounded-full shadow-lg"></div>
              <div className={`w-2 h-2 bg-white border-2 border-coral/40 rounded-full shadow-lg ${tailSide === 'left' ? 'ml-1' : 'mr-1'}`}></div>
            </div>
          </>
        )}

        {/* Shape 4: Heart-shaped bubble */}
        {bubbleShape === 4 && (
          <>
            <div className="relative bg-white border-2 border-coral/40 shadow-elegant px-8 py-6 min-w-[240px] max-w-[360px] w-auto"
                 style={{ borderRadius: '50% 50% 0 0 / 60% 60% 0 0', clipPath: 'polygon(50% 100%, 0% 40%, 0% 20%, 20% 0%, 40% 0%, 50% 10%, 60% 0%, 80% 0%, 100% 20%, 100% 40%)' }}>
              <div className="text-center">
                <Heart className="w-6 h-6 text-coral mx-auto mb-3 animate-float" />
                <p className="text-base text-navy font-sans leading-relaxed font-medium break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: message.length > 100 ? 5 : message.length > 50 ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{message}</p>
              </div>
            </div>
            <div className={`absolute -bottom-5 ${tailSide === 'left' ? 'left-1/2' : 'right-1/2'} flex flex-col gap-1`}>
              <div className="w-3 h-3 bg-white border-2 border-coral/40 rounded-full shadow-lg"></div>
              <div className="w-2 h-2 bg-white border-2 border-coral/40 rounded-full shadow-lg ml-1"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
