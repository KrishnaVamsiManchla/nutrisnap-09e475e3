import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
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
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">Take a photo or upload</p>
            <p className="text-sm text-muted-foreground">Snap your meal for instant analysis</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="Food" className="w-full max-h-64 object-cover" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Input
            placeholder="Quantity (optional, e.g. '2 servings', '300g')"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Button onClick={analyze} disabled={analyzing} className="w-full" size="lg">
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Analyze Food
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FoodCamera;
