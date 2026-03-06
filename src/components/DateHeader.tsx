import { useRef, useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DateHeader = ({ date, onDateChange }: DateHeaderProps) => {
  const today = isToday(date);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (diff > threshold) {
      onDateChange(subDays(date, 1));
    } else if (diff < -threshold && !today) {
      onDateChange(addDays(date, 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative flex items-center justify-between"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl press-scale"
        onClick={() => onDateChange(subDays(date, 1))}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl hover:bg-accent/60 transition-colors press-scale">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {today ? "Today" : format(date, "EEEE")}
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {format(date, "MMM d, yyyy")}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl shadow-elevated" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onDateChange(d)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl press-scale"
        onClick={() => onDateChange(addDays(date, 1))}
        disabled={today}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default DateHeader;
