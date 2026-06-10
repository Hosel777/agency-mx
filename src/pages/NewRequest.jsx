import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { startOrchestration } from '../services/api'
import toast from 'react-hot-toast'
import { Send, ArrowLeft, Loader2, Paperclip, Bot } from 'lucide-react'
import FileUpload from '../components/common/FileUpload'

const projectTypes = [
  'Landing Page', 'Campaña de Ads', 'Rediseño de Marca',
  'Estrategia de Contenido', 'SEO', 'Email Marketing',
  'Video / TikTok', 'Redes Sociales', 'E-commerce',
  'Estrategia General', 'Otro',
]

export default function NewRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectType: '',
    clientName: '',
    budget: '',
    deadline: '',
    refs: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.projectType) {
      toast.error('Completa los campos obligatorios')
      return
    }

    setSubmitting(true)
    const { data: newRequest, error } = await supabase.from('client_requests').insert({
      title: form.title,
      description: form.description,
      project_type: form.projectType,
      client_name: form.clientName,
      budget: form.budget ? Number(form.budget) : null,
      deadline: form.deadline || null,
      refs: form.refs,
      status: 'pending',
    }).select().single()

    if (error) {
      setSubmitting(false)
      toast.error('Error al crear la solicitud')
      return
    }

    toast.success('Solicitud creada — los agentes comienzan a trabajar')

    startOrchestration(newRequest.id).catch(err => {
      console.error('Error al iniciar orquestación:', err)
    })

    setSubmitting(false)
    navigate('/')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="font-h1 text-h1 text-on-surface">Nueva Solicitud</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Describe el proyecto y los agentes se encargarán</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Título del proyecto *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Ej: Landing page para SaaS de reservas" />
          </div>

          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Tipo de proyecto *</label>
            <select name="projectType" value={form.projectType} onChange={handleChange} className="input-field">
              <option value="">Selecciona...</option>
              {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Nombre del cliente</label>
            <input name="clientName" value={form.clientName} onChange={handleChange} className="input-field" placeholder="Cliente final" />
          </div>

          <div className="col-span-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Descripción del proyecto *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="input-field resize-none" placeholder="Describe en detalle qué necesita el cliente, objetivo, audiencia, tono, etc." />
          </div>

          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Presupuesto (USD)</label>
            <input name="budget" type="number" value={form.budget} onChange={handleChange} className="input-field" placeholder="Ej: 5000" />
          </div>

          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block">Fecha límite</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className="input-field" />
          </div>

          <div className="col-span-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5 block flex items-center gap-1">
              <Paperclip className="w-4 h-4" /> Archivos adjuntos
            </label>
            <FileUpload
              onUpload={(file) => setUploadedFiles(prev => [...prev, file])}
              path={`requests/${Date.now()}`}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.svg,.mp4,.mov"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Enviando...' : 'Enviar a los Agentes'}
          </button>
        </div>
      </form>
    </div>
  )
}
