import { timestampDate } from '@bufbuild/protobuf/wkt';
import { Currency, type Expense } from '@/shared/api/gen/expense_pb';
import { amountInput, type CurrencyCode } from '@/shared/lib/money';

export type ExpenseForm = {
  id?: string;
  amount: string;
  currency: CurrencyCode;
  occurredAt: string;
  description: string;
  categoryId: string;
};

export function toLocalDateTime(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function createExpenseForm(categoryId = ''): ExpenseForm {
  return {
    amount: '',
    currency: 'THB',
    occurredAt: toLocalDateTime(new Date()),
    description: '',
    categoryId,
  };
}

export function editExpenseForm(expense: Expense): ExpenseForm {
  return {
    id: expense.id,
    amount: amountInput(expense.amountMinor),
    currency: currencyCode(expense.currency),
    occurredAt: toLocalDateTime(expense.occurredAt ? timestampDate(expense.occurredAt) : new Date()),
    description: expense.description,
    categoryId: expense.category?.id ?? '',
  };
}

export function currencyCode(currency: Currency): CurrencyCode {
  switch (currency) {
    case Currency.GEL:
      return 'GEL';
    case Currency.USD:
      return 'USD';
    case Currency.THB:
      return 'THB';
    default:
      throw new Error(`Unsupported currency value: ${currency}`);
  }
}

export function apiCurrency(currency: CurrencyCode): Currency {
  switch (currency) {
    case 'GEL':
      return Currency.GEL;
    case 'USD':
      return Currency.USD;
    case 'THB':
      return Currency.THB;
  }
}

export function formatExpenseDate(expense: Expense): string {
  if (!expense.occurredAt) return '—';
  return new Intl.DateTimeFormat('en-TH', { dateStyle: 'medium', timeStyle: 'short' })
    .format(timestampDate(expense.occurredAt));
}
