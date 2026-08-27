"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import type { CatalogFormState } from "../form-utils";
import { deleteExceptionAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

export function DeleteExceptionButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteExceptionAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Remove this holiday or closure? Booking availability will update after it is removed.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" size="sm" disabled={pending}>
        {pending ? "Removing…" : "Remove"}
      </Button>
      <FormError message={state.error} className="mt-1" />
    </form>
  );
}
