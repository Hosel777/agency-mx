const AGENTS_HIERARCHY = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Agents Orchestrator',
    role: 'Gerente General',
    level: 1,
    description: 'Recibe tu pedido, lo desglosa, activa los departamentos, coordina el flujo y consolida el resultado.',
    icon: 'Brain',
  },
  departments: [
    {
      id: 'estrategia',
      name: 'Estrategia & Research',
      level: 2,
      agents: [
        { id: 'trend-researcher', name: 'Trend Researcher', role: 'Investigador de mercado' },
        { id: 'product-manager', name: 'Product Manager', role: 'Define features y roadmap' },
        { id: 'strategy', name: 'Strategy', role: 'Posicionamiento y plan' },
        { id: 'cultural-intelligence', name: 'Cultural Intelligence', role: 'Evaluación cultural' },
        { id: 'lead-gen-strategist', name: 'Lead Gen Strategist', role: 'Diseño de ofertas' },
        { id: 'book-co-author', name: 'Book Co-Author', role: 'Contenido largo' },
      ],
    },
    {
      id: 'diseno',
      name: 'Producto & Diseño',
      level: 3,
      agents: [
        { id: 'ui-designer', name: 'UI Designer', role: 'Diseño visual' },
        { id: 'ux-researcher', name: 'UX Researcher', role: 'Pruebas de usuario' },
        { id: 'brand-guardian', name: 'Brand Guardian', role: 'Identidad de marca' },
        { id: 'visual-storyteller', name: 'Visual Storyteller', role: 'Narrativa visual' },
        { id: 'prompt-engineer', name: 'Image Prompt Engineer', role: 'Generación de imágenes' },
      ],
    },
    {
      id: 'marketing',
      name: 'Marketing & Contenido',
      level: 4,
      agents: [
        { id: 'content-creator', name: 'Content Creator', role: 'Redacción de contenidos' },
        { id: 'social-media', name: 'Social Media Strategist', role: 'Estrategia social' },
        { id: 'seo-specialist', name: 'SEO Specialist', role: 'Optimización SEO' },
        { id: 'email-marketing', name: 'Email Marketing Strategist', role: 'Email campaigns' },
        { id: 'growth-hacker', name: 'Growth Hacker', role: 'Crecimiento viral' },
        { id: 'instagram-curator', name: 'Instagram Curator', role: 'Estrategia visual IG' },
        { id: 'tiktok-strategist', name: 'TikTok Strategist', role: 'Contenido TikTok' },
        { id: 'linkedin-creator', name: 'LinkedIn Content Creator', role: 'Contenido B2B' },
      ],
    },
    {
      id: 'paid-media',
      name: 'Paid Media',
      level: 5,
      agents: [
        { id: 'ppc-strategist', name: 'PPC Campaign Strategist', role: 'Arquitectura de ads' },
        { id: 'search-analyst', name: 'Search Query Analyst', role: 'Análisis de keywords' },
        { id: 'ad-creative', name: 'Ad Creative Strategist', role: 'Creativas publicitarias' },
        { id: 'tracking-specialist', name: 'Tracking Specialist', role: 'GTM, GA4, CAPI' },
      ],
    },
    {
      id: 'ingenieria',
      name: 'Ingeniería',
      level: 6,
      agents: [
        { id: 'frontend-dev', name: 'Frontend Developer', role: 'React/Vue, UI components' },
        { id: 'backend-architect', name: 'Backend Architect', role: 'APIs, DB, escalabilidad' },
        { id: 'devops', name: 'DevOps Automator', role: 'CI/CD, infraestructura' },
        { id: 'ai-engineer', name: 'AI Engineer', role: 'Modelos ML, integración AI' },
        { id: 'security-architect', name: 'Security Architect', role: 'Seguridad' },
      ],
    },
    {
      id: 'testing',
      name: 'Testing & QA',
      level: 7,
      agents: [
        { id: 'reality-checker', name: 'Reality Checker', role: 'Certificación de calidad' },
        { id: 'api-tester', name: 'API Tester', role: 'Validación de APIs' },
        { id: 'accessibility-auditor', name: 'Accessibility Auditor', role: 'WCAG' },
      ],
    },
    {
      id: 'ventas',
      name: 'Ventas & CRM',
      level: 8,
      agents: [
        { id: 'outbound-strategist', name: 'Outbound Strategist', role: 'Prospección' },
        { id: 'deal-strategist', name: 'Deal Strategist', role: 'Estrategia de deals' },
        { id: 'pipeline-analyst', name: 'Pipeline Analyst', role: 'Forecasting' },
      ],
    },
    {
      id: 'finanzas',
      name: 'Finanzas & Legal',
      level: 9,
      agents: [
        { id: 'finance-tracker', name: 'Finance Tracker', role: 'Cash flow' },
        { id: 'legal-compliance', name: 'Legal Compliance', role: 'Regulaciones' },
        { id: 'analytics-reporter', name: 'Analytics Reporter', role: 'Dashboards y KPIs' },
      ],
    },
    {
      id: 'operaciones',
      name: 'Soporte & Operaciones',
      level: 10,
      agents: [
        { id: 'support-responder', name: 'Support Responder', role: 'Atención al cliente' },
        { id: 'project-shepherd', name: 'Project Shepherd', role: 'Coordinación' },
        { id: 'studio-producer', name: 'Studio Producer', role: 'Orquestación multi-proyecto' },
      ],
    },
  ],
}

export default AGENTS_HIERARCHY
