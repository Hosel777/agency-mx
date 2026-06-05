import { supabase } from './lib/supabase.js'
import { callClaude } from './lib/anthropic.js'
import { CHAINS, AGENT_PROMPTS } from './lib/agents.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { requestId, apiKey: bodyKey } = req.body
  if (!requestId) {
    return res.status(400).json({ error: 'requestId required' })
  }

  const apiKey = bodyKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Configúrala en Settings o en variables de entorno.' })
  }

  try {
    const { data: request, error: reqError } = await supabase
      .from('client_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' })
    }

    await supabase
      .from('client_requests')
      .update({ status: 'in_progress' })
      .eq('id', requestId)

    // --- Step 1: Orchestrator ---
    const orchestratorPrompt = AGENT_PROMPTS['agents-orchestrator']
    const orchestratorMsg = `Analiza la siguiente solicitud de marketing:

Título: ${request.title}
Descripción: ${request.description}
Tipo de proyecto: ${request.project_type}
Presupuesto: $${request.budget || 'No definido'}
Fecha límite: ${request.deadline || 'No definida'}
Referencias: ${request.refs || 'Ninguna'}

Genera el plan de ejecución en formato JSON. Recuerda que debes definir qué cadena de agentes usar y qué debe producir cada uno.`

    const orchestratorResponse = await callClaude(
      orchestratorPrompt.systemPrompt,
      [{ role: 'user', content: orchestratorMsg }],
      apiKey
    )

    // Save orchestrator message
    await supabase.from('agent_messages').insert({
      request_id: requestId,
      agent_name: 'Agents Orchestrator',
      agent_id: 'agents-orchestrator',
      role: 'assistant',
      content: orchestratorResponse
    })

    // Parse orchestrator response (extract JSON)
    let plan
    try {
      const jsonMatch = orchestratorResponse.match(/\{[\s\S]*\}/)
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      plan = null
    }

    // Determine chain from orchestrator or fallback to project_type
    const chainId = plan?.chain || request.project_type || 'full'
    const chain = CHAINS[chainId] || CHAINS.full
    const agentSequence = chain.agents

    // If orchestrator specified custom agent instructions, use them
    const agentInstructions = {}
    if (plan?.agentes) {
      plan.agentes.forEach(a => {
        agentInstructions[a.id] = a.instrucciones
      })
    }

    // --- Step 2: Execute each agent in sequence ---
    const completedDeliverables = []
    let previousContext = `Solicitud original:\nTítulo: ${request.title}\nDescripción: ${request.description}\n\n`

    for (const agentId of agentSequence) {
      const agentConfig = AGENT_PROMPTS[agentId]
      if (!agentConfig) continue

      // Update status
      await supabase
        .from('client_requests')
        .update({ status: `Procesando: ${agentConfig.name}` })
        .eq('id', requestId)

      // Build the message with context from previous agents
      let agentMessage = previousContext

      if (agentInstructions[agentId]) {
        agentMessage += `Instrucciones específicas: ${agentInstructions[agentId]}\n\n`
      }

      agentMessage += `Basándote en la información anterior y el contexto del proyecto, genera tu entregable como ${agentConfig.name}.`

      // Call Claude
      const agentResponse = await callClaude(
        agentConfig.systemPrompt,
        [{ role: 'user', content: agentMessage }],
        apiKey
      )

      // Save agent message
      await supabase.from('agent_messages').insert({
        request_id: requestId,
        agent_name: agentConfig.name,
        agent_id: agentId,
        role: 'assistant',
        content: agentResponse
      })

      // Save as deliverable
      const deliverableName = `${agentConfig.emoji} ${agentConfig.name}: ${request.title}`
      const { data: deliverable } = await supabase.from('deliverables').insert({
        request_id: requestId,
        agent_id: agentId,
        agent_name: agentConfig.name,
        name: deliverableName,
        description: `Entregable generado por ${agentConfig.name} para: ${request.title}`,
        content: agentResponse,
        deliverable_type: agentConfig.deliverableType || 'text',
        status: 'completed'
      }).select().single()

      if (deliverable) {
        completedDeliverables.push(deliverable)
      }

      // Append to context for next agent
      previousContext += `\n\n--- ${agentConfig.name} ---\n${agentResponse.substring(0, 3000)}`
    }

    // --- Step 3: Mark request as completed ---
    const allAgentsCount = agentSequence.length
    const completedCount = completedDeliverables.length

    await supabase
      .from('client_requests')
      .update({ status: 'completed' })
      .eq('id', requestId)

    return res.status(200).json({
      success: true,
      requestId,
      agentsActivated: allAgentsCount,
      deliverablesGenerated: completedCount,
      plan: plan || { chain: chainId, agents: agentSequence }
    })

  } catch (error) {
    console.error('Orchestration error:', error)

    await supabase
      .from('client_requests')
      .update({ status: 'error' })
      .eq('id', requestId)

    return res.status(500).json({
      error: error.message,
      requestId
    })
  }
}
