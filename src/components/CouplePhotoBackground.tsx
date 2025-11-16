// Add your couple's photo to src/assets/couple-photo.jpg to display it as background
// If no photo is added, the background won't be shown

export const CouplePhotoBackground = () => {
  let couplePhoto;
  
  try {
    // Try to import the couple photo from assets
    couplePhoto = new URL('../assets/couple-photo.jpg', import.meta.url).href;
  } catch {
    // If photo doesn't exist, don't show background
    return null;
  }

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
