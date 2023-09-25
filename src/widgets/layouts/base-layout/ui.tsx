import { PropsWithChildren } from 'react';

export const BaseLayout = ({ children }: PropsWithChildren) => (
  <>
    {/* <Header /> */}
    <main className="main">{children}</main>
  </>
);
