import { Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
  onRemove: () => void;
}

const WaterTracker = ({ currentMl, goalMl, onAdd, onRemove }: WaterTrackerProps) => {
  const glasses = Math.round(currentMl / 250);
  const pct = Math.min(100, Math.round((currentMl / goalMl) * 100));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Water</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentMl} / {goalMl} ml ({glasses} glasses)
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onAdd(250)}
        >
          <Plus className="h-3.5 w-3.5" />
          250ml
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onAdd(500)}
        >
          <Plus className="h-3.5 w-3.5" />
          500ml
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onRemove}
          disabled={currentMl === 0}
        >
          <Minus className="h-3.5 w-3.5" />
          Undo
        </Button>
      </div>
    </div>
  );
};

export default WaterTracker;
