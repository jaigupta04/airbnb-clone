"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-neutral-400">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { login, loading } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      show("Welcome back!", "success");
      router.push(redirect);
    } catch (err) {
      show((err as Error).message, "error");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
        </Field>
        <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-2 font-semibold">Demo accounts (password: <code>password123</code>):</p>
        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
          <li><button onClick={() => setEmail("priya@example.com")} className="hover:underline">priya@example.com</button> — Guest</li>
          <li><button onClick={() => setEmail("maria@example.com")} className="hover:underline">maria@example.com</button> — Superhost</li>
          <li><button onClick={() => setEmail("james@example.com")} className="hover:underline">james@example.com</button> — Host</li>
        </ul>
      </div>

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="font-semibold underline">Sign up</a>
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