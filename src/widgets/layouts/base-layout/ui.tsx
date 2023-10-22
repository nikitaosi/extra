import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/shared/ui/theme-provider';
import { Toaster } from '@/shared/ui/toaster';

export const BaseLayout = ({ children }: PropsWithChildren) => (
  <>
    {/* <Header /> */}
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <main className='main'>{children}</main>
      <Toaster />
    </ThemeProvider>
  </>
);
