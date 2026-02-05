"use client";

import { useState } from 'react';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? 'sent' : 'error');
  }

  return (
    <div className="max-w-lg mx-auto p-8 mt-12 rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)]">
      <h1 className="text-3xl font-bold mb-6 text-[var(--text)]">Invite a Bandmate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Send Invite
        </Button>
      </form>
      {status === 'sent' && <div className="text-[var(--gold)] mt-4">Invite sent!</div>}
      {status === 'error' && <div className="text-[var(--pink)] mt-4">Failed to send invite.</div>}
    </div>
  );
}
