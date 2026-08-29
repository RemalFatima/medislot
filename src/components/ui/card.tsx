import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const cardLiftClass =
  "transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-primary/30";

export const cardGridHoverClass =
  "[&>li]:transition-[opacity,filter] [&>li]:duration-200 [&:has(li:hover)>li]:opacity-70 [&:has(li:hover)>li]:grayscale [&:has(li:hover)>li:hover]:opacity-100 [&:has(li:hover)>li:hover]:grayscale-0";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-border bg-surface shadow-(--shadow-card)",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-sm text-muted", className)} {...props} />
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}
