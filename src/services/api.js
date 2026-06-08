import { supabase } from './supabase'

export async function submitRequest(requestData) {
  const { data, error } = await supabase
    .from('client_requests')
    .insert(requestData)
    .select()
    .single()
  return { data, error }
}

export async function fetchRequest(id) {
  const { data, error } = await supabase
    .from('client_requests')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function fetchAgentMessages(requestId, agentId) {
  let query = supabase
    .from('agent_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query
  return { data, error }
}

export async function fetchDeliverables(requestId) {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function updateRequestStatus(id, status) {
  const { error } = await supabase
    .from('client_requests')
    .update({ status })
    .eq('id', id)
  return { error }
}

export async function approveDeliverable(id) {
  const { error } = await supabase
    .from('deliverables')
    .update({ status: 'approved' })
    .eq('id', id)
  return { error }
}

// --- Orchestration API (llama al backend) ---

function getApiKey() {
  return localStorage.getItem('agency_mx_anthropic_key') || undefined
}

export async function startOrchestration(requestId, mode = 'execute') {
  const response = await fetch('/api/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, apiKey: getApiKey(), mode })
  })
  return response.json()
}

export async function generateQuote(requestId) {
  return startOrchestration(requestId, 'quote')
}

export async function sendQuote(requestId) {
  const response = await fetch('/api/send-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId })
  })
  return response.json()
}

export async function sendChatMessage(requestId, message, agentId = null) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, message, agentId, apiKey: getApiKey() })
  })
  return response.json()
}

export async function deployWebsite(deliverableId, requestId, content, title) {
  const response = await fetch('/api/deploy-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliverableId, requestId, content, title })
  })
  return response.json()
}
