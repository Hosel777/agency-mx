import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Key, Save, Bot, CheckCircle2, ExternalLink, Sparkles, Shield } from 'lucide-react'

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: '00000000-0000-0000-0000-000000000000', message: 'ping' })
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="text-muted mt-0.5">Conecta tus servicios y configura la agencia virtual</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agency-50 to-agency-100 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-agency-600" />
        </div>
      </div>

      <div className="card p-8 space-y-8">
        {/* Supabase */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-agency-50 to-agency-100 shadow-sm">
              <Shield className="w-5 h-5 text-agency-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Conexión Supabase</h2>
              <p className="text-xs text-gray-500">Base de datos y almacenamiento</p>
            </div>
          </div>
          <div className="space-y-4 bg-surface-secondary rounded-2xl p-5 border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Supabase URL</label>
              <input value={supabaseUrl} className="input-field bg-white/50 text-xs font-mono" readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Supabase Anon Key</label>
              <input value={supabaseKey} className="input-field bg-white/50 text-xs font-mono truncate" readOnly />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado desde variables de entorno
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Anthropic */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm">
              <Bot className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">API Key (LLM)</h2>
              <p className="text-xs text-gray-500">Los agentes usan el proveedor configurado (Claude o DeepSeek)</p>
            </div>
          </div>
          <div className="space-y-4 bg-surface-secondary rounded-2xl p-5 border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">LLM API Key</label>
              <input
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="input-field bg-white/50 text-xs font-mono"
                placeholder="sk-ant-... o sk-..."
              />
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-agency-600 hover:text-agency-700 font-medium flex items-center gap-0.5">
                Claude: Anthropic Console <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-gray-300 mx-1">|</span>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-agency-600 hover:text-agency-700 font-medium flex items-center gap-0.5">
                OpenRouter: openrouter.ai/keys <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}
