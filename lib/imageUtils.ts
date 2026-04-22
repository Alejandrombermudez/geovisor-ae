/**
 * Transforma una URL pública de Supabase Storage al endpoint de redimensionado.
 * Si la URL no es de Supabase Storage, la devuelve tal cual (no lanza error).
 *
 * Requiere que "Image Transformations" esté habilitado en el proyecto Supabase.
 * URL original:    /storage/v1/object/public/{bucket}/{path}
 * URL resized:     /storage/v1/render/image/public/{bucket}/{path}?width=W&quality=Q
 */
export function resizeSupabaseUrl(url: string, width: number, quality = 60): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return (
    url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
    `?width=${width}&quality=${quality}`
  )
}
