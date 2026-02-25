/**
 * Gemini AI Service (Servicio de IA Gemini)
 * File: server/utils/gemini.ts
 *
 * Server-side utility that wraps the Google Gemini API to provide
 * AI-powered ticket analysis. This file is used by API route handlers.
 *
 * WHY A SEPARATE UTILITY?
 * - Keeps the Gemini logic out of route handlers (separation of concerns)
 * - Makes it easy to switch AI providers later (OpenAI, Anthropic, etc.)
 * - Centralizes prompt engineering in one place
 *
 * WHAT IT DOES:
 * 1. analyzeTicket()    → Classify sentiment, priority, category, language + generate summary
 * 2. suggestReply()     → Generate a suggested agent reply for a ticket
 *
 * (¿POR QUÉ UNA UTILIDAD SEPARADA?
 *  - Mantiene la lógica de Gemini fuera de los handlers de rutas (separación de responsabilidades)
 *  - Facilita cambiar de proveedor de IA después (OpenAI, Anthropic, etc.)
 *  - Centraliza la ingeniería de prompts en un solo lugar)
 *
 * IMPORTANT: The NUXT_GEMINI_API_KEY environment variable must be set.
 * Get yours free at: https://aistudio.google.com/apikey
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TicketAnalysis {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  sentimentScore: number // 0.0 – 1.0 intensity (Intensidad de sentimiento)
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string // e.g. "billing", "technical", "account" (Categoría)
  language: string // ISO 639-1 code: "en", "es", "fr" (Código ISO)
  summary: string // 1-2 sentence summary (Resumen de 1-2 oraciones)
}

export interface SuggestedReply {
  suggestedReply: string // The full reply text (Texto completo de la respuesta)
  confidence: number // 0.0 – 1.0 how confident the AI is (Confianza)
  reasoning: string // Why the AI chose this reply (Por qué la IA eligió esta respuesta)
}

// ── Gemini API call helper ─────────────────────────────────────────────────────

/**
 * Call the Gemini API with a prompt and return the text response.
 *
 * We use the REST API directly (no SDK) to keep dependencies minimal.
 * The endpoint is: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
 *
 * (Llamar a la API de Gemini con un prompt y retornar el texto de respuesta.
 *  Usamos la API REST directamente (sin SDK) para mantener las dependencias mínimas.)
 */
