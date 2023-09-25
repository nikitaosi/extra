import { MainPage } from '@/pages/main';

export default function Main() {
  return <MainPage />;
}

export async function getStaticProps() {
  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {},
  };
}
