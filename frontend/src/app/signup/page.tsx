"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHost, setIsHost] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      show("Password must be at least 6 characters", "error");
      return;
    }
    try {
      await signup(name, email, password, isHost);
      show("Account created!", "success");
      router.push("/");
    } catch (err) {
      show((err as Error).message, "error");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Sign up</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Full name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
        </Field>
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="At least 6 characters" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isHost} onChange={(e) => setIsHost(e.target.checked)} className="h-4 w-4 accent-rose-500" />
          I want to list my property (become a host)
        </label>
        <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        Already have an account?{" "}
        <a href="/login" className="font-semibold underline">Log in</a>
      </p>
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 focus:dark:border-neutral-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}