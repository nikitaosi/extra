'use client';

import { LoaderCircle, ShieldCheck, WalletCards } from 'lucide-react';
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
            <span>Cannot reach the API: {apiError}</span>
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
          {loginError && <p role="alert" className="error-text">{loginError}</p>}
          <button className="button primary wide" type="submit" disabled={loginBusy}>
            {loginBusy ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}
            Sign in
          </button>
        </form>
        <p className="auth-footnote">
          Your expenses live in PostgreSQL and are served through a typed Protobuf API.
        </p>
      </section>
    </main>
  );
}
