"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/actions/auth";

const initialState: SignInState = {};

export function LoginForm() {
  // useActionState drives the form: wires the Server Action, surfaces the
  // returned error state, and exposes a pending flag for the button.
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-gold"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Mot de passe</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-gold"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
