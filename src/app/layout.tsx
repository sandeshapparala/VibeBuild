import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import LenisProvider from "@/components/providers/lenis-provider"
import { AuthProvider } from '@/lib/auth';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
})

export const metadata: Metadata = {
    title: "VibeBuild – AI-Powered Project Assistant",
    description:
        "Turn your app ideas into structured plans, tech stack suggestions, and curated GPT prompt packs with VibeBuild.",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={cn(
                "min-h-screen bg-background font-sans antialiased text-foreground",
                geistSans.variable,
                geistMono.variable
            )}
        >
            <LenisProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </LenisProvider>
            <Toaster position="top-center" richColors expand />
        </body>
        </html>
    )
}
