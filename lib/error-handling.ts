import { toast } from "@/components/ui/use-toast"

export function handleError(error: unknown, customMessage?: string) {
  console.error(error)

  let errorMessage = "An unexpected error occurred. Please try again."

  if (error instanceof Error) {
    errorMessage = error.message
  }

  toast({
    variant: "destructive",
    title: customMessage || "Error",
    description: errorMessage,
  })
}

export function handleSuccess(message: string) {
  toast({
    title: "Success",
    description: message,
  })
}

