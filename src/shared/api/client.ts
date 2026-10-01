import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { AuthService, ExpenseService } from './gen/expense_pb';

function apiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3101';
  throw new Error('NEXT_PUBLIC_API_URL is required');
}

function transport() {
  return createConnectTransport({
    baseUrl: apiUrl(),
    useBinaryFormat: true,
    fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
  });
}

export function authClient() {
  return createClient(AuthService, transport());
}

export function expenseClient() {
  return createClient(ExpenseService, transport());
}
