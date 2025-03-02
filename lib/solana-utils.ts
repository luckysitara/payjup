import * as web3 from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"
import { TokenListProvider, type TokenInfo } from "@solana/spl-token-registry"
import axios from "axios"

// Helius RPC URLs
const MAINNET_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=58fcffd5-d2bb-4247-bf8d-69e902d395b8"
const DEVNET_RPC_URL = "https://devnet.helius-rpc.com/?api-key=58fcffd5-d2bb-4247-bf8d-69e902d395b8"

// Jupiter API URL
const JUPITER_API_URL = "https://quote-api.jup.ag/v4"

// List of accepted tokens
const ACCEPTED_TOKENS = ["SOL", "USDC", "RAY", "SRM", "FIDA"]

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

export async function makePayment(
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

    // For simplicity, we're assuming SOL transfer here.
    // For other tokens, you'd need to use the Token Program.
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * web3.LAMPORTS_PER_SOL,
      }),
    )

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = senderPublicKey

    const signedTransaction = await window.phantom.solana.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error("Error making payment:", error)
    if (error instanceof web3.SendTransactionError) {
      throw new Error(`Failed to process payment: ${error.message}`)
    } else if (error instanceof web3.ConfirmTransactionError) {
      throw new Error("Payment was sent but not confirmed. Please check your wallet for details.")
    } else {
      throw new Error("Failed to process payment. Please try again.")
    }
  }
}

export async function swapTokens(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippage = 1,
): Promise<{ inputAmount: number; outputAmount: number; txSignature: string }> {
  try {
    // 1. Get the route
    const quoteResponse = await axios.get(`${JUPITER_API_URL}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps: slippage * 100,
      },
    })

    const { data: quoteData } = quoteResponse

    // 2. Get the swap transaction
    const swapResponse = await axios.post(`${JUPITER_API_URL}/swap`, {
      quoteResponse: quoteData,
      userPublicKey: window.phantom.solana.publicKey.toString(),
      wrapUnwrapSOL: true,
    })

    const { swapTransaction } = swapResponse.data

    // 3. Sign and send the transaction
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

export async function getTokenList(): Promise<TokenInfo[]> {
  const tokenListProvider = new TokenListProvider()
  const tokenList = await tokenListProvider.resolve()
  const tokens = tokenList.filterByClusterSlug("mainnet-beta").getList()
  return tokens.filter((token) => ACCEPTED_TOKENS.includes(token.symbol))
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

