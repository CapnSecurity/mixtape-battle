"use client";


import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';

type User = {
  id: string;
  email: string;
  isAdmin: boolean;
};

export default function InvitePage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle'|'deleting'|'deleted'|'error'>('idle');
  const [deleteError, setDeleteError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (session?.user && (session.user as any).isAdmin) {
      fetchUsers();
    }
  }, [session]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }

  // Only allow if logged in and isAdmin
  if (status === 'loading') return null;
  if (!session || !session.user || !(session.user as any).isAdmin) {
    return (
      <div className="max-w-lg mx-auto p-8 mt-12 rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] text-center">
        <h1 className="text-3xl font-bold mb-6 text-[var(--text)]">Access Denied</h1>
        <p className="text-[var(--muted)]">You must be an admin to invite users.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg('sending');
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatusMsg(res.ok ? 'sent' : 'error');
  }

  async function handleDeleteUser(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete ${deleteEmail}? This cannot be undone.`)) {
      return;
    }
    
    setDeleteStatus('deleting');
    setDeleteError('');
    
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: deleteEmail }),
    });
    
    if (res.ok) {
      setDeleteStatus('deleted');
      setDeleteEmail('');
      setTimeout(() => setDeleteStatus('idle'), 3000);
      // Refresh user list
      fetchUsers();
    } else {
      const data = await res.json();
      setDeleteError(data.error || 'Failed to delete user');
      setDeleteStatus('error');
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8 mt-12 space-y-8">
      {/* Invite User Section */}
      <div className="rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] p-8">
        <h1 className="text-3xl font-bold mb-6 text-[var(--text)]">Invite a Bandmate</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={statusMsg === 'sending'}>
            {statusMsg === 'sending' ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>
        {statusMsg === 'sent' && <div className="text-[var(--gold)] mt-4">Invite sent!</div>}
        {statusMsg === 'error' && <div className="text-[var(--pink)] mt-4">Failed to send invite.</div>}
      </div>

      {/* Delete User Section */}
      <div className="rounded-2xl border border-red-500/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] p-8">
        <h2 className="text-2xl font-bold mb-2 text-red-500">Remove User Account</h2>
        <p className="text-[var(--muted)] text-sm mb-6">
          Permanently delete a user and all their data. This cannot be undone.
        </p>

        {/* User List */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Current Users</h3>
          {loadingUsers ? (
            <div className="text-[var(--muted)] text-sm">Loading users...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setDeleteEmail(user.email)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface2)] hover:bg-[var(--surface)] cursor-pointer transition border border-[var(--ring)]/10"
                >
                  <div className="flex-1">
                    <div className="text-sm text-[var(--text)] font-medium">{user.email}</div>
                  </div>
                  {user.isAdmin && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-[var(--gold)]/20 text-[var(--gold)]">
                      ADMIN
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleDeleteUser} className="space-y-4">
          <Input
            type="email"
            required
            placeholder="Email address to delete"
            value={deleteEmail}
            onChange={e => setDeleteEmail(e.target.value)}
          />
          <Button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600" 
            disabled={deleteStatus === 'deleting'}
          >
            {deleteStatus === 'deleting' ? 'Deleting...' : 'Delete User'}
          </Button>
        </form>
        {deleteStatus === 'deleted' && (
          <div className="text-[var(--gold)] mt-4">User deleted successfully!</div>
        )}
        {deleteStatus === 'error' && (
          <div className="text-red-400 mt-4">{deleteError}</div>
        )}
      </div>
    </div>
  );
}
