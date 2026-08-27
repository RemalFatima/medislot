"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { humanErrorMessage } from "@/lib/human-error";

export const fieldClass = cn(
  "h-11 w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
  "outline-none transition-colors placeholder:text-muted",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-(--ring)",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
  "aria-invalid:border-danger",
);

export const checkboxClass =
  "size-5 shrink-0 rounded border-border text-primary accent-primary focus-visible:ring-2 focus-visible:ring-(--ring) disabled:opacity-60";

export const textareaClass = cn(
  "w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground",
  "outline-none transition-colors placeholder:text-muted",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-(--ring)",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
  "aria-invalid:border-danger",
);

export function RequiredMark() {
  return (
    <>
      <span className="ms-0.5 font-semibold text-danger" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

function validityMessage(validity: ValidityState, fallback: string): string {
  if (validity.valueMissing) {
    return "This field is required.";
  }
  if (validity.typeMismatch) {
    return "Enter a valid value.";
  }
  if (validity.tooShort) {
    return "This field is too short.";
  }
  if (validity.patternMismatch) {
    return "Enter a valid value.";
  }
  if (validity.rangeUnderflow || validity.rangeOverflow || validity.stepMismatch) {
    return "Enter a valid number.";
  }
  return fallback || "Check this field.";
}

type ControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type ControlProps = {
  id?: string;
  required?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  onInvalid?: (event: FormEvent<ControlElement>) => void;
  onInput?: (event: FormEvent<ControlElement>) => void;
  onChange?: (event: FormEvent<ControlElement>) => void;
};

export function RequiredGroup({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  const [localError, setLocalError] = useState<string | undefined>();

  return (
    <fieldset
      className="min-w-0"
      onInvalidCapture={(event) => {
        event.preventDefault();
        setLocalError("This field is required.");
      }}
      onChange={() => setLocalError(undefined)}
    >
      <legend className="text-base font-semibold text-foreground">
        {legend}
        <RequiredMark />
      </legend>
      {hint}
      {children}
      {localError ? (
        <p className="mt-2 text-xs text-danger" role="alert">
          {localError}
        </p>
      ) : null}
    </fieldset>
  );
}

export function ValidatedForm({
  onSubmit,
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      {...props}
      noValidate
      onSubmit={(event) => {
        if (!event.currentTarget.checkValidity()) {
          event.preventDefault();
          event.currentTarget.querySelector<HTMLElement>(":invalid")?.focus();
          return;
        }
        onSubmit?.(event);
      }}
    >
      {children}
    </form>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const [localError, setLocalError] = useState<string | undefined>();
  const shownError = error || localError;
  const child = isValidElement(children) ? (children as ReactElement<ControlProps>) : null;
  const isRequired = required || Boolean(child?.props.required);

  const control = child
    ? cloneElement(child, {
        id: child.props.id ?? controlId,
        required: isRequired,
        "aria-required": isRequired || undefined,
        "aria-invalid": shownError ? true : undefined,
        onInvalid: (event: FormEvent<ControlElement>) => {
          event.preventDefault();
          const target = event.currentTarget;
          setLocalError(validityMessage(target.validity, target.validationMessage));
          child.props.onInvalid?.(event);
        },
        onInput: (event: FormEvent<ControlElement>) => {
          setLocalError(undefined);
          child.props.onInput?.(event);
        },
        onChange: (event: FormEvent<ControlElement>) => {
          setLocalError(undefined);
          child.props.onChange?.(event);
        },
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor={controlId} className="font-medium text-foreground">
        {label}
        {isRequired ? <RequiredMark /> : null}
      </label>
      {control}
      {hint && !shownError ? <span className="text-xs text-muted">{hint}</span> : null}
      {shownError ? (
        <span className="text-xs text-danger" role="alert">
          {humanErrorMessage(shownError, shownError)}
        </span>
      ) : null}
    </div>
  );
}
