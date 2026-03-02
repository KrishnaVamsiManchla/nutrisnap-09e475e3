import { Beef, Wheat, Droplets } from "lucide-react";

interface MacroCardsProps {
  protein: number;
  carbs: number;
  fat: number;
  goals: { protein: number; carbs: number; fat: number };
}

const MacroCards = ({ protein, carbs, fat, goals }: MacroCardsProps) => {
  const macros = [
    { label: "Protein", value: protein, goal: goals.protein, icon: Beef, color: "hsl(var(--health-red) / 0.75)", bgColor: "hsl(var(--health-red) / 0.08)" },
    { label: "Carbs", value: carbs, goal: goals.carbs, icon: Wheat, color: "hsl(var(--health-orange) / 0.75)", bgColor: "hsl(var(--health-orange) / 0.08)" },
    { label: "Fat", value: fat, goal: goals.fat, icon: Droplets, color: "hsl(var(--health-blue) / 0.75)", bgColor: "hsl(var(--health-blue) / 0.08)" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {macros.map((m) => {
        const pct = Math.min(100, Math.round((m.value / m.goal) * 100));
        return (
          <div
            key={m.label}
            className="rounded-2xl bg-card p-3.5 flex flex-col items-center gap-2.5 shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: m.bgColor }}>
              <m.icon className="h-4 w-4" style={{ color: m.color }} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium leading-none">{Math.round(m.value)}g</p>
              <p className="text-[10px] text-muted-foreground mt-1">/ {m.goal}g</p>
            </div>
            {/* Mini progress bar */}
            <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
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
