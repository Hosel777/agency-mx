const PROVIDER = process.env.LLM_PROVIDER || 'claude'
const MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-20250514'

export async function callLLM(systemPrompt, messages, apiKey) {
  if (PROVIDER === 'openrouter') {
    return callOpenRouter(systemPrompt, messages, apiKey)
  }
  return callClaude(systemPrompt, messages, apiKey)
}

async function callOpenRouter(systemPrompt, messages, apiKey) {
  const openaiMessages = []
  if (systemPrompt) {
    openaiMessages.push({ role: 'system', content: systemPrompt })
  }
  for (const msg of messages) {
    openaiMessages.push({ role: msg.role, content: msg.content })
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://agency-mx.vercel.app',
      'X-Title': 'Agency MX'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: openaiMessages
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
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
