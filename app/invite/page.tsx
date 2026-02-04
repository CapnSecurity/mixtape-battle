import { useState } from 'react';

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
    <div className="max-w-lg mx-auto p-8 mt-12 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Invite a Bandmate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send Invite
        </button>
      </form>
      {status === 'sent' && <div className="text-green-600 mt-4">Invite sent!</div>}
      {status === 'error' && <div className="text-red-600 mt-4">Failed to send invite.</div>}
    </div>
  );
}
