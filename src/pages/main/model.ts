import {
  createEffect,
  createEvent,
  createStore,
  sample,
  Store,
} from 'effector';
import { addExpenseMutation } from '@/shared/api/create-expense';
import { fetchExpensesQuery } from '@/shared/api/get-expenses';

enum Category {
  'Groceries' = 1,
  'House',
}

export type Expense = {
  amount: number;
  currency: 'lari' | 'dollar';
  date: Date;
  description: string;
  category: Category;
};

export type ExpenseProp = {
  name: keyof Expense;
  value: Expense[keyof Expense];
};

export const pageStarted = createEvent();

sample({
  clock: pageStarted,
  target: fetchExpensesQuery.start,
});

export const formSubmitted = createEvent();
export const setFieldEvent = createEvent<ExpenseProp>();

const $expense: Store<Expense> = createStore<Expense>({
  amount: 0,
  currency: 'lari',
  date: new Date(),
  description: '-',
  category: 1,
}).on(
  setFieldEvent,
  (defaultObj, newValue: ExpenseProp) => {
    /* eslint-disable no-console */
    console.log(newValue);
    return { ...defaultObj, ...newValue };
  },
);

const submitFormFx = createEffect((data: Expense) => {
  addExpenseMutation.start({ ...data });
});
export const handleChange = setFieldEvent.prepend(
  (payload: ExpenseProp) => ({
    [payload.name]: payload.value,
  }) as ExpenseProp,
);

sample({
  clock: formSubmitted,
  source: $expense,
  target: submitFormFx,
});

addExpenseMutation.finished.success.watch(({ params }) => {
  // eslint-disable-next-line no-console
  console.log('success!', 'params:', params);
});
