import { supabase } from './supabase'

const BUCKET = 'agency-files'

export async function uploadFile(file, path = '') {
  const filePath = path
    ? `${path}/${Date.now()}-${file.name}`
    : `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
  }
}

export async function deleteFile(path) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  return { error }
}

export async function listFiles(path = '') {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(path)

  return { data, error }
}
