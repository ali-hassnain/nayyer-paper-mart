import "./globals.css";
import "@/styles/index.scss";
import Layout from "@/components/wrappers/Layout";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { GET__getUser } from "@/services/queries-ssr";
import { AppWrapper } from "@/context/AppWrapper";
import { Toaster } from "@/components/ui/shadcn/sonner";

export const pacaembu = localFont({
  src: "../public/fonts/Pacaembu.woff2",
  variable: "--t-font-family-global",
});

export const metadata = {
  title:
    "Swoop Parts",
  description:
    "Best automobile parts sourcing platform in the United Arab Emirates",
};

export default async function RootLayout({ children }) {
  const user = await GET__getUser();
  return (
    <html lang="en">
    <head>s
      <link rel="icon" href="/favicon.ico" type="image/png"/>
    </head>
      <body className={`${pacaembu.variable}`}>
        <NextTopLoader
          color="var(--t-primary-branding-color)"
          showSpinner={false}
          height={2}
          zIndex={999999}
        />
        <AppWrapper user={user}>
          <Layout>{children}</Layout>
        </AppWrapper>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
