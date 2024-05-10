import type { AppProps } from 'next/app';
import '../styles/globals.css';
import './pallets.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;
