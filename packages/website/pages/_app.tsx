// @ts-nocheck
import type { AppProps } from 'next/app'
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";
import { NearHooksProvider } from '@cura/hooks'
import { RecoilRoot } from 'recoil'

import '@cura/components/dist/assets/fonts/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <NearHooksProvider>
          <Component {...pageProps} />
        </NearHooksProvider>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default MyApp