import "@/styles/globals.css";

import type { AppProps, AppType } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { trpc } from "@/utils/trpc";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
};

export default trpc.withTRPC(MyApp);
