import { Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8">
            <Droplets className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-semibold text-foreground">Water</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {currentMl} / {goalMl} ml
        </span>
      </div>
      {/* Custom progress bar */}
      <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{glasses} glasses</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-8 rounded-xl text-xs press-scale border-border/60"
            onClick={() => onAdd(250)}
          >
            <Plus className="h-3 w-3" />
            250ml
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-8 rounded-xl text-xs press-scale border-border/60"
            onClick={() => onAdd(500)}
          >
            <Plus className="h-3 w-3" />
            500ml
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-8 rounded-xl text-xs press-scale border-border/60"
            onClick={onRemove}
            disabled={currentMl === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
