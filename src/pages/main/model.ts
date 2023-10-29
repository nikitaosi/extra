import {
  createEffect,
  createEvent,
  createStore,
  sample,
  Store,
  Event,
} from 'effector';
import { addExpenseMutation } from '@/shared/api/create-expense';
import { fetchExpensesQuery } from '@/shared/api/get-expenses';

enum Category {
  'Groceries' = 1,
  'House' = 2,
}

export type Expense = {
  value: number;
  currency: 'lari' | 'dollar';
  date: Date;
  description: string;
  category: Category;
};

type ExpenseProp = Record<string, string>;

export const pageStarted = createEvent();

sample({
  clock: pageStarted,
  target: fetchExpensesQuery.start,
});

export const formSubmitted = createEvent();
const setField: Event<ExpenseProp> = createEvent();

const $expense: Store<Expense> = createStore<Expense>({
  value: 0,
  currency: 'dollar',
  date: new Date(),
  description: 'default',
  category: 1,
}).on(
  setField,
  (defaultObj, newValue: ExpenseProp) => {
    console.log(newValue);
    return { ...defaultObj, ...newValue };
  },
);

const submitFormFx = createEffect((data: Expense) => {
  addExpenseMutation.start({ ...data });
});
export const handleChange = setField.prepend(
  (payload: ExpenseProp): ExpenseProp => ({
    [payload.name]: payload.value,
  }),
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
