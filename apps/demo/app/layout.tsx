import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUWP SDK Demo",
  description: "Live demonstration of @muwp/sdk on Stellar mainnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 font-mono">{children}</body>
    </html>
  );
}
