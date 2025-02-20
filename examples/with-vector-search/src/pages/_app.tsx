import "@/styles/globals.css";
import type { AppProps, AppType } from "next/app";
import { trpc } from "@/utils/trpc";
import { Analytics } from "@vercel/analytics/next";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
};

export default trpc.withTRPC(MyApp);
