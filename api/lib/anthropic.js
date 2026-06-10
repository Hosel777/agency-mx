const PROVIDER = process.env.LLM_PROVIDER || 'claude'
const MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-20250514'
const TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT || '8000')
const FALLBACK_MODELS = (process.env.LLM_FALLBACK_MODELS || [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
  'mistralai/mistral-7b-instruct:free'
].join(',')).split(',').filter(Boolean)

export async function callLLM(systemPrompt, messages, apiKey) {
  if (PROVIDER === 'openrouter') {
    return callOpenRouter(systemPrompt, messages, apiKey)
  }
  return callClaude(systemPrompt, messages, apiKey)
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(id)
  }
}

async function callOpenRouter(systemPrompt, messages, apiKey) {
  const openaiMessages = []
  if (systemPrompt) {
    openaiMessages.push({ role: 'system', content: systemPrompt })
  }
  for (const msg of messages) {
    openaiMessages.push({ role: msg.role, content: msg.content })
  }

  const modelsToTry = [MODEL, ...FALLBACK_MODELS]
  let lastError = null

  for (const model of modelsToTry) {
    try {
      const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://agency-mx.vercel.app',
          'X-Title': 'Agency MX'
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          messages: openaiMessages
        })
      }, TIMEOUT_MS)

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }

      const errorText = await response.text()
      lastError = new Error(`OpenRouter error (${response.status}) for ${model}: ${errorText}`)
      console.warn(`[Fallback] ${model} failed (${response.status}), trying next...`)
    } catch (err) {
      lastError = err
      console.warn(`[Fallback] ${model} error: ${err.message}, trying next...`)
    }
  }

  throw lastError || new Error('All OpenRouter models failed')
}

async function callClaude(systemPrompt, messages, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error (${response.status}): ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}
