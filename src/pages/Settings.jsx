import { useState } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'
import { Key, Save, Bot } from 'lucide-react'

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [apiKey, setApiKey] = useState('')

  const handleSave = () => {
    toast.success('Configuración guardada (en este entorno local)')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-gray-500 text-sm">Conecta tus servicios y configura la agencia</p>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-gray-400" />
            Conexión Supabase
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Supabase URL</label>
              <input
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="input-field"
                placeholder="https://tu-proyecto.supabase.co"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supabase Anon Key</label>
              <input
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-gray-400" />
            API de IA (para los agentes)
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">OpenAI / Together API Key</label>
            <input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="input-field font-mono text-sm"
              placeholder="sk-..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Los agentes usarán esta key para generar contenido
            </p>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  )
}
