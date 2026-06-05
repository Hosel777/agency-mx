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
