import { useState } from "react";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WeeklyAnalysis = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-analysis");
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      setAnalysis(data.analysis);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load analysis", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown renderer for bold and headers
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-sm font-bold mt-4 mb-2 first:mt-0">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.trim() === "") return <br key={i} />;

      // Handle bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <section className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            AI Weekly Analysis
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs"
          onClick={fetchAnalysis}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : analysis ? (
            <RefreshCw className="h-3 w-3" />
          ) : null}
          {loading ? "Analyzing…" : analysis ? "Refresh" : "Analyze My Week"}
        </Button>
      </div>

      {loading && !analysis && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p>Crunching your nutrition data…</p>
        </div>
      )}

      {analysis && (
        <div className="rounded-xl bg-muted/30 px-4 py-3 space-y-1">
          {renderMarkdown(analysis)}
        </div>
      )}

      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
          <Brain className="h-8 w-8 mb-2 opacity-30" />
          <p>Tap "Analyze My Week" for AI-powered insights</p>
          <p className="text-xs opacity-60 mt-1">Based on your last 7 days of data</p>
        </div>
      )}
    </section>
  );
};

export default WeeklyAnalysis;
