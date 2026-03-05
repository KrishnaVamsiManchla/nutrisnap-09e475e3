import { useState } from "react";
import { Settings, Globe, Bell, Heart, Database, Shield, Crown, ChevronRight, ExternalLink } from "lucide-react";
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
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Settings</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-28">
        {/* Account */}
        <section className="rounded-2xl bg-card p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            Account
          </h2>

          {/* Language */}
          <div className="space-y-1.5">
            <span className="text-sm text-foreground">Language</span>
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
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <span className="font-medium">{l.native}</span>
                    <span className="text-muted-foreground ml-2 text-xs">({l.label})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Units */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Units</p>
              <p className="text-xs text-muted-foreground">Weight measurement system</p>
            </div>
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
        </section>

        {/* Other sections */}
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="rounded-2xl bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" />
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 active:scale-[0.98]"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {/* Subscription */}
        <section className="rounded-2xl bg-card p-5 space-y-3 shadow-sm">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Crown className="h-3.5 w-3.5" />
            Subscription
          </h2>
          <button
            onClick={() => navigate("/pricing")}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 active:scale-[0.98]"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Manage Subscription</p>
              <p className="text-xs text-muted-foreground">View plans and billing</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings_;
