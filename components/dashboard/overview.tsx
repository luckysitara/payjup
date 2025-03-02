"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useSupabase } from "@/components/supabase-provider"

export function Overview() {
  const [data, setData] = useState([])
  const { supabase, user } = useSupabase()

  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("merchant_id", user?.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching transaction data:", error)
        return
      }

      const aggregatedData = data.reduce((acc, transaction) => {
        const date = new Date(transaction.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += transaction.amount
        return acc
      }, {})

      const chartData = Object.entries(aggregatedData).map(([date, total]) => ({
        name: date,
        total: total,
      }))

      setData(chartData)
    }

    if (user) {
      fetchData()
    }
  }, [supabase, user])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

