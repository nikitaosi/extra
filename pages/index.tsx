import { fork, allSettled, serialize } from 'effector';
import { MainPage, pageStarted } from '@/pages/main';

export default function Main() {
  return <MainPage />;
}

export async function getStaticProps() {
  const scope = fork();
  await allSettled(pageStarted, { scope });

  return {
    props: {
      values: serialize(scope),
    },
  };
}
