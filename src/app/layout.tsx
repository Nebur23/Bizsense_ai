import type { Metadata } from "next";
//import { Geist, Geist_Mono, Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { TanstackProvider } from "@/components/providers/tanstack-provider";
import { Toaster } from "sonner";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const ibmPlexSerif = IBM_Plex_Serif({
//   variable: "--font-ibm-plex-serif",
//   weight: ["400", "700"],
//   subsets: ["latin"],
// });
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "BizSense AI",
  description: "A unified, AI-powered SaaS platform",
  icons: {
    icon: "/icons/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`antialiased`}

        //className={`${ibmPlexSerif.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable}  antialiased`}
      >
        <TanstackProvider>{children}</TanstackProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
