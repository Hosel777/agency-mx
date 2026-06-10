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
    <header className="h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-margin-desktop sticky top-0 z-30">
      <div>
        <h2 className="font-h3 text-h3 font-bold text-on-surface">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input className="bg-surface-container-low border border-outline-variant/30 rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all w-64 outline-none placeholder:text-outline/50" placeholder="Global search..." type="text" />
        </div>

        <button className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
        </button>

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
