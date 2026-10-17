import { getDemoResponse } from './demoResponses'

const AI_API_URL = import.meta.env.VITE_AI_API_URL as string | undefined

export const isDemoMode = !AI_API_URL

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponse {
  content: string
  isDemo: boolean
}

/**
 * Send a chat message to the AI provider.
 *
 * In demo mode (no VITE_AI_API_URL configured), returns a simulated response
 * that is clearly labeled as demo content.
 *
 * To connect a real AI:
 * 1. Set up a backend proxy that holds your API key securely
 * 2. Expose a POST endpoint accepting { messages: [{role, content}] }
 * 3. Set VITE_AI_API_URL to that endpoint
 */
export async function sendChatMessage(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<ChatResponse> {
  if (!AI_API_URL) {
    // Demo mode — simulate thinking delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 800))
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    return {
      content: getDemoResponse(lastUser?.content || ''),
      isDemo: true,
    }
  }

  try {
    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages } as ChatRequest),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      throw new Error(`AI request failed (${res.status}): ${errText}`)
    }

    const data = await res.json()
    return {
      content: data.content || data.message || data.text || '',
      isDemo: false,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Connection failed'
    throw new Error(`Unable to reach AI provider: ${msg}`)
  }
}
