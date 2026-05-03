import { useNavigate } from "react-router-dom";
import { Dumbbell, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

const RoleSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const choose = async (role: "client" | "trainer") => {
    if (!user) return;
    setLoading(role);
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role });
    setLoading(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate(role === "trainer" ? "/trainer" : "/", { replace: true });
    // Force reload so useRole refetches
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome</h1>
          <p className="text-sm text-muted-foreground">How will you use NutriSnap?</p>
        </div>

        <button
          onClick={() => choose("client")}
          disabled={loading !== null}
          className="card-premium w-full flex items-center gap-4 p-5 text-left transition-all hover:border-primary/40 press-scale disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground">I'm a User</p>
            <p className="text-xs text-muted-foreground">Track meals, calories, and progress</p>
          </div>
        </button>

        <button
          onClick={() => choose("trainer")}
          disabled={loading !== null}
          className="card-premium w-full flex items-center gap-4 p-5 text-left transition-all hover:border-primary/40 press-scale disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Dumbbell className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground">I'm a Trainer</p>
            <p className="text-xs text-muted-foreground">Manage clients, workouts, and chat</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;