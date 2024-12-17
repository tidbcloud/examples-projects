import "@/styles/globals.css";

import type { AppProps, AppType } from "next/app";
import { trpc } from "@/utils/trpc";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <NuqsAdapter>
      <Component {...pageProps} />
    </NuqsAdapter>
  );
};

export default trpc.withTRPC(MyApp);
