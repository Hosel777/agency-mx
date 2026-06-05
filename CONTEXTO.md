# CONTEXTO DEL PROYECTO — Agency MX

> Guardar este archivo cada vez que se avance para no perder el hilo si se cuelga o apaga la PC.
> Última actualización: 5 Junio 2026 — Sesión 2: Backend real con Claude Sonnet

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
- Formulario de nueva solicitud funcional → inserta en Supabase + dispara orquestación
- Página de detalle con tabs (Resumen, Agentes, Conversación) + preview entregables
- Página de aprobaciones con botones Aprobar / Solicitar Cambios / Entregar al Cliente
- Modal de vista previa de entregables (text, html, image, code, file)
- Chat real con agentes via Claude Sonnet con historial de conversación
- Página de agentes con acordeones expandibles
- Página de configuración guarda API Key en localStorage
- Login/Register con Supabase Auth
- Dashboard con stats reales y solicitudes desde Supabase
- Logout funcional

### Backend / Base de datos
- 4 tablas en Supabase: client_requests, agent_messages, deliverables, agents
- Columnas adicionales: deliverable_type, language, client_delivered, client_delivered_at
- **api/orchestrate.js**: endpoint que recibe requestId, llama a Claude Sonnet, ejecuta cadena de agentes, genera entregables y los guarda en Supabase
- **api/chat.js**: endpoint de chat con agentes via Claude, con historial de 20 mensajes
- **api/lib/anthropic.js**: helper para llamar Claude Sonnet (modelo claude-sonnet-4-20250514)
- **api/lib/agents.js**: 11 agentes con system prompts en español + 7 cadenas de orquestación

### Definiciones de agentes
- 112 archivos .md completos en `agents/` organizados en 10 departamentos
- 11 prompts de agente en `api/lib/agents.js` para el backend

---

## LO QUE NO FUNCIONA / ESTÁ INCOMPLETO

### Hardcodeado
- Agents page: usa `agents.js` hardcodeado en vez de consultar tabla `agents` de Supabase
- 112 .md vs 41 en JS vs 31 en SQL — inconsistentes (hay que unificar)

### Falta
- Subida de archivos con Supabase Storage
- Notificaciones en tiempo real (Supabase Realtime)
- Pruebas automatizadas
- Límite de timeout de Vercel (Hobby=10s puede ser poco para cadenas largas)

---

## ESTADO ACTUAL

| Área | % |
|---|---|
| UI / Frontend visual | **90%** |
| CRUD contra Supabase | **90%** |
| Autenticación | **80%** |
| Integración con IA (Claude) | **100%** (backend listo, falta API key del usuario) |
| Orquestación de agentes | **100%** (backend listo) |
| Chat con agentes | **100%** (backend listo) |
| Definiciones de agentes (.md) | **100%** |
| Consistencia agentes (.md vs JS vs SQL) | **30%** |
| **GLOBAL** | **~80%**

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

## ÚLTIMA ACTUALIZACIÓN — Backend real con Claude Sonnet

✅ API backend completa (Vercel Serverless Functions):
  - api/orchestrate.js — orquestación: recibe requestId, llama a Claude, activa agentes en cadena
  - api/chat.js — chat en tiempo real con agentes via Claude
  - api/lib/agents.js — 11 agentes con prompts en español + 7 cadenas de orquestación
  - api/lib/anthropic.js — helper para llamar Claude Sonnet
  - api/lib/supabase.js — cliente admin para operaciones de backend

✅ Frontend actualizado:
  - NewRequest.jsx — crea solicitud + dispara orquestación automáticamente
  - AgentChat.jsx — chat real contra Claude con historial de conversación
  - Dashboard.jsx — consulta datos reales de Supabase (stats y solicitudes)
  - Header.jsx — logout funcional + link a login
  - Settings.jsx — guarda API key en localStorage y la envía al backend
  - Login.jsx — login/register con Supabase Auth
  - RequestDetail.jsx — bugfix (supabase no importado)
  - api.js — nuevas funciones startOrchestration() y sendChatMessage()

## PENDIENTE PARA PRÓXIMA SESIÓN

### Fase 1 — Configuración para que funcione en producción
1. ⬜ El usuario debe obtener:
   - ANTHROPIC_API_KEY de https://console.anthropic.com
   - SUPABASE_SERVICE_ROLE_KEY de Supabase > Project Settings > API
2. ⬜ Agregar ANTHROPIC_API_KEY y SUPABASE_SERVICE_ROLE_KEY como variables de entorno en Vercel
3. ⬜ Ejecutar migraciones SQL pendientes en Supabase SQL Editor
4. ⬜ El .env ya tiene las variables pero con valores vacíos (el usuario llena)

### Fase 2 — Mejoras pendientes
5. ⬜ Página de Agents.js: conectar a tabla `agents` de Supabase en vez de datos hardcodeados
6. ⬜ Revisar límite de timeout de Vercel (Hobby=10s, Pro=60s)
7. ⬜ Unificar 112 .md ↔ 41 JS ↔ 31 SQL (sincronizar agentes)
8. ⬜ Subida de archivos con Supabase Storage
9. ⬜ Pruebas automatizadas

## PRÓXIMA SESIÓN — CONTINUAR DESDE AQUÍ

Pasos para arrancar:
1. `npm run dev` para iniciar frontend
2. Llenar ANTHROPIC_API_KEY en .env o via Settings
3. Llenar SUPABASE_SERVICE_ROLE_KEY en .env
4. Probar creando una solicitud y viendo cómo los agentes generan entregables
