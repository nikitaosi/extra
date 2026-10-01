import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
} from 'lucide-react';
import type { Category, Expense } from '@/shared/api/gen/expense_pb';
import { formatMoney } from '@/shared/lib/money';
import { currencyCode, formatExpenseDate } from './model';

type ExpenseListProps = {
  expenses: Expense[];
  categories: Category[];
  categoriesError: string;
  loading: boolean;
  error: string;
  page: number;
  pageCount: number;
  total: number;
  search: string;
  draftSearch: string;
  categoryId: string;
  deletingId: string | null;
  onDraftSearch: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

export function ExpenseList({
  expenses,
  categories,
  categoriesError,
  loading,
  error,
  page,
  pageCount,
  total,
  search,
  draftSearch,
  categoryId,
  deletingId,
  onDraftSearch,
  onCategoryChange,
  onPageChange,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  return (
    <section className="records" aria-labelledby="records-title">
      <div className="records-heading">
        <div>
          <p className="eyebrow">YOUR ACTIVITY</p>
          <h2 id="records-title">Expenses</h2>
        </div>
        <button className="icon-button" type="button" onClick={onRefresh} title="Refresh expenses" aria-label="Refresh expenses">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="filters">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search descriptions"
            value={draftSearch}
            onChange={(event) => onDraftSearch(event.target.value)}
            aria-label="Search descriptions"
          />
        </label>
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <ChevronDown className="filter-select-icon" size={16} aria-hidden="true" />
        </div>
      </div>
      {categoriesError && <p className="error-text inline-error" role="alert">Could not load categories: {categoriesError}</p>}
      {error ? (
        <div className="empty-state" role="alert">
          <p>Could not load expenses.</p>
          <span>{error}</span>
          <button className="button secondary" type="button" onClick={onRefresh}>Try again</button>
        </div>
      ) : loading ? (
        <div className="empty-state" aria-live="polite">
          <LoaderCircle className="spin" size={24} />
          <p>Loading expenses…</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <WalletCards size={26} />
          <p>No expenses found</p>
          <span>{search || categoryId ? 'Try another search or category.' : 'Add your first expense to get started.'}</span>
          {!search && !categoryId && (
            <button className="button secondary" type="button" onClick={onCreate}>Add your first expense</button>
          )}
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                <th scope="col" className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="date-cell">{formatExpenseDate(expense)}</td>
                  <td className="description-cell">{expense.description || 'Untitled expense'}</td>
                  <td><span className="category-pill">{expense.category?.name ?? '—'}</span></td>
                  <td className="amount-cell">{formatMoney(expense.amountMinor, currencyCode(expense.currency))}</td>
                  <td className="actions-cell">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => onEdit(expense)}
                      aria-label={`Edit ${expense.description || 'expense'}`}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => onDelete(expense)}
                      disabled={deletingId === expense.id}
                      aria-label={`Delete ${expense.description || 'expense'}`}
                      title="Delete"
                    >
                      {deletingId === expense.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <footer className="table-footer">
        <span>{total === 0 ? '0 expenses' : `Page ${page} of ${pageCount} · ${total} expenses`}</span>
        <div className="pager">
          <button
            className="icon-button"
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>
    </section>
  );
}
