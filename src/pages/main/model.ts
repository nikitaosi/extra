import { createEvent, sample } from 'effector';
import { fetchExpensesQuery } from '@/shared/api/get-expenses';

export const pageStarted = createEvent();

sample({
  clock: pageStarted,
  target: fetchExpensesQuery.start,
});
