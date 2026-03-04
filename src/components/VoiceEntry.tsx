import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NutritionData {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  serving_size: string;
}

interface VoiceEntryProps {
  onResult: (data: NutritionData) => void;
}

type Status = "idle" | "listening" | "processing" | "preview" | "error";

// Extend Window for SpeechRecognition
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const VoiceEntry = ({ onResult }: VoiceEntryProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [waveValues, setWaveValues] = useState<number[]>(Array(5).fill(0.2));
  const recognitionRef = useRef<any>(null);
  const waveInterval = useRef<ReturnType<typeof setInterval>>();

  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    return () => {
      stopListening();
      if (waveInterval.current) clearInterval(waveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateWave = () => {
    waveInterval.current = setInterval(() => {
      setWaveValues(Array(5).fill(0).map(() => 0.2 + Math.random() * 0.8));
    }, 150);
  };

  const stopWave = () => {
    if (waveInterval.current) clearInterval(waveInterval.current);
    setWaveValues(Array(5).fill(0.2));
  };

  const startListening = () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser.");
      setStatus("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setStatus("listening");
      setTranscript("");
      setError("");
      animateWave();
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
      }
      setTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      stopWave();
      if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
      } else {
        setError(`Error: ${event.error}`);
      }
      setStatus("error");
    };

    recognition.onend = () => {
      stopWave();
      if (status === "listening") {
        setStatus(transcript ? "preview" : "idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopWave();
    if (transcript) {
      setStatus("preview");
    } else {
      setStatus("idle");
    }
  };

  const handleConfirm = async () => {
    if (!transcript.trim()) return;
    setAnalyzing(true);
    setStatus("processing");
    try {
      const { data, error: fnError } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke(
        "analyze-food",
        { body: { description: transcript.trim() } }
      );
      if (fnError) throw fnError;
      if (data) onResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze food");
      setStatus("error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCancel = () => {
    stopListening();
    setTranscript("");
    setStatus("idle");
    setError("");
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Waveform */}
      <div className="flex items-end justify-center gap-1.5 h-16">
        {waveValues.map((v, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-primary transition-all duration-150"
            style={{ height: `${v * 100}%`, opacity: status === "listening" ? 1 : 0.3 }}
          />
        ))}
      </div>

      {/* Status text */}
      <div className="text-center space-y-1">
        {status === "idle" && (
          <p className="text-sm text-muted-foreground">Tap the mic to start</p>
        )}
        {status === "listening" && (
          <p className="text-sm text-primary font-medium animate-pulse">Listening…</p>
        )}
        {status === "processing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </div>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Transcript preview */}
      {(status === "preview" || status === "listening") && transcript && (
        <div className="w-full rounded-2xl bg-muted/40 px-4 py-3 text-center">
          <p className="text-sm font-medium text-foreground">"{transcript}"</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === "idle" || status === "error" ? (
          <button
            onClick={startListening}
            disabled={!isSupported}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90"
          >
            <Mic className="h-7 w-7" strokeWidth={1.5} />
          </button>
        ) : status === "listening" ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-10 w-10 rounded-full">
              <X className="h-5 w-5" />
            </Button>
            <button
              onClick={stopListening}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform active:scale-90 animate-pulse"
            >
              <MicOff className="h-7 w-7" strokeWidth={1.5} />
            </button>
          </>
        ) : status === "preview" ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-10 w-10 rounded-full">
              <X className="h-5 w-5" />
            </Button>
            <button
              onClick={handleConfirm}
              disabled={analyzing}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90"
            >
              <Check className="h-7 w-7" strokeWidth={1.5} />
            </button>
            <Button variant="ghost" size="sm" onClick={startListening} className="rounded-full text-xs">
              Retry
            </Button>
          </>
        ) : null}
      </div>

      {!isSupported && (
        <p className="text-xs text-muted-foreground text-center">
          Speech recognition requires Chrome, Edge, or Safari.
        </p>
      )}
    </div>
  );
};

export default VoiceEntry;