async function callGemini(prompt: string): Promise<string> {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'NUXT_GEMINI_API_KEY is not configured',
    })
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  // Retry with exponential backoff on 429 (rate limit) errors
  // (Reintentar con backoff exponencial en errores 429 (límite de tasa))
  const MAX_RETRIES = 3
  let lastError: any = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await $fetch<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          // generationConfig controls the output: low temperature = more deterministic
          // (generationConfig controla la salida: temperatura baja = más determinista)
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            // Tell Gemini to respond in JSON
            // (Decirle a Gemini que responda en JSON)
            responseMimeType: 'application/json',
          },
        },
      })

      // Gemini response structure: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw createError({ statusCode: 502, message: 'Empty response from Gemini AI' })
      }

      return text
    } catch (err: any) {
      lastError = err
      const status = err?.response?.status ?? err?.statusCode ?? err?.status

      // Only retry on 429 (rate limit) or 503 (service unavailable)
      // (Solo reintentar en 429 (límite de tasa) o 503 (servicio no disponible))
      if ((status === 429 || status === 503) && attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt + 1) * 1000 // 2s, 4s, 8s
        console.warn(
          `[Gemini] Rate limited (${status}), retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // Sanitize error to never expose API key in client-facing messages
      const sanitizedError = createError({
        statusCode: status === 429 ? 429 : status || 500,
        message:
          status === 429
            ? 'AI service is temporarily rate-limited. Please wait a moment and try again.'
            : status === 503
              ? 'AI service is temporarily unavailable. Please try again later.'
              : 'AI analysis failed. Please try again later.',
      })
      throw sanitizedError
    }
  }

  // Sanitize the last error too
  throw createError({
    statusCode: 429,
    message: 'AI service is temporarily rate-limited. Please wait a moment and try again.',
  })
}

// ── Public functions ───────────────────────────────────────────────────────────

/**
 * Analyze a ticket's content to extract sentiment, priority, category, etc.
 *
 * PROMPT ENGINEERING NOTES:
 * - We give the AI a strict JSON schema to follow → deterministic parsing
 * - We list all valid enum values → prevents hallucinated categories
 * - We use few-shot examples by describing what each field means
 *
 * (NOTAS DE INGENIERÍA DE PROMPTS:
 *  - Damos a la IA un esquema JSON estricto → parsing determinista
 *  - Listamos todos los valores enum válidos → previene categorías alucinadas
 *  - Usamos ejemplos implícitos describiendo lo que significa cada campo)
 */
export async function analyzeTicket(subject: string, body: string): Promise<TicketAnalysis> {
  const prompt = `You are a customer support AI assistant for a multi-channel support platform.

Analyze the following customer support ticket and extract structured information.

TICKET:
Subject: ${subject}
Message: ${body}

Respond with a JSON object containing EXACTLY these fields:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "sentimentScore": <number between 0.0 and 1.0, where 1.0 is the most intense>,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "category": <one of: "billing", "technical", "account", "shipping", "product", "general", "feedback", "security", "integration", "onboarding">,
  "language": <ISO 639-1 code of the ticket language, e.g. "en", "es", "fr">,
  "summary": <1-2 sentence summary of the issue in the same language as the ticket>
}

RULES:
- sentiment: POSITIVE if grateful/happy, NEUTRAL if factual, NEGATIVE if frustrated/angry
- sentimentScore: 0.0 = barely any emotion, 1.0 = extremely emotional
- priority: URGENT if service is down or data loss risk, HIGH if significant impact, MEDIUM if standard request, LOW if informational
- category: choose the MOST relevant one from the list
- language: detect from the ticket text
- summary: be concise, factual, in the same language as the ticket`

  const text = await callGemini(prompt)

  try {
    const parsed = JSON.parse(text) as TicketAnalysis
    // Validate and clamp values (Validar y restringir valores)
    return {
      sentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(parsed.sentiment)
        ? parsed.sentiment
        : 'NEUTRAL',
      sentimentScore: Math.max(0, Math.min(1, Number(parsed.sentimentScore) || 0.5)),
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(parsed.priority)
        ? parsed.priority
        : 'MEDIUM',
      category: String(parsed.category || 'general').toLowerCase(),
      language: String(parsed.language || 'en').slice(0, 5),
      summary: String(parsed.summary || '').slice(0, 500),
    }
  } catch {
    // If JSON parsing fails, return safe defaults
    // (Si falla el parsing de JSON, retornar valores seguros por defecto)
    console.error('[Gemini] Failed to parse analysis response:', text)
    return {
      sentiment: 'NEUTRAL',
      sentimentScore: 0.5,
      priority: 'MEDIUM',
      category: 'general',
      language: 'en',
      summary: '',
    }
  }
}

/**
 * Generate a suggested reply for an agent to use when responding to a ticket.
 *
 * We provide the full conversation context so the AI can give a relevant reply
 * that takes into account what's already been said.
 *
 * (Generar una respuesta sugerida para que un agente use al responder a un ticket.
 *  Proporcionamos el contexto completo de la conversación para que la IA dé una
 *  respuesta relevante que tenga en cuenta lo que ya se ha dicho.)
 */
export async function suggestReply(
  subject: string,
  body: string,
  messages: Array<{ body: string; senderType: string }>,
  sentiment?: string | null,
  category?: string | null,
): Promise<SuggestedReply> {
  // Build conversation history for context (Construir historial de conversación para contexto)
  const conversationHistory = messages.map((m, i) => `[${m.senderType}] ${m.body}`).join('\n\n')

  const prompt = `You are a helpful, professional customer support agent. Generate a suggested reply for the following ticket.

TICKET INFO:
Subject: ${subject}
Original message: ${body}
${sentiment ? `Customer sentiment: ${sentiment}` : ''}
${category ? `Category: ${category}` : ''}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n` : ''}

Respond with a JSON object:
{
  "suggestedReply": "<the full reply text, professional and empathetic, in the same language as the conversation>",
  "confidence": <number between 0.0 and 1.0 — how confident you are this is a good reply>,
  "reasoning": "<1 sentence explaining your approach, in English>"
}

RULES:
- Match the language of the original ticket (if in Spanish, reply in Spanish, etc.)
- Be empathetic but professional
- If the customer is frustrated, acknowledge their frustration first
- Provide actionable next steps when possible
- Keep it concise: 2-4 paragraphs max
- Do NOT make up specific account details, order numbers, or prices`

  const text = await callGemini(prompt)

  try {
    const parsed = JSON.parse(text) as SuggestedReply
    return {
      suggestedReply: String(parsed.suggestedReply || ''),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
      reasoning: String(parsed.reasoning || ''),
    }
  } catch {
    console.error('[Gemini] Failed to parse reply suggestion:', text)
    return {
      suggestedReply: '',
      confidence: 0,
      reasoning: 'Failed to generate a reply suggestion',
    }
  }
}
