export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { supabase } = await import('./lib/supabase.js')

    const { data: request, error } = await supabase.from('client_requests').insert({
      title: 'Landing Page para FinTech — Demo',
      description: `Necesitamos una landing page moderna para una startup FinTech que ofrece pagos digitales para negocios en LATAM.

Objetivos:
- Capturar leads de dueños de negocios
- Explicar el producto en menos de 30 segundos
- Integración con Stripe para pagos
- Diseño responsive y optimizado para móviles

Audiencia objetivo: dueños de pequeñas y medianas empresas en México, Colombia y Argentina, de 25-45 años, que buscan aceptar pagos online.

Requerimientos técnicos:
- Landing page en español
- SEO optimizado para "pagos online", "pasarela de pago"
- Formulario de registro con validación
- Sección de precios con 3 planes
- Testimonios de clientes ficticios pero realistas
- Blog integrado con 3 artículos iniciales sobre finanzas`,
      project_type: 'website',
      client_name: 'FinTech Demo Corp',
      budget: 18000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client_email: 'cliente-demo@agency-mx.app',
      refs: 'Referencias: https://stripe.com, https://mercadopago.com.uy, https://cuenca.com',
      source: 'demo',
      status: 'pending',
      brand_data: {
        business_name: 'FinTech Demo',
        industry: 'FinTech / Pagos Digitales',
        audience: 'Dueños de PyMEs en LATAM, 25-45 años',
        tone: 'Profesional, moderno, confiable',
        style: 'Minimalista con acentos en azul y verde',
        colors: ['#1e40af', '#059669', '#0ea5e9', '#f8fafc'],
        description: 'Pasarela de pagos digitales para negocios en Latinoamérica'
      }
    }).select().single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      requestId: request.id,
      title: request.title,
      message: 'Solicitud demo creada exitosamente'
    })

  } catch (error) {
    console.error('Demo error:', error)
    return res.status(500).json({ error: error.message })
  }
}
