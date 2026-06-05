import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { startOrchestration } from '../services/api'
import toast from 'react-hot-toast'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-2xl font-bold">Nueva Solicitud</h1>
        <p className="text-gray-500 text-sm">Describe el proyecto y los agentes se encargarán</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Título del proyecto *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Landing page para SaaS de reservas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de proyecto *</label>
            <select name="projectType" value={form.projectType} onChange={handleChange} className="input-field">
              <option value="">Selecciona...</option>
              {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre del cliente</label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              className="input-field"
              placeholder="Cliente final"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción del proyecto *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              className="input-field resize-none"
              placeholder="Describe en detalle qué necesita el cliente, objetivo, audiencia, tono, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Presupuesto (USD)</label>
            <input
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha límite</label>
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Referencias / URLs</label>
            <textarea
              name="refs"
              value={form.refs}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Links de inspiración, referencias de marca, etc."
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            {submitting ? 'Enviando...' : 'Enviar a los Agentes'}
          </button>
        </div>
      </form>
    </div>
  )
}
