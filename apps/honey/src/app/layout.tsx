import "../styles/globals.css";
import { IBM_Plex_Sans, Jua } from "next/font/google";
import Script from "next/script";
import { honeyName, honeyUrl } from "@bera/config";
import {
  Footer,
  Header,
  MainWithBanners,
  TailwindIndicator,
  TermOfUseModal,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Toaster } from "react-hot-toast";

import { mobileNavItems, navItems } from "./config";
import HoneyProviders from "~/components/honey-providers";
import { Metadata } from "next";

const fontSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHoney = Jua({
  weight: ["400"],
  variable: "--font-honey",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(honeyUrl),
  title: "Honey",
  description: "Mint, redeem, and trade Honey",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontHoney.variable,
        )}
      >
        <TermOfUseModal />
        <HoneyProviders>
          <Header
            isHoney
            navItems={navItems}
            mobileNavItems={mobileNavItems}
            appName={honeyName}
          />
          <MainWithBanners className="pt-start" appName={honeyName}>
            {props.children}
          </MainWithBanners>
          <Toaster position="bottom-right" />
          <Footer />
          <TailwindIndicator />
        </HoneyProviders>
      </body>
    </html>
  );
}
