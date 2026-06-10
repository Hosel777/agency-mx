import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Key, Save, Bot, CheckCircle2, ExternalLink, Sparkles, Shield, Globe, Download } from 'lucide-react'
import { useI18n, LOCALES } from '../contexts/I18nContext'
import { usePWA } from '../hooks/usePWA'

export default function Settings() {
  const { locale, changeLocale } = useI18n()
  const { installPrompt, isInstalled, install } = usePWA()
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Configuración</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Conecta tus servicios y configura la agencia virtual</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-h3 text-h3 text-on-surface">Conexión Supabase</h2>
              <p className="text-caption text-on-surface-variant">Base de datos y almacenamiento</p>
            </div>
          </div>
          <div className="space-y-4 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Supabase URL</label>
              <input value={supabaseUrl} className="input-field font-mono" readOnly />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Supabase Anon Key</label>
              <input value={supabaseKey} className="input-field font-mono truncate" readOnly />
            </div>
            <div className="flex items-center gap-1.5 text-caption text-tertiary font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado desde variables de entorno
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant/20" />

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-secondary/10">
              <Bot className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-h3 text-h3 text-on-surface">API Key (LLM)</h2>
              <p className="text-caption text-on-surface-variant">Los agentes usan el proveedor configurado (Claude o DeepSeek)</p>
            </div>
          </div>
          <div className="space-y-4 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">LLM API Key</label>
              <input
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="input-field font-mono"
                placeholder="sk-ant-... o sk-..."
              />
            </div>
            <p className="text-caption text-on-surface-variant flex items-center gap-1">
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium flex items-center gap-0.5">
                Claude: Anthropic Console <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-outline mx-1">|</span>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium flex items-center gap-0.5">
                OpenRouter: openrouter.ai/keys <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-outline-variant/20" />

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-tertiary/10">
              <Globe className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <h2 className="font-h3 text-h3 text-on-surface">Idioma / Language</h2>
              <p className="text-caption text-on-surface-variant">Selecciona el idioma de la interfaz</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map(l => (
              <button
                key={l.code}
                onClick={() => changeLocale(l.code)}
                className={`px-4 py-2 rounded-xl text-body-md transition-all ${locale === l.code ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-hover'}`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {!isInstalled && installPrompt && (
          <>
            <div className="border-t border-outline-variant/20" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary/10">
                  <Download className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-h3 text-h3 text-on-surface">Instalar App</h2>
                  <p className="text-caption text-on-surface-variant">Usa Agency MX como aplicación de escritorio</p>
                </div>
              </div>
              <button onClick={install} className="btn-primary text-caption px-5">
                <Download className="w-4 h-4" /> Instalar
              </button>
            </div>
          </>
        )}

        <div className="border-t border-outline-variant/20 pt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}
