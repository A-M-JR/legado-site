const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato inválido. Use JPEG, PNG, WebP ou GIF.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Imagem muito grande. Máximo 2MB.';
  }
  return null;
}

export function sanitizePostgrestSearch(term: string): string {
  return term.trim().replace(/[%_,().\\]/g, '');
}

export const MAX_RECORDACAO_MENSAGEM = 2000;
export const MAX_RECORDACAO_NOME = 100;
