import { formatMoney, type CurrencyCode } from '@/shared/lib/money';

export type ExpenseSummaryItem =
  | { kind: 'count'; label: string; value: number; detail: string }
  | { kind: 'currency'; label: string; value: bigint; currency: CurrencyCode; detail: string };

export function ExpenseSummary({ items }: { items: ExpenseSummaryItem[] }) {
  return (
    <section className="summary-grid" aria-label="Current page summary">
      {items.map((item) => (
        <article className={`summary-card${item.kind === 'count' ? ' summary-card-featured' : ''}`} key={item.label}>
          <p className="summary-label">{item.label}</p>
          <strong>{item.kind === 'count' ? item.value : formatMoney(item.value, item.currency)}</strong>
          <span>{item.detail}</span>
        </article>
      ))}
    </section>
  );
}
