import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "client" | "trainer" | "admin";

export const useRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const isTrainer = roles.includes("trainer");

  const enableTrainer = async () => {
    if (!user) return;
    await supabase.from("user_roles").insert({ user_id: user.id, role: "trainer" });
    setRoles((prev) => (prev.includes("trainer") ? prev : [...prev, "trainer"]));
  };

  return { roles, isTrainer, loading: loading || authLoading, enableTrainer };
};
