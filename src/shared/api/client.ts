import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { AuthService, ExpenseService } from './gen/expense_pb';

function apiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3101';
  return `${window.location.origin}/api`;
}

function transport() {
  return createConnectTransport({
    baseUrl: apiUrl(),
    useBinaryFormat: true,
    defaultTimeoutMs: 60_000,
    fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
  });
}

export function authClient() {
  return createClient(AuthService, transport());
}

export function expenseClient() {
  return createClient(ExpenseService, transport());
}
