import { useCallback } from 'react'
import { supabase } from '../services/supabase'

export function useAuditLog(userId) {
  const log = useCallback(async (action, details = {}) => {
    if (!userId) return
    try {
      await supabase.from('audit_log').insert({
        user_id: userId,
        action,
        details,
        ip: 'client',
        user_agent: navigator.userAgent,
      })
    } catch (err) {
      console.warn('Audit log error:', err)
    }
  }, [userId])

  return { log }
}
