import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Script from 'next/script'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Bitcoin Brainiac",
  description: "The daily newsletter for serious Bitcoin investors.",
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "./apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "./apple-touch-icon-precomposed.png",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-1R70VG55JT"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-1R70VG55JT');
          `}
        </Script>
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{
          background: 'radial-gradient(circle at top, #ffffff 0%, #fff3d6 50%, #ffd6a0 100%)'
        }}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
