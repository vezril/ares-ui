import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AresSidebar } from "@/components/ares/ares-sidebar";
import { Providers } from "@/components/providers";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ares — wireless survey",
  description:
    "Operator console for the Ares wireless pentest platform: live own-network survey, posture, and findings. Own-scope detail, foreign aggregate only.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // dark-only per the constellation UX standard — no light mode.
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}>
        <Providers>
          <div className="flex min-h-dvh">
            <AresSidebar />
            <main className="relative min-w-0 flex-1">
              {/*
                Faint god-mark watermark behind the main view — fixed, offset past
                the sidebar, very low opacity, aria-hidden so it reads as texture.
                ares.png is keyed onto the theme ground (#06060F), NOT transparent,
                so it composites cleanly ONLY over --background — which is exactly
                the page ground this layer sits on.
              */}
              <div
                aria-hidden
                className="pointer-events-none fixed inset-y-0 left-16 right-0 z-0 flex items-center justify-center overflow-hidden sm:left-60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ares.png"
                  alt=""
                  className="w-[38rem] max-w-[70%] select-none opacity-[0.05]"
                />
              </div>
              <div className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
