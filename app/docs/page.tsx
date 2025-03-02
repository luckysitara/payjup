"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 container py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-6">SolPay Documentation</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to SolPay! This guide will help you set up and start accepting Solana payments in your
                application.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create an account on SolPay</li>
                <li>Set up your merchant profile</li>
                <li>Generate API keys</li>
                <li>Integrate SolPay into your application</li>
              </ol>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
              <p className="text-muted-foreground mb-4">
                Our API allows you to create payment links, process transactions, and manage your account
                programmatically.
              </p>
              <Button asChild>
                <Link href="/docs/api">View Full API Reference</Link>
              </Button>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Integration Guide</h2>
              <p className="text-muted-foreground mb-4">
                Learn how to integrate SolPay into your application with our step-by-step guides.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Web Integration</li>
                <li>Mobile SDK</li>
                <li>Server-side Integration</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
              <p className="text-muted-foreground mb-4">Find answers to commonly asked questions about SolPay.</p>
              <Button asChild>
                <Link href="/docs/faq">View FAQs</Link>
              </Button>
            </section>
          </div>
        </motion.div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">© 2024 SolPay. All rights reserved.</div>
      </footer>
    </div>
  )
}

