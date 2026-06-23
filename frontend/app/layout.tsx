import "./globals.css";

import type { Metadata } from "next";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  applicationName: "つづる日記",
  title: {
    default: "つづる日記",
    template: "%s | つづる日記",
  },
  description: "日々の記録を、静かに読み返せる場所。",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
