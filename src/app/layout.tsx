import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "FinBoard - Customizable Finance Dashboard",
  description: "Build your own real-time finance monitoring dashboard with customizable widgets, drag-and-drop functionality, and seamless financial API integrations.",
  keywords: ["finance", "dashboard", "stocks", "trading", "widgets", "real-time", "portfolio"],
  authors: [{ name: "FinBoard" }],
  openGraph: {
    title: "FinBoard - Customizable Finance Dashboard",
    description: "Build your own real-time finance monitoring dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
