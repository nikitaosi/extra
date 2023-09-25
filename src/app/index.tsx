import { EffectorNext } from '@effector/next';
import type { AppProps } from 'next/app';
import { BaseLayout } from '@/widgets/layouts/base-layout';

const App = ({ Component, pageProps }: AppProps) => (
  <EffectorNext values={pageProps.values}>
    <BaseLayout>
      <Component {...pageProps} />
    </BaseLayout>
  </EffectorNext>
);

export default App;
