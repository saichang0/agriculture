import type { Metadata } from "next";
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
  title: "ຮ້ານອຸປະກອນການກະເສດ",
  description: "ລະບົບຂາຍໜ້າຮ້ານ",
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
