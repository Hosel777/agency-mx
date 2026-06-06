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
    FOR SELECT USING (auth.uid() = user_id);

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

-- Poblar agentes iniciales
INSERT INTO public.agents (id, name, role, department, level) VALUES
    ('orchestrator', 'Agents Orchestrator', 'Gerente General', 'Gerencia', 1),
    ('trend-researcher', 'Trend Researcher', 'Investigador de mercado', 'Estrategia & Research', 2),
    ('product-manager', 'Product Manager', 'Define features y roadmap', 'Estrategia & Research', 2),
    ('strategy', 'Strategy', 'Posicionamiento y plan', 'Estrategia & Research', 2),
    ('cultural-intelligence', 'Cultural Intelligence', 'Evaluación cultural', 'Estrategia & Research', 2),
    ('lead-gen-strategist', 'Lead Gen Strategist', 'Diseño de ofertas', 'Estrategia & Research', 2),
    ('ui-designer', 'UI Designer', 'Diseño visual', 'Producto & Diseño', 3),
    ('ux-researcher', 'UX Researcher', 'Pruebas de usuario', 'Producto & Diseño', 3),
    ('brand-guardian', 'Brand Guardian', 'Identidad de marca', 'Producto & Diseño', 3),
    ('visual-storyteller', 'Visual Storyteller', 'Narrativa visual', 'Producto & Diseño', 3),
    ('content-creator', 'Content Creator', 'Redacción de contenidos', 'Marketing & Contenido', 4),
    ('social-media', 'Social Media Strategist', 'Estrategia social', 'Marketing & Contenido', 4),
    ('seo-specialist', 'SEO Specialist', 'Optimización SEO', 'Marketing & Contenido', 4),
    ('email-marketing', 'Email Marketing Strategist', 'Email campaigns', 'Marketing & Contenido', 4),
    ('growth-hacker', 'Growth Hacker', 'Crecimiento viral', 'Marketing & Contenido', 4),
    ('ppc-strategist', 'PPC Campaign Strategist', 'Arquitectura de ads', 'Paid Media', 5),
    ('search-analyst', 'Search Query Analyst', 'Análisis de keywords', 'Paid Media', 5),
    ('ad-creative', 'Ad Creative Strategist', 'Creativas publicitarias', 'Paid Media', 5),
    ('frontend-dev', 'Frontend Developer', 'React/Vue, UI components', 'Ingeniería', 6),
    ('backend-architect', 'Backend Architect', 'APIs, DB, escalabilidad', 'Ingeniería', 6),
    ('devops', 'DevOps Automator', 'CI/CD, infraestructura', 'Ingeniería', 6),
    ('ai-engineer', 'AI Engineer', 'Modelos ML, integración AI', 'Ingeniería', 6),
    ('reality-checker', 'Reality Checker', 'Certificación de calidad', 'Testing & QA', 7),
    ('api-tester', 'API Tester', 'Validación de APIs', 'Testing & QA', 7),
    ('outbound-strategist', 'Outbound Strategist', 'Prospección', 'Ventas & CRM', 8),
    ('deal-strategist', 'Deal Strategist', 'Estrategia de deals', 'Ventas & CRM', 8),
    ('finance-tracker', 'Finance Tracker', 'Cash flow', 'Finanzas & Legal', 9),
    ('legal-compliance', 'Legal Compliance', 'Regulaciones', 'Finanzas & Legal', 9),
    ('analytics-reporter', 'Analytics Reporter', 'Dashboards y KPIs', 'Finanzas & Legal', 9),
    ('support-responder', 'Support Responder', 'Atención al cliente', 'Soporte & Operaciones', 10),
    ('project-shepherd', 'Project Shepherd', 'Coordinación', 'Soporte & Operaciones', 10),
    -- Agentes adicionales (sync con agents.js)
    ('book-co-author', 'Book Co-Author', 'Contenido largo', 'Estrategia & Research', 2),
    ('image-prompt-engineer', 'Image Prompt Engineer', 'Generación de imágenes', 'Producto & Diseño', 3),
    ('instagram-curator', 'Instagram Curator', 'Estrategia visual IG', 'Marketing & Contenido', 4),
    ('tiktok-strategist', 'TikTok Strategist', 'Contenido TikTok', 'Marketing & Contenido', 4),
    ('linkedin-content-creator', 'LinkedIn Content Creator', 'Contenido B2B', 'Marketing & Contenido', 4),
    ('tracking-specialist', 'Tracking Specialist', 'GTM, GA4, CAPI', 'Paid Media', 5),
    ('security-architect', 'Security Architect', 'Seguridad', 'Ingeniería', 6),
    ('accessibility-auditor', 'Accessibility Auditor', 'WCAG', 'Testing & QA', 7),
    ('pipeline-analyst', 'Pipeline Analyst', 'Forecasting', 'Ventas & CRM', 8),
    ('studio-producer', 'Studio Producer', 'Orquestación multi-proyecto', 'Soporte & Operaciones', 10)
ON CONFLICT (id) DO NOTHING;

-- Sincronizar agentes faltantes usando los archivos agents/ .md (opcional - para referencia)
-- Total: 41 agentes en SQL (31 originales + 10 añadidos)

-- ==========================================
-- Supabase Storage (bucket para archivos)
-- ==========================================
-- Ejecutar en el SQL Editor de Supabase:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agency-files', 'agency-files', false);
--
-- Política para subir archivos (usuarios autenticados):
-- CREATE POLICY "users_upload_own_files" ON storage.objects
--     FOR INSERT WITH CHECK (
--         auth.role() = 'authenticated'
--         AND bucket_id = 'agency-files'
--     );
--
-- Política para leer archivos (usuarios autenticados):
-- CREATE POLICY "users_read_files" ON storage.objects
--     FOR SELECT USING (
--         auth.role() = 'authenticated'
--         AND bucket_id = 'agency-files'
--     );
