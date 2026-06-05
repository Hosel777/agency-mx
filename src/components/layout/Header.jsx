import { useApp } from '../../contexts/AppContext'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user } = useApp()

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
            <button className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-400">No autenticado</span>
        )}
      </div>
    </header>
  )
}
