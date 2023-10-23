import { MainPage } from '@/pages/main';
import { getExpenses } from '@/shared/api/get-expenses';

export default function Main() {
  return <MainPage />;
}

export async function getStaticProps() {
  await getExpenses.start();
  return {
    props: {},
  };
}
