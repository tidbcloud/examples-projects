import { SWRConfig, SWRConfiguration } from "swr";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/next";

import "~/styles/global.css";

export default function App({ Component, pageProps }: AppProps) {
  const options: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };
  return (
    <SWRConfig value={options}>
      <Component {...pageProps} />
      <Analytics />
    </SWRConfig>
  );
}
