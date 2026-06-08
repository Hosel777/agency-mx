import { supabase } from './lib/supabase.js'

const RESEND_API_URL = 'https://api.resend.com/emails'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { requestId } = req.body
  if (!requestId) {
    return res.status(400).json({ error: 'requestId required' })
  }

  try {
    const { data: request, error: reqError } = await supabase
      .from('client_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const { data: deliverables } = await supabase
      .from('deliverables')
      .select('content')
      .eq('request_id', requestId)
      .eq('agent_id', 'sales')
      .limit(1)

    const quoteContent = deliverables?.[0]?.content || ''
    const stripeLink = request.stripe_payment_link || ''
    const clientEmail = request.client_email || ''
    const projectTitle = request.title || 'Solicitud'

    const emailSent = await sendQuoteEmail(clientEmail, projectTitle, quoteContent, stripeLink)

    await notifySocialPulse(clientEmail, projectTitle, quoteContent, stripeLink, requestId)

    const { error: updateErr } = await supabase
      .from('client_requests')
      .update({ status: 'quote_sent', quote_sent_at: new Date().toISOString() })
      .eq('id', requestId)

    if (updateErr) {
      console.error('Error updating quote_sent_at:', updateErr)
    }

    console.log(`Quote sent for request ${requestId} to ${clientEmail || 'no email'}`)

    return res.status(200).json({
      success: true,
      requestId,
      email_sent: emailSent,
      message: `Presupuesto enviado${clientEmail ? ` a ${clientEmail}` : ''}`
    })

  } catch (err) {
    console.error('Send quote error:', err)
    return res.status(500).json({ error: err.message })
  }
}

async function sendQuoteEmail(email, title, quoteContent, stripeLink) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey || !email) return false

  try {
    const subject = `Presupuesto para "${title}" - Agency MX`
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Presupuesto</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f0f0f; color: #ffffff;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">Agency MX</h1>
    <p style="color: #9ca3af; margin-top: 5px;">Agencia de marketing digital con IA</p>
  </div>
  <div style="background: #1a1a1a; border-radius: 12px; padding: 30px; margin: 20px 0;">
    <h2 style="color: #ffffff; margin: 0 0 10px 0;">Presupuesto listo</h2>
    <p style="color: #d1d5db; line-height: 1.6;">Recibimos tu solicitud para <strong>"${title}"</strong> y generamos el siguiente presupuesto:</p>
    ${quoteContent ? `<div style="background: #252525; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <pre style="color: #e5e7eb; font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0; font-family: inherit;">${quoteContent}</pre>
    </div>` : ''}
    ${stripeLink ? `<div style="margin: 30px 0; text-align: center;">
      <a href="${stripeLink}" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Ir al pago →</a>
    </div>` : ''}
    <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">Este presupuesto tiene validez por 30 días.</p>
  </div>
  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>Si tenés dudas, respondé este correo.</p>
  </div>
</body>
</html>`

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Agency MX <notificaciones@socialpulse.app>',
        to: email,
        subject,
        html
      })
    })

    if (!response.ok) {
      const errData = await response.json()
      console.error('Resend error:', errData)
      return false
    }

    return true
  } catch (err) {
    console.error('sendQuoteEmail error:', err.message)
    return false
  }
}

async function notifySocialPulse(email, title, quoteContent, stripeLink, requestId) {
  const webhookUrl = process.env.SOCIALPULSE_WEBHOOK_URL
  const apiKey = process.env.AGENCY_MX_API_KEY

  if (!webhookUrl || !apiKey) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        client_email: email,
        title,
        quote_text: quoteContent,
        stripe_link: stripeLink,
        request_id: requestId,
        status: 'quote_sent'
      })
    })
  } catch (err) {
    console.error('notifySocialPulse error:', err.message)
  }
}
