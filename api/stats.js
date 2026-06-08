export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { supabase } = await import('./lib/supabase.js')

    const { data: requests, error: reqError } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (reqError) {
      return res.status(500).json({ error: reqError.message })
    }

    const { count: deliverablesCount, error: delError } = await supabase
      .from('deliverables')
      .select('*', { count: 'exact', head: true })

    const { count: messagesCount, error: msgError } = await supabase
      .from('agent_messages')
      .select('*', { count: 'exact', head: true })

    const total = requests?.length || 0
    const completed = requests?.filter(r => r.status === 'completed').length || 0
    const inProgress = requests?.filter(r => r.status === 'in_progress').length || 0
    const pending = requests?.filter(r => r.status === 'pending').length || 0
    const quoting = requests?.filter(r => r.status === 'quoting' || r.status === 'quote_sent').length || 0

    const socialPulseCount = requests?.filter(r => r.source === 'socialpulse').length || 0
    const manualCount = requests?.filter(r => !r.source || r.source === 'manual' || r.source === 'demo').length || 0

    const completedTimes = (requests || [])
      .filter(r => r.status === 'completed' && r.created_at)
      .map(r => {
        const end = new Date(r.updated_at || r.created_at)
        const start = new Date(r.created_at)
        return (end - start) / (1000 * 60)
      })

    const avgTimeMinutes = completedTimes.length > 0
      ? Math.round(completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length)
      : 0

    const agentsUsed = new Set()
    ;(requests || []).forEach(r => {
      if (r.orchestration_plan?.agents) {
        r.orchestration_plan.agents.forEach(a => agentsUsed.add(a))
      }
    })

    const statusBreakdown = {
      pending, quoting, in_progress: inProgress,
      completed, rejected: requests?.filter(r => r.status === 'rejected').length || 0
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalRequests: total,
        completedRequests: completed,
        inProgressRequests: inProgress,
        pendingRequests: pending,
        quotingRequests: quoting,
        totalDeliverables: deliverablesCount || 0,
        totalAgentMessages: messagesCount || 0,
        uniqueAgentsUsed: agentsUsed.size,
        avgCompletionTimeMinutes: avgTimeMinutes,
        socialPulseCount,
        manualCount,
        statusBreakdown,
        totalAgentsAvailable: 112
      }
    })

  } catch (error) {
    console.error('Stats error:', error)
    return res.status(500).json({ error: error.message })
  }
}
