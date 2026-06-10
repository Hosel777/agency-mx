# PROMPT PARA CURSOR — TRANSFORMACIÓN VISUAL PREMIUM

> ⚠️ **NO MODIFICAR LÓGICA DE NEGOCIO NI OPERATIVA.** 
> El proyecto está funcional al 97%. Solo cambiar lo VISUAL.
> No tocar: api/*, src/services/*, src/contexts/*, src/utils/*, src/hooks/*, supabase-schema.sql
> Solo modificar: src/index.css, tailwind.config.js, src/components/*, src/pages/* (solo JSX/estilos)

---

## OBJETIVO

Transformar la UI de **Agency MX** (agencia de marketing digital con IA) de su diseño actual funcional a un **look enterprise premium** tipo Vercel, Linear, Notion o Retool — moderno, limpio, profesional, con atención obsesiva al detalle visual.

---

## DESIGN SYSTEM

### Paleta de Colores

```js
// tailwind.config.js — reemplazar colores existentes
colors: {
  // Primary: Indigo más vibrante y profesional
  agency: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
    300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
    600: '#4f46e5', 700: '#4338ca', 800: '#3730a3',
    900: '#312e81',
  },
  // Neutros más definidos para enterprise
  neutral: {
    50: '#fafafa', 75: '#f5f5f5', 100: '#f0f0f0',
    150: '#e8e8e8', 200: '#d9d9d9', 300: '#b3b3b3',
    400: '#8c8c8c', 500: '#666666', 600: '#4d4d4d',
    700: '#333333', 800: '#1a1a1a', 900: '#0d0d0d',
  },
  // Success, Warning, Error más refinados
  success: '#0ca678', warning: '#f59f00', error: '#e03131',
  surface: '#ffffff',
  'surface-secondary': '#f8f9fa',
  'surface-tertiary': '#f1f3f5',
}
```

### Tipografía
- Font: `Inter` (300 a 800 weight)
- Headings: `font-semibold` o `font-bold`, `tracking-tight`
- Body: `text-sm` (14px) o `text-xs` (12px) para UI densa
- Labels: `text-xs font-medium uppercase tracking-wide text-neutral-400`
- Mono: `font-mono` para código y metadatos

### Sombras
```js
boxShadow: {
  'xs': '0 1px 2px rgba(0,0,0,0.03)',
  'sm': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
  'md': '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)',
  'lg': '0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.03)',
  'xl': '0 20px 25px rgba(0,0,0,0.05), 0 10px 10px rgba(0,0,0,0.02)',
  'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
  'card-hover': '0 10px 40px rgba(0,0,0,0.07)',
  'glass': '0 8px 32px rgba(0,0,0,0.05)',
  'sidebar': '4px 0 24px rgba(0,0,0,0.06)',
}
```

### Bordes
- `rounded-lg` para cards y contenedores (8px)
- `rounded-xl` para inputs y botones importantes (12px)
- `rounded-2xl` para modales y cards principales (16px)
- `rounded-full` para badges y avatares
- Border color: `border-neutral-200/80` (con opacidad para sutileza)

---

## TRANSFORMACIONES ESPECÍFICAS

### 1. Sidebar (`src/components/layout/Sidebar.jsx`)
- Fondo: `bg-white` con `border-r border-neutral-100` (NO oscuro)
- Items de navegación: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium`
  - Default: `text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700`
  - Active: `bg-agency-50 text-agency-700 font-semibold`
- Iconos: lucide-react, 18px, `text-neutral-400` (active: `text-agency-500`)
- Logo: SVG `w-8 h-8` con gradiente `from-agency-500 to-agency-600` + texto "Agency MX" en `font-bold text-lg tracking-tight`
- Espaciado: `p-4`, gap entre secciones `py-6`
- Versión compacta/retractable (opcional)

### 2. Header (`src/components/layout/Header.jsx`)
- Glass effect: `bg-white/80 backdrop-blur-xl border-b border-neutral-100`
- Altura: `h-14` (56px)
- Título izquierdo: `text-base font-semibold text-neutral-800`
- Avatar/derecha: foto o iniciales en `w-8 h-8 rounded-full bg-agency-100 text-agency-700 text-xs font-semibold`
- Botones de acción: `btn-ghost` con `p-2 rounded-lg hover:bg-neutral-100`

### 3. Dashboard (`src/pages/Dashboard.jsx`)
- **Hero Stats**: Grid responsivo `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
  - Cada stat card: `bg-white rounded-xl border border-neutral-100 p-5`
  - Número: `text-3xl font-bold tracking-tight text-neutral-900`
  - Label: `text-sm text-neutral-500 mt-1`
  - Icono: `w-10 h-10 rounded-xl bg-agency-50 text-agency-600 p-2`
  - Mini trend indicator opcional (↑ verde / ↓ rojo)
- **Solicitudes Recientes**: Tabla o lista con:
  - Row: `flex items-center gap-4 px-4 py-3 hover:bg-neutral-50 rounded-lg transition-colors`
  - Status badges con colores y texto
  - Título del proyecto: `text-sm font-medium text-neutral-800`
  - Fecha: `text-xs text-neutral-400`
- **Botón "Nueva Solicitud"**: `bg-agency-600 hover:bg-agency-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98]`
- **Botón "Demo Rápida"**: `btn-secondary` con `border-dashed border-neutral-300`

### 4. Página de Agentes (`src/pages/Agents.jsx`)
- Árbol jerárquico con:
  - Departamento header: `flex items-center gap-2 px-4 py-3 bg-neutral-50 rounded-lg cursor-pointer text-sm font-semibold text-neutral-700`
  - Agente individual: `flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 rounded-lg text-sm text-neutral-600`
  - Avatar/emoji del agente: `w-8 h-8 rounded-lg bg-gradient-to-br from-agency-100 to-agency-50 flex items-center justify-center text-sm`
  - Grid responsivo de agentes dentro de cada departamento

### 5. Página de Aprobaciones (`src/pages/Approvals.jsx`)
- Layout: `max-w-5xl mx-auto`
- Filtros: tabs horizontales o pills con `rounded-full`
- Cards de entregable:
  - `bg-white rounded-xl border border-neutral-100 p-4 hover:shadow-md transition-shadow`
  - Header con emoji + nombre del agente + tipo + status badge
  - Extracto del contenido (primeros 150 chars) en `text-sm text-neutral-500`
  - Botones de acción inline (Aprobar / Rechazar / Vista Previa)
- Modal de vista previa (DeliverablePreview):
  - Overlay: `bg-black/40 backdrop-blur-sm`
  - Modal: `bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-auto`
  - Tabs: Preview / Raw con diseño tipo VS Code

### 6. Workspace (`src/components/workspace/AgentWorkspace.jsx`)
- **3 paneles** con separadores sutiles `border-neutral-100`
- Panel izquierdo (File Explorer):
  - Fondo: `bg-white`
  - Items: `px-3 py-1.5 text-xs hover:bg-neutral-50 rounded cursor-pointer`
  - Iconos por tipo de archivo: `w-4 h-4`
- Panel central (Editor):
  - Header de tabs: `bg-neutral-50 border-b border-neutral-100 px-3 h-9 flex items-center gap-1 text-xs font-medium text-neutral-500`
  - Área de contenido: `p-6 text-sm leading-relaxed`
- Panel derecho (Chat):
  - Header: `px-4 py-3 border-b border-neutral-100 text-sm font-semibold text-neutral-700`
  - Burbujas: 
    - User: `bg-agency-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%] text-sm`
    - Agent: `bg-neutral-100 text-neutral-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] text-sm text-sm`
  - Input: `rounded-xl border-neutral-200 focus:ring-2 focus:ring-agency-500/20 px-4 py-2.5 text-sm`

### 7. Login (`src/pages/Login.jsx`)
- Fondo con gradiente o patrón: `bg-gradient-to-br from-agency-50 via-white to-agency-100`
- Card: `bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 max-w-md w-full`
- Logo centrado
- Inputs: `rounded-xl border-neutral-200 px-4 py-3 text-sm focus:ring-2 focus:ring-agency-500/20`
- Botón submit: `w-full bg-agency-600 hover:bg-agency-700 text-white font-medium py-3 rounded-xl shadow-sm transition-all`

### 8. Nueva Solicitud (`src/pages/NewRequest.jsx`)
- Layout: `max-w-3xl mx-auto space-y-8`
- Secciones: `bg-white rounded-xl border border-neutral-100 p-6`
- Labels: `text-sm font-medium text-neutral-700 mb-1.5`
- Inputs: `rounded-xl border-neutral-200 px-4 py-2.5 text-sm`
- Selects: `rounded-xl border-neutral-200 px-4 py-2.5 text-sm bg-white`
- File upload: Drop zone con `border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center hover:border-agency-300 transition-colors bg-neutral-50/50`

---

## REGLAS GENERALES DE UI PREMIUM

1. **Consistencia**: Todo elemento interactivo tiene hover state, focus state y transition
2. **Espaciado**: Usar gap-3, gap-4, gap-6. Padding mínimo p-4 en contenedores
3. **Tipografía fluida**: `text-sm` para body, `text-xs` para metadatos, `text-lg`/`text-xl` para headings
4. **Color con propósito**: El color agency (indigo) solo para acciones primarias y acentos. Neutros para el resto
5. **Sin bordes duros**: Preferir `border-neutral-200` con opacidad 80%
6. **Jerarquía visual**: Sombras más fuertes (shadow-lg) para modales/drawers, shadow-sm para cards
7. **Motion**: `transition-all duration-200` en hover, `animate-fadeIn` en entradas, `animate-slideUp` en listas
8. **Micro-interacciones**: Botón active:scale-[0.97], checkbox/radio con checkmark animado, skeletons en carga
9. **Responsive**: Grid adaptativo, sidebar colapsable en mobile, texto fluido
10. **Glassmorphism**: Para headers y modales, `bg-white/80 backdrop-blur-xl`

---

## COMPONENTES GLOBALES A MEJORAR

### `src/index.css`
Reemplazar clases utilitarias con versiones pulidas:
```css
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
           bg-agency-600 text-white text-sm font-medium shadow-sm
           hover:bg-agency-700 active:scale-[0.97] 
           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
           transition-all duration-200;
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
           bg-white text-neutral-700 text-sm font-medium border border-neutral-200
           hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.97]
           transition-all duration-200;
  }
  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg
           text-neutral-500 text-sm font-medium
           hover:bg-neutral-100 hover:text-neutral-700
           transition-all duration-200;
  }
  .input-field {
    @apply w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white
           text-sm text-neutral-800 placeholder-neutral-400
           focus:outline-none focus:ring-2 focus:ring-agency-500/20 focus:border-agency-400
           transition-all duration-200;
  }
  .card {
    @apply bg-white rounded-xl border border-neutral-100 p-5 
           shadow-sm hover:shadow-md transition-all duration-200;
  }
  .card-glass {
    @apply bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-glass;
  }
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  .badge-green  { @apply badge bg-emerald-50 text-emerald-700; }
  .badge-blue   { @apply badge bg-blue-50 text-blue-700; }
  .badge-yellow { @apply badge bg-amber-50 text-amber-700; }
  .badge-purple { @apply badge bg-violet-50 text-violet-700; }
  .badge-gray   { @apply badge bg-neutral-100 text-neutral-600; }
}
```

### Animaciones
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
```

---

## ARCHIVOS QUE PUEDES MODIFICAR

```
src/index.css              → Sistema de diseño completo (componentes Tailwind)
tailwind.config.js          → Colores, sombras, animaciones
src/components/layout/Sidebar.jsx    → Solo JSX/estilos
src/components/layout/Header.jsx     → Solo JSX/estilos
src/components/layout/DashboardLayout.jsx → Solo JSX/estilos
src/components/common/DeliverablePreview.jsx → Solo JSX/estilos
src/components/common/FileUpload.jsx  → Solo JSX/estilos
src/components/agents/AgentChat.jsx   → Solo JSX/estilos
src/components/workspace/AgentWorkspace.jsx → Solo JSX/estilos
src/components/workspace/OrchestrationTimeline.jsx → Solo JSX/estilos
src/pages/Dashboard.jsx   → Solo JSX/estilos
src/pages/NewRequest.jsx  → Solo JSX/estilos
src/pages/RequestDetail.jsx → Solo JSX/estilos
src/pages/Agents.jsx      → Solo JSX/estilos
src/pages/Approvals.jsx   → Solo JSX/estilos
src/pages/Settings.jsx    → Solo JSX/estilos
src/pages/Login.jsx       → Solo JSX/estilos
```

## ARCHIVOS QUE NO DEBES TOCAR (lógica de negocio)

```
api/*                      → Backend completo
src/services/*             → API calls, Supabase client, Storage
src/contexts/AppContext.jsx → Estado global
src/utils/*                → Constantes, agentes, prompts
src/hooks/*                → Hooks personalizados
supabase-schema.sql        → Base de datos
vercel.json                → Config deploy
package.json               → Dependencias
```

---

## ENTREGABLE FINAL

El resultado debe verse como una **plataforma SaaS enterprise** lista para producción:
- Sin elementos placeholder o de prueba
- Transiciones suaves en todas las interacciones
- Estilo consistente en todos los componentes
- Preparado para whitelabel (cambio de colores fácil desde tailwind.config.js)
- Código limpio, sin comentarios innecesarios
- Build sin errores (npm run build debe pasar)

---

## REGLA DE ORO

> Si no es visual, NO LO TOQUES.
> Si un componente funciona, solo cambia sus clases CSS/Tailwind, su estructura HTML y su presentación.
> No refactorices lógica, no cambies imports, no renombres funciones, no toques APIs.
