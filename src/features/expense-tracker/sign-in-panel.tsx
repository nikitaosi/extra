'use client';

import { ShieldCheck, WalletCards } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Theme } from '@/shared/hooks/use-theme';
import { ThemeToggle } from './theme-toggle';

type SignInPanelProps = {
  apiError: string;
  loginBusy: boolean;
  loginError: string;
  theme: Theme;
  onLogin: (email: string, password: string) => void;
  onRetry: () => void;
  onToggleTheme: () => void;
};

export function SignInPanel({
  apiError,
  loginBusy,
  loginError,
  theme,
  onLogin,
  onRetry,
  onToggleTheme,
}: SignInPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginBusy) return;
    onLogin(email, password);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card-top">
          <div className="brand-mark"><WalletCards size={26} /></div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <p className="eyebrow">EXTRA / PRIVATE WORKSPACE</p>
        <h1>Money, in focus.</h1>
        <p className="muted">Sign in to view and manage your expenses.</p>
        {apiError && (
          <div className="notice failure" role="alert">
            <span>{apiError}</span>
            <button className="button secondary" type="button" onClick={onRetry}>Retry</button>
          </div>
        )}
        <form onSubmit={submit} className="stack" aria-label="Sign in">
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {loginBusy && <p role="status" className="muted">Connecting… Demo server is waking up; first load may take a little while.</p>}
          {loginError && <p role="alert" className="error-text">{loginError}</p>}
          <button className="button primary wide login-button" type="submit" disabled={loginBusy} aria-busy={loginBusy}>
            {loginBusy ? <span className="login-loader" aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}
            {loginBusy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footnote">
          Your expenses live in PostgreSQL and are served through a typed Protobuf API.
        </p>
      </section>
    </main>
  );
}
