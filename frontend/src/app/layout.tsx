import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  // ← 追加
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "生活ダッシュボード",
  description: "生活を管理するダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
