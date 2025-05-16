import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Use Geist instead of Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono can be kept if needed for specific components, but primary font is Sans
const geistMono = Geist({ // Assuming Geist Mono is also from next/font/google or similar
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'] // Example weights, adjust as needed
});


export const metadata: Metadata = {
  title: 'SERP Eye - AI-Powered SERP Analysis',
  description: 'Analyze Search Engine Results Pages with AI-driven insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
