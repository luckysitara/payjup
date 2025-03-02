"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [merchantData, setMerchantData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const txSignature = searchParams.get("tx")

  useEffect(() => {
    const fetchPaymentData = async () => {
      const paymentId = params.id as string

      try {
        // Fetch payment link data
        const { data: paymentData, error: paymentError } = await supabase
          .from("payment_links")
          .select("*")
          .eq("id", paymentId)
          .single()

        if (paymentError) throw paymentError

        setPaymentData(paymentData)

        // Fetch merchant data
        const { data: merchantData, error: merchantError } = await supabase
          .from("merchants")
          .select("*")
          .eq("id", paymentData.merchant_id)
          .single()

        if (merchantError) throw merchantError

        setMerchantData(merchantData)
      } catch (error) {
        console.error("Error fetching payment data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentData()
  }, [supabase, params.id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  const getExplorerLink = () => {
    if (!txSignature) return "#"

    const baseUrl =
      merchantData?.network === "mainnet"
        ? "https://explorer.solana.com/tx/"
        : "https://explorer.solana.com/tx/?cluster=devnet"

    return `${baseUrl}${txSignature}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-primary/10">
      <header className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SolPay</span>
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4 text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your payment has been processed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">${paymentData?.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Merchant</p>
                  <p className="font-medium">{merchantData?.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment For</p>
                  <p className="font-medium">{paymentData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network</p>
                  <p className="font-medium capitalize">{merchantData?.network}</p>
                </div>
              </div>
            </div>
            {txSignature && (
              <div className="text-center">
                <Link href={getExplorerLink()} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on Solana Explorer
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

