import dayjs from 'dayjs';
import { createStore } from 'effector';
import { hotkey } from 'effector-hotkey';
import { useUnit } from 'effector-react';
import type { NextPage } from 'next';
import { useState, useEffect, useCallback, Dispatch } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ExpenseProp, formSubmitted, handleChange } from '@/pages/main/model';
import { fetchExpensesQuery } from '@/shared/api/get-expenses';
import { Button } from '@/shared/ui/button';
import { DateTimePicker } from '@/shared/ui/date-time-picker';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  type SubmitHandler,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { ModeToggle } from '@/shared/ui/theme-toggler';
import { useToast } from '@/shared/ui/use-toast';
import { DataTable, type Payment } from './main-table';

const $formOpened = createStore(false);
const openModal = hotkey('alt+a');
const submitModal = hotkey('enter');

$formOpened.on(openModal, (opened) => !opened);
$formOpened.on(submitModal, (opened) => !opened);

const Form = ({
  setOpened,
} // setData,
: {
  setOpened: Dispatch<boolean>;
}) => {
  const form = useForm<Payment>();
  const { toast } = useToast();
  const onSubmit: SubmitHandler<Payment> = () => {
    setOpened(false);
    formSubmitted();
    toast({
      title: 'Done',
      description: 'Your expense has been added',
      duration: 2000,
    });
  };

  // const handleKey = (e: KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     setOpened(false);
  //     onSubmit();
  //   }
  // };
  // #TODO remove this nesting in name property
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
        <FormField
          control={form.control}
          name='attributes.amount'
          defaultValue={100}
          render={({ field: { onChange, name, value } }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder='100'
                  type='number'
                  autoComplete='off'
                  value={value}
                  onChange={(e) => {
                    handleChange({
                      name: 'amount',
                      value: e.target.value,
                    } as ExpenseProp);
                    onChange(e.target.value);
                  }}
                  name={name}
                  // onKeyDown={() => handleKey}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex flex-row space-x-4'>
          <FormField
            control={form.control}
            name='attributes.currency'
            defaultValue='lari'
            render={({ field: { onChange, name, value } }) => (
              <FormItem className='w-full'>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(e) => {
                      handleChange({
                        name: 'currency',
                        value: e,
                      } as ExpenseProp);
                      onChange(e);
                    }}
                    name={name}
                    value={value}
                    defaultValue='lari'
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='₾' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='lari'>₾</SelectItem>
                      <SelectItem value='dollar'>$</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='attributes.category.data.attributes.name'
            defaultValue='Grocery'
            render={({ field: { onChange, name, value } }) => (
              <FormItem className='w-full'>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(e) => {
                      handleChange({
                        name: 'category',
                        value: e,
                      } as ExpenseProp);
                      onChange(e);
                    }}
                    name={name}
                    value={value}
                    defaultValue='Grocery'
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Grocery' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Grocery'>Grocery</SelectItem>
                      <SelectItem value='House'>House</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='attributes.date'
          render={({ field: { onChange, value, name } }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DateTimePicker
                  date={value || new Date()}
                  setDate={(e) => {
                    handleChange({
                      name: name.slice(11),
                      value: e,
                    } as ExpenseProp);
                    onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='attributes.description'
          defaultValue=''
          render={({ field: { onChange, name } }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='another spending'
                  onChange={(e) => {
                    handleChange({
                      name: name.slice(11),
                      value: e.target.value,
                    } as ExpenseProp);
                    onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant='outline' onClick={form.handleSubmit(onSubmit)}>
          <span>add</span>
        </Button>
      </form>
    </FormProvider>
  );
};

export const MainPage: NextPage = () => {
  const [opened, setOpened] = useState<boolean>(false);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (
        (event.altKey && event.key === 'a')
        || (event.altKey && event.key === 'ф')
      ) {
        setOpened(!opened);
      }
    },
    [opened],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const {
    data: { data: tableData },
  } = useUnit(fetchExpensesQuery);

  return (
    <>
      <ModeToggle />
      <main className='flex flex-col items-center justify-between p-8'>
        <span>Today is {dayjs().format('DD MMMM')}</span>

        <Dialog open={opened} onOpenChange={setOpened}>
          <DialogTrigger>
            <Button
              asChild
              variant='outline'
              className='fixed bottom-12 right-8 lg:bottom-[40px] lg:right-[40px] h-9'
            >
              <span>add</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new expense</DialogTitle>
            </DialogHeader>
            <Form setOpened={setOpened} />
          </DialogContent>
        </Dialog>
        <DataTable data={tableData} />
      </main>
    </>
  );
};
