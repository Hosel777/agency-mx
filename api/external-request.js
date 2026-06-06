const ALLOWED_ORIGINS = [
  'https://marketing-app-jola.vercel.app',
  'https://agency-mx.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
]

function setCorsHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export default async function handler(req, res) {
  const origin = req.headers.origin
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = req.headers['x-api-key']
  const expectedKey = process.env.AGENCY_MX_API_KEY
  if (expectedKey && apiKey !== expectedKey) {
    return res.status(401).json({ error: 'API key inválida' })
  }

  const { title, description, project_type, client_name, client_email, budget, deadline, refs, source, brand_data, images } = req.body

  if (!title || !description) {
    return res.status(400).json({ error: 'title y description son requeridos' })
  }

  const validTypes = ['website', 'social_media', 'branding', 'seo', 'ads', 'content', 'full']
  const type = validTypes.includes(project_type) ? project_type : 'website'

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase no configurado' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

    const insertData = {
      title,
      description,
      project_type: type,
      client_name: client_name || null,
      budget: budget ? parseFloat(budget) : null,
      deadline: deadline || null,
      refs: JSON.stringify({ client_email, source, brand_data, images }) || '',
      status: 'pending'
    }

    const { data, error } = await supabase
      .from('client_requests')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Fallback: try without refs JSON
      delete insertData.refs
      const { data: data2, error: error2 } = await supabase
        .from('client_requests')
        .insert({ title, description, project_type: type, status: 'pending' })
        .select()
        .single()
      if (error2) {
        console.error('Error creating request:', error2)
        return res.status(500).json({ error: 'Error al crear la solicitud' })
      }
      return res.status(201).json({
        success: true,
        requestId: data2.id,
        status: data2.status,
        url: `${process.env.VERCEL_URL || 'https://agency-mx.vercel.app'}/requests/${data2.id}`
      })
    }

    return res.status(201).json({
      success: true,
      requestId: data.id,
      status: data.status,
      url: `${process.env.VERCEL_URL || 'https://agency-mx.vercel.app'}/requests/${data.id}`
    })

  } catch (err) {
    console.error('External request error:', err)
    return res.status(500).json({ error: err.message })
  }
}
