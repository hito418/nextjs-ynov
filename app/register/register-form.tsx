"use client";

import { useActionState } from "react";
import { signUpAction, type SignUpState } from "@/app/actions/auth";

const initialState: SignUpState = {};

export function RegisterForm() {
  // Same shape as the login form: useActionState wires the Server Action,
  // surfaces its returned error, and exposes a pending flag for the button.
  const [state, action, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Nom</span>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-gold"
        />
      </label>

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
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-gold"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
