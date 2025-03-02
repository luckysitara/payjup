"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, CreditCard, DollarSign, Users } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { supabase, user } = useSupabase()
  const [merchantData, setMerchantData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!user) return

      try {
        // Fetch merchant profile
        const { data: merchantProfile, error: profileError } = await supabase
          .from("merchants")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        // Fetch transaction stats
        const { data: transactionStats, error: statsError } = await supabase
          .from("transactions")
          .select("amount, status, created_at")
          .eq("merchant_id", user.id)
          .order("created_at", { ascending: false })

        if (statsError) throw statsError

        setMerchantData({
          profile: merchantProfile,
          transactions: transactionStats || [],
        })
      } catch (error) {
        console.error("Error fetching merchant data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchantData()
  }, [supabase, user])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate dashboard metrics
  const totalTransactions = merchantData?.transactions?.length || 0
  const successfulTransactions = merchantData?.transactions?.filter((tx: any) => tx.status === "completed").length || 0
  const totalVolume = merchantData?.transactions?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0
  const averageTransaction = totalTransactions > 0 ? totalVolume / totalTransactions : 0

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
    <motion.div className="flex-1 space-y-4" initial="initial" animate="animate" variants={stagger}>
      <motion.div className="flex items-center justify-between" variants={fadeIn}>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </motion.div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={stagger}>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalVolume.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalTransactions > 0 ? ((successfulTransactions / totalTransactions) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">+7.4% from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" variants={stagger}>
            <motion.div variants={fadeIn} className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Transaction volume for the past 30 days</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn} className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>You made {successfulTransactions} sales this month.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" variants={stagger}>
            <motion.div variants={fadeIn} className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Analytics</CardTitle>
                  <CardDescription>Detailed breakdown of your payment activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">More detailed analytics coming soon.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn} className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Token Distribution</CardTitle>
                  <CardDescription>Breakdown of tokens received before swap</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Token distribution data will appear here.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

