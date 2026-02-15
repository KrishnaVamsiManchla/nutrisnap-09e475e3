import { useRef } from "react";
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
      // Swiped right → previous day
      onDateChange(subDays(date, 1));
    } else if (diff < -threshold && !today) {
      // Swiped left → next day
      onDateChange(addDays(date, 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="flex items-center justify-between"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => onDateChange(subDays(date, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl hover:bg-accent transition-colors">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {today ? "Today" : format(date, "EEEE")}
            </span>
            <span className="text-lg font-bold tracking-tight">
              {format(date, "MMM d, yyyy")}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
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
        className="h-8 w-8 rounded-full"
        onClick={() => onDateChange(addDays(date, 1))}
        disabled={today}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateHeader;
