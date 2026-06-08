import { supabase } from './lib/supabase.js'
import { callLLM } from './lib/anthropic.js'
import { CHAINS, AGENT_PROMPTS } from './lib/agents.js'
import { formatBrandContext } from './brand-utils.js'

async function addLog(requestId, agent, text, level = 'info') {
  const log = { time: new Date().toISOString(), agent, text, level }
  const { data } = await supabase.from('client_requests').select('orchestration_logs').eq('id', requestId).single()
  const logs = data?.orchestration_logs || []
  logs.push(log)
  await supabase.from('client_requests').update({ orchestration_logs: logs }).eq('id', requestId)
}

async function runOrchestrator(requestId, request, apiKey) {
  const prompt = AGENT_PROMPTS['agents-orchestrator']
  const msg = `Analiza la siguiente solicitud de marketing:

Título: ${request.title}
Descripción: ${request.description}
Tipo de proyecto: ${request.project_type}
Presupuesto: $${request.budget || 'No definido'}
Fecha límite: ${request.deadline || 'No definida'}
Referencias: ${request.refs || 'Ninguna'}

Genera el plan de ejecución en formato JSON. Recuerda que debes definir qué cadena de agentes usar y qué debe producir cada uno.`

  const response = await callLLM(prompt.systemPrompt, [{ role: 'user', content: msg }], apiKey)

  let plan
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch { plan = null }

  const chainId = plan?.chain || request.project_type || 'full'
  const chain = CHAINS[chainId] || CHAINS.full

  const result = { plan, chainId, chain, response }
  return result
}

