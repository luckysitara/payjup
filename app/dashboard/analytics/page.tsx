"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [analyticsData, setAnalyticsData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const fetchAnalytics = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("transaction_analytics")
        .select("*")
        .eq("merchant_id", user.id)
        .gte("date", dateRange.from.toISOString().split("T")[0])
        .lte("date", dateRange.to.toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (error) throw error

      setAnalyticsData(data || [])
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        variant: "destructive",
        title: "Error fetching analytics",
        description: "Failed to load analytics data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user, dateRange, toast])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate" variants={fadeIn}>
      <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.reduce((sum, day) => sum + day.total_transactions, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.reduce((sum, day) => sum + day.total_volume, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (analyticsData.reduce((sum, day) => sum + day.successful_transactions, 0) /
                  analyticsData.reduce((sum, day) => sum + day.total_transactions, 0)) *
                100
              ).toFixed(2)}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                analyticsData.reduce((sum, day) => sum + day.total_volume, 0) /
                analyticsData.reduce((sum, day) => sum + day.total_transactions, 0)
              ).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume</CardTitle>
          <CardDescription>Daily transaction volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_volume" fill="#8884d8" name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}

