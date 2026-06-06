export function formatBrandContext(brandData, images = []) {
  if (!brandData) return ''

  let context = `\n\n--- DATOS DE MARCA DEL CLIENTE ---\n`

  if (brandData.business_name) {
    context += `Nombre del negocio: ${brandData.business_name}\n`
  }
  if (brandData.industry) {
    context += `Industria/Nicho: ${brandData.industry}\n`
  }
  if (brandData.audience) {
    context += `Público objetivo: ${brandData.audience}\n`
  }
  if (brandData.tone) {
    context += `Tono de comunicación: ${brandData.tone}\n`
  }
  if (brandData.style) {
    context += `Estilo visual: ${brandData.style}\n`
  }
  if (brandData.colors) {
    const colors = typeof brandData.colors === 'string'
      ? brandData.colors
      : Array.isArray(brandData.colors)
        ? brandData.colors.join(', ')
        : JSON.stringify(brandData.colors)
    context += `Colores de marca: ${colors}\n`
  }
  if (brandData.description) {
    context += `Descripción de la marca: ${brandData.description}\n`
  }

  if (images && images.length > 0) {
    context += `\nImágenes del cliente:\n`
    images.forEach((img, i) => {
      context += `  [${i + 1}] ${img.label || 'Imagen'}: ${img.url}\n`
    })
  }

  context += `--- FIN DATOS DE MARCA ---\n`

  return context
}

export function extractBrandVisuals(brandData) {
  const visuals = {}

  if (brandData?.colors) {
    const c = typeof brandData.colors === 'string'
      ? brandData.colors.split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : Array.isArray(brandData.colors)
        ? brandData.colors
        : []
    visuals.colors = c.length >= 2 ? c.slice(0, 4) : ['#1a1a2e', '#16213e', '#0f3460', '#e94560']
  }

  visuals.style = brandData?.style || 'moderno'
  visuals.tone = brandData?.tone || 'profesional'

  return visuals
}
