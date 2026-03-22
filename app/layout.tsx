import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intern Path | Staj Takip",
  description: "Teknik terimleri sade ve ilham verici bir dille açıklar.",
};

// Mobilde her şeyin ekrana tam oturmasını sağlayan sihirli dokunuş:
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full antialiased overflow-x-hidden">
      <body className="flex min-h-screen flex-col font-sans bg-slate-50 overflow-x-hidden">
        <main className="flex-1 w-full max-w-md mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
