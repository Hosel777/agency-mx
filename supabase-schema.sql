-- ============================================================================
-- AGENCY MX — Esquema Inicial para Supabase
-- ============================================================================

-- Tabla de solicitudes de clientes
CREATE TABLE IF NOT EXISTS public.client_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_type TEXT NOT NULL,
    client_name TEXT,
    budget NUMERIC,
    deadline DATE,
    refs TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoting', 'quote_sent', 'in_progress', 'review', 'approved', 'completed', 'rejected')),
    orchestration_logs JSONB DEFAULT '[]'::jsonb,
    orchestration_plan JSONB DEFAULT NULL,
    brand_data JSONB DEFAULT NULL,
    images JSONB DEFAULT NULL,
    client_email TEXT,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migración segura si la tabla ya existe sin status
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS orchestration_logs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS orchestration_plan JSONB DEFAULT NULL;
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS brand_data JSONB DEFAULT NULL;
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.client_requests ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Tabla de mensajes de agentes
CREATE TABLE IF NOT EXISTS public.agent_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.client_requests(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    role TEXT DEFAULT 'assistant',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de entregables
CREATE TABLE IF NOT EXISTS public.deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.client_requests(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT,
    file_url TEXT,
    deliverable_type TEXT DEFAULT 'text' CHECK (deliverable_type IN ('text', 'html', 'image', 'code', 'file')),
    language TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
    client_delivered BOOLEAN DEFAULT false,
    client_delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migración para tablas existentes
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS deliverable_type TEXT DEFAULT 'text';
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS client_delivered BOOLEAN DEFAULT false;
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS client_delivered_at TIMESTAMPTZ;
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS deployed BOOLEAN DEFAULT false;
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ;

-- Tabla de agentes
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    level INTEGER DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_requests_user ON public.client_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON public.client_requests(status);
CREATE INDEX IF NOT EXISTS idx_agent_messages_request ON public.agent_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_agent ON public.agent_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_request ON public.deliverables(request_id);

-- RLS Policies
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Políticas para client_requests
DROP POLICY IF EXISTS "users_see_own_requests" ON public.client_requests;
CREATE POLICY "users_see_own_requests" ON public.client_requests
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "users_see_external_requests" ON public.client_requests;
CREATE POLICY "users_see_external_requests" ON public.client_requests
    FOR SELECT USING (user_id IS NULL);

DROP POLICY IF EXISTS "users_insert_own_requests" ON public.client_requests;
CREATE POLICY "users_insert_own_requests" ON public.client_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_requests" ON public.client_requests;
CREATE POLICY "users_update_own_requests" ON public.client_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para agent_messages
DROP POLICY IF EXISTS "users_see_own_agent_messages" ON public.agent_messages;
CREATE POLICY "users_see_own_agent_messages" ON public.agent_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.client_requests
            WHERE id = agent_messages.request_id AND user_id = auth.uid()
        )
    );

-- Políticas para deliverables
DROP POLICY IF EXISTS "users_see_own_deliverables" ON public.deliverables;
CREATE POLICY "users_see_own_deliverables" ON public.deliverables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.client_requests
            WHERE id = deliverables.request_id AND user_id = auth.uid()
        )
    );

-- Políticas para agents (público de solo lectura)
DROP POLICY IF EXISTS "agents_readable_by_all" ON public.agents;
CREATE POLICY "agents_readable_by_all" ON public.agents
    FOR SELECT USING (true);

