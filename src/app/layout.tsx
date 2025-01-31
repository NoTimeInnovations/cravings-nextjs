import type { Metadata } from "next";
import Script from "next/script"; // Import Script for Google Analytics
import "./globals.css";
import { Navbar } from "@/components/Navbar";
// import Snow from "@/components/Snow";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
// import RateUsModal from "@/components/RateUsModal";
import "@smastrom/react-rating/style.css";
import { Toaster } from "@/components/ui/sonner";
import CravingsCashInfoModal from "@/components/CravingsCashInfoModal";
import SyncUserOfferCoupons from "@/components/SyncUserOfferCoupons";
import LocationAccess from "@/components/LocationAccess";

export const metadata: Metadata = {
  title: "Cravings",
  description: "Find the best food deals in your area",
  icons: ["/icon-64x64_christmas.png"],
  metadataBase: new URL("http://cravings.vercel.app"),
  openGraph: {
    title: "Cravings",
    description: "Find the best food deals in your area",
    type: "website",
    images: ["/ogImage_christmas.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7SV68LS8J6');
            `,
          }}
        />
      </head>
      <body className={`antialiased`}>
        <Toaster richColors />
        {/* <Snow /> */}
        <Navbar />
        {/* <RateUsModal /> */}
        <CravingsCashInfoModal />
        <PwaInstallPrompt />
        <SyncUserOfferCoupons />
        <LocationAccess />
        {children}
      </body>
    </html>
  );
}
