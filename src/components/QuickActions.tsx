import { Keyboard, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onManual: () => void;
  onCamera: () => void;
  onVoice: () => void;
}

const QuickActions = ({ onManual, onCamera, onVoice }: QuickActionsProps) => {
  const actions = [
    { label: "Add Food", icon: Keyboard, onClick: onManual },
    { label: "Scan with AI", icon: Camera, onClick: onCamera },
    { label: "Voice Log", icon: Mic, onClick: onVoice },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((a) => (
        <Button
          key={a.label}
          variant="outline"
          className="h-auto flex-col gap-3 py-5 rounded-2xl border-0 bg-card hover:bg-accent transition-all shadow-card press-scale"
          onClick={a.onClick}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8">
            <a.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-xs font-medium text-foreground">{a.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
