import type { NextPage } from 'next';
// import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const MainPage: NextPage = () => (
  // const [expences, setExpences] = useState({});

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
        />
      </DialogContent>
    </Dialog>
  </main>
);
