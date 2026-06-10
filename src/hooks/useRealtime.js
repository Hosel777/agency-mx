import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export function useRealtime(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const unreadRef = useRef(0)

  const addNotification = useCallback((n) => {
    setNotifications(prev => [n, ...prev])
    unreadRef.current += 1
    setUnreadCount(unreadRef.current)
    toast(n.message, { icon: n.icon, duration: 4000 })
  }, [])

  const markAllRead = useCallback(() => {
    unreadRef.current = 0
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'client_requests',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const r = payload.new
        addNotification({
          id: `req-${r.id}-${Date.now()}`,
          type: 'request_created',
          message: `Nueva solicitud: ${r.title}`,
          icon: '📋',
          data: r,
          time: new Date().toISOString(),
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_requests',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const r = payload.new
        const statusMap = {
          quoting: { msg: 'Generando presupuesto...', icon: '💰' },
          quote_sent: { msg: 'Presupuesto listo', icon: '📄' },
          in_progress: { msg: 'Agentes trabajando', icon: '🤖' },
          completed: { msg: 'Solicitud completada', icon: '✅' },
        }
        const s = statusMap[r.status]
        if (s) {
          addNotification({
            id: `req-${r.id}-${r.status}-${Date.now()}`,
            type: 'status_change',
            message: `${r.title}: ${s.msg}`,
            icon: s.icon,
            data: r,
            time: new Date().toISOString(),
          })
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deliverables',
      }, (payload) => {
        const d = payload.new
        addNotification({
          id: `del-${d.id}-${Date.now()}`,
          type: 'deliverable',
          message: `Nuevo entregable: ${d.name || 'Sin nombre'}`,
          icon: '📎',
          data: d,
          time: new Date().toISOString(),
        })
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_messages',
      }, (payload) => {
        const m = payload.new
        if (m.agent_name && m.agent_name !== 'Usuario') {
          addNotification({
            id: `msg-${m.id}-${Date.now()}`,
            type: 'agent_message',
            message: `${m.agent_name}: ${m.content?.slice(0, 80)}${m.content?.length > 80 ? '...' : ''}`,
            icon: '💬',
            data: m,
            time: new Date().toISOString(),
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, addNotification])

  return { notifications, unreadCount, markAllRead }
}
