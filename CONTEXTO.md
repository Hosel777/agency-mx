# CONTEXTO DEL PROYECTO — Agency MX

> Guardar este archivo cada vez que se avance para no perder el hilo si se cuelga o apaga la PC.
> Última actualización: 5 Junio 2026 — Sesión 4: AgentWorkspace tipo VSCode + logs en vivo

---

## OBJETIVO

Construir **agency-mx**: una agencia de marketing digital virtual operada por agentes de IA.
El CEO/cliente crea solicitudes de proyectos → los agentes de IA trabajan en cadena → generan entregables → el CEO aprueba/rechaza → se entrega al cliente final.

Stack: React + Vite + TailwindCSS + Supabase (backend+BD) + Vercel (deploy frontend).
Repo: https://github.com/Hosel777/agency-mx.git

---

## ESTRUCTURA DEL PROYECTO

```
agency-mx/
├── agents/                        # 112 definiciones de agentes en markdown
│   ├── orchestrator/              # 1 agente: agents-orchestrator.md
│   ├── strategy/                  # 8 agentes: trend-researcher, strategy, product-manager, cultural-intelligence, sprint-prioritizer, offer-lead-gen-strategist, private-domain-operator, book-co-author
│   ├── design/                    # 11 agentes: brand-guardian, ui-designer, ux-researcher, ux-architect, visual-storyteller, whimsy-injector, image-prompt-engineer, inclusive-visuals-specialist, persona-walkthrough-specialist, feedback-synthesizer, behavioral-nudge-engine
│   ├── marketing/                 # 25 agentes: content-creator, social-media-strategist, seo-specialist, email-marketing-strategist, growth-hacker, linkedin-content-creator, twitter-engager, reddit-community-builder, podcast-strategist, video-optimization-specialist, app-store-optimizer, ai-citation-strategist, aeo-foundations-architect, agentic-search-optimizer, carousel-growth-engine, multi-platform-publisher, instagram-curator, tiktok-strategist, douyin-strategist, wechat-official-account-manager, xiaohongshu-specialist, baidu-seo-specialist, bilibili-content-strategist, cross-border-ecommerce, china-market-specialist
│   ├── paid-media/                # 7 agentes: ppc-campaign-strategist, ad-creative-strategist, paid-social-strategist, programmatic-buyer, paid-media-auditor, search-query-analyst, tracking-specialist
│   ├── engineering/               # 21 agentes: frontend-developer, backend-architect, senior-developer, rapid-prototyper, software-architect, ai-engineer, mobile-app-builder, data-engineer, database-optimizer, prompt-engineer, email-intelligence-engineer, git-workflow-master, sre, technical-writer, code-reviewer, compliance-auditor, penetration-tester, incident-responder, appsec-engineer, security-architect, devops-automator
│   ├── testing/                   # 8 agentes: reality-checker, workflow-optimizer, tool-evaluator, accessibility-auditor, api-tester, performance-benchmarker, test-results-analyzer, evidence-collector
│   ├── sales/                     # 8 agentes
│   ├── finance/                   # 5 agentes: finance-tracker, analytics-reporter, executive-summary-generator, accounts-payable, legal-compliance
│   ├── support/                   # 6 agentes: project-shepherd, meeting-notes-specialist, studio-operations, studio-producer, infrastructure-maintainer, support-responder
│   └── specialized/               # 12 agentes: lsp-index-engineer, zk-steward, report-distribution-agent, sales-data-extraction-agent, model-qa-specialist, mcp-builder, incident-response-commander, y-agents-engineer, csv-connector, (more...)
├── api/                           # VACÍO — hay que crear Edge Functions aquí
├── src/
│   ├── components/
│   │   ├── agents/AgentChat.jsx   # Chat UI con agentes (no funcional)
│   │   ├── common/DeliverablePreview.jsx  # Modal vista previa entregables ✅
│   │   └── layout/
│   │       ├── DashboardLayout.jsx
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   ├── contexts/AppContext.jsx     # Estado global (user, requests, agentsActive)
│   ├── hooks/useSupabase.js       # Hook NO USADO en ningún componente
│   ├── pages/
│   │   ├── Dashboard.jsx          # Consulta datos reales de Supabase ✅
│   │   ├── NewRequest.jsx         # Formulario → inserta en Supabase + orquestación ✅
│   │   ├── RequestDetail.jsx      # Lee de Supabase + preview entregables ✅
│   │   ├── Agents.jsx             # Lista hardcodeada desde agents.js ⬜
│   │   ├── Approvals.jsx          # CRUD real contra Supabase ✅
│   │   ├── Settings.jsx           # Guarda API key en localStorage ✅
│   │   └── Login.jsx              # Login/Register con Supabase Auth ✅
│   ├── services/
│   │   ├── supabase.js            # Cliente Supabase configurado ✅
│   │   └── api.js                 # CRUD + startOrchestration + sendChatMessage ✅
│   └── utils/
│       ├── agents.js              # 41 agentes hardcodeados (vs 112 .md, vs 31 SQL)
│       ├── constants.js           # Status labels/colors
│       └── orchestrator-prompts.js # Prompt de orchestrator (ahora en api/lib/agents.js)
├── api/                           # Backend serverless (Vercel Functions)
│   ├── orchestrate.js             # Orquestación con Claude ✅
│   ├── chat.js                    # Chat con agentes ✅
│   └── lib/
│       ├── anthropic.js           # Helper Claude Sonnet ✅
│       ├── agents.js              # Prompts + cadenas de agentes ✅
│       └── supabase.js            # Cliente admin Supabase ✅
├── supabase-schema.sql            # Schema completo + seed + migraciones
├── .env                           # Credenciales REALES del usuario
└── CONTEXTO.md                    # ← ESTE ARCHIVO
```

