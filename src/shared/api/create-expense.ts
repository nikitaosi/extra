import { createQuery } from '@farfetched/core';

// type Expense = {
//   value: number,
//   currency: string,
//   category: 1 | 2,
//   date: Date,
//   description: string
// };

export const createExpense = createQuery({
  handler: async ({ id }) => {
    const response = await fetch(
      `https://rickandmortyapi.com/api/character/${id}`,
    );

    return response.json();
  },
});
