import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import StyledJsxRegistry from '@/lib/registry';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flick Sage - Your Personal Movie Discovery Platform",
  description: "Discover trending movies, explore top-rated films, and get personalized recommendations. Your next favorite movie is just a click away.",
  keywords: "movies, film, recommendation, trending, top rated, cinema, entertainment",
  authors: [{ name: "Flick Sage Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledJsxRegistry>
          <CustomThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </CustomThemeProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
