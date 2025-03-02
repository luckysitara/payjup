"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function PaymentsPage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPayment, setNewPayment] = useState({
    name: "",
    amount: "",
    description: "",
  })

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("payment_links")
          .select("*")
          .eq("merchant_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setPayments(data || [])
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [supabase, user])

  const handleCreatePayment = async () => {
    if (!user) return

    try {
      // Generate a unique payment ID
      const paymentId = crypto.randomUUID()

      const { error } = await supabase.from("payment_links").insert({
        id: paymentId,
        merchant_id: user.id,
        name: newPayment.name,
        amount: Number.parseFloat(newPayment.amount),
        description: newPayment.description,
        status: "active",
      })

      if (error) throw error

      toast({
        title: "Payment link created",
        description: "Your payment link has been created successfully.",
      })

      // Refresh the payments list
      const { data, error: fetchError } = await supabase
        .from("payment_links")
        .select("*")
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setPayments(data || [])

      // Reset the form
      setNewPayment({
        name: "",
        amount: "",
        description: "",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating payment link",
        description: error.message || "Something went wrong. Please try again.",
      })
    }
  }

  const copyPaymentLink = (paymentId: string) => {
    const link = `${window.location.origin}/pay/${paymentId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Payment link copied to clipboard",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payment Links</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Payment Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
              <DialogDescription>Create a new payment link for your customers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Product or service name"
                  value={newPayment.name}
                  onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Description of the product or service"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePayment}>Create Payment Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Payment Links</CardTitle>
          <CardDescription>Manage and share payment links with your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <h3 className="text-lg font-medium">No payment links yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first payment link to start accepting payments.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.name}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(payment.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className={`mr-2 h-2 w-2 rounded-full ${
                            payment.status === "active" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        />
                        {payment.status === "active" ? "Active" : "Inactive"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => copyPaymentLink(payment.id)}>
                        Copy Link
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

