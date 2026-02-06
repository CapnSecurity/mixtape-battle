"use client";


import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import { useCsrfToken, withCsrfToken } from '@/lib/use-csrf';

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
  const [resetStatus, setResetStatus] = useState<{ [email: string]: 'idle'|'sending'|'sent'|'error' }>({});
  const [adminToggleStatus, setAdminToggleStatus] = useState<{ [email: string]: 'idle'|'toggling'|'success'|'error' }>({});
  const { token: csrfToken } = useCsrfToken();

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
      <div className="max-w-lg mx-auto p-8 mt-12 rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)]">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-3 text-[var(--text)]">Admin Access Required</h1>
          <p className="text-[var(--muted)] mb-6">
            Only administrators can access the user management page.
          </p>
        </div>
        
        <div className="space-y-3">
          <a 
            href="/battle" 
            className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white font-semibold text-center hover:opacity-90 transition-opacity"
          >
            🎵 Go to Battle Page
          </a>
          <a 
            href="/songs" 
            className="block w-full py-3 px-4 rounded-lg border border-[var(--ring)]/30 text-[var(--text)] font-semibold text-center hover:bg-[var(--surface)] transition-colors"
          >
            🎸 Browse Songs
          </a>
          <a 
            href="/results" 
            className="block w-full py-3 px-4 rounded-lg border border-[var(--ring)]/30 text-[var(--text)] font-semibold text-center hover:bg-[var(--surface)] transition-colors"
          >
            🏆 View Results
          </a>
          <a 
            href="/settings" 
            className="block w-full py-3 px-4 rounded-lg border border-[var(--ring)]/30 text-[var(--text)] font-semibold text-center hover:bg-[var(--surface)] transition-colors"
          >
            ⚙️ Settings
          </a>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg('sending');
    if (!csrfToken) {
      setStatusMsg('error');
      return;
    }

    const res = await fetch(
      '/api/invite',
      withCsrfToken(csrfToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    );
    setStatusMsg(res.ok ? 'sent' : 'error');
  }

  async function handleDeleteUser(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete ${deleteEmail}? This cannot be undone.`)) {
      return;
    }
    
    setDeleteStatus('deleting');
    setDeleteError('');
    
    if (!csrfToken) {
      setDeleteError('Security token not ready. Please try again.');
      setDeleteStatus('error');
      return;
    }

    const res = await fetch(
      '/api/admin/delete-user',
      withCsrfToken(csrfToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail }),
      })
    );
    
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

  async function handleSendPasswordReset(email: string) {
    setResetStatus(prev => ({ ...prev, [email]: 'sending' }));
    
    try {
      if (!csrfToken) {
        setResetStatus(prev => ({ ...prev, [email]: 'error' }));
        return;
      }

      const res = await fetch(
        '/api/admin/send-password-reset',
        withCsrfToken(csrfToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      );
      
      if (res.ok) {
        setResetStatus(prev => ({ ...prev, [email]: 'sent' }));
        setTimeout(() => {
          setResetStatus(prev => ({ ...prev, [email]: 'idle' }));
        }, 3000);
      } else {
        setResetStatus(prev => ({ ...prev, [email]: 'error' }));
      }
    } catch (error) {
      console.error('Failed to send password reset:', error);
      setResetStatus(prev => ({ ...prev, [email]: 'error' }));
    }
  }

  async function handleToggleAdmin(email: string, currentIsAdmin: boolean) {
    // Prevent self-demotion
    if (currentIsAdmin && email === session?.user?.email) {
      alert('Cannot remove your own admin privileges');
      return;
    }

    const action = currentIsAdmin ? 'remove admin privileges from' : 'make admin';
    if (!confirm(`Are you sure you want to ${action} ${email}?`)) {
      return;
    }

    setAdminToggleStatus(prev => ({ ...prev, [email]: 'toggling' }));
    
    try {
      if (!csrfToken) {
        setAdminToggleStatus(prev => ({ ...prev, [email]: 'error' }));
        return;
      }

      const res = await fetch(
        '/api/admin/toggle-admin',
        withCsrfToken(csrfToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      );
      
      if (res.ok) {
        setAdminToggleStatus(prev => ({ ...prev, [email]: 'success' }));
        setTimeout(() => {
          setAdminToggleStatus(prev => ({ ...prev, [email]: 'idle' }));
        }, 2000);
        // Refresh user list to show updated admin status
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle admin status');
        setAdminToggleStatus(prev => ({ ...prev, [email]: 'error' }));
      }
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      setAdminToggleStatus(prev => ({ ...prev, [email]: 'error' }));
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
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface2)] border border-[var(--ring)]/10"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => setDeleteEmail(user.email)}>
                    <div className="text-sm text-[var(--text)] font-medium">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.isAdmin && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-[var(--gold)]/20 text-[var(--gold)]">
                        ADMIN
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleAdmin(user.email, user.isAdmin)}
                      disabled={adminToggleStatus[user.email] === 'toggling'}
                      className="text-xs"
                      title={user.isAdmin ? 'Remove admin privileges' : 'Make admin'}
                    >
                      {adminToggleStatus[user.email] === 'toggling' && '⏳'}
                      {adminToggleStatus[user.email] === 'success' && '✓'}
                      {adminToggleStatus[user.email] === 'error' && '✗'}
                      {(!adminToggleStatus[user.email] || adminToggleStatus[user.email] === 'idle') && (user.isAdmin ? '👑 Demote' : '👑 Promote')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleSendPasswordReset(user.email)}
                      disabled={resetStatus[user.email] === 'sending'}
                      className="text-xs"
                    >
                      {resetStatus[user.email] === 'sending' && '⏳'}
                      {resetStatus[user.email] === 'sent' && '✓'}
                      {resetStatus[user.email] === 'error' && '✗'}
                      {(!resetStatus[user.email] || resetStatus[user.email] === 'idle') && '🔑 Reset'}
                    </Button>
                  </div>
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
