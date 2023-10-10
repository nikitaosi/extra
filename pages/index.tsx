import { MainPage } from '@/pages/main';

export default function Main() {
  return <MainPage />;
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
