// @ts-nocheck
import type { AppProps } from 'next/app'
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";
import { NearHooksProvider } from '@cura/hooks'

import '@cura/components/dist/assets/fonts/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <NearHooksProvider>
        <Component {...pageProps} />
      </NearHooksProvider>
    </ThemeProvider>
  );
}

export default MyApp