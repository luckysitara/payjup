import * as web3 from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"
import { TokenListProvider, type TokenInfo } from "@solana/spl-token-registry"
import axios from "axios"

// Constants
const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL!
const DEVNET_RPC_URL = process.env.NEXT_PUBLIC_DEVNET_RPC_URL!
const JUPITER_API_URL = process.env.NEXT_PUBLIC_JUPITER_API_URL!
const ACCEPTED_TOKENS = ["SOL", "USDC", "RAY", "SRM", "FIDA"]

// Wallet connection
export async function connectWallet(): Promise<string> {
  if (!window.phantom?.solana) {
    throw new Error("Phantom wallet is not installed. Please install it first.")
  }

  try {
    const response = await window.phantom.solana.connect()
    return response.publicKey.toString()
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    throw new Error("Failed to connect to wallet. Please try again.")
  }
}

// Payment processing
export async function processPayment(
  recipientAddress: string,
  amount: number,
  token: string,
  network: "mainnet" | "devnet" = "devnet",
): Promise<string> {
  if (!window.phantom?.solana?.isConnected) {
    throw new Error("Wallet is not connected. Please connect your wallet first.")
  }

  const connection = new web3.Connection(network === "mainnet" ? MAINNET_RPC_URL : DEVNET_RPC_URL, "confirmed")

  try {
    const senderPublicKey = await window.phantom.solana.publicKey
    const recipientPublicKey = new web3.PublicKey(recipientAddress)

    const transaction = createTransactionForToken(senderPublicKey, recipientPublicKey, amount, token)

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = senderPublicKey

    const signedTransaction = await window.phantom.solana.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error("Error processing payment:", error)
    if (error instanceof web3.SendTransactionError) {
      throw new Error(`Failed to process payment: ${error.message}`)
    } else if (error instanceof web3.ConfirmTransactionError) {
      throw new Error("Payment was sent but not confirmed. Please check your wallet for details.")
    } else {
      throw new Error("Failed to process payment. Please try again.")
    }
  }
}

// Token swapping
export async function swapTokens(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippage = 1,
): Promise<{ inputAmount: number; outputAmount: number; txSignature: string }> {
  try {
    const quoteResponse = await axios.get(`${JUPITER_API_URL}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps: slippage * 100,
      },
    })

    const { data: quoteData } = quoteResponse

    const swapResponse = await axios.post(`${JUPITER_API_URL}/swap`, {
      quoteResponse: quoteData,
      userPublicKey: window.phantom.solana.publicKey.toString(),
      wrapUnwrapSOL: true,
    })

    const { swapTransaction } = swapResponse.data

    const transaction = web3.Transaction.from(Buffer.from(swapTransaction, "base64"))
    const signedTransaction = await window.phantom.solana.signTransaction(transaction)

    const connection = new web3.Connection(MAINNET_RPC_URL, "confirmed")
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    await connection.confirmTransaction(signature)

    return {
      inputAmount: amount,
      outputAmount: quoteData.outAmount,
      txSignature: signature,
    }
  } catch (error) {
    console.error("Error swapping tokens:", error)
    throw new Error("Failed to swap tokens. Please try again.")
  }
}

// Helper functions
async function getSwapQuote(inputMint: string, outputMint: string, amount: number, slippage: number) {
  const quoteResponse = await axios.get(`${JUPITER_API_URL}/quote`, {
    params: {
      inputMint,
      outputMint,
      amount,
      slippageBps: slippage * 100,
    },
  })
  return quoteResponse.data
}

async function getSwapTransaction(quoteResponse: any) {
  const swapResponse = await axios.post(`${JUPITER_API_URL}/swap`, {
    quoteResponse,
    userPublicKey: window.phantom.solana.publicKey.toString(),
    wrapUnwrapSOL: true,
  })
  return swapResponse.data.swapTransaction
}

async function executeSwapTransaction(swapTransaction: string) {
  const transaction = web3.Transaction.from(Buffer.from(swapTransaction, "base64"))
  const signedTransaction = await window.phantom.solana.signTransaction(transaction)

  const connection = new web3.Connection(MAINNET_RPC_URL, "confirmed")
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())

  await connection.confirmTransaction(signature)
  return signature
}

export async function getTokenList(): Promise<TokenInfo[]> {
  const tokenListProvider = new TokenListProvider()
  const tokenList = await tokenListProvider.resolve()
  const tokens = tokenList.filterByClusterSlug("mainnet-beta").getList()
  return tokens.filter((token) => ACCEPTED_TOKENS.includes(token.symbol))
}

function createTransactionForToken(
  senderPublicKey: PublicKey,
  recipientPublicKey: PublicKey,
  amount: number,
  token: string,
): web3.Transaction {
  // Implement token-specific transaction creation logic here
  // For simplicity, we're using a basic SOL transfer
  return new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: amount * web3.LAMPORTS_PER_SOL,
    }),
  )
}

// Add TypeScript declaration for Phantom wallet
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isConnected: boolean
        connect: () => Promise<{ publicKey: PublicKey }>
        disconnect: () => Promise<void>
        signTransaction: (transaction: web3.Transaction) => Promise<web3.Transaction>
        signAllTransactions: (transactions: web3.Transaction[]) => Promise<web3.Transaction[]>
        signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
        publicKey: PublicKey
      }
    }
  }
}

