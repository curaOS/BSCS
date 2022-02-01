import type { AppProps } from "next/app";
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";

import { ApolloProvider } from "@apollo/client";
import client from "../utils/apollo-client";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default MyApp;
