import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Scribe: Multilingual Typing Trainer",
  description: "Multilingual typing and transcription trainer for English, Korean, and Japanese with OCR for book pages and live speed and accuracy metrics.",
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
