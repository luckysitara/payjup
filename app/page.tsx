"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Coins, Globe, Wallet } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <motion.div className="flex items-center gap-2" {...fadeIn}>
            <Coins className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SolPay</span>
          </motion.div>
          <motion.nav className="hidden md:flex items-center gap-6" {...fadeIn}>
            <Link href="#features" className="text-sm font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium">
              Documentation
            </Link>
          </motion.nav>
          <motion.div className="flex items-center gap-4" {...fadeIn}>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </motion.div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/jupiter-bg.png')] bg-cover bg-center opacity-20 dark:opacity-10" />
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="container px-4 md:px-6 relative z-10"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div className="space-y-2" variants={fadeIn}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Accept Solana Payments, Your Way
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Seamlessly accept any Solana token and automatically swap to your preferred currency. No code
                  required.
                </p>
              </motion.div>
              <motion.div className="flex flex-col sm:flex-row gap-4" variants={fadeIn}>
                <Link href="/signup">
                  <Button size="lg" className="gap-1">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button variant="outline" size="lg">
                    View Documentation
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <motion.section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="container px-4 md:px-6">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need to accept Solana payments
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides a complete solution for businesses to accept Solana payments with automatic
                  token swaps.
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-2 rounded-lg p-4"
                variants={fadeIn}
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Accept Any Token</h3>
                <p className="text-center text-muted-foreground">
                  Let your customers pay with any Solana token while you receive your preferred currency.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-2 rounded-lg p-4"
                variants={fadeIn}
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Automatic Swaps</h3>
                <p className="text-center text-muted-foreground">
                  Payments are automatically swapped to your preferred token using Jupiter's powerful swap API.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-2 rounded-lg p-4"
                variants={fadeIn}
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Devnet & Mainnet</h3>
                <p className="text-center text-muted-foreground">
                  Seamlessly switch between Solana Devnet and Mainnet for testing and production.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          id="pricing"
          className="w-full py-12 md:py-24 lg:py-32"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="container px-4 md:px-6">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that fits your business needs
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6"
                variants={fadeIn}
              >
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-4xl font-bold">1%</p>
                <p className="text-center text-muted-foreground">Per transaction</p>
                <ul className="space-y-2 text-center">
                  <li>Up to $10,000 monthly volume</li>
                  <li>Unlimited transactions</li>
                  <li>24/7 support</li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6"
                variants={fadeIn}
              >
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-4xl font-bold">0.5%</p>
                <p className="text-center text-muted-foreground">Per transaction</p>
                <ul className="space-y-2 text-center">
                  <li>Unlimited monthly volume</li>
                  <li>Priority support</li>
                  <li>Custom integrations</li>
                </ul>
                <Button className="w-full">Contact Sales</Button>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <motion.p className="text-center text-sm leading-loose text-muted-foreground md:text-left" variants={fadeIn}>
            © 2024 SolPay. All rights reserved.
          </motion.p>
          <motion.div className="flex items-center gap-4" variants={fadeIn}>
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

