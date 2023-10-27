import { createMutation } from '@farfetched/core';

type Expense = {
  value: number,
  currency: string,
  category: 1 | 2,
  date: Date,
  description: string
};

export const addExpenseMutation = createMutation({
  handler: async (expense: Expense) => {
    const response = await fetch(
      'http://localhost:1337/api/expenses?populate=*',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer d758b1ffc0dbd26ed1daf0f28a3d545ebc36499666c1aaba4163edb47ebf74cac385927c74356cf041b277315a577ee62d7a6d120840ee7d5eb82caba313505f3499ad2f2e9b4e858b6a86a97b6adc9eb6d6dfc4bc4a3795ce05eaa8dcde8c174bdee12dade382a924d2fd1d1c1077f5ddb4c0f5a47a4a08dcb6bbf98b03c107',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ data: expense }),
      },
    );
    return response.json();
  },
});
