import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
export const ParentsImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(localStorage.getItem("anniversary-parents-image"));
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
  return;
};