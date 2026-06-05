import { supabase } from '../services/supabase'

export function useSupabase() {
  const getRequests = async () => {
    const { data } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }

  const getAgents = async () => {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .order('level', { ascending: true })
    return data || []
  }

  return { getRequests, getAgents }
}
