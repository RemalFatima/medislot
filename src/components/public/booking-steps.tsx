import { cn } from "@/lib/cn";

const STEPS = [
  "Doctor",
  "Service",
  "Date",
  "Time",
  "Your details",
  "Confirmed",
] as const;

export function BookingSteps({
  current,
  className,
}: {
  current: number;
  className?: string;
}) {
  const currentIndex = Math.min(Math.max(current, 1), STEPS.length) - 1;

  return (
    <nav aria-label="Booking progress" className={cn("mb-8", className)}>
      <p className="text-sm font-medium text-foreground">
        Step {currentIndex + 1} of {STEPS.length}
        <span className="font-normal text-muted"> · {STEPS[currentIndex]}</span>
      </p>
      <ol className="mt-3 hidden gap-2 sm:grid sm:grid-cols-6">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "truncate text-center text-xs",
              index === currentIndex
                ? "font-semibold text-primary"
                : index < currentIndex
                  ? "text-foreground"
                  : "text-muted",
            )}
          >
            {label}
          </li>
        ))}
      </ol>
      <ol className="mt-3 flex gap-1" aria-hidden>
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index <= currentIndex ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </ol>
    </nav>
  );
}
