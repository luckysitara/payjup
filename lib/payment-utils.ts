import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function validatePaymentLink(paymentId: string) {
  const { data, error } = await supabase.from("payment_links").select("*").eq("id", paymentId).single()

  if (error) {
    throw new Error("Invalid payment link")
  }

  if (data.status !== "active") {
    throw new Error("This payment link is no longer active")
  }

  return data
}

