import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
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

interface ManualEntryProps {
  onResult: (data: NutritionData) => void;
}

const ManualEntry = ({ onResult }: ManualEntryProps) => {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyze = async () => {
    if (!food.trim()) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { food_description: food, quantity: quantity || undefined },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      onResult(data);
      setFood("");
      setQuantity("");
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="What did you eat? (e.g. 'chicken breast with rice')"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && analyze()}
      />
      <Input
        placeholder="Quantity (e.g. '200g', '1 plate', '2 cups')"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <Button onClick={analyze} disabled={analyzing || !food.trim()} className="w-full" size="lg">
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Look Up Nutrition
          </>
        )}
      </Button>
    </div>
  );
};

export default ManualEntry;
