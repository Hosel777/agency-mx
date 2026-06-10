import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, getCurrentUser } from '../services/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [agentsActive, setAgentsActive] = useState([])
  const [role, setRole] = useState('viewer')

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      if (u) {
        supabase.from('user_roles').select('role').eq('user_id', u.id).single().then(({ data }) => {
          if (data?.role) setRole(data.role)
        })
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
  }, [])

  useEffect(() => {
    if (user) fetchRequests()
  }, [user, fetchRequests])

  return (
    <AppContext.Provider value={{
      user, loading, role, setRole,
      requests, fetchRequests,
      agentsActive, setAgentsActive,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
