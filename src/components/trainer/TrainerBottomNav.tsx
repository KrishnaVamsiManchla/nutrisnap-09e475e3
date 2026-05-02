import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Dumbbell, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/trainer", label: "Dashboard", icon: LayoutDashboard },
  { path: "/trainer/clients", label: "Clients", icon: Users },
  { path: "/trainer/workouts", label: "Workouts", icon: Dumbbell },
  { path: "/trainer/profile", label: "Profile", icon: UserCircle },
];

const TrainerBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto w-full max-w-lg px-4 pb-2">
        <nav
          className="flex items-center justify-around rounded-[22px] px-2 py-1.5"
          style={{
            backgroundColor: "hsl(var(--card) / 0.88)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: "var(--shadow-nav)",
          }}
        >
          {tabs.map((tab) => {
            const isActive =
              tab.path === "/trainer"
                ? location.pathname === "/trainer"
                : location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 transition-all duration-200 press-scale",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TrainerBottomNav;
