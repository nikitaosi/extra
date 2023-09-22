// import type { NextPage } from 'next';

export const MainPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div>
      <label
        htmlFor="expence"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        How much did you spend?
      </label>
      <input
        type="number"
        id="expence"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
    </div>
  </main>
);
