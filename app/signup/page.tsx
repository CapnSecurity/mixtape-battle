"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle"|"validating"|"invalid"|"ready"|"submitting"|"success"|"error">("idle");

  useEffect(() => {
    if (!token) return setStatus("invalid");
    setStatus("validating");
    fetch(`/api/invite/validate?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.email) {
          setEmail(data.email);
          setStatus("ready");
        } else {
          setStatus("invalid");
        }
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setStatus("success");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setStatus("error");
    }
  }

  if (status === "invalid") return <div className="max-w-lg mx-auto p-8 mt-12 text-center">Invalid or expired invite link.</div>;
  if (status === "success") return <div className="max-w-lg mx-auto p-8 mt-12 text-center text-[var(--gold)]">Account created! Redirecting to login...</div>;

  return (
    <div className="max-w-lg mx-auto p-8 mt-12 rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)]">
      <h1 className="text-3xl font-bold mb-6 text-[var(--text)]">Create Your Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Email</label>
          <Input type="email" value={email} disabled readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Password</label>
          <Input type="password" required placeholder="Set a password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={status!=="ready"}>Create Account</Button>
      </form>
      {status === "error" && <div className="text-[var(--pink)] mt-4">Failed to create account.</div>}
    </div>
  );
}
