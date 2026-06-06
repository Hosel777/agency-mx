import { supabase } from './lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { deliverableId, requestId, content, title } = req.body
  if (!deliverableId || !content) {
    return res.status(400).json({ error: 'deliverableId and content required' })
  }

  try {
    const slug = (title || 'website')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
    const timestamp = Date.now()
    const filename = `${slug}-${timestamp}.html`
    const storagePath = `websites/${filename}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agency-files')
      .upload(storagePath, content, {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      if (uploadError.message?.includes('bucket')) {
        return res.status(400).json({
          error: 'El bucket agency-files no existe. Créalo en Supabase Dashboard > Storage.',
          hint: 'CREATE POLICY ...'
        })
      }
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from('agency-files')
      .getPublicUrl(storagePath)

    const publicUrl = urlData?.publicUrl

    if (publicUrl) {
      await supabase
        .from('deliverables')
        .update({ file_url: publicUrl, deployed: true, deployed_at: new Date().toISOString() })
        .eq('id', deliverableId)
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: storagePath,
      filename
    })

  } catch (error) {
    console.error('Deploy error:', error)
    return res.status(500).json({ error: error.message })
  }
}
