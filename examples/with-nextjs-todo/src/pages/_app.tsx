import "@/styles/globals.css";

import type { AppProps, AppType } from "next/app";
import { trpc } from "@/utils/trpc";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { Analytics } from "@vercel/analytics/next";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <NuqsAdapter>
      <Component {...pageProps} />
      <Analytics />
    </NuqsAdapter>
  );
};

export default trpc.withTRPC(MyApp);
