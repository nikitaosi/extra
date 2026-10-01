import { Check, X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { Category } from '@/shared/api/gen/expense_pb';
import type { ExpenseForm } from './model';

type ExpenseEditorProps = {
  form: ExpenseForm;
  categories: Category[];
  busy: boolean;
  error: string;
  onChange: (form: ExpenseForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function ExpenseEditor({
  form,
  categories,
  busy,
  error,
  onChange,
  onSubmit,
  onCancel,
}: ExpenseEditorProps) {
  function update<K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <section className="form-panel" aria-labelledby="expense-form-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">EXPENSE DETAILS</p>
          <h2 id="expense-form-title">{form.id ? 'Edit expense' : 'Add an expense'}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Close form">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            Amount
            <input
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => update('amount', event.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            Currency
            <select
              value={form.currency}
              onChange={(event) => update('currency', event.target.value as ExpenseForm['currency'])}
            >
              {form.currency === 'GEL' && <option value="GEL">GEL · Georgian lari (legacy)</option>}
              <option value="THB">THB · Thai baht</option>
              <option value="USD">USD · US dollar</option>
            </select>
          </label>
          <label>
            Category
            <select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} required>
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            Date &amp; time
            <input
              type="datetime-local"
              value={form.occurredAt}
              onChange={(event) => update('occurredAt', event.target.value)}
              required
            />
          </label>
          <label className="full-span">
            Description
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              maxLength={500}
              placeholder="What was this for?"
              rows={2}
            />
          </label>
        </div>
        {error && <p role="alert" className="error-text">{error}</p>}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onCancel}>Cancel</button>
          <button className="button primary" type="submit" disabled={busy || categories.length === 0}>
            {busy ? <span className="button-loader" aria-label="Saving" /> : <Check size={17} />}
            {form.id ? 'Save changes' : 'Save expense'}
          </button>
        </div>
      </form>
    </section>
  );
}
