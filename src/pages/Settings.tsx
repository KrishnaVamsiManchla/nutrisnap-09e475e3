import { Globe, Bell, Heart, Database, Shield, Crown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsSections = [
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Meal Reminders", description: "Get reminded to log your meals" },
      { label: "Weekly Reports", description: "Receive weekly progress summaries" },
    ],
  },
  {
    title: "Health Integrations",
    icon: Heart,
    items: [
      { label: "Apple Health", description: "Sync weight and activity data" },
      { label: "Google Fit", description: "Connect your Google Fit account" },
    ],
  },
  {
    title: "Data",
    icon: Database,
    items: [
      { label: "Export Data", description: "Download your nutrition data as CSV" },
      { label: "Sync Data", description: "Ensure all data is backed up" },
    ],
  },
  {
    title: "Privacy",
    icon: Shield,
    items: [
      { label: "Terms of Service", description: "Read our terms" },
      { label: "Privacy Policy", description: "How we handle your data" },
    ],
  },
];

const Settings_ = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Settings</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-28">
        {/* Account */}
        <section className="card-premium space-y-4 animate-fade-in">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
            Account
          </h2>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Language</span>
            <Select
              value={i18n.language}
              onValueChange={(lang) => {
                i18n.changeLanguage(lang);
                localStorage.setItem("app_language", lang);
                if (user) {
                  supabase.from("user_profiles").update({ language: lang }).eq("user_id", user.id).then(() => {});
                }
              }}
            >
              <SelectTrigger className="rounded-xl border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <span className="font-medium">{l.native}</span>
                    <span className="text-muted-foreground ml-2 text-xs">({l.label})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Units</p>
              <p className="text-xs text-muted-foreground">Weight measurement system</p>
            </div>
            <span className="text-sm text-muted-foreground font-medium">kg</span>
          </div>
        </section>

        {/* Other sections */}
        {settingsSections.map((section, sIdx) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className="card-premium space-y-3 animate-fade-in"
              style={{ animationDelay: `${(sIdx + 1) * 60}ms` }}
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {section.title}
              </h2>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 transition-colors hover:bg-muted/40 press-scale"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {/* Subscription */}
        <section className="card-premium space-y-3 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Crown className="h-3.5 w-3.5" strokeWidth={1.5} />
            Subscription
          </h2>
          <button
            onClick={() => navigate("/pricing")}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 transition-colors hover:bg-muted/40 press-scale"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Manage Subscription</p>
              <p className="text-xs text-muted-foreground">View plans and billing</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings_;
