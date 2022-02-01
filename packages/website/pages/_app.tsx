// @ts-nocheck
import type { AppProps } from 'next/app';
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";
import { NearHooksProvider } from '@cura/hooks'

import '@cura/components/dist/assets/fonts/index.css'

import { ApolloProvider } from "@apollo/client";
import client from "../utils/apollo-client";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ApolloProvider client={client}>
        <NearHooksProvider>
          <Component {...pageProps} />
        </NearHooksProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default MyApp;
