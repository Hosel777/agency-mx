import { useApp } from '../../contexts/AppContext'
import { supabase } from '../../services/supabase'
import { LogOut, User, LogIn, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          Panel de Control
        </h2>
        <p className="text-xs text-gray-500">Agencia de Marketing Virtual</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-agency-500 ring-2 ring-white" />
        </button>

        {/* User */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-agency-400 to-agency-600 flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user.email}</p>
                <p className="text-[11px] text-gray-500">CEO — Agency MX</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
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
