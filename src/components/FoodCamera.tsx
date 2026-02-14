import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NutritionData {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  serving_size: string;
}

interface FoodCameraProps {
  onResult: (data: NutritionData) => void;
}

const FoodCamera = ({ onResult }: FoodCameraProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    try {
      const base64 = preview.split(",")[1];
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { image_base64: base64, quantity: quantity || undefined },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      onResult(data);
      setPreview(null);
      setQuantity("");
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="space-y-3">
          {/* Large camera area */}
          <div
            onClick={() => cameraRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-12 cursor-pointer transition-all hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold">Take a Photo</p>
              <p className="text-sm text-muted-foreground mt-1">Point your camera at your meal</p>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {/* Upload from gallery */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span>Upload from Gallery</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Image preview */}
          <div className="relative rounded-3xl overflow-hidden bg-muted">
            <img src={preview} alt="Food" className="w-full aspect-[4/3] object-cover" />
            <button
              onClick={() => { setPreview(null); setQuantity(""); }}
              className="absolute top-3 right-3 rounded-full bg-background/80 p-2 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Portion size input */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Approximate portion size (optional)
            </label>
            <Input
              placeholder="e.g. '2 servings', '300g', '1 bowl'"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border-0 bg-muted/50 focus-visible:ring-1"
            />
          </div>

          {/* Analyze button */}
          <Button onClick={analyze} disabled={analyzing} className="w-full h-12 text-base rounded-2xl" size="lg">
            {analyzing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Identifying food…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Analyze with AI
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            AI will detect food items and estimate nutrition
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodCamera;
