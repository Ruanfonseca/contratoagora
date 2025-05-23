import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contrato Agora",
  description: "O contrato que você precisa num só lugar !",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="logocontrato.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
