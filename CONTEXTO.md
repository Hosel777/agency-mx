# CONTEXTO DEL PROYECTO — Agency MX

> Guardar este archivo cada vez que se avance para no perder el hilo si se cuelga o apaga la PC.
> Última actualización: 5 Junio 2026

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
│   │   ├── Dashboard.jsx          # Estadísticas hardcodeadas
│   │   ├── NewRequest.jsx         # Formulario → inserta en Supabase ✅
│   │   ├── RequestDetail.jsx      # Lee de Supabase ✅ (BUG: supabase no importado L38)
│   │   ├── Agents.jsx             # Lista hardcodeada desde agents.js
│   │   ├── Approvals.jsx          # CRUD real contra Supabase ✅
│   │   └── Settings.jsx           # Solo UI, no guarda nada
│   ├── services/
│   │   ├── supabase.js            # Cliente Supabase configurado ✅
│   │   └── api.js                 # 6 funciones CRUD ✅
│   └── utils/
│       ├── agents.js              # 41 agentes hardcodeados (vs 112 .md, vs 31 SQL)
│       ├── constants.js           # Status labels/colors
│       └── orchestrator-prompts.js # Prompt de orchestrator (NO USADO)
├── supabase-schema.sql            # Schema completo + seed + migraciones
├── .env                           # Credenciales Supabase REALES del usuario
└── CONTEXTO.md                    # ← ESTE ARCHIVO
```

---

## LO QUE ESTÁ HECHO

### Frontend (UI completa)
- Layout con Sidebar + Header + contenido principal
- 6 páginas con navegación via React Router
- Formulario de nueva solicitud funcional (inserta en Supabase)
- Página de detalle con tabs (Resumen, Agentes, Conversación)
- Página de aprobaciones con botones Aprobar / Solicitar Cambios / Entregar al Cliente
- Modal de vista previa de entregables (text, html, image, code, file)
- Chat UI con filtro por agente
- Página de agentes con acordeones expandibles
- Página de configuración (solo UI)

### Backend / Base de datos
- 4 tablas en Supabase: client_requests, agent_messages, deliverables, agents
- 6 funciones CRUD en api.js
- 31 agentes seed insertados en SQL
- Columnas adicionales: deliverable_type, language, client_delivered, client_delivered_at

### Definiciones de agentes
- 112 archivos .md completos con frontmatter, identidad, misión, deliverables, workflow, métricas
- Organizados en 10 departamentos + orchestrator + specialized

---

## LO QUE NO FUNCIONA / ESTÁ INCOMPLETO

### Bugs
- **RequestDetail.jsx línea 38**: usa `supabase.from(...)` pero `supabase` no está importado (solo está `fetchRequest` de `api.js`)

### Hardcodeado (hay que conectar a Supabase)
- Dashboard: estadísticas son números fijos (3,2,1,5)
- Agents page: usa `agents.js` hardcodeado en vez de consultar tabla `agents`
- 112 .md vs 41 en JS vs 31 en SQL — inconsistentes

### No existe
- **No hay backend serverless** (api/ vacío)
- **No hay integración con LLM** (OpenAI, Together, Anthropic, etc.)
- **No hay orquestación de agentes** (orchestrator-prompts.js existe pero no se usa)
- **No hay generación automática de entregables** al crear solicitud
- **Chat no envía mensajes a ningún lado** — solo UI
- **No hay Login / Register** (solo detección de sesión existente)
- **Settings no guarda nada** (API Key, etc.)
- **botón Logout en Header no funciona**
- **No hay subida de archivos** (Supabase Storage sin usar)
- **No hay pruebas/tests**

---

## ORDEN DE PRIORIDAD PARA HACERLO REAL

### Fase 1 — Backend + IA (crítico)
1. Crear Edge Functions en `api/` que reciban webhooks al crear solicitudes
2. Integrar OpenAI/Together API — llamar al LLM con el prompt del orchestrator
3. Pipeline de orquestación: Research → Strategy → Design → Content → Dev → SEO → QA → Consolidation → CEO → Cliente
4. Que los agentes generen entregables reales y los inserten en Supabase
5. Chat real: enviar mensaje → consultar LLM → guardar respuesta en `agent_messages`

### Fase 2 — Autenticación y UX completo
6. Página de Login/Register con Supabase Auth
7. Logout funcional en Header
8. Dashboard real consultando Supabase
9. Settings persistente (guardar en Supabase o localStorage)
10. Arreglar bug de import en RequestDetail.jsx

### Fase 3 — Consistencia y pulido
11. Sincronizar: 112 .md ↔ 41 JS ↔ 31 SQL (unificar a una sola fuente de verdad)
12. Agents page: leer de tabla `agents` de Supabase
13. Subida de archivos con Supabase Storage
14. Notificaciones en tiempo real (Supabase Realtime)
15. Pruebas automatizadas

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
VITE_SUPABASE_URL=https://jqhjhuwlshqhgxbpmtum.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

API Key de IA se configura en Settings (pero no se guarda aún).

---

## PRÓXIMA SESIÓN — CONTINUAR DESDE AQUÍ

Lo último que se hizo:
- ✅ DeliverablePreview componente creado
- ✅ RequestDetail conectado a Supabase (falta arreglar bug import L38)
- ✅ Approvals con flujo completo: aprobar, rechazar, entregar al cliente
- ✅ SQL actualizado con deliverable_type, language, client_delivered
- ✅ Reporte de estado del proyecto
- ❌ El usuario quiere que TODO sea real — empezar por Fase 1 (Edge Functions + LLM)
