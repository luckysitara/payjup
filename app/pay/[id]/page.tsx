"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Coins, Loader2 } from "lucide-react"
import { connectWallet, makePayment, swapTokens, getTokenList } from "@/lib/solana-utils"
import { validatePaymentLink } from "@/lib/payment-utils"
import type { TokenInfo } from "@solana/spl-token-registry"
import { motion, AnimatePresence } from "framer-motion"

export default function PaymentPage() {
  const params = useParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [merchantData, setMerchantData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [tokens, setTokens] = useState<TokenInfo[]>([])

  useEffect(() => {
    const fetchPaymentData = async () => {
      const paymentId = params.id as string

      try {
        // Validate payment link
        const paymentData = await validatePaymentLink(paymentId)
        setPaymentData(paymentData)

        // Fetch merchant data
        const { data: merchantData, error: merchantError } = await supabase
          .from("merchants")
          .select("*")
          .eq("id", paymentData.merchant_id)
          .single()

        if (merchantError) throw merchantError

        setMerchantData(merchantData)

        // Fetch token list
        const tokenList = await getTokenList()
        setTokens(tokenList)

        // Set default selected token
        if (tokenList.length > 0) {
          setSelectedToken(tokenList[0].address)
        }
      } catch (error) {
        console.error("Error fetching payment data:", error)
        toast({
          variant: "destructive",
          title: "Error loading payment",
          description: "This payment link is invalid or has expired.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentData()
  }, [supabase, params.id, toast])

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      setWalletConnected(true)
      toast({
        title: "Wallet connected",
        description: "Your Solana wallet has been connected successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Wallet connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
      })
    }
  }

  const handlePayment = async () => {
    if (!paymentData || !merchantData || !selectedToken) return

    setIsProcessing(true)
    try {
      // Create transaction record
      const transactionId = crypto.randomUUID()
      const { error: txError } = await supabase.from("transactions").insert({
        id: transactionId,
        merchant_id: merchantData.id,
        payment_link_id: paymentData.id,
        amount: paymentData.amount,
        token: selectedToken,
        target_token: merchantData.preferred_token,
        status: "pending",
      })

      if (txError) throw txError

      // Process payment through Solana
      const txSignature = await makePayment(
        merchantData.wallet_address,
        paymentData.amount,
        selectedToken,
        merchantData.network,
      )

      // If the selected token is different from the merchant's preferred token, perform a swap
      let swapSignature = null
      if (selectedToken !== merchantData.preferred_token) {
        const swapResult = await swapTokens(selectedToken, merchantData.preferred_token, paymentData.amount)
        swapSignature = swapResult.txSignature
      }

      // Update transaction with signatures
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          transaction_signature: txSignature,
          swap_signature: swapSignature,
          status: "completed",
        })
        .eq("id", transactionId)

      if (updateError) throw updateError

      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      })

      // Redirect to success page
      window.location.href = `/pay/${params.id}/success?tx=${txSignature}`
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: error.message || "Failed to process payment. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 },
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="animate-pulse text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Loading payment...</p>
        </motion.div>
      </div>
    )
  }

  if (!paymentData || !merchantData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl">Invalid Payment</CardTitle>
              <CardDescription className="text-center">This payment link is invalid or has expired.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Please contact the merchant for assistance.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-primary/10">
      <motion.header
        className="container flex h-16 items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SolPay</span>
        </div>
      </motion.header>
      <main className="container flex flex-1 items-center justify-center py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key="payment-card"
            className="w-full max-w-md"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
          >
            <Card>
              <CardHeader>
                <CardTitle>{paymentData.name}</CardTitle>
                <CardDescription>{paymentData.description || "Complete your payment"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">${paymentData.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Pay to {merchantData.business_name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select payment token:</p>
                  <Select value={selectedToken} onValueChange={setSelectedToken} disabled={!walletConnected}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Payment will be automatically swapped to {merchantData.preferred_token}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {!walletConnected ? (
                  <Button className="w-full" onClick={handleConnectWallet} disabled={isProcessing}>
                    Connect Wallet
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handlePayment} disabled={isProcessing || !selectedToken}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Powered by Jupiter Swap on Solana {merchantData.network}
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