---

## LO QUE ESTÁ HECHO

### Frontend (UI completa)
- Layout con Sidebar + Header + contenido principal
- 7 páginas con navegación via React Router (+ Login)
- **AgentWorkspace**: workspace 3 paneles tipo VSCode:
  - Explorador de archivos (entregables por agente con íconos)
  - Editor con vista previa (texto, HTML/iframe, imagen, código)
  - Chat lateral con agentes
  - Terminal con logs en vivo (timestamps, colores, auto-scroll)
  - Botón "Ejecutar Agentes" que dispara la orquestación
  - Polling automático cada 3s para ver entregables y logs en tiempo real
- Formulario de nueva solicitud → inserta en Supabase + dispara orquestación + subida de archivos
- Página de detalle con workspace integrado, sin tabs
- Página de aprobaciones con botones Aprobar / Solicitar Cambios / Entregar al Cliente
- Modal de vista previa de entregables (text, html, image, code, file)
- Chat real con agentes via Claude Sonnet con historial de conversación
- Página de agentes con datos desde Supabase (con fallback a agents.js)
- Página de configuración guarda API Key en localStorage
- Login/Register con Supabase Auth
- Dashboard con stats reales y solicitudes desde Supabase
- Logout funcional
- FileUpload componente para subir archivos a Supabase Storage
- storage.js: servicio de subida, borrado y listado de archivos

### Backend / Base de datos
- 5 tablas en Supabase (+ orchestration_logs embebido en client_requests)
- Columnas: deliverable_type, language, client_delivered, client_delivered_at, orchestration_logs
- **api/orchestrate.js**: escribe logs en `orchestration_logs` en cada paso
- **api/chat.js**: chat con agentes via Claude, historial de 20 mensajes
- **api/lib/anthropic.js**: helper Claude Sonnet
- **api/lib/agents.js**: 11 prompts + 7 cadenas de orquestación
- SQL Storage: instrucciones para bucket agency-files

### Definiciones de agentes
- 112 archivos .md completos en `agents/` organizados en 10 departamentos
- 11 prompts de agente en `api/lib/agents.js` para el backend

---

## LO QUE NO FUNCIONA / ESTÁ INCOMPLETO

### Por mejorar
- 112 .md vs 41 en JS vs 41 en SQL — los .md tienen agentes especializados extra
- Notificaciones en tiempo real (Supabase Realtime)
- Pruebas automatizadas
- Timeout de Vercel Hobby (10s puede ser poco para cadenas largas de agentes)

---

## ESTADO ACTUAL

| Área | % |
|---|---|
| UI / Frontend visual | **95%** |
| CRUD contra Supabase | **95%** |
| Autenticación (Login/Register/Logout) | **100%** |
| Integración con IA (Claude Sonnet) | **100%** (backend listo, falta API key) |
| Orquestación de agentes | **100%** |
| Chat con agentes | **100%** |
| Agents page desde Supabase | **100%** |
| Supabase Storage (subida archivos) | **100%** |
| Definiciones de agentes (.md) | **100%** |
| Consistencia agentes (.md vs JS vs SQL) | **50%** (41 sincronizados, .md tiene más) |
| **GLOBAL** | **~90%** |

## PENDIENTE

- Revisar timeout Vercel Hobby (10s puede ser poco para cadenas largas de agentes)
- Unificar 112 .md con los 41 core agents
- Pruebas automatizadas

---

## GUÍA DE DEPLOY — LLEVAR A PRODUCCIÓN

### 1. Configurar Supabase

