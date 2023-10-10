import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/shared/ui/theme-provider';

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
    </ThemeProvider>
  </>
);
