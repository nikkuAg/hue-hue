import { useState, useEffect } from "react";

export const CouplePhotoBackground = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    localStorage.getItem("anniversary-couple-photo")
  );

  useEffect(() => {
    const handlePhotoUpdate = () => {
      setPhotoUrl(localStorage.getItem("anniversary-couple-photo"));
    };

    window.addEventListener("couple-photo-updated", handlePhotoUpdate);
    return () => window.removeEventListener("couple-photo-updated", handlePhotoUpdate);
  }, []);

  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] blur-sm"
        style={{
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-mint-light/90 to-coral/5" />
    </div>
  );
};
