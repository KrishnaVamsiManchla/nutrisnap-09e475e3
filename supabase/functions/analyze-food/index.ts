import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_base64, food_description, quantity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a precise nutritional analysis AI. Analyze the food provided and return ONLY valid JSON with this exact structure:
{
  "food_name": "name of the food",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "serving_size": "description of serving size",
  "items": [{"name": "item name", "calories": number}]
}
All values should be for the total amount shown/described. Be as accurate as possible. If multiple items are visible, sum them up but list individually in items array. Return ONLY the JSON, no markdown.`;

    const messages: any[] = [{ role: "system", content: systemPrompt }];

    if (image_base64) {
      const userContent: any[] = [];
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image_base64}` },
      });
      let text = "Analyze this food image and provide detailed nutritional information.";
      if (quantity) text += ` The quantity is: ${quantity}.`;
      userContent.push({ type: "text", text });
      messages.push({ role: "user", content: userContent });
    } else if (food_description) {
      let text = `Analyze this food and provide detailed nutritional information: ${food_description}`;
      if (quantity) text += `. Quantity: ${quantity}`;
      messages.push({ role: "user", content: text });
    } else {
      throw new Error("Either image_base64 or food_description is required");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse the JSON from the response
    let nutritionData;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      nutritionData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse nutritional data");
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
