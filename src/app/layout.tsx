import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading-loaded",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-loaded",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
});

export const metadata: Metadata = {
  title: "Sanchit.OS",
  description:
    "An immersive 3D portfolio experience that feels like booting into a futuristic operating system.",
  openGraph: {
    title: "Sanchit.OS",
    description: "Interactive 3D portfolio operating system",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
