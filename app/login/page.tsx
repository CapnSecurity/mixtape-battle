"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("email", { email, redirect: false });
    setSent(true);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Sign in</h1>
      {!sent ? (
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit">Send magic link</button>
        </form>
      ) : (
        <p>Check MailHog at http://localhost:8025 for the login link.</p>
      )}
    </main>
  );
}
