# Instructivo: Bridge SocialPulse → Agency MX

Agrega un botón "¿Necesitas una página web?" en el Dashboard de SocialPulse que permita a los usuarios solicitar servicios premium. La solicitud se envía a Agency MX, donde agentes IA generan un presupuesto y, si se acepta, producen el entregable (web, branding, ads, etc.).

---

## 1. Crear componente: `src/components/SolicitarServicioModal.jsx`

Usa el patrón de modal existente en SocialPulse (igual que `UpgradeModal.jsx`). Debe:

```
src/components/SolicitarServicioModal.jsx
```

```jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../services/supabase'

const SERVICE_TYPES = [
  { id: 'website', label: 'Una página web', icon: Globe, desc: 'Landing page, web corporativa o tienda online' },
  { id: 'mvp', label: 'Una aplicación / herramienta', icon: null, desc: 'App web con funciones específicas para tu negocio' },
  { id: 'branding', label: 'Identidad de marca', icon: null, desc: 'Logo, colores, tipografía y guía visual' },
  { id: 'ads', label: 'Anuncios y campañas', icon: null, desc: 'Google Ads, Facebook Ads e Instagram Ads' },
  { id: 'seo', label: 'Posicionamiento en Google', icon: null, desc: 'Que tu negocio aparezca en los primeros resultados' },
  { id: 'full', label: 'Proyecto completo', icon: null, desc: 'Varios servicios combinados' },
]

export default function SolicitarServicioModal({ isOpen, onClose, brandMemory }) {
  const [step, setStep] = useState('form') // form | loading | success | error
  const [form, setForm] = useState({
    title: '',
    description: '',
    project_type: 'website',
    budget: '',
    deadline: '',
    business_name: brandMemory?.business_name || '',
    industry: brandMemory?.industry || '',
    audience: brandMemory?.audience || '',
    tone: brandMemory?.tone || '',
    style: brandMemory?.style || '',
    colors: brandMemory?.colors?.join(', ') || '',
    imageUrls: '',
    app_problem: '',
    app_users: '',
    app_features: ''
  })
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStep('loading')

    const imageList = form.imageUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.startsWith('http'))
      .map((url, i) => ({ url, label: `Imagen ${i + 1}` }))

    const brandData = {
      business_name: form.business_name,
      industry: form.industry,
      audience: form.audience,
      tone: form.tone,
      style: form.style,
      colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
      description: form.description,
      app_problem: form.app_problem || undefined,
      app_users: form.app_users || undefined,
      app_features: form.app_features || undefined
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      const response = await fetch('https://agency-mx.vercel.app/api/external-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_AGENCY_MX_API_KEY || ''
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          project_type: form.project_type,
          client_name: user?.user_metadata?.full_name || user?.email || '',
          client_email: user?.email || '',
          budget: form.budget ? parseFloat(form.budget) : null,
          deadline: form.deadline || null,
          source: 'socialpulse',
          brand_data: brandData,
          images: imageList.length > 0 ? imageList : null
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        setStep('success')
      } else {
        setStep('error')
        setResult(data)
      }
    } catch (err) {
      setStep('error')
      setResult({ error: err.message })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-dark-card rounded-2xl p-6 max-w-lg w-full border border-dark-border max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {step === 'form' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">¿En qué te podemos ayudar?</h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo de servicio *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICE_TYPES.map(t => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setForm(f => ({ ...f, project_type: t.id }))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            form.project_type === t.id
                              ? 'border-brand-500 bg-brand-500/10'
                              : 'border-dark-border bg-dark-bg hover:border-brand-500/50'
                          }`}
                        >
                          <div className="text-sm font-medium text-white">{t.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">¿Cómo te gustaría llamar este proyecto? *</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                      placeholder="Ej: La página web de mi restaurante"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descripción de lo que necesitas *</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 min-h-[100px]"
                      placeholder="Cuéntanos qué necesitas, para qué lo usarás, qué te gustaría que hiciera... cuanto más detalles des, mejor podremos ayudarte"
                      required
                    />
                  </div>

                  {/* Campos extra solo para aplicaciones */}
                  {form.project_type === 'mvp' && (
                    <div className="border border-brand-500/20 bg-brand-500/5 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium text-brand-400">Cuéntanos más sobre tu aplicación</p>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">¿Qué problema quieres resolver?</label>
                        <textarea value={form.app_problem} onChange={e => setForm(f => ({ ...f, app_problem: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm min-h-[60px]"
                          placeholder="Ej: Quiero que mis clientes puedan agendar citas online sin tener que llamar" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">¿Quiénes la van a usar?</label>
                        <input value={form.app_users} onChange={e => setForm(f => ({ ...f, app_users: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm"
                          placeholder="Ej: Mis clientes y yo (el administrador)" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">¿Qué funciones debería tener?</label>
                        <textarea value={form.app_features} onChange={e => setForm(f => ({ ...f, app_features: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm min-h-[60px]"
                          placeholder="Ej: Registro de usuarios, calendario de citas, notificaciones, panel de administración" />
                      </div>
                    </div>
                  )}

                  {/* Datos de marca */}
                  <div className="border-t border-dark-border pt-4 mt-2">
                    <p className="text-sm font-medium text-white mb-3">Datos de tu marca</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre del negocio</label>
                        <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                          placeholder="Mi Negocio" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Industria</label>
                        <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                          placeholder="Ej: Gastronomía" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Público objetivo</label>
                        <input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                          placeholder="Ej: Jóvenes 25-40" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Tono de comunicación</label>
                        <select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500">
                          <option value="">Seleccionar...</option>
                          <option value="profesional">Profesional</option>
                          <option value="casual">Casual</option>
                          <option value="divertido">Divertido</option>
                          <option value="elegante">Elegante</option>
                          <option value="moderno">Moderno</option>
                          <option value="cercano">Cercano</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Estilo visual</label>
                        <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500">
                          <option value="">Seleccionar...</option>
                          <option value="moderno">Moderno</option>
                          <option value="minimalista">Minimalista</option>
                          <option value="clasico">Clásico</option>
                          <option value="colorido">Colorido</option>
                          <option value="oscuro">Oscuro</option>
                          <option value="lujo">Lujo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Colores de marca</label>
                        <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                          placeholder="#1a1a2e, #e94560" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm text-gray-400 mb-1">URLs de imágenes (una por línea)</label>
                      <textarea value={form.imageUrls} onChange={e => setForm(f => ({ ...f, imageUrls: e.target.value }))}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 min-h-[60px] text-sm"
                        placeholder="https://ejemplo.com/logo.png&#10;https://ejemplo.com/producto.jpg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Presupuesto estimado (MXN)</label>
                      <input
                        type="number"
                        value={form.budget}
                        onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                        placeholder="Ej: 15000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Fecha límite</label>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl font-medium hover:opacity-90 transition-all mt-2"
                  >
                    Quiero que me ayuden
                  </button>
                </form>
              </>
            )}

            {step === 'loading' && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-brand-500" />
                <p className="text-white font-medium">Estamos analizando tu solicitud...</p>
                <p className="text-gray-400 text-sm mt-1">En unos segundos tendrás tu presupuesto</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">¡Recibimos tu solicitud!</h3>
                <p className="text-gray-400 mb-6">
                  Nuestro equipo está preparando una propuesta para ti. Te contactaremos pronto.
                </p>
                <div className="bg-dark-bg rounded-xl p-4 mb-6 text-left text-sm">
                  <div className="text-gray-400">ID de solicitud:</div>
                  <div className="text-white font-mono">{result?.requestId}</div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-all"
                >
                  Entendido
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Error al enviar</h3>
                <p className="text-gray-400 mb-6">{result?.error || 'Intenta de nuevo más tarde'}</p>
                <button
                  onClick={() => setStep('form')}
                  className="w-full py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-all"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## 2. Agregar card en Dashboard

Editar `src/pages/Dashboard.jsx`:

**A) Agregar import del modal al inicio del archivo:**
```jsx
import { useState } from 'react'
import SolicitarServicioModal from '../components/SolicitarServicioModal'
```

**B) Agregar estado en el componente Dashboard (después de los otros useState):**
```jsx
const [showServiceModal, setShowServiceModal] = useState(false)
```

**C) Agregar el modal al final del JSX (antes del cierre del fragment o div principal):**
```jsx
<SolicitarServicioModal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)} />
```

**D) Agregar una card de "Servicios Premium" después de las Quick Action Cards. Busca el grid de Quick Action Cards y agrega esta card al final:**

```jsx
{/* Card: Servicios Premium */}
<button
  onClick={() => setShowServiceModal(true)}
  className="w-full p-5 bg-gradient-to-br from-brand-500/10 to-accent-500/10 rounded-2xl border border-brand-500/20 hover:border-brand-500/50 transition-all text-left group"
>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
      <Globe className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
        ¿Necesitas algo más?
      </h3>
      <p className="text-sm text-gray-400 mt-0.5">
        Sitios web, branding, anuncios y más — presupuesto sin compromiso
      </p>
    </div>
    <div className="text-brand-400 group-hover:translate-x-1 transition-transform">
      →
    </div>
  </div>
</button>
```

## 3. Verificaciones previas (CRÍTICO — la IA debe ejecutar esto)

Antes de crear el componente, verifica cada punto. Si algo no existe, créalo:

### 3.1 Variable de entorno
- Buscar en `src/services/supabase.js` si existe la función o constante que expone la marca del usuario (brand memory)
- Buscar en `src/components/Sidebar.jsx` o `src/pages/Create/components/BrandMemoryCard.jsx` cómo se accede a `brandMemory` / `brand_data` del usuario
- Si no existe un hook que exponga brand data, crear en `src/hooks/useBrandMemory.js`:
  ```js
  import { useMemo } from 'react'
  import { useUser } from '../hooks/useUser' // o el hook de auth que exista

  export default function useBrandMemory() {
    const user = useUser()
    return useMemo(() => ({
      business_name: user?.user_metadata?.business_name || '',
      industry: user?.user_metadata?.industry || '',
      audience: user?.user_metadata?.audience || '',
      tone: user?.user_metadata?.tone || '',
      style: user?.user_metadata?.style || '',
      colors: user?.user_metadata?.colors ? JSON.parse(user.user_metadata.colors) : [],
    }), [user])
  }
  ```

### 3.2 Verificar que el modal tenga el diseño correcto
- Leer `src/components/SolicitarServicioModal.jsx` si ya existe
- Verificar que SERVICE_TYPES use lenguaje simple (no "MVP", "SEO", "Branding", "PPC")
- Verificar que cuando se selecciona "Una aplicación / herramienta" aparezcan los campos extra (problema, usuarios, funciones)
- Si falta algo, actualizar el componente **sin cambiar su estructura visual ni romper su funcionamiento**

### 3.3 Verificar Dashboard
- Leer `src/pages/Dashboard.jsx` para encontrar dónde está el grid de "Quick Action Cards"
- Verificar que el import `Globe` desde `lucide-react` esté disponible
- Si no hay un `useState` de `showServiceModal`, agregarlo

### 3.4 Agregar variable de entorno
Buscar archivo `.env` (o `.env.local`) en la raíz del proyecto. Si no existe, crearlo. Agregar:
```
VITE_AGENCY_MX_API_KEY=clave_que_configuremos_en_agency_mx
```

### 3.5 Verificar que el endpoint de Agency MX responde
La URL base del endpoint es `https://agency-mx.vercel.app/api/external-request`. Si aún no está desplegado, dejar la variable `VITE_AGENCY_MX_API_KEY` configurada para cuando se despliegue.

## 4. Integrar brandMemory en el Dashboard

Al agregar el modal en Dashboard.jsx, pasarle los datos de marca:

```jsx
import useBrandMemory from '../hooks/useBrandMemory'

// dentro del componente Dashboard:
const brandMemory = useBrandMemory()

// paso C modificado:
<SolicitarServicioModal
  isOpen={showServiceModal}
  onClose={() => setShowServiceModal(false)}
  brandMemory={brandMemory}
/>
```

## 5. Verificar funcionamiento

1. Abrir SocialPulse → Dashboard
2. Debe aparecer la card "¿Necesitas algo más?" al final de las cards de acción rápida
3. Click → se abre el modal con el formulario
4. Completar y enviar → debe mostrar loading → success
5. En la base de datos de Agency MX debe aparecer la solicitud con `source: 'socialpulse'`
6. En el workspace de Agency MX, el CEO puede ver la solicitud y generar presupuesto

---

## Endpoint de Agency MX (ya creado)

`POST https://agency-mx.vercel.app/api/external-request`

Headers:
- `Content-Type: application/json`
- `x-api-key: <AGENCY_MX_API_KEY>`

Body:
```json
{
  "title": "Landing page para mi negocio",
  "description": "Descripción del proyecto...",
  "project_type": "website",
  "client_name": "Juan Pérez",
  "client_email": "juan@email.com",
  "budget": 15000,
  "deadline": "2026-07-01",
  "source": "socialpulse",
  "brand_data": {
    "business_name": "Mi Negocio",
    "industry": "Gastronomía",
    "audience": "Jóvenes 25-40",
    "tone": "moderno",
    "style": "minimalista",
    "colors": ["#1a1a2e", "#e94560"],
    "description": "Descripción de la marca"
  },
  "images": [
    { "url": "https://ejemplo.com/logo.png", "label": "Logo" },
    { "url": "https://ejemplo.com/producto.jpg", "label": "Producto" }
  ]
}
```

Respuesta exitosa:
```json
{
  "success": true,
  "requestId": "uuid-del-request",
  "status": "pending",
  "url": "https://agency-mx.vercel.app/requests/uuid"
}
```
