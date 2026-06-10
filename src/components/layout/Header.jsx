import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useRealtime } from '../../hooks/useRealtime'
import { supabase } from '../../services/supabase'
import { LogOut, User, LogIn, Bell, Sun, Moon, X, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user } = useApp()
  const { theme, toggleTheme } = useTheme()
  const { notifications, unreadCount, markAllRead } = useRealtime(user?.id)
  const [showNotifs, setShowNotifs] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-margin-desktop sticky top-0 z-30">
      <div>
        <h2 className="font-h3 text-h3 font-bold text-on-surface">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input className="bg-surface-container-low border border-outline-variant/30 rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all w-64 outline-none placeholder:text-outline/50" placeholder="Global search..." type="text" />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-[10px] font-bold text-on-error flex items-center justify-center ring-2 ring-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-outline-variant bg-surface shadow-glass z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                  <span className="text-label-sm font-semibold text-on-surface uppercase tracking-wider">Notificaciones</span>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all" title="Marcar todo leído">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-caption text-on-surface-variant">Sin notificaciones</div>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/20 last:border-0">
                        <span className="text-lg flex-shrink-0">{n.icon}</span>
                        <div className="min-w-0">
                          <p className="text-body-md text-on-surface">{n.message}</p>
                          <p className="text-caption text-on-surface-variant mt-0.5">
                            {new Date(n.time).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-outline-variant/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-primary/20">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-body-md font-medium text-on-surface leading-tight">{user.email}</p>
                <p className="text-caption text-on-surface-variant">CEO — Agency MX</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-xs px-4 py-2"
          >
            <LogIn className="w-4 h-4" /> Iniciar sesión
          </button>
        )}
      </div>
    </header>
  )
}
