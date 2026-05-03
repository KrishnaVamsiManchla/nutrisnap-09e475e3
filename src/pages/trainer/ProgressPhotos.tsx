import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Camera, RotateCcw } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProgressPhotos = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(URL.createObjectURL(f));
  };

  return (
    <TrainerLayout
      title="Progress Photo"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(`/trainer/clients/${id}`)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Card className="card-premium overflow-hidden">
        {photo ? (
          <img src={photo} alt="Progress" className="aspect-[3/4] w-full object-cover" />
        ) : (
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 bg-muted/40 text-muted-foreground">
            <Camera className="h-10 w-10" strokeWidth={1.5} />
            <p className="text-sm">Capture a progress photo</p>
          </div>
        )}
      </Card>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" className="gap-2" onClick={() => setPhoto(null)} disabled={!photo}>
          <RotateCcw className="h-4 w-4" /> Retake
        </Button>
        <Button className="gap-2" onClick={() => inputRef.current?.click()}>
          <Camera className="h-4 w-4" /> {photo ? "New" : "Open Camera"}
        </Button>
      </div>
    </TrainerLayout>
  );
};

export default ProgressPhotos;