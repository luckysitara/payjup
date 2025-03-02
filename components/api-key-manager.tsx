"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"

interface ApiKey {
  id: string
  key: string
  network: "mainnet" | "devnet"
  is_active: boolean
}

interface ApiKeyManagerProps {
  apiKeys: ApiKey[]
  onGenerateKey: (network: "mainnet" | "devnet") => Promise<void>
  onToggleKey: (keyId: string, isActive: boolean) => Promise<void>
  onDeleteKey: (keyId: string) => Promise<void>
}

export function ApiKeyManager({ apiKeys, onGenerateKey, onToggleKey, onDeleteKey }: ApiKeyManagerProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateKey = async (network: "mainnet" | "devnet") => {
    setIsGenerating(true)
    try {
      await onGenerateKey(network)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating API key",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage your API keys for integrating with your applications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKeys.map((key) => (
          <motion.div
            key={key.id}
            className="flex items-center justify-between p-2 border rounded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p className="font-medium">
                {key.key.slice(0, 8)}...{key.key.slice(-8)}
              </p>
              <p className="text-sm text-muted-foreground">{key.network}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={key.is_active} onCheckedChange={(checked) => onToggleKey(key.id, checked)} />
              <span className="text-sm">{key.is_active ? "Active" : "Inactive"}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your API key.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteKey(key.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => handleGenerateKey("mainnet")} disabled={isGenerating}>
          Generate Mainnet Key
        </Button>
        <Button onClick={() => handleGenerateKey("devnet")} disabled={isGenerating}>
          Generate Devnet Key
        </Button>
      </CardFooter>
    </Card>
  )
}

