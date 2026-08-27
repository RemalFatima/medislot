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
}: {
  current: number;
}) {
  const currentIndex = Math.min(Math.max(current, 1), STEPS.length) - 1;

  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-foreground">
        Step {currentIndex + 1} of {STEPS.length}
        <span className="font-normal text-muted"> · {STEPS[currentIndex]}</span>
      </p>
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
    </div>
  );
}
