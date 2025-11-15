import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export const ParentsImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    localStorage.getItem("anniversary-parents-image")
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
      localStorage.setItem("anniversary-parents-image", result);
      toast.success("Parents' image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    localStorage.removeItem("anniversary-parents-image");
    toast.success("Image removed");
  };

  return (
    <Card className="p-6 shadow-elegant border-gold/20">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Gift Reward Image</h3>
          <p className="text-sm text-muted-foreground">
            Upload your parents' picture to show as the gift reward
          </p>
        </div>

        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gold/30">
              <img
                src={imagePreview}
                alt="Parents"
                className="w-full h-full object-cover"
              />
              <Button
                onClick={handleRemoveImage}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Label
              htmlFor="parents-image"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gold/30 rounded-lg p-8 cursor-pointer hover:border-gold/50 transition-colors"
            >
              <Upload className="w-12 h-12 text-gold mb-4" />
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 5MB
              </span>
              <input
                id="parents-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </Label>
          </div>
        )}
      </div>
    </Card>
  );
};
