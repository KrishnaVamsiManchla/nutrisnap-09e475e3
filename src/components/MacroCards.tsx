import { Beef, Wheat, Droplets } from "lucide-react";

interface MacroCardsProps {
  protein: number;
  carbs: number;
  fat: number;
  goals: { protein: number; carbs: number; fat: number };
}

const MacroCards = ({ protein, carbs, fat, goals }: MacroCardsProps) => {
  const macros = [
    { label: "Protein", value: protein, goal: goals.protein, icon: Beef, color: "hsl(var(--health-red))" },
    { label: "Carbs", value: carbs, goal: goals.carbs, icon: Wheat, color: "hsl(var(--health-orange))" },
    { label: "Fat", value: fat, goal: goals.fat, icon: Droplets, color: "hsl(var(--health-blue))" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {macros.map((m) => {
        const pct = Math.min(100, Math.round((m.value / m.goal) * 100));
        return (
          <div
            key={m.label}
            className="rounded-2xl bg-card border p-3 flex flex-col items-center gap-2"
          >
            <m.icon className="h-5 w-5" style={{ color: m.color }} />
            <div className="text-center">
              <p className="text-lg font-bold leading-none">{Math.round(m.value)}g</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">/ {m.goal}g</p>
            </div>
            {/* Mini progress bar */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: m.color }}
              />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground">{m.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default MacroCards;