-- Poblar agentes desde archivos agents/ (112 agentes)
INSERT INTO public.agents (id, name, role, department, level) VALUES
    ('agents-orchestrator', 'Agents Orchestrator', 'Gerente general que coordina toda la agencia. Recibe pedidos, activa departamentos, orquesta el flujo y consolida resultados.', 'orchestrator', 1),
    ('book-co-author', 'Book Co-Author', 'Coautor de libros y contenido largo (lead magnets, whitepapers, ebooks).', 'strategy', 2),
    ('cultural-intelligence', 'Cultural Intelligence', 'Evalúa que el producto o campaña funcione en la cultura objetivo.', 'strategy', 2),
    ('offer-lead-gen-strategist', 'Offer & Lead Gen Strategist', 'Diseña la oferta y el lead magnet para atraer y convertir clientes potenciales.', 'strategy', 2),
    ('private-domain-operator', 'Private Domain Operator', 'Estrategia de comunidad y mensajería directa (WhatsApp/WeChat) para fidelizar clientes.', 'strategy', 2),
    ('product-manager', 'Product Manager', 'Define features, roadmap y PRD. Dueño del producto que decide qué construir.', 'strategy', 2),
    ('sprint-prioritizer', 'Sprint Prioritizer', 'Prioriza tareas y arma sprints basados en impacto y urgencia.', 'strategy', 2),
    ('strategy', 'Strategy', 'Define el posicionamiento y el plan estratégico para cada proyecto basado en research.', 'strategy', 2),
    ('trend-researcher', 'Trend Researcher', 'Investiga mercado, competencia y tendencias para fundamentar cada decisión de la agencia.', 'strategy', 2),
    ('behavioral-nudge-engine', 'Behavioral Nudge Engine', 'Diseña patrones de psicología conductual para mejorar conversión y engagement.', 'design', 3),
    ('brand-guardian', 'Brand Guardian', 'Guardián de la identidad de marca. Asegura consistencia visual y verbal en todos los entregables.', 'design', 3),
    ('feedback-synthesizer', 'Feedback Synthesizer', 'Analiza feedback de usuarios y extrae insights accionables.', 'design', 3),
    ('image-prompt-engineer', 'Image Prompt Engineer', 'Genera prompts para imágenes de producto con IA.', 'design', 3),
    ('inclusive-visuals-specialist', 'Inclusive Visuals Specialist', 'Asegura representación diversa y auténtica en imágenes y contenido visual.', 'design', 3),
    ('persona-walkthrough-specialist', 'Persona Walkthrough Specialist', 'Simula la experiencia del usuario paso a paso a través de diferentes perfiles.', 'design', 3),
    ('ui-designer', 'UI Designer', 'Diseñador visual especializado en crear interfaces hermosas, consistentes y accesibles.', 'design', 3),
    ('ux-architect', 'UX Architect', 'Arquitectura técnica de UX. Sistemas CSS y fundamentos de implementación.', 'design', 3),
    ('ux-researcher', 'UX Researcher', 'Pruebas de usuario, análisis de comportamiento y validación de diseños.', 'design', 3),
    ('visual-storyteller', 'Visual Storyteller', 'Narrativa visual del producto a través de multimedia, video e imágenes.', 'design', 3),
    ('whimsy-injector', 'Whimsy Injector', 'Agrega personalidad, delight y micro-interacciones divertidas a productos y marcas.', 'design', 3),
    ('aeo-foundations-architect', 'AEO Foundations Architect', 'Optimización para motores de respuesta AI (llms.txt, AI-aware robots.txt).', 'marketing', 4),
    ('agentic-search-optimizer', 'Agentic Search Optimizer', 'Optimiza sitios web para que agentes de AI los encuentren y usen.', 'marketing', 4),
    ('ai-citation-strategist', 'AI Citation Strategist', 'Mejora la visibilidad de la marca en ChatGPT, Claude, Gemini y Perplexity.', 'marketing', 4),
    ('app-store-optimizer', 'App Store Optimizer', 'Optimización de App Store (ASO) para apps móviles.', 'marketing', 4),
    ('baidu-seo-specialist', 'Baidu SEO Specialist', 'Optimización para Baidu, SEO China, cumplimiento ICP y ranking en el buscador chino.', 'marketing', 4),
    ('bilibili-content-strategist', 'Bilibili Content Strategist', 'Estrategia en Bilibili, algoritmo B站, cultura danmaku y crecimiento de UP主.', 'marketing', 4),
    ('carousel-growth-engine', 'Carousel Growth Engine', 'Genera y publica carruseles virales para Instagram y LinkedIn.', 'marketing', 4),
    ('china-market-specialist', 'China Market Specialist', 'Estrategia para mercado chino: WeChat, Douyin, Xiaohongshu, Baidu, Bilibili.', 'marketing', 4),
    ('content-creator', 'Content Creator', 'Estratega y creador de contenido multi-plataforma. Redacción, storytelling y copywriting.', 'marketing', 4),
    ('cross-border-ecommerce', 'Cross-Border E-Commerce', 'Estrategia de e-commerce global: Amazon, Shopee, Lazada,跨境物流.', 'marketing', 4),
    ('douyin-strategist', 'Douyin Strategist', 'Estrategia en Douyin (TikTok China), short-video marketing y algoritmo de recomendación.', 'marketing', 4),
    ('email-marketing-strategist', 'Email Marketing Strategist', 'Especialista en campañas de email marketing, automatización y deliverability.', 'marketing', 4),
    ('growth-hacker', 'Growth Hacker', 'Experimentos de crecimiento viral. Adquisición rápida de usuarios y optimización de conversión.', 'marketing', 4),
    ('instagram-curator', 'Instagram Curator', 'Estratega visual para Instagram. Curación de contenido, estética y crecimiento en IG.', 'marketing', 4),
    ('linkedin-content-creator', 'LinkedIn Content Creator', 'Crea contenido B2B y personal branding para LinkedIn.', 'marketing', 4),
    ('multi-platform-publisher', 'Multi-Platform Publisher', 'Publica contenido en múltiples plataformas desde un solo lugar.', 'marketing', 4),
    ('podcast-strategist', 'Podcast Strategist', 'Estrategia de podcasting, producción y distribución.', 'marketing', 4),
    ('reddit-community-builder', 'Reddit Community Builder', 'Marketing auténtico y construcción de comunidad en Reddit.', 'marketing', 4),
    ('seo-specialist', 'SEO Specialist', 'Especialista en optimización para motores de búsqueda. SEO técnico, contenido y link building.', 'marketing', 4),
    ('social-media-strategist', 'Social Media Strategist', 'Estratega de redes sociales multi-plataforma. Planifica contenido y crecimiento.', 'marketing', 4),
    ('tiktok-strategist', 'TikTok Strategist', 'Estratega de contenido viral para TikTok. Algoritmo, tendencias y crecimiento.', 'marketing', 4),
    ('twitter-engager', 'Twitter Engager', 'Thought leadership y community management en Twitter/X.', 'marketing', 4),
    ('video-optimization-specialist', 'Video Optimization Specialist', 'Estrategia de YouTube y video SEO para maximizar alcance orgánico.', 'marketing', 4),
    ('wechat-official-account-manager', 'WeChat Official Account Manager', 'Gestión de cuentas oficiales de WeChat, contenido y comunidad.', 'marketing', 4),
    ('xiaohongshu-specialist', 'Xiaohongshu Specialist', 'Estrategia en Xiaohongshu (RED), contenido lifestyle y tendencias.', 'marketing', 4),
    ('ad-creative-strategist', 'Ad Creative Strategist', 'Crea creativas publicitarias efectivas para Google, Meta y Performance Max.', 'paid-media', 5),
    ('paid-media-auditor', 'Paid Media Auditor', 'Auditoría de 200+ puntos de cuentas publicitarias para optimizar rendimiento.', 'paid-media', 5),
    ('paid-social-strategist', 'Paid Social Strategist', 'Estrategia de anuncios en Meta, LinkedIn y TikTok Ads.', 'paid-media', 5),
    ('ppc-campaign-strategist', 'PPC Campaign Strategist', 'Arquitecto de campañas publicitarias en Google, Meta y Amazon Ads.', 'paid-media', 5),
    ('programmatic-buyer', 'Programmatic & Display Buyer', 'Compra programática de display, GDN, DSPs y publicidad programática.', 'paid-media', 5),
    ('search-query-analyst', 'Search Query Analyst', 'Análisis de términos de búsqueda, keywords negativas y optimización de campañas PPC.', 'paid-media', 5),
    ('tracking-specialist', 'Tracking & Measurement Specialist', 'GTM, GA4, conversion tracking y CAPI para medir resultados precisos.', 'paid-media', 5),
    ('autonomous-optimization-architect', 'Autonomous Optimization Architect', 'Routing de LLMs, optimización de costos y shadow testing para sistemas autónomos.', 'specialized', 5),
    ('cultural-intelligence-strategist', 'Cultural Intelligence Strategist', 'UX global, representación cultural y diseño para audiencias internacionales.', 'specialized', 5),
    ('data-consolidation-agent', 'Data Consolidation Agent', 'Agregación de datos de ventas y consolidación de reportes.', 'specialized', 5),
    ('developer-advocate', 'Developer Advocate', 'Comunidad dev, contenido técnico y puente entre producto y desarrolladores.', 'specialized', 5),
    ('identity-graph-operator', 'Identity Graph Operator', 'Resolución de identidad multi-sistema para consistencia de datos entre plataformas.', 'specialized', 5),
    ('incident-response-commander', 'Incident Response Commander', 'Manejo de incidentes de producción, comando y control en situaciones de crisis.', 'specialized', 5),
    ('lsp-index-engineer', 'LSP/Index Engineer', 'Language Server Protocol, code intelligence e indexing para herramientas de desarrollo.', 'specialized', 5),
    ('mcp-builder', 'MCP Builder', 'Construye servidores MCP (Model Context Protocol) para extender capacidades de IA.', 'specialized', 5),
    ('model-qa-specialist', 'Model QA Specialist', 'Auditoría de modelos ML, evaluación de calidad y validación de outputs.', 'specialized', 5),
    ('report-distribution-agent', 'Report Distribution Agent', 'Distribución automática de reportes a equipos y clientes.', 'specialized', 5),
    ('sales-data-extraction-agent', 'Sales Data Extraction Agent', 'Monitoreo de datos de ventas en Excel, extracción de métricas y reportes.', 'specialized', 5),
    ('zk-steward', 'ZK Steward', 'Gestión de conocimiento, Zettelkasten y construcción de bases de conocimiento conectadas.', 'specialized', 5),
    ('ai-engineer', 'AI Engineer', 'Integra modelos de IA, crea pipelines de datos y soluciones de machine learning.', 'engineering', 6),
    ('appsec-engineer', 'Application Security Engineer', 'Seguridad en el ciclo de vida del desarrollo, SAST/DAST, código seguro.', 'engineering', 6),
    ('backend-architect', 'Backend Architect', 'Arquitecto de sistemas backend. APIs, bases de datos, microservicios y escalabilidad.', 'engineering', 6),
    ('code-reviewer', 'Code Reviewer', 'Revisión de código constructiva, calidad y mejores prácticas.', 'engineering', 6),
    ('compliance-auditor', 'Compliance Auditor', 'Auditoría de cumplimiento SOC2, ISO27001, HIPAA.', 'engineering', 6),
    ('data-engineer', 'Data Engineer', 'Construye pipelines de datos, ETL y arquitectura lakehouse.', 'engineering', 6),
    ('database-optimizer', 'Database Optimizer', 'Optimización de bases de datos PostgreSQL/MySQL, tuning e indexing.', 'engineering', 6),
    ('devops-automator', 'DevOps Automator', 'CI/CD, infraestructura cloud, automatización y despliegue continuo.', 'engineering', 6),
    ('email-intelligence-engineer', 'Email Intelligence Engineer', 'Procesamiento de emails, extracción estructurada de datos para agentes AI.', 'engineering', 6),
    ('frontend-developer', 'Frontend Developer', 'Desarrollador frontend experto en React, Vue y tecnologías web modernas.', 'engineering', 6),
    ('git-workflow-master', 'Git Workflow Master', 'Estrategia de branching, conventional commits y flujo de trabajo Git.', 'engineering', 6),
    ('incident-responder', 'Incident Responder', 'DFIR, contención de brechas y respuesta a incidentes de seguridad.', 'engineering', 6),
    ('mobile-app-builder', 'Mobile App Builder', 'Construye aplicaciones móviles nativas e híbridas con React Native y Flutter.', 'engineering', 6),
    ('penetration-tester', 'Penetration Tester', 'Pruebas de intrusión, ethical hacking y validación de seguridad.', 'engineering', 6),
    ('prompt-engineer', 'Prompt Engineer', 'Diseño de prompts para LLMs. Optimización de instrucciones para IA.', 'engineering', 6),
    ('rapid-prototyper', 'Rapid Prototyper', 'Crea MVPs rápidos y pruebas de concepto en tiempo récord.', 'engineering', 6),
    ('security-architect', 'Security Architect', 'Threat modeling, secure-by-design y seguridad en la arquitectura de sistemas.', 'engineering', 6),
    ('senior-developer', 'Senior Developer', 'Desarrollador senior con patrones avanzados y arquitectura de software.', 'engineering', 6),
    ('software-architect', 'Software Architect', 'Arquitectura de software, DDD, system design y análisis de trade-offs.', 'engineering', 6),
    ('sre', 'SRE', 'Site Reliability Engineering. SLOs, error budgets y observabilidad.', 'engineering', 6),
    ('technical-writer', 'Technical Writer', 'Documentación técnica, API docs y guías de usuario.', 'engineering', 6),
    ('accessibility-auditor', 'Accessibility Auditor', 'Auditoría de accesibilidad WCAG, screen readers y diseño inclusivo.', 'testing', 7),
    ('api-tester', 'API Tester', 'Validación de APIs, tests de integración y contrato.', 'testing', 7),
    ('evidence-collector', 'Evidence Collector', 'QA basado en screenshots y evidencia visual de calidad.', 'testing', 7),
    ('performance-benchmarker', 'Performance Benchmarker', 'Tests de carga, rendimiento y benchmark de sistemas.', 'testing', 7),
    ('reality-checker', 'Reality Checker', 'Certificador de calidad. Verifica que todo cumpla los estándares antes de entregar al cliente.', 'testing', 7),
    ('test-results-analyzer', 'Test Results Analyzer', 'Análisis de resultados de tests, cobertura y calidad.', 'testing', 7),
    ('tool-evaluator', 'Tool Evaluator', 'Evaluación de tecnologías, herramientas y plataformas.', 'testing', 7),
    ('workflow-optimizer', 'Workflow Optimizer', 'Optimización de procesos y flujos de trabajo para eficiencia operativa.', 'testing', 7),
    ('account-strategist', 'Account Strategist', 'Land-and-expand, QBRs, stakeholder mapping y crecimiento de cuentas.', 'sales', 8),
    ('deal-strategist', 'Deal Strategist', 'MEDDPICC, competitive positioning y estrategia para cerrar deals.', 'sales', 8),
    ('discovery-coach', 'Discovery Coach', 'SPIN, Gap Selling y estructura de llamadas de descubrimiento.', 'sales', 8),
    ('outbound-strategist', 'Outbound Strategist', 'Prospección basada en señales, secuencias multi-canal y outreach B2B.', 'sales', 8),
    ('pipeline-analyst', 'Pipeline Analyst', 'Forecasting, pipeline health, deal velocity y revenue operations.', 'sales', 8),
    ('proposal-strategist', 'Proposal Strategist', 'RFPs, win themes y narrativa persuasiva en propuestas comerciales.', 'sales', 8),
    ('sales-coach', 'Sales Coach', 'Desarrollo de representantes, call coaching y mejora del equipo de ventas.', 'sales', 8),
    ('sales-engineer', 'Sales Engineer', 'Demos técnicas, POCs, battlecards y soporte técnico en ventas.', 'sales', 8),
    ('accounts-payable', 'Accounts Payable Agent', 'Pagos, facturación, vendor management y cuentas por pagar.', 'finance', 9),
    ('analytics-reporter', 'Analytics Reporter', 'Crea dashboards, KPIs y reportes de business intelligence para mostrar resultados.', 'finance', 9),
    ('executive-summary-generator', 'Executive Summary Generator', 'Reportes ejecutivos para C-suite con resúmenes estratégicos.', 'finance', 9),
    ('finance-tracker', 'Finance Tracker', 'Controla el cash flow, presupuesto y planificación financiera de la agencia.', 'finance', 9),
    ('legal-compliance', 'Legal Compliance Checker', 'Regulaciones, compliance, revisiones legales y gestión de riesgos.', 'finance', 9),
    ('infrastructure-maintainer', 'Infrastructure Maintainer', 'Confiabilidad del sistema, monitoreo y mantenimiento de infraestructura.', 'support', 10),
    ('meeting-notes-specialist', 'Meeting Notes Specialist', 'Resúmenes estructurados de reuniones con decisiones y acciones.', 'support', 10),
    ('project-shepherd', 'Project Shepherd', 'Coordinación cross-funcional, timeline management y seguimiento de proyectos.', 'support', 10),
    ('studio-operations', 'Studio Operations', 'Eficiencia operativa, procesos y optimización del estudio.', 'support', 10),
    ('studio-producer', 'Studio Producer', 'Orquestación multi-proyecto, resource allocation y gestión de portfolio.', 'support', 10),
    ('support-responder', 'Support Responder', 'Atención al cliente, resolución de incidencias y soporte técnico.', 'support', 10)
ON CONFLICT (id) DO NOTHING;

-- Total: 112 agentes extraídos de agents/

-- ==========================================
-- Supabase Storage (bucket público para websites)
-- ==========================================
-- Ejecutar EN ORDEN en el SQL Editor de Supabase:
--
-- 1. Crear bucket público (para que getPublicUrl() funcione):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agency-files', 'agency-files', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;
--
-- 2. Política para que cualquiera pueda leer (necesario para websites públicos):
-- CREATE POLICY "public_read_agency_files" ON storage.objects
--     FOR SELECT USING (bucket_id = 'agency-files');
--
-- 3. Política para que usuarios autenticados puedan subir:
-- CREATE POLICY "authenticated_upload_agency_files" ON storage.objects
--     FOR INSERT WITH CHECK (
--         auth.role() = 'authenticated'
--         AND bucket_id = 'agency-files'
--     );
--
-- NOTA: El deploy-website.js usa service_role key, que bypasses RLS.
-- El bucket debe ser public=true para que getPublicUrl() devuelva URLs accesibles.
