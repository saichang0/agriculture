import type { Metadata, Viewport } from "next";
import { Noto_Serif_Lao, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-provider";

const notoSerifLao = Noto_Serif_Lao({
  variable: "--font-noto-lao",
  subsets: ["lao", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kased",
  description: "ລະບົບຂາຍໜ້າຮ້ານ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "kased",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lo"
      className={`${notoSerifLao.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-page-bg text-text-primary">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
