const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 15 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato inválido. Use JPEG, PNG, WebP ou GIF.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Imagem muito grande. Máximo 2MB.';
  }
  return null;
}

export function validateMediaFile(file: File): string | null {
  if (file.type.startsWith('image/')) return validateImageFile(file);
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return 'Vídeo muito grande. Máximo 15MB.';
    }
    return null;
  }
  return 'Formato não suportado. Use foto (JPEG, PNG) ou vídeo curto (MP4, WebM).';
}

export function isVideoMediaUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function sanitizePostgrestSearch(term: string): string {
  return term.trim().replace(/[%_,().\\]/g, '');
}

export const MAX_RECORDACAO_MENSAGEM = 2000;
export const MAX_RECORDACAO_NOME = 100;
