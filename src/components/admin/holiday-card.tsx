import type { ReactNode } from "react";
import { Clock3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, cardLiftClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { exceptionTypeLabel, timeInputValue } from "@/server/scheduling/constants";
import type { AvailabilityException } from "@/server/scheduling/exceptions";
import type { ExceptionType } from "@/types/database";

const BAR: Record<ExceptionType, string> = {
  holiday: "bg-primary",
  leave: "bg-warning",
  special_hours: "bg-info",
  unavailable: "bg-danger",
};

const TONE: Record<
  ExceptionType,
  "neutral" | "success" | "warning" | "danger" | "info" | "primary"
> = {
  holiday: "primary",
  leave: "warning",
  special_hours: "info",
  unavailable: "danger",
};

function dateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return {
    weekday: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      timeZone: "UTC",
    }).format(utc),
    day: String(day),
    month: new Intl.DateTimeFormat("en-GB", {
      month: "short",
      timeZone: "UTC",
    }).format(utc),
    full: new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(utc),
  };
}

export function HolidayCard({
  exception,
  doctorName,
  isPast,
  children,
}: {
  exception: AvailabilityException;
  doctorName?: string;
  isPast: boolean;
  children?: ReactNode;
}) {
  const parts = dateParts(exception.date);
  const who = exception.doctor_id ? (doctorName ?? "Doctor") : "Entire clinic";
  const when =
    exception.start_time && exception.end_time
      ? `${timeInputValue(exception.start_time)}–${timeInputValue(exception.end_time)}`
      : "All day";

  return (
    <Card className={cn("overflow-hidden p-0", cardLiftClass, isPast && "opacity-80")}>
      <div className={`h-1.5 ${BAR[exception.type]}`} />
      <div className="bg-linear-to-b from-accent/35 to-surface p-4 sm:p-5">
        <div className="flex gap-4">
          <div
            className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent px-2 py-3"
            aria-hidden
          >
            <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
              {parts.weekday}
            </p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {parts.day}
            </p>
            <p className="text-xs font-medium text-muted">{parts.month}</p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold tracking-tight text-foreground">
                  {parts.full}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={TONE[exception.type]}>
                    {exceptionTypeLabel(exception.type)}
                  </Badge>
                  {isPast ? <Badge tone="neutral">Past</Badge> : null}
                </div>
              </div>
              {children ? <div className="shrink-0">{children}</div> : null}
            </div>

            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-surface/80 px-3 py-2 ring-1 ring-border">
                <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                  <UserRound className="size-3.5" aria-hidden />
                  Applies to
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{who}</dd>
              </div>
              <div className="rounded-xl bg-surface/80 px-3 py-2 ring-1 ring-border">
                <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                  <Clock3 className="size-3.5" aria-hidden />
                  Hours
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{when}</dd>
              </div>
            </dl>

            {exception.reason ? (
              <p className="mt-3 text-sm leading-6 text-muted">{exception.reason}</p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
