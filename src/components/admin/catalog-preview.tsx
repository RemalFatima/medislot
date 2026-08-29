"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { Badge } from "@/components/ui/badge";
import { cardLiftClass } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

export type PreviewField = {
  label: string;
  value: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CatalogPreviewCard({
  title,
  description,
  meta,
  chips,
  active,
  editHref,
  canEdit,
  fields,
  leading,
}: {
  title: string;
  description?: string | null;
  meta?: string;
  chips?: string[];
  active: boolean;
  editHref: string;
  canEdit: boolean;
  fields: PreviewField[];
  leading?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative h-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-(--shadow-card)",
            cardLiftClass,
          )}
        >
          <span className="h-1.5 bg-primary" />
          <span className="flex flex-1 flex-col bg-linear-to-b from-accent/45 to-surface p-5">
            <span className="flex items-start gap-3">
              {leading ?? (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-semibold tracking-wide text-primary ring-2 ring-white">
                  {initials(title)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="wrap-break-word text-base font-semibold tracking-tight text-foreground">
                    {title}
                  </span>
                  <span className={cn("shrink-0", canEdit && "pr-8")}>
                    <VisibilityBadge active={active} />
                  </span>
                </span>
                {meta ? (
                  <span className="mt-1.5 block">
                    <Badge tone="primary">{meta}</Badge>
                  </span>
                ) : null}
              </span>
            </span>
            {chips && chips.length > 0 ? (
              <span className="mt-3 flex flex-wrap gap-1.5">
                {chips.slice(0, 3).map((chip) => (
                  <Badge key={chip} tone="neutral">
                    {chip}
                  </Badge>
                ))}
                {chips.length > 3 ? (
                  <Badge tone="neutral">+{chips.length - 3}</Badge>
                ) : null}
              </span>
            ) : null}
            {description ? (
              <span className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                {description}
              </span>
            ) : null}
            <span className="mt-auto inline-flex items-center gap-1 border-t border-border pt-3 text-sm font-semibold text-primary">
              View details
              <ChevronRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </span>
        </button>
        {canEdit ? <EditIconLink href={editHref} label={`Edit ${title}`} /> : null}
      </div>
      <PreviewModal
        open={open}
        title={title}
        fields={fields}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function PreviewModal({
  open,
  title,
  fields,
  onClose,
}: {
  open: boolean;
  title: string;
  fields: PreviewField[];
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <dl className="grid gap-3">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-border bg-accent/30 px-3 py-2.5"
          >
            <dt className="text-xs font-medium tracking-wide text-muted uppercase">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm wrap-break-word text-foreground">
              {field.value || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

function EditIconLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="absolute top-5 right-3 z-10 inline-flex size-9 items-center justify-center rounded-xl border border-border bg-surface/95 text-muted shadow-(--shadow-card) backdrop-blur-sm hover:border-primary/30 hover:bg-accent hover:text-primary"
    >
      <Pencil className="size-4" />
    </Link>
  );
}
