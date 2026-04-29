import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FlavorProvider } from "@/components/flavor-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formula Helper",
  description: "AI-assisted IDM formula builder and explainer.",
};

// Inline script: read flavor from localStorage and set data-flavor BEFORE
// hydration so we don't flash the default flavor on a returning visitor.
const flavorBoot = `
try {
  var f = localStorage.getItem("formulahelper:flavor:v1");
  if (f === "terminal" || f === "swiss" || f === "edtech") {
    document.documentElement.setAttribute("data-flavor", f);
  } else {
    document.documentElement.setAttribute("data-flavor", "terminal");
  }
} catch (e) {
  document.documentElement.setAttribute("data-flavor", "terminal");
}
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: flavorBoot }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FlavorProvider>{children}</FlavorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
