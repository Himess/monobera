import "../styles/globals.css";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import { hubName, hubUrl, tokenListUrl } from "@bera/config";
import {
  Footer,
  Header,
  MainWithBanners,
  TailwindIndicator,
  TermOfUseModal,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";

import Providers from "./Providers";
import { navItems } from "./config";

const fontSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(hubUrl),
  title: {
    template: `%s | ${hubName}`,
    default: hubName,
  },
};
const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: false,
});

export default async function RootLayout(props: { children: React.ReactNode }) {
  let fetchedTokenList = null;

  try {
    if (tokenListUrl.startsWith("http")) {
      const response = await fetch(tokenListUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch token list: ${response.statusText}`);
      }
      fetchedTokenList = await response.json();
    } else {
      const publicPath = path.join(process.cwd(), "public");
      const tokenListPath = path.join(publicPath, tokenListUrl);

      // Check if public directory and file exist
      if (existsSync(tokenListPath)) {
        try {
          const fileContent = readFileSync(tokenListPath, "utf8");
          fetchedTokenList = JSON.parse(fileContent);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`Error parsing token list file: ${errorMessage}`);
        }
      } else {
        console.error(`Token list file not found at: ${tokenListPath}`);
      }
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error loading token list: ${errorMessage}`);
  }

  return (
    <html lang="en" className="bg-background">
      <body
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
      >
        <Providers content={fetchedTokenList}>
          <TermOfUseModal />

          <PostHogPageView />
          {/* Note: This div previously had overflow-hidden, but it was removed as it interferes with sticky elements */}
          <div className="relative flex min-h-screen w-full flex-col ">
            <div className="z-[100]">
              <Toaster position="bottom-right" />
            </div>
            <div className="z-10 flex-1">
              <Header navItems={navItems} appName={hubName} hideTheme />
              <MainWithBanners
                // mt-8 should probably be removed
                className="mt-8"
                // paddingTop={150}
                // multiplier={50}
                appName={hubName}
              >
                {props.children}
              </MainWithBanners>
            </div>
            <Footer />
          </div>
          <TailwindIndicator />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
