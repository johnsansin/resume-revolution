import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDateDisplay(value?: string): string {
  const date = parseISODate(value);
  if (!date) return "";
  return format(date, "MMM d, yyyy");
}

function parseISOMonth(value?: string): { year: number; month: number } | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return undefined;
  return { year, month };
}

export function formatMonthDisplay(value?: string): string {
  const parsed = parseISOMonth(value);
  if (!parsed) return "";
  const date = new Date(parsed.year, parsed.month - 1, 1);
  return format(date, "MMMM yyyy");
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder, className, id, disabled }) => {
  const selected = parseISODate(value);

  const handleSelect = (date: Date | undefined) => {
    if (date) onChange(formatDateToISO(date));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-card border-border focus:border-accent transition-colors",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
          {selected ? formatDateDisplay(value) : <span>{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} initialFocus />
      </PopoverContent>
      <input type="hidden" id={id} value={value || ""} />
    </Popover>
  );
};

interface MonthPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, placeholder, className, id, disabled }) => {
  const parsed = parseISOMonth(value) || (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  })();
  const [viewYear, setViewYear] = React.useState(parsed.year);
  const [open, setOpen] = React.useState(false);

  const handlePick = (month: number) => {
    const m = String(month).padStart(2, "0");
    onChange(`${viewYear}-${m}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-card border-border focus:border-accent transition-colors",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
          {value ? formatMonthDisplay(value) : <span>{placeholder || "Pick a month"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex items-center justify-between mb-3 px-1">
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewYear((y) => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{viewYear}</span>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewYear((y) => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((name, i) => {
            const active = value === `${viewYear}-${String(i + 1).padStart(2, "0")}`;
            return (
              <Button
                key={name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePick(i + 1)}
                className={cn(
                  "justify-center text-xs px-1 py-2 h-auto",
                  active && "bg-accent text-accent-foreground border-accent/50 shadow-md"
                )}
              >
                {name.slice(0, 3)}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
      <input type="hidden" id={id} value={value || ""} />
    </Popover>
  );
};

export default DatePicker;
export { MonthPicker };
