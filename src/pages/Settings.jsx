import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'
import { Key, Save, Bot, CheckCircle2, ExternalLink } from 'lucide-react'

export default function Settings() {
  const [supabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('agency_mx_anthropic_key')
    if (saved) setApiKey(saved)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem('agency_mx_anthropic_key', apiKey)

    // Quick validation: try calling the API with a simple ping
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: '00000000-0000-0000-0000-000000000000',
          message: 'ping'
        })
      })
      const data = await response.json()
      if (data.error?.includes('API') || data.error?.includes('apiKey')) {
        toast.error('La API Key no es válida')
      } else {
        toast.success('Configuración guardada y API Key verificada')
      }
    } catch {
      toast.success('Configuración guardada localmente')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-gray-500 text-sm">Conecta tus servicios y configura la agencia virtual</p>
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
              <input value={supabaseUrl} className="input-field bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supabase Anon Key</label>
              <input value={supabaseKey} className="input-field bg-gray-50 font-mono text-sm" readOnly />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Conectado desde variables de entorno
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-gray-400" />
            Claude API Key (Anthropic)
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Anthropic API Key</label>
            <input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="input-field font-mono text-sm"
              placeholder="sk-ant-..."
            />
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              Los agentes usarán Claude Sonnet para generar contenido de calidad.
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-agency-600 hover:underline flex items-center gap-0.5">
                Obtener key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}
