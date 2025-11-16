import couplePhoto from "@/assets/couple-photo.jpg";

export const CouplePhotoBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] blur-sm"
        style={{
          backgroundImage: `url(${couplePhoto})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-mint-light/90 to-coral/5" />
    </div>
  );
};
