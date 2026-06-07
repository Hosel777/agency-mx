import { supabase } from './lib/supabase.js'

const SQL = `
DROP POLICY IF EXISTS "users_see_external_requests" ON public.client_requests;
CREATE POLICY "users_see_external_requests" ON public.client_requests
    FOR SELECT USING (user_id IS NULL);
`

export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key']
  const expectedKey = process.env.AGENCY_MX_API_KEY

  if (!expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: SQL })
    if (error) {
      return res.json({ error: error.message, hint: 'Ejecutá el SQL manualmente en Supabase Dashboard > SQL Editor' })
    }
    return res.json({ success: true, message: 'Política creada' })
  } catch (e) {
    return res.json({ error: e.message, hint: 'Ejecutá el SQL manualmente en Supabase Dashboard > SQL Editor' })
  }
}
