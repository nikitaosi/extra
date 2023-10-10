import '@/shared/ui/styles/globals.css';
import { EffectorNext } from '@effector/next';
import type { AppProps } from 'next/app';
import { BaseLayout } from '@/widgets/layouts';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EffectorNext values={pageProps.values}>
      <BaseLayout>
        <Component {...pageProps} />
      </BaseLayout>
    </EffectorNext>
  );
}
