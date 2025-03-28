import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import 'react-quill/dist/quill.snow.css';
import '../styles/globals.css';



function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
