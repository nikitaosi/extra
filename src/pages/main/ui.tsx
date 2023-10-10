import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { Dispatch, SetStateAction, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  FormProvider,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

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
        <TableHead className='text-right'>Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {expenses.map((expense) => (
        <TableRow key={expense.id}>
          {/* <TableCell className="font-medium">INV001</TableCell> */}
          {/* <TableCell>Paid</TableCell> */}
          {/* <TableCell>Credit Card</TableCell> */}
          <TableCell className='text-right'>{expense.value}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const Form = ({
  expense,
  setExpense,
  setOpened,
}: {
  expense: number;
  setExpense: Dispatch<SetStateAction<number>>;
  setOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  const form = useForm();

  function onSubmit(values: FieldValues): FieldValues {
    setOpened(false);
    console.log(values);
    return values;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='value'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  placeholder='100'
                  type='number'
                  autoComplete='off'
                  {...field}
                  value={expense}
                  onChange={(e) => setExpense(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>How much did you spend?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder='food' {...field} />
              </FormControl>
              <FormDescription>
                Add description for expense (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  );
};

let arrId: number = 0;

export const MainPage: NextPage = () => {
  const [expensesArr, setExpensesArr] = useState<
    Array<{ id: number; value: number }>
  >([]);
  const [expense, setExpense] = useState<number>(0);
  const [opened, setOpened] = useState<boolean>(false);

  const addExpense = () => {
    setExpensesArr([
      ...expensesArr,
      {
        id: (arrId += 1),
        value: expense,
      },
    ]);
    setOpened(false);
  };
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Dialog open={opened} onOpenChange={setOpened}>
        <DialogTrigger
          onClick={() => setOpened(true)}
          className='z-100 fixed top-[20px] right-[20px] flex h-[64px] w-[64px] items-center justify-between rounded-full p-[12px] text-sm font-medium transition shadow-lg dark:hover:bg-black sm:h-[48px] sm:w-[48px]'
        >
          add
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new expense</DialogTitle>
          </DialogHeader>
          <Form
            expense={expense}
            setExpense={setExpense}
            setOpened={setOpened}
          />
          <Button variant='outline' onClick={() => addExpense()}>
            add
          </Button>
        </DialogContent>
      </Dialog>
      <DashboardTable expenses={expensesArr} />
    </main>
  );
};
