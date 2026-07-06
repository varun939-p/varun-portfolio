import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceMono = Space_Mono({ 
  weight: ["400"], 
  subsets: ["latin"], 
  variable: "--font-space-mono" 
});

export const metadata: Metadata = {
  title: "Varun Paruchuri | Software Engineer",
  description: "Portfolio of Varun Paruchuri, Backend Software Engineer specialized in Python & AI/ML.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceMono.variable} font-sans bg-background text-white`}>
        {children}
      </body>
    </html>
  );
}