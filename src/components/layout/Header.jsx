import { useApp } from '../../contexts/AppContext'
import { supabase } from '../../services/supabase'
import { LogOut, User, LogIn } from 'lucide-react'
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
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Panel de Control
      </h2>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              {user.email}
            </span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <LogIn className="w-4 h-4" /> Iniciar sesión
          </button>
        )}
      </div>
    </header>
  )
}
