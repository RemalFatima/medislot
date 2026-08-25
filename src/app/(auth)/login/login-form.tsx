"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-800">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-800">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-900"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
