# Cambios para SocialPulse (solo modificar, no reescribir)

## Archivo a modificar: `src/components/SolicitarServicioModal.jsx`

No reescribas el componente completo. Lee el archivo existente y aplica solo estos cambios:

### 1. SERVICE_TYPES — usar lenguaje simple

Reemplazar los labels y descripciones para que cualquier usuario entienda:

```js
const SERVICE_TYPES = [
  { id: 'website', label: 'Una página web', icon: Globe, desc: 'Landing page, web corporativa o tienda online' },
  { id: 'mvp', label: 'Una aplicación / herramienta', icon: null, desc: 'App web con funciones específicas para tu negocio' },
  { id: 'branding', label: 'Identidad de marca', icon: null, desc: 'Logo, colores, tipografía y guía visual' },
  { id: 'ads', label: 'Anuncios y campañas', icon: null, desc: 'Google Ads, Facebook Ads e Instagram Ads' },
  { id: 'seo', label: 'Posicionamiento en Google', icon: null, desc: 'Que tu negocio aparezca en los primeros resultados' },
  { id: 'full', label: 'Proyecto completo', icon: null, desc: 'Varios servicios combinados' },
]
```

### 2. Agregar fields extra al form state

Agregar al `useState` del form:
```js
app_problem: '',
app_users: '',
app_features: ''
```

### 3. Incluir app fields en brandData (handleSubmit)

```js
app_problem: form.app_problem || undefined,
app_users: form.app_users || undefined,
app_features: form.app_features || undefined
```

### 4. Modal title — texto más amigable

Cambiar:
- "Solicitar Servicio Premium" → "¿En qué te podemos ayudar?"

### 5. Descripción — placeholder más claro

Cambiar placeholder a:
- "Cuéntanos qué necesitas, para qué lo usarás, qué te gustaría que hiciera... cuanto más detalles des, mejor podremos ayudarte"

### 6. Campos extra condicionales (solo para app)

Después del textarea de descripción, agregar (solo si `form.project_type === 'mvp'`):

```jsx
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
```

### 7. Botón submit — texto más amigable

Cambiar:
- "Solicitar Presupuesto" → "Quiero que me ayuden"

### 8. Textos de estados loading/success

- Loading: "Enviando solicitud..." → "Estamos analizando tu solicitud..."
- Loading desc: "Un equipo de agentes IA preparará tu presupuesto" → "En unos segundos tendrás tu presupuesto"
- Success title: "¡Solicitud recibida!" → "¡Recibimos tu solicitud!"
- Success desc: "Nuestro equipo está preparando tu presupuesto. Te contactaremos en breve." → "Nuestro equipo está preparando una propuesta para ti. Te contactaremos pronto."

---

**Importante:** no cambies la estructura visual del modal, las animaciones, ni el resto de la lógica. Solo aplica estos cambios puntuales.
