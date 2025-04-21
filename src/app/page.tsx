"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            Build Smarter with AI.
            <br />
            <span className="text-yellow-400">Turn Ideas into Code.</span>
          </h1>

          <p className="text-muted-foreground text-lg">
            VibeBuild helps you transform your raw app ideas into structured plans, tech stacks, and AI-generated code prompts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button className="px-6 py-3 text-lg">Start Building</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" className="px-6 py-3 text-lg">How it Works</Button>
            </Link>
          </div>
        </motion.div>
      </main>
  )
}
