"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { ApiKeyManager } from "@/components/api-key-manager"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { web3 } from "@solana/web3.js"

const formSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  walletAddress: z.string().refine(
    (value) => {
      try {
        new web3.PublicKey(value)
        return true
      } catch {
        return false
      }
    },
    { message: "Invalid Solana wallet address" },
  ),
  preferredToken: z.string(),
  network: z.enum(["devnet", "mainnet"]),
})

export default function SettingsPage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [merchantData, setMerchantData] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState<any[]>([])

  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("merchants").select("*").eq("id", user.id).single()

        if (error) throw error

        setMerchantData(data)

        // Fetch API keys
        const { data: apiKeysData, error: apiKeysError } = await supabase
          .from("api_keys")
          .select("*")
          .eq("merchant_id", user.id)

        if (apiKeysError) throw apiKeysError

        setApiKeys(apiKeysData || [])
      } catch (error) {
        console.error("Error fetching merchant data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchantData()
  }, [supabase, user])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: merchantData?.business_name || "",
      walletAddress: merchantData?.wallet_address || "",
      preferredToken: merchantData?.preferred_token || "USDC",
      network: merchantData?.network || "devnet",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("merchants")
        .update({
          business_name: values.businessName,
          wallet_address: values.walletAddress,
          preferred_token: values.preferredToken,
          network: values.network,
        })
        .eq("id", user?.id)

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message || "Something went wrong. Please try again.",
      })
    }
  }

  const generateApiKey = async (network: "mainnet" | "devnet") => {
    if (!user) return

    try {
      const newApiKey = crypto.randomUUID()

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          merchant_id: user.id,
          key: newApiKey,
          network: network,
        })
        .select()

      if (error) throw error

      setApiKeys([...apiKeys, data[0]])

      toast({
        title: "API key generated",
        description: `Your new ${network} API key has been generated successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error generating API key",
        description: error.message || "Something went wrong. Please try again.",
      })
    }
  }

  const toggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("api_keys").update({ is_active: isActive }).eq("id", keyId)

      if (error) throw error

      setApiKeys(apiKeys.map((key) => (key.id === keyId ? { ...key, is_active: isActive } : key)))

      toast({
        title: `API key ${isActive ? "enabled" : "disabled"}`,
        description: `The API key has been ${isActive ? "enabled" : "disabled"} successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating API key",
        description: error.message || "Something went wrong. Please try again.",
      })
    }
  }

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

  if (isLoading || !merchantData) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div
          className="animate-pulse text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-lg text-muted-foreground">Loading settings...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate" variants={stagger}>
      <motion.div variants={fadeIn}>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </motion.div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Update your business information and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" {...form.register("businessName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet-address">Wallet Address</Label>
                  <Input id="wallet-address" {...form.register("walletAddress")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <Select
                    {...form.register("network")}
                    onValueChange={(value) => setMerchantData({ ...merchantData, network: value })}
                  >
                    <SelectTrigger id="network">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="devnet">Devnet</SelectItem>
                      <SelectItem value="mainnet">Mainnet</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select Devnet for testing, Mainnet for production.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure your payment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred-token">Preferred Settlement Token</Label>
                  <Select
                    {...form.register("preferredToken")}
                    onValueChange={(value) => setMerchantData({ ...merchantData, preferred_token: value })}
                  >
                    <SelectTrigger id="preferred-token">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    All payments will be automatically swapped to this token.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <motion.div variants={fadeIn}>
            <ApiKeyManager apiKeys={apiKeys} onGenerateKey={generateApiKey} onToggleKey={toggleApiKey} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

