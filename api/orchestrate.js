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

    const sbUpdate = async (table, data, eqCol, eqVal) => {
      const { error } = await supabase.from(table).update(data).eq(eqCol, eqVal)
      if (error) console.error(`Supabase update error (${table}):`, error)
      return error
    }
    const sbInsert = async (table, data) => {
      const { error } = await supabase.from(table).insert(data)
      if (error) console.error(`Supabase insert error (${table}):`, error)
      return error
    }

    await sbUpdate('client_requests', { status: 'quoting' }, 'id', requestId)

    // Paso 1: Ejecutar el Orquestador para generar el plan
    const orcResult = await runOrchestrator(requestId, request, apiKey)

    await sbInsert('agent_messages', {
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

    await sbUpdate('client_requests', { orchestration_plan: planData }, 'id', requestId)

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

    await sbInsert('agent_messages', {
      request_id: requestId,
      agent_name: 'Sales',
      agent_id: 'sales',
      role: 'assistant',
      content: quote
    })

    await sbInsert('deliverables', {
      request_id: requestId,
      agent_id: 'sales',
      agent_name: 'Sales',
      name: `📊 Presupuesto: ${request.title}`,
      description: `Presupuesto generado por Sales Agent para: ${request.title}`,
      content: quote,
      deliverable_type: 'text',
      status: 'completed'
    })

    const finalErr = await sbUpdate('client_requests', { status: 'quote_sent' }, 'id', requestId)
    if (finalErr) {
      console.error('CRITICAL: status update failed — check SUPABASE_SERVICE_ROLE_KEY in Vercel')
      return res.status(200).json({ success: true, mode: 'quote', requestId, plan: planData, quote, warning: 'Status no actualizado en DB — verificar clave' })
    }

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

    // ─── Load existing deliverables to know what's been done ───
    const { data: existingDeliverables } = await supabase
      .from('deliverables')
      .select('agent_id, content, agent_name')
      .eq('request_id', requestId)
      .eq('status', 'completed')

    const doneAgentIds = new Set(existingDeliverables?.map(d => d.agent_id) || [])

    // ─── STEP 1: Generate or retrieve plan ───
    let plan, chainId, chain, agentSequence, agentInstructions

    if (request.orchestration_plan) {
      const saved = request.orchestration_plan
      chainId = saved.chain || request.project_type || 'full'
      chain = CHAINS[chainId] || CHAINS.full
      agentSequence = chain.agents
      plan = saved
      agentInstructions = {}
      if (saved.agentes) {
        saved.agentes.forEach(a => { agentInstructions[a.id] = a.instrucciones })
      }
    } else {
      if (doneAgentIds.size > 0) {
        return res.status(400).json({ error: 'No plan found but deliverables exist — inconsistent state' })
      }

      await addLog(requestId, 'Sistema', 'Iniciando orquestación...')
      await addLog(requestId, 'Sistema', `Tipo de proyecto: ${request.project_type}`)
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

      await supabase.from('client_requests').update({
        orchestration_plan: { chain: chainId, agents: agentSequence, agentes: plan?.agentes || [] }
      }).eq('id', requestId)
    }

    // ─── STEP 2: Find NEXT unprocessed agent ───
    const nextIndex = agentSequence.findIndex(id => !doneAgentIds.has(id))
    if (doneAgentIds.size === 0) {
      // First call — set in_progress
      await supabase.from('client_requests').update({ status: 'in_progress' }).eq('id', requestId)
    }

    if (nextIndex === -1) {
      // All agents done!
      await addLog(requestId, 'Sistema', `Orquestación completada: ${doneAgentIds.size} entregables generados por ${agentSequence.length} agentes`)
      await addLog(requestId, 'Sistema', 'Los entregables están listos para revisión en Aprobaciones')
      await supabase.from('client_requests').update({ status: 'completed' }).eq('id', requestId)
      return res.status(200).json({ success: true, done: true, step: agentSequence.length, total: agentSequence.length })
    }

    // ─── STEP 3: Execute the NEXT agent ───
    const agentId = agentSequence[nextIndex]
    const agentConfig = AGENT_PROMPTS[agentId]
    if (!agentConfig) {
      // Skip missing agent — try next call
      return res.status(200).json({ success: true, step: nextIndex + 1, total: agentSequence.length, skipped: agentId })
    }

    await addLog(requestId, agentConfig.name, `Trabajando... (${nextIndex + 1}/${agentSequence.length})`)

    // Build context from previous deliverables
    const brandContext = formatBrandContext(request.brand_data, request.images)
    let previousContext = `Solicitud original:\nTítulo: ${request.title}\nDescripción: ${request.description}\n${brandContext}\n`

    if (existingDeliverables) {
      for (const d of existingDeliverables) {
        previousContext += `\n\n--- ${d.agent_name} ---\n${(d.content || '').substring(0, 3000)}`
      }
    }

    let agentMessage = previousContext
    if (agentInstructions[agentId]) {
      agentMessage += `\n\nInstrucciones específicas: ${agentInstructions[agentId]}`
    }
    agentMessage += `\n\nBasándote en la información anterior y el contexto del proyecto, genera tu entregable como ${agentConfig.name}.`

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
    await supabase.from('deliverables').insert({
      request_id: requestId,
      agent_id: agentId,
      agent_name: agentConfig.name,
      name: deliverableName,
      description: `Entregable generado por ${agentConfig.name} para: ${request.title}`,
      content: agentResponse,
      deliverable_type: agentConfig.deliverableType || 'text',
      status: 'completed'
    })

    // ─── STEP 4: Check if all done ───
    const remainingCount = agentSequence.slice(nextIndex + 1).filter(id => AGENT_PROMPTS[id]).length
    if (remainingCount === 0) {
      await addLog(requestId, 'Sistema', `Orquestación completada: ${doneAgentIds.size + 1} entregables generados por ${agentSequence.length} agentes`)
      await addLog(requestId, 'Sistema', 'Los entregables están listos para revisión en Aprobaciones')
      await supabase.from('client_requests').update({ status: 'completed' }).eq('id', requestId)
      return res.status(200).json({ success: true, done: true, step: nextIndex + 1, total: agentSequence.length })
    }

    return res.status(200).json({
      success: true,
      done: false,
      step: nextIndex + 1,
      total: agentSequence.length,
      currentAgent: agentConfig.name
    })

  } catch (error) {
    console.error('Orchestration error:', error)
    await addLog(requestId, 'Sistema', `Error: ${error.message}`, 'error')
    await supabase.from('client_requests').update({ status: 'error' }).eq('id', requestId)
    return res.status(500).json({ error: error.message, requestId })
  }
}
