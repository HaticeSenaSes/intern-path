import type { Metadata } from "next";
import "./globals.css?v=1";

export const metadata: Metadata = {
  title: "Intern Path | Staj Takip",
  description: "Teknik terimleri sade ve ilham verici bir dille açıklar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="flex min-h-dvh flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
