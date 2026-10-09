'use client';

import { timestampFromDate } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError } from '@connectrpc/connect';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, LoaderCircle, LogOut, Plus, WalletCards, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { authClient, expenseClient } from '@/shared/api/client';
import type { Expense } from '@/shared/api/gen/expense_pb';
import { useTheme } from '@/shared/hooks/use-theme';
import { parseAmountMinor } from '@/shared/lib/money';
import { apiCurrency, createExpenseForm, currencyCode, editExpenseForm, type ExpenseForm } from './model';
import { ExpenseEditor } from './expense-editor';
import { ExpenseList } from './expense-list';
import { ExpenseSummary, type ExpenseSummaryItem } from './expense-summary';
import { SignInPanel } from './sign-in-panel';
import { ThemeToggle } from './theme-toggle';

function errorMessage(error: unknown): string {
  if (error instanceof ConnectError) return error.rawMessage || error.message;
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function ExpenseDashboard() {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [form, setForm] = useState<ExpenseForm | null>(null);
  const [formError, setFormError] = useState('');
  const [formBusy, setFormBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const me = useQuery({ queryKey: ['me'], queryFn: () => authClient().me({}) });
  const signedIn = Boolean(me.data);
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => expenseClient().listCategories({}),
    enabled: signedIn,
  });
  const expenses = useQuery({
    queryKey: ['expenses', page, search, categoryId],
    queryFn: () => expenseClient().listExpenses({ page, pageSize: 10, query: search, categoryId }),
    enabled: signedIn,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(draftSearch.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftSearch]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function submitLogin(email: string, password: string) {
    setLoginBusy(true);
    setLoginError('');
    try {
      const response = await authClient().login({ email, password });
      queryClient.setQueryData(['me'], { email: response.email });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      ]);
    } catch (error) {
      setLoginError(errorMessage(error));
    } finally {
      setLoginBusy(false);
    }
  }

  async function submitLogout() {
    setActionError('');
    try {
      await authClient().logout({});
      queryClient.setQueryData(['me'], null);
      queryClient.removeQueries({ queryKey: ['categories'] });
      queryClient.removeQueries({ queryKey: ['expenses'] });
      setForm(null);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    const amountMinor = parseAmountMinor(form.amount);
    const occurredAt = new Date(form.occurredAt);
    if (amountMinor === null) {
      setFormError('Enter a positive amount with up to two decimal places.');
      return;
    }
    if (!Number.isFinite(occurredAt.valueOf()) || !form.categoryId) {
      setFormError('Choose a valid date and category.');
      return;
    }

    setFormBusy(true);
    setFormError('');
    try {
      const input = {
        amountMinor,
        currency: apiCurrency(form.currency),
        occurredAt: timestampFromDate(occurredAt),
        description: form.description.trim(),
        categoryId: form.categoryId,
      };
      if (form.id) await expenseClient().updateExpense({ id: form.id, input });
      else await expenseClient().createExpense({ input });

      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setNotice(form.id ? 'Expense updated.' : 'Expense saved.');
      setForm(null);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setFormBusy(false);
    }
  }

  async function deleteExpense(expense: Expense) {
    if (!window.confirm(`Delete this ${expense.description || 'expense'}?`)) return;
    setActionError('');
    setDeletingId(expense.id);
    try {
      await expenseClient().deleteExpense({ id: expense.id });
      if (currentExpenses.length === 1 && page > 1) setPage(page - 1);
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setNotice('Expense deleted.');
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  if (me.isPending) {
    return (
      <main className="centered-state">
        <LoaderCircle className="spin" size={28} />
        <p>Connecting to your expenses…</p>
      </main>
    );
  }

  const apiError = me.isError && ConnectError.from(me.error).code !== Code.Unauthenticated;
  if (!signedIn) {
    return (
      <SignInPanel
        apiError={apiError ? errorMessage(me.error) : ''}
        loginBusy={loginBusy}
        loginError={loginError}
        theme={theme}
        onLogin={(email, password) => void submitLogin(email, password)}
        onRetry={() => void me.refetch()}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const currentExpenses = expenses.data?.expenses ?? [];
  const total = expenses.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / 10));
  const totals = currentExpenses.reduce(
    (result, expense) => {
      result[currencyCode(expense.currency)] += expense.amountMinor;
      return result;
    },
    { GEL: 0n, USD: 0n, THB: 0n },
  );
  const summaryItems: ExpenseSummaryItem[] = [
    { kind: 'count', label: 'Expenses found', value: total, detail: 'Matching your filters' },
    { kind: 'currency', label: 'THB on this page', value: totals.THB, currency: 'THB', detail: 'Thai baht' },
    { kind: 'currency', label: 'USD on this page', value: totals.USD, currency: 'USD', detail: 'US dollars' },
  ];
  if (totals.GEL > 0n) {
    summaryItems.push({ kind: 'currency', label: 'GEL · legacy', value: totals.GEL, currency: 'GEL', detail: 'Existing Georgian lari entries' });
  }

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark small"><WalletCards size={20} /></span>
            <span>extra<span className="brand-dot">.</span></span>
          </div>
          <div className="topbar-right">
            <span className="user-email">{me.data?.email}</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button className="icon-button" type="button" onClick={() => void submitLogout()} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <section className="intro">
          <div>
            <p className="eyebrow">PERSONAL FINANCE / OVERVIEW</p>
            <h1>Track what matters.</h1>
            <p className="muted">A clear view of every expense, wherever you are.</p>
          </div>
          <button
            className="button primary"
            type="button"
            onClick={() => {
              setForm(createExpenseForm(categories.data?.categories[0]?.id));
              setFormError('');
            }}
          >
            <Plus size={18} /> New expense
          </button>
        </section>

        <ExpenseSummary items={summaryItems} />

        {notice && <div className="notice success" role="status"><Check size={18} />{notice}</div>}
        {actionError && (
          <div className="notice failure" role="alert">
            <span>{actionError}</span>
            <button className="icon-button" type="button" onClick={() => setActionError('')} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        )}

        {form && (
          <ExpenseEditor
            form={form}
            categories={categories.data?.categories ?? []}
            busy={formBusy}
            error={formError}
            onChange={setForm}
            onSubmit={(event) => void submitExpense(event)}
            onCancel={() => setForm(null)}
          />
        )}

        <ExpenseList
          expenses={currentExpenses}
          categories={categories.data?.categories ?? []}
          categoriesError={categories.isError ? errorMessage(categories.error) : ''}
          loading={expenses.isPending}
          error={expenses.isError ? errorMessage(expenses.error) : ''}
          page={page}
          pageCount={pageCount}
          total={total}
          search={search}
          draftSearch={draftSearch}
          categoryId={categoryId}
          deletingId={deletingId}
          onDraftSearch={setDraftSearch}
          onCategoryChange={(value) => {
            setCategoryId(value);
            setPage(1);
          }}
          onPageChange={(value) => setPage(Math.max(1, Math.min(pageCount, value)))}
          onRefresh={() => void expenses.refetch()}
          onCreate={() => {
            setForm(createExpenseForm(categories.data?.categories[0]?.id));
            setFormError('');
          }}
          onEdit={(expense) => {
            setForm(editExpenseForm(expense));
            setFormError('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={(expense) => void deleteExpense(expense)}
        />

        <footer className="site-footer">
          <span>EXTRA / A BETTER VIEW OF SPENDING</span>
          <span>Built with Next.js, ConnectRPC &amp; PostgreSQL</span>
        </footer>
      </div>
    </main>
  );
}
