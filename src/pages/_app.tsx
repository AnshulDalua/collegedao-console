import { AppContext, AppInitialProps, AppLayoutProps } from "next/app";
import { Inter } from "next/font/google";

import type { NextComponentType } from "next";
import type { ReactNode } from "react";

import "../styles/globals.css";

import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("@/components/Core/Toaster"), {
  ssr: false,
});
const PosthogProvider = dynamic(
  () => import("@/components/Core/PosthogProvider"),
  {
    ssr: false,
  }
);

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const MyApp: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
  Component,
  pageProps,
}: AppLayoutProps) => {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PosthogProvider>
        <main lang="en" className={inter.className} suppressHydrationWarning>
          <Toaster />
          {getLayout(<Component {...pageProps} />)}
        </main>
      </PosthogProvider>
    </ThemeProvider>
  );
};

export default MyApp;
