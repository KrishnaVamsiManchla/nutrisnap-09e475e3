import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all data in parallel
    const [foodRes, waterRes, weightRes, goalsRes] = await Promise.all([
      supabase
        .from("food_entries")
        .select("food_name, calories, protein_g, carbs_g, fat_g, sugar_g, meal_type, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("water_entries")
        .select("amount_ml, created_at")
        .gte("created_at", sevenDaysAgo.toISOString()),
      supabase
        .from("weight_logs")
        .select("weight_kg, logged_at")
        .order("logged_at", { ascending: true })
        .limit(14),
      supabase
        .from("user_goals")
        .select("calories, protein_g, carbs_g, fat_g, water_ml")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const foodEntries = foodRes.data || [];
    const waterEntries = waterRes.data || [];
    const weightLogs = weightRes.data || [];
    const goals = goalsRes.data;

    if (foodEntries.length === 0) {
      return new Response(
        JSON.stringify({ analysis: "Not enough data yet. Log at least a few days of meals to get your personalized AI analysis." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a concise data summary for the AI
    const dayMap: Record<string, { cals: number; protein: number; carbs: number; fat: number; sugar: number; meals: string[]; times: string[] }> = {};
    foodEntries.forEach((e: any) => {
      const day = new Date(e.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      if (!dayMap[day]) dayMap[day] = { cals: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, meals: [], times: [] };
      dayMap[day].cals += Number(e.calories);
      dayMap[day].protein += Number(e.protein_g);
      dayMap[day].carbs += Number(e.carbs_g);
      dayMap[day].fat += Number(e.fat_g);
      dayMap[day].sugar += Number(e.sugar_g || 0);
      dayMap[day].meals.push(`${e.meal_type}: ${e.food_name} (${e.calories}kcal)`);
      const hour = new Date(e.created_at).getHours();
      dayMap[day].times.push(`${hour}:00`);
    });

    const totalWaterMl = waterEntries.reduce((s: number, e: any) => s + e.amount_ml, 0);
    const avgWaterPerDay = Math.round(totalWaterMl / 7);

    const dataSummary = Object.entries(dayMap)
      .map(([day, d]) => `${day}: ${Math.round(d.cals)}kcal, P:${Math.round(d.protein)}g, C:${Math.round(d.carbs)}g, F:${Math.round(d.fat)}g, Sugar:${Math.round(d.sugar)}g | Meals: ${d.meals.join("; ")} | Meal times: ${d.times.join(", ")}`)
      .join("\n");

    const weightSummary = weightLogs.length > 0
      ? `Weight logs: ${weightLogs.map((w: any) => `${w.logged_at}: ${w.weight_kg}kg`).join(", ")}`
      : "No weight data available.";

    const goalsSummary = goals
      ? `Goals: ${goals.calories}kcal, P:${goals.protein_g}g, C:${goals.carbs_g}g, F:${goals.fat_g}g, Water:${goals.water_ml}ml/day`
      : "No goals set.";

    const prompt = `You are an expert nutrition coach analyzing a user's last 7 days of food data. Be motivational but direct. Use a conversational tone.

USER DATA:
${dataSummary}

${weightSummary}
${goalsSummary}
Avg water intake: ${avgWaterPerDay}ml/day

ANALYZE for:
- Overeating timing patterns (late night, specific days)
- Protein deficiency trends
- Weekend vs weekday calorie spikes
- Emotional eating indicators (high sugar, irregular patterns)
- Macro balance quality

RESPOND with EXACTLY this format (use markdown):

### 🔍 Key Insights

1. **[Insight title]** — [1-2 sentence observation with specific numbers from the data]

2. **[Insight title]** — [1-2 sentence observation with specific numbers from the data]

3. **[Insight title]** — [1-2 sentence observation with specific numbers from the data]

### 🎯 Your #1 Action Step

[One specific, actionable improvement they can start tomorrow. Be concrete — name a food swap, timing change, or habit.]

### 💪 Bottom Line

[1-2 motivational sentences. Be real, not generic. Reference their actual data.]`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a minute." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Unable to generate analysis.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
