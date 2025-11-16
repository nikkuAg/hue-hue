export const BotanicalDecoration = () => {
  return (
    <>
      {/* Top Left Botanical */}
      <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none z-10 opacity-20">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 20C20 20 40 60 60 80C80 100 120 120 140 100C160 80 180 40 180 20"
            stroke="hsl(165 40% 60%)"
            strokeWidth="2"
            fill="none"
            className="animate-float-gentle"
          />
          <circle cx="60" cy="80" r="8" fill="hsl(12 82% 77%)" opacity="0.6" />
          <circle cx="100" cy="90" r="6" fill="hsl(165 40% 75%)" opacity="0.6" />
          <circle cx="140" cy="100" r="7" fill="hsl(15 75% 82%)" opacity="0.6" />
        </svg>
      </div>

      {/* Bottom Right Botanical */}
      <div className="fixed bottom-0 right-0 w-64 h-64 pointer-events-none z-10 opacity-20 rotate-180">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 20C20 20 40 60 60 80C80 100 120 120 140 100C160 80 180 40 180 20"
            stroke="hsl(155 20% 50%)"
            strokeWidth="2"
            fill="none"
            className="animate-float-gentle"
          />
          <circle cx="60" cy="80" r="8" fill="hsl(12 82% 77%)" opacity="0.6" />
          <circle cx="100" cy="90" r="6" fill="hsl(165 40% 75%)" opacity="0.6" />
          <circle cx="140" cy="100" r="7" fill="hsl(15 75% 82%)" opacity="0.6" />
        </svg>
      </div>

      {/* Floating Dots */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-gentle"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "hsl(12 82% 77%)" : i % 3 === 1 ? "hsl(165 40% 75%)" : "hsl(15 75% 82%)",
              opacity: 0.3,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};
