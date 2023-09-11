import '@/styles/globals.css';
import {EffectorNext} from '@effector/next';
import type {AppProps} from 'next/app';

export default function App({Component, pageProps}: AppProps) {
    return <EffectorNext values={pageProps.values}>
        {/*<Layout>*/}
            <Component {...pageProps} />
        {/*</Layout>*/}
    </EffectorNext>
}
