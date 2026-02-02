import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Scribe - Improve Your Authoring Skills",
  description: "Multilingual transcription platform to enhance authoring skills and typing speed using curated news, editorials, and novels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
