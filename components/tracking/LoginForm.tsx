"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasSupabaseConfig()) {
      setError("Employee login is ready, but Supabase keys still need to be added in Netlify.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      window.location.href = "/dashboard";
    } catch {
      setError("Login failed. Please check the email and password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="section-shell mx-auto max-w-xl p-6 md:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-enterprise-blue/10 text-enterprise-blue">
        <LockKeyhole className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-3xl font-bold text-enterprise-charcoal">Employee login</h2>
      <p className="mt-3 text-enterprise-gray">
        Sign in to view assigned shipments, start a shift, and update customer deliveries.
      </p>

      <div className="mt-6 space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <p className="mt-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <Button type="submit" className="mt-6 w-full rounded-2xl" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign In
      </Button>

      <p className="mt-5 text-center text-sm text-enterprise-gray">
        Need a login? Ask a dispatcher or Supabase admin to create your employee account.
      </p>
      <Link
        href="/track"
        className="mt-3 block text-center text-sm font-semibold text-enterprise-blue hover:text-enterprise-navy"
      >
        Customer tracking page
      </Link>
    </form>
  );
}
