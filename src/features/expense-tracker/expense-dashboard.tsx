'use client';

import { timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError } from '@connectrpc/connect';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, LogOut, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, WalletCards, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { authClient, expenseClient } from '@/shared/api/client';
import { Currency, type Expense } from '@/shared/api/gen/expense_pb';
import { amountInput, formatMoney, parseAmountMinor, type CurrencyCode } from '@/shared/lib/money';

type ExpenseForm = {
  id?: string;
  amount: string;
  currency: CurrencyCode;
  occurredAt: string;
  description: string;
  categoryId: string;
};

function localDateTime(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function newForm(categoryId = ''): ExpenseForm {
  return { amount: '', currency: 'GEL', occurredAt: localDateTime(new Date()), description: '', categoryId };
}

function editForm(expense: Expense): ExpenseForm {
  return {
    id: expense.id,
    amount: amountInput(expense.amountMinor),
    currency: expense.currency === Currency.USD ? 'USD' : 'GEL',
    occurredAt: localDateTime(expense.occurredAt ? timestampDate(expense.occurredAt) : new Date()),
    description: expense.description,
    categoryId: expense.category?.id ?? '',
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof ConnectError) return error.rawMessage || error.message;
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function ExpenseDashboard() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError('');
    try {
      const response = await authClient().login({ email, password });
      queryClient.setQueryData(['me'], { email: response.email });
      setPassword('');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
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
    const date = new Date(form.occurredAt);
    if (amountMinor === null) {
      setFormError('Enter a positive amount with up to two decimal places.');
      return;
    }
    if (!Number.isFinite(date.valueOf()) || !form.categoryId) {
      setFormError('Choose a valid date and category.');
      return;
    }
    setFormBusy(true);
    setFormError('');
    try {
      const input = {
        amountMinor,
        currency: form.currency === 'GEL' ? Currency.GEL : Currency.USD,
        occurredAt: timestampFromDate(date),
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
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setNotice('Expense deleted.');
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  if (me.isPending) {
    return <main className="centered-state"><LoaderCircle className="spin" size={28} /><p>Connecting to your expenses…</p></main>;
  }

  const apiError = me.isError && ConnectError.from(me.error).code !== Code.Unauthenticated;

  if (!signedIn) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="brand-mark"><WalletCards size={26} /></div>
          <p className="eyebrow">EXTRA / PRIVATE WORKSPACE</p>
          <h1>Money, in focus.</h1>
          <p className="muted">Sign in to view and manage your expenses.</p>
          {apiError && <div className="notice failure" role="alert">Cannot reach the API: {errorMessage(me.error)}<button className="button secondary" onClick={() => void me.refetch()}>Retry</button></div>}
          <form onSubmit={(event) => void submitLogin(event)} className="stack" aria-label="Sign in">
            <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {loginError && <p role="alert" className="error-text">{loginError}</p>}
            <button className="button primary wide" type="submit" disabled={loginBusy}>{loginBusy ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />} Sign in</button>
          </form>
          <p className="auth-footnote">Your expenses are stored in PostgreSQL and served through a typed Protobuf API.</p>
        </section>
      </main>
    );
  }

  const currentExpenses = expenses.data?.expenses ?? [];
  const total = expenses.data?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / 10));
  const shownGEL = currentExpenses.reduce((sum, item) => sum + (item.currency === Currency.GEL ? item.amountMinor : 0n), 0n);
  const shownUSD = currentExpenses.reduce((sum, item) => sum + (item.currency === Currency.USD ? item.amountMinor : 0n), 0n);

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <header className="topbar">
          <div className="brand"><span className="brand-mark small"><WalletCards size={20} /></span><span>extra<span className="brand-dot">.</span></span></div>
          <div className="topbar-right"><span className="user-email">{me.data?.email}</span><button className="icon-button" onClick={() => void submitLogout()} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
        </header>

        <section className="intro">
          <div><p className="eyebrow">PERSONAL FINANCE / OVERVIEW</p><h1>Track what matters.</h1><p className="muted">A clear view of every expense, wherever you are.</p></div>
          <button className="button primary" onClick={() => { setForm(newForm(categories.data?.categories[0]?.id)); setFormError(''); }}><Plus size={18} /> New expense</button>
        </section>

        <section className="summary-grid" aria-label="Current page summary">
          <div className="summary-card"><p className="summary-label">Expenses found</p><strong>{total}</strong><span>Matching your filters</span></div>
          <div className="summary-card"><p className="summary-label">GEL on this page</p><strong>{formatMoney(shownGEL, 'GEL')}</strong><span>Georgian lari</span></div>
          <div className="summary-card"><p className="summary-label">USD on this page</p><strong>{formatMoney(shownUSD, 'USD')}</strong><span>US dollars</span></div>
        </section>

        {notice && <div className="notice success" role="status"><Check size={18} />{notice}</div>}
        {actionError && <div className="notice failure" role="alert">{actionError}<button className="icon-button" onClick={() => setActionError('')} aria-label="Dismiss"><X size={16} /></button></div>}

        {form && (
          <section className="form-panel" aria-labelledby="expense-form-title">
            <div className="panel-heading"><div><p className="eyebrow">EXPENSE DETAILS</p><h2 id="expense-form-title">{form.id ? 'Edit expense' : 'Add an expense'}</h2></div><button className="icon-button" onClick={() => setForm(null)} aria-label="Close form"><X size={20} /></button></div>
            <form onSubmit={(event) => void submitExpense(event)}>
              <div className="form-grid">
                <label>Amount<input inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" required /></label>
                <label>Currency<select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value as CurrencyCode })}><option value="GEL">GEL · Georgian lari</option><option value="USD">USD · US dollar</option></select></label>
                <label>Category<select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required><option value="">Choose category</option>{categories.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                <label>Date & time<input type="datetime-local" value={form.occurredAt} onChange={(event) => setForm({ ...form, occurredAt: event.target.value })} required /></label>
                <label className="full-span">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} placeholder="What was this for?" rows={2} /></label>
              </div>
              {formError && <p role="alert" className="error-text">{formError}</p>}
              <div className="form-actions"><button type="button" className="button secondary" onClick={() => setForm(null)}>Cancel</button><button className="button primary" type="submit" disabled={formBusy || !categories.data?.categories.length}>{formBusy ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}{form.id ? 'Save changes' : 'Save expense'}</button></div>
            </form>
          </section>
        )}

        <section className="records" aria-labelledby="records-title">
          <div className="records-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2 id="records-title">Expenses</h2></div><button className="icon-button" onClick={() => void expenses.refetch()} title="Refresh expenses" aria-label="Refresh expenses"><RefreshCw size={18} /></button></div>
          <div className="filters">
            <label className="search-box"><Search size={18} /><input type="search" placeholder="Search descriptions" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} aria-label="Search descriptions" /></label>
            <select className="filter-select" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} aria-label="Filter by category"><option value="">All categories</option>{categories.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          </div>
          {categories.isError && <p className="error-text" role="alert">Could not load categories: {errorMessage(categories.error)}</p>}
          {expenses.isError ? <div className="empty-state"><p>Could not load expenses.</p><span>{errorMessage(expenses.error)}</span><button className="button secondary" onClick={() => void expenses.refetch()}>Try again</button></div> : expenses.isPending ? <div className="empty-state"><LoaderCircle className="spin" size={24} /><p>Loading expenses…</p></div> : currentExpenses.length === 0 ? <div className="empty-state"><WalletCards size={26} /><p>No expenses found</p><span>{search || categoryId ? 'Try another search or category.' : 'Add your first expense to get started.'}</span></div> : (
            <div className="table-scroll"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th className="actions-col">Actions</th></tr></thead><tbody>{currentExpenses.map((expense) => <tr key={expense.id}><td className="date-cell">{expense.occurredAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(timestampDate(expense.occurredAt)) : '—'}</td><td className="description-cell">{expense.description || 'Untitled expense'}</td><td><span className="category-pill">{expense.category?.name ?? '—'}</span></td><td className="amount-cell">{formatMoney(expense.amountMinor, expense.currency === Currency.USD ? 'USD' : 'GEL')}</td><td className="actions-cell"><button className="icon-button" onClick={() => { setForm(editForm(expense)); setFormError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={`Edit ${expense.description || 'expense'}`} title="Edit"><Pencil size={16} /></button><button className="icon-button danger" onClick={() => void deleteExpense(expense)} disabled={deletingId === expense.id} aria-label={`Delete ${expense.description || 'expense'}`} title="Delete">{deletingId === expense.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}</button></td></tr>)}</tbody></table></div>
          )}
          <footer className="table-footer"><span>{total === 0 ? '0 expenses' : `Page ${page} of ${maxPage} · ${total} expenses`}</span><div className="pager"><button className="icon-button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} aria-label="Previous page"><ArrowLeft size={18} /></button><button className="icon-button" onClick={() => setPage((value) => Math.min(maxPage, value + 1))} disabled={page >= maxPage} aria-label="Next page"><ArrowRight size={18} /></button></div></footer>
        </section>
        <footer className="site-footer"><span>EXTRA / A BETTER VIEW OF SPENDING</span><span>Built with Next.js, ConnectRPC & PostgreSQL</span></footer>
      </div>
    </main>
  );
}
