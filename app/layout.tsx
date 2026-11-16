import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  BUSINESS,
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_URL,
  personJsonLd,
} from "@/lib/site";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE = "Carmen Gem | Washington DC Luxury Escort & Companion";

export const metadata: Metadata = {
  // Makes every relative URL below resolve against the real origin.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${BUSINESS.name}`,
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.name,
  // Canonicals are defined per page so each indexable route has its own URL.
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    title: SITE_TITLE,
    description: BUSINESS.description,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: BUSINESS.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: BUSINESS.description,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(BUSINESS.googleSiteVerification
    ? { verification: { google: BUSINESS.googleSiteVerification } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="bg-shell text-ink font-body min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd()).replace(/</g, "\\u003c"),
          }}
        />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
