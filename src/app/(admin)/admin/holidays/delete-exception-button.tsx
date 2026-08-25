"use client";

import { useActionState } from "react";
import type { CatalogFormState } from "../form-utils";
import { deleteExceptionAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

export function DeleteExceptionButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteExceptionAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-red-700 hover:underline disabled:opacity-60"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {state.error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
