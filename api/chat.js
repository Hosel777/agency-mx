import { supabase } from './lib/supabase.js'
import { callLLM } from './lib/anthropic.js'
import { AGENT_PROMPTS } from './lib/agents.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { requestId, message, agentId, apiKey: bodyKey } = req.body
  if (!requestId || !message) {
    return res.status(400).json({ error: 'requestId and message required' })
  }

  const apiKey = bodyKey || process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key no configurada. Configúrala en Settings (ANTHROPIC_API_KEY o LLM_API_KEY).' })
  }

  try {
    const agentIdToUse = agentId || 'agents-orchestrator'
    const agentConfig = AGENT_PROMPTS[agentIdToUse]

    if (!agentConfig) {
      return res.status(400).json({ error: `Agent '${agentIdToUse}' not found` })
    }

    // Load previous messages for context
    const { data: previousMessages } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Format previous messages for Claude
    const conversationHistory = (previousMessages || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: `${msg.agent_name || 'Usuario'}: ${msg.content}`
    }))

    // Load request context
    const { data: request } = await supabase
      .from('client_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    const contextIntro = `Contexto del proyecto: ${request?.title || 'Sin título'}\n${request?.description || ''}\n\n`

    // Save user message
    await supabase.from('agent_messages').insert({
      request_id: requestId,
      agent_name: 'Usuario',
      agent_id: 'user',
      role: 'user',
      content: message
    })

    // Call Claude
    const claudeMessages = [
      ...conversationHistory.slice(-10),
      { role: 'user', content: contextIntro + message }
    ]

    const response = await callLLM(agentConfig.systemPrompt, claudeMessages, apiKey)

    // Save assistant response
    await supabase.from('agent_messages').insert({
      request_id: requestId,
      agent_name: agentConfig.name,
      agent_id: agentIdToUse,
      role: 'assistant',
      content: response
    })

    return res.status(200).json({
      success: true,
      agent: agentConfig.name,
      response
    })

  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({ error: error.message })
  }
}
