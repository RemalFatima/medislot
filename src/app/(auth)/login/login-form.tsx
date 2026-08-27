"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <Field label="Email">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </Field>
      <FormError message={state.error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
