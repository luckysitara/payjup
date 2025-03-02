"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CreditCard, Home, Settings, LineChart, BarChart4, Wallet, Code } from "lucide-react"
import { motion } from "framer-motion"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart4,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: LineChart,
  },
  {
    title: "Payouts",
    href: "/dashboard/payouts",
    icon: Wallet,
  },
  {
    title: "Developer",
    href: "/dashboard/developer",
    icon: Code,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  const fadeIn = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  }

  return (
    <motion.nav
      className="grid items-start gap-2"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {items.map((item) => (
        <motion.div key={item.href} variants={fadeIn}>
          <Link
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  )
}

