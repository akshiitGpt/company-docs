import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Docs",
  description: "Company knowledge base — browse, edit, and chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
