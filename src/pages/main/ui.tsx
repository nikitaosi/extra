import dayjs from 'dayjs';
import { createStore } from 'effector';
import { hotkey } from 'effector-hotkey';
import type { NextPage } from 'next';
import {
  Dispatch,
  SetStateAction,
  useState,
  KeyboardEvent,
  useEffect,
  useCallback,
} from 'react';
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
import { ModeToggle } from '@/shared/ui/theme-toggler';

const $formOpened = createStore(false);
const openModal = hotkey('alt+a');

$formOpened.on(openModal, (opened) => !opened);

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
  addExpense,
}: {
  expense: number;
  setExpense: Dispatch<SetStateAction<number>>;
  addExpense: () => void;
}) => {
  const form = useForm();

  const onSubmit = (values: FieldValues): FieldValues => values;

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit({});
    }
  };

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
                  onKeyDown={() => handleKey}
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
        <FormField
          control={form.control}
          name='currency'
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
        <Button asChild variant='outline' onClick={() => addExpense()}>
          <span>add</span>
        </Button>
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
  // const openedStore = useUnit($formOpened);

  const addExpense = () => {
    setExpensesArr([
      ...expensesArr,
      {
        id: (arrId += 1),
        value: expense,
      },
    ]);
  };

  const handleKeyPress = useCallback((event: Event) => {
    // @ts-ignore
    if (event.altKey && event.key === 'a') {
      setOpened(!opened);
    }
  }, [opened]);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      <ModeToggle />
      <main className='flex flex-col items-center justify-between p-24'>
        <Dialog open={opened} onOpenChange={setOpened}>
          <DialogTrigger>
            <Button
              asChild
              variant='secondary'
              className='fixed bottom-[60px] right-[40px]'
            >
              <span>add</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new expense</DialogTitle>
            </DialogHeader>
            <Form
              expense={expense}
              setExpense={setExpense}
              addExpense={addExpense}
            />
          </DialogContent>
        </Dialog>
        <DashboardTable expenses={expensesArr} />
      </main>
    </>
  );
};
