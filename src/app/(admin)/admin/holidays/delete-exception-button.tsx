"use client";

import { useActionState, useRef, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CatalogFormState } from "../form-utils";
import { deleteExceptionAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

export function DeleteExceptionButton({ id }: { id: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    deleteExceptionAction,
    initialState,
  );

  return (
    <>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="id" value={id} />
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
        >
          {pending ? "Removing…" : "Remove"}
        </Button>
        <FormError message={state.error} className="mt-1" />
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Remove this date?"
        description="Booking availability will update after this holiday or closure is removed."
        confirmLabel="Remove"
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
