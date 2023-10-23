import { createQuery } from '@farfetched/core';

// type Expense = {
//   value: number,
//   currency: string,
//   category: 1 | 2,
//   date: Date,
//   description: string
// };

export const getExpenses = createQuery({
  handler: async () => {
    const response = await fetch(
      `https://localhost:1337/api/expenses`,
    );

    return response.json();
  },
});
