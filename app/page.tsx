import { Providers } from './providers';
import { ExpenseDashboard } from '@/features/expense-tracker/expense-dashboard';

export default function Home() {
  return (
    <Providers>
      <ExpenseDashboard />
    </Providers>
  );
}
