import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Archivo (expanded width) for headings, IBM Plex for reading and data.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Varun Paruchuri | Full-Stack & Backend Developer · Python · FastAPI · AWS",
  description:
    "Portfolio of Varun Paruchuri — Backend Software Engineer specializing in Python/FastAPI REST APIs, PostgreSQL, and LLM integrations (Gemini, GPT-4o, Groq). Currently at Ezinore.",
  keywords: [
    "Varun Paruchuri", "Backend Engineer", "Python", "FastAPI", "PostgreSQL",
    "AI ML Engineer", "Gemini", "GPT-4o", "Groq LLaMA", "REST API",
    "Software Engineer", "Hyderabad", "Full Stack", "Next.js", "TypeScript"
  ],
  authors: [{ name: "Varun Paruchuri", url: "https://varun-portfolio-hazel.vercel.app/" }],
  openGraph: {
    title: "Varun Paruchuri | Backend Engineer · AI/ML",
    description: "Building intelligent backend systems with Python, FastAPI, and LLMs.",
    url: "https://varun-portfolio-hazel.vercel.app/",
    siteName: "Varun Paruchuri Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varun Paruchuri | Backend Engineer · AI/ML",
    description: "Building intelligent backend systems with Python, FastAPI, and LLMs.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans bg-background text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}