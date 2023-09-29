import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const DashboardTable = ({
  expenses,
}: {
  expenses: Array<{ id: number; value: number }>;
}) => (
  <Table>
    <TableCaption>Today is {dayjs().format('DD MMMM')}</TableCaption>
    <TableHeader>
      <TableRow>
        {/* <TableHead className="w-[100px]">Invoice</TableHead> */}
        {/* <TableHead>Status</TableHead> */}
        {/* <TableHead>Method</TableHead> */}
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {expenses.map((expence) => (
        <TableRow key={expence.id}>
          {/* <TableCell className="font-medium">INV001</TableCell> */}
          {/* <TableCell>Paid</TableCell> */}
          {/* <TableCell>Credit Card</TableCell> */}
          <TableCell className="text-right">{expence.value}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

let arrId: number = 0;

export const MainPage: NextPage = () => {
  const [expensesArr, setExpensesArr] = useState<
    Array<{ id: number; value: number }>
  >([]);
  const [expense, setExpense] = useState<number>(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Dialog>
        <DialogTrigger className="z-100 fixed top-[20px] right-[20px] flex h-[64px] w-[64px] items-center justify-between rounded-full bg-green-300 p-[12px] text-sm font-medium transition shadow-lg hover:bg-green-500 sm:h-[48px] sm:w-[48px]">
          add
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How much did you spend?</DialogTitle>
          </DialogHeader>
          <input
            type="number"
            id="expence"
            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            value={expense}
            onChange={(e) => setExpense(Number(e.target.value))}
          />
          <Button
            variant="outline"
            onClick={() => {
              setExpensesArr([
                ...expensesArr,
                {
                  id: (arrId += 1),
                  value: expense,
                },
              ]);
            }}
          >
            add
          </Button>
        </DialogContent>
      </Dialog>
      <DashboardTable expenses={expensesArr} />
    </main>
  );
};
