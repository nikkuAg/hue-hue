import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export const CouplePhotoUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    localStorage.getItem("anniversary-couple-photo")
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      localStorage.setItem("anniversary-couple-photo", result);
      toast.success("Photo uploaded successfully!");
      window.dispatchEvent(new Event("couple-photo-updated"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    localStorage.removeItem("anniversary-couple-photo");
    toast.success("Photo removed");
    window.dispatchEvent(new Event("couple-photo-updated"));
  };

  return (
    <Card className="p-6 md:p-8 shadow-card border-teal/20 bg-gradient-to-br from-cream to-white-smoke">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-playfair font-semibold mb-2 text-navy">
            Add Your Special Photo
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload a photo of Pawan & Prachi for a personalized touch
          </p>
        </div>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Couple"
              className="w-full h-48 md:h-64 object-cover rounded-lg border-2 border-teal/20"
            />
            <Button
              onClick={handleRemoveImage}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Label
            htmlFor="couple-image"
            className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-teal/30 rounded-lg cursor-pointer bg-white-smoke hover:bg-cream transition-colors"
          >
            <Upload className="w-12 h-12 text-teal mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload image</span>
            <span className="text-xs text-muted-foreground mt-1">(Max 5MB)</span>
            <input
              id="couple-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </Label>
        )}
      </div>
    </Card>
  );
};
