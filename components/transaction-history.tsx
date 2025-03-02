"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"

export function TransactionHistory() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState({ column: "created_at", ascending: false })

  const pageSize = 10

  const fetchTransactions = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const query = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("merchant_id", user.id)
        .order(sortBy.column, { ascending: sortBy.ascending })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

      const { data, error, count } = await query

      if (error) throw error

      setTransactions(data || [])
      setTotalPages(Math.ceil((count || 0) / pageSize))
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        variant: "destructive",
        title: "Error fetching transactions",
        description: "Failed to load transaction history. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user, sortBy, currentPage, toast])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleSort = (column) => {
    setSortBy((prev) => ({
      column,
      ascending: prev.column === column ? !prev.ascending : true,
    }))
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <Button variant="ghost" onClick={() => handleSort("id")}>
                ID <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("amount")}>
                Amount <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("status")}>
                Status <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("created_at")}>
                Date <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id.slice(0, 8)}...</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