async function handleQuoteMode(requestId, apiKey, res) {
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
      .update({ status: 'quoting' })
      .eq('id', requestId)

    // Paso 1: Ejecutar el Orquestador para generar el plan
    const orcResult = await runOrchestrator(requestId, request, apiKey)

    await supabase.from('agent_messages').insert({
      request_id: requestId,
      agent_name: 'Agents Orchestrator',
      agent_id: 'agents-orchestrator',
      role: 'assistant',
      content: orcResult.response
    })

    // Guardar el plan en la solicitud para usarlo después en la ejecución
    const planData = {
      chain: orcResult.chainId,
      agents: orcResult.chain.agents,
      agentes: orcResult.plan?.agentes || [],
      entregables_esperados: orcResult.plan?.entregables_esperados || []
    }

    await supabase
      .from('client_requests')
      .update({ orchestration_plan: planData })
      .eq('id', requestId)

    // Paso 2: Ejecutar el Sales Agent con el plan ya definido
    const salesAgent = AGENT_PROMPTS['sales']
    const agentesList = orcResult.chain.agents
      .map(id => AGENT_PROMPTS[id]?.name || id)
      .join(', ')

    const salesMsg = `Genera un presupuesto profesional para la siguiente solicitud:

Título: ${request.title}
Descripción: ${request.description}
Tipo de proyecto: ${request.project_type} (${orcResult.chain.label})
Presupuesto del cliente: $${request.budget || 'No especificado'}
Fecha límite: ${request.deadline || 'No especificada'}
Referencias: ${request.refs || 'Ninguna'}

AGENTES A ACTIVAR (${orcResult.chain.agents.length}):
${agentesList}

Basado en estos agentes/servicios, genera un presupuesto detallado con:
- Precio individual por cada servicio/agente
- Precio total del proyecto
- Forma de pago sugerida
- Tiempo de entrega estimado`

    const quote = await callLLM(salesAgent.systemPrompt, [{ role: 'user', content: salesMsg }], apiKey)

    await supabase.from('agent_messages').insert({
      request_id: requestId,
      agent_name: 'Sales',
      agent_id: 'sales',
      role: 'assistant',
      content: quote
    })

    await supabase.from('deliverables').insert({
      request_id: requestId,
      agent_id: 'sales',
      agent_name: 'Sales',
      name: `📊 Presupuesto: ${request.title}`,
      description: `Presupuesto generado por Sales Agent para: ${request.title}`,
      content: quote,
      deliverable_type: 'text',
      status: 'completed'
    })

    await supabase
      .from('client_requests')
      .update({ status: 'quote_sent', quote_sent_at: new Date().toISOString() })
      .eq('id', requestId)

    return res.status(200).json({
      success: true,
      mode: 'quote',
      requestId,
      plan: planData,
      quote
    })

  } catch (error) {
    console.error('Quote error:', error)
    await supabase.from('client_requests').update({ status: 'error' }).eq('id', requestId)
    return res.status(500).json({ error: error.message })
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { requestId, apiKey: bodyKey, mode } = req.body
  if (!requestId) {
    return res.status(400).json({ error: 'requestId required' })
  }

  const provider = process.env.LLM_PROVIDER || 'claude'
  const apiKey = bodyKey || (provider === 'openrouter' ? process.env.LLM_API_KEY : (process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY))
  if (!apiKey) {
    return res.status(500).json({ error: `API Key no configurada para ${provider}. Configúrala en Settings o en Vercel (LLM_API_KEY).` })
  }

  // Mode "quote": solo ejecuta el Sales Agent para generar presupuesto
  if (mode === 'quote') {
    return handleQuoteMode(requestId, apiKey, res)
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

    await addLog(requestId, 'Sistema', 'Iniciando orquestación...')
    await addLog(requestId, 'Sistema', `Tipo de proyecto: ${request.project_type}`)

    await supabase
      .from('client_requests')
      .update({ status: 'in_progress' })
      .eq('id', requestId)

    // --- Step 1: Use saved plan (from quote mode) or run orchestrator ---
    let plan, chainId, chain, agentSequence, agentInstructions

    if (request.orchestration_plan) {
      // Reuse plan from quote step
      const saved = request.orchestration_plan
      chainId = saved.chain || request.project_type || 'full'
      chain = CHAINS[chainId] || CHAINS.full
      agentSequence = chain.agents
      plan = saved

      agentInstructions = {}
      if (saved.agentes) {
        saved.agentes.forEach(a => { agentInstructions[a.id] = a.instrucciones })
      }

      await addLog(requestId, 'Sistema', 'Usando plan generado durante el presupuesto')
      await addLog(requestId, 'Agents Orchestrator', `Plan recuperado: ${chain.label} (${agentSequence.length} agentes)`)
    } else {
      // Run orchestrator to generate plan
      await addLog(requestId, 'Agents Orchestrator', 'Analizando solicitud y generando plan de ejecución...')
      const orchestratorPrompt = AGENT_PROMPTS['agents-orchestrator']
      const orchestratorMsg = `Analiza la siguiente solicitud de marketing:

Título: ${request.title}
Descripción: ${request.description}
Tipo de proyecto: ${request.project_type}
Presupuesto: $${request.budget || 'No definido'}
Fecha límite: ${request.deadline || 'No definida'}
Referencias: ${request.refs || 'Ninguna'}

Genera el plan de ejecución en formato JSON. Recuerda que debes definir qué cadena de agentes usar y qué debe producir cada uno.`

      const orchestratorResponse = await callLLM(
        orchestratorPrompt.systemPrompt,
        [{ role: 'user', content: orchestratorMsg }],
        apiKey
      )

      await addLog(requestId, 'Agents Orchestrator', 'Plan de ejecución generado')

      await supabase.from('agent_messages').insert({
        request_id: requestId,
        agent_name: 'Agents Orchestrator',
        agent_id: 'agents-orchestrator',
        role: 'assistant',
        content: orchestratorResponse
      })

      try {
        const jsonMatch = orchestratorResponse.match(/\{[\s\S]*\}/)
        plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      } catch { plan = null }

      chainId = plan?.chain || request.project_type || 'full'
      chain = CHAINS[chainId] || CHAINS.full
      agentSequence = chain.agents

      await addLog(requestId, 'Agents Orchestrator', `Cadena seleccionada: ${chain.label} (${agentSequence.length} agentes)`)

      agentInstructions = {}
      if (plan?.agentes) {
        plan.agentes.forEach(a => { agentInstructions[a.id] = a.instrucciones })
      }

      // Save plan for future use
      await supabase.from('client_requests').update({
        orchestration_plan: { chain: chainId, agents: agentSequence, agentes: plan?.agentes || [] }
      }).eq('id', requestId)
    }

    // --- Step 2: Execute each agent ---
    const completedDeliverables = []
    const brandContext = formatBrandContext(request.brand_data, request.images)
    let previousContext = `Solicitud original:\nTítulo: ${request.title}\nDescripción: ${request.description}\n${brandContext}\n`

    for (let i = 0; i < agentSequence.length; i++) {
      const agentId = agentSequence[i]
      const agentConfig = AGENT_PROMPTS[agentId]
      if (!agentConfig) continue

      await addLog(requestId, agentConfig.name, `Trabajando... (${i + 1}/${agentSequence.length})`)
      await addLog(requestId, 'Sistema', `Procesando: ${agentConfig.name}`)

      let agentMessage = previousContext
      if (agentInstructions[agentId]) {
        agentMessage += `Instrucciones específicas: ${agentInstructions[agentId]}\n\n`
      }
      agentMessage += `Basándote en la información anterior y el contexto del proyecto, genera tu entregable como ${agentConfig.name}.`

      const agentResponse = await callLLM(
        agentConfig.systemPrompt,
        [{ role: 'user', content: agentMessage }],
        apiKey
      )

      await addLog(requestId, agentConfig.name, 'Entregable generado')

      await supabase.from('agent_messages').insert({
        request_id: requestId,
        agent_name: agentConfig.name,
        agent_id: agentId,
        role: 'assistant',
        content: agentResponse
      })

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

      previousContext += `\n\n--- ${agentConfig.name} ---\n${agentResponse.substring(0, 3000)}`
    }

    // --- Step 3: Complete ---
    await addLog(requestId, 'Sistema', `Orquestación completada: ${completedDeliverables.length} entregables generados por ${agentSequence.length} agentes`)
    await addLog(requestId, 'Sistema', 'Los entregables están listos para revisión en Aprobaciones')

    await supabase
      .from('client_requests')
      .update({ status: 'completed' })
      .eq('id', requestId)

    return res.status(200).json({
      success: true,
      requestId,
      agentsActivated: agentSequence.length,
      deliverablesGenerated: completedDeliverables.length,
      plan: plan || { chain: chainId, agents: agentSequence }
    })

  } catch (error) {
    console.error('Orchestration error:', error)

    await addLog(requestId, 'Sistema', `Error: ${error.message}`, 'error')

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
