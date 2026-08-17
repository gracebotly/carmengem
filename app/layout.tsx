import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

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

export const metadata: Metadata = {
  title: "Carmen Rose — Therapeutic Massage in Bowie, Maryland",
  description:
    "Therapeutic massage by appointment in Bowie, Maryland. Serving Prince George's County.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="bg-shell text-ink font-body min-h-full flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}