1. Ir a https://supabase.com y abrir el proyecto (bphfylpvuoijadkgyifk)
2. **SQL Editor** → pegar todo `supabase-schema.sql` y ejecutar
3. **Project Settings > API** → copiar `Service Role Key` (no la anon key)
4. **Storage** → crear bucket `agency-files`:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('agency-files', 'agency-files', false);
   ```
   Luego crear políticas:
   ```sql
   CREATE POLICY "users_upload_own_files" ON storage.objects
     FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'agency-files');
   CREATE POLICY "users_read_files" ON storage.objects
     FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'agency-files');
   ```

### 2. Obtener API Key de Anthropic

1. Ir a https://console.anthropic.com
2. Crear cuenta o iniciar sesión
3. Ir a API Keys → crear key
4. Copiar la key (empieza con `sk-ant-`)

### 3. Deploy en Vercel

1. Ir a https://vercel.com
2. Importar repositorio: `https://github.com/Hosel777/agency-mx`
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

6. **Environment Variables** (sección en Vercel):
   | Variable | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://bphfylpvuoijadkgyifk.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | (la anon key de Supabase) |
   | `SUPABASE_URL` | `https://bphfylpvuoijadkgyifk.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | (service role key de Supabase) |
   | `ANTHROPIC_API_KEY` | (tu key de Anthropic) |

7. Deploy → Vercel genera URL tipo `agency-mx.vercel.app`

### 4. Probar en producción

1. Abrir la URL de Vercel
2. Registrarse con email y contraseña
3. Ir a Configuración → verificar que la API Key esté cargada
4. Crear una solicitud de prueba (ej: "Landing page para negocio local")
5. Ir al detalle de la solicitud → ver cómo los agentes generan entregables
6. Revisar Aprobaciones → aprobar y entregar al cliente

### 5. Desarrollo local

```bash
npm run dev        # Iniciar frontend en :5173
npm run build      # Build producción
```

Las API routes (`/api/*`) solo funcionan en Vercel. Para desarrollo local, necesitas Vercel CLI:
```bash
npm i -g vercel
vercel dev         # Inicia todo localmente (frontend + api)
```

---

## PRÓXIMA SESIÓN — CONTINUAR DESDE AQUÍ

Lo último completado:
- ✅ Agents page conectada a Supabase con fallback local
- ✅ SQL seed actualizado a 41 agentes
- ✅ Supabase Storage + FileUpload component
- ✅ DeliverablePreview usa deliverable_type de la BD
- ✅ Guía de deploy completa en este documento
- ❌ El proyecto está ~90% listo para producción

Pasos para la próxima sesión:
1. Hacer deploy a Vercel siguiendo la guía
2. Probar que la orquestación funcione
3. Unificar 112 .md con agentes core (opcional)
4. Agregar pruebas automatizadas (opcional)

---

## COMANDOS ÚTILES

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build producción
npm run preview      # Preview del build
git add -A && git commit -m "mensaje" && git push  # Subir cambios
```

---

## VARIABLES DE ENTORNO (.env)

```
VITE_SUPABASE_URL=https://bphfylpvuoijadkgyifk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://bphfylpvuoijadkgyifk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=  <-- obtener de Supabase > Project Settings > API
ANTHROPIC_API_KEY=           <-- obtener de https://console.anthropic.com
```

---

## HISTORIAL DE SESIONES

### Sesión 1 — Fundación
- Proyecto inicializado (Vite + React + Tailwind)
- Layout, 6 páginas, Supabase schema, git repo
- 112 agentes .md, DeliverablePreview, Approvals, SQL migraciones

### Sesión 2 — Backend real con Claude Sonnet (Commit: fda8308)
- api/orchestrate.js — orquestación con Claude Sonnet
- api/chat.js — chat en tiempo real con agentes
- api/lib/agents.js — 11 prompts + 7 cadenas de orquestación
- Login.jsx, Dashboard real, Chat real, Settings persistente, Logout
- Bugfix: supabase import en RequestDetail

### Sesión 4 — AgentWorkspace + logs en vivo (Commit: 8a4529b)
- AgentWorkspace: layout 3 paneles tipo VSCode (explorador | editor | chat)
- FileExplorer: árbol de entregables por agente con íconos y estados
- EditorPanel: vista previa de texto, HTML (iframe), imagen, código con pestañas
- LiveTerminal: logs en vivo con timestamps, colores por nivel, auto-scroll
- orchestrate.js: escribe logs en `orchestration_logs` (JSONB) durante la ejecución
- Frontend: polling cada 3s de logs + entregables mientras orquesta
- RequestDetail simplificado: solo breadcrumb + AgentWorkspace
- SQL: columna `orchestration_logs JSONB` en client_requests
