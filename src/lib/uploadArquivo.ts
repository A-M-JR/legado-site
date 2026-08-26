import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import imageCompression from 'browser-image-compression'

export const MP_BUCKET = 'mp-arquivos'

const TIPOS_ACEITOS = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
]

const TAMANHO_MAXIMO = 10 * 1024 * 1024 // 10 MB
const COMPRIMIR_ACIMA_DE = 1.5 * 1024 * 1024 // fotos de celular passam disso com folga

export type ArquivoAnexo = {
    path: string
    nome: string
    mime: string
    tamanho: number
}

export function ehImagem(mime?: string): boolean {
    return Boolean(mime && mime.toLowerCase().startsWith('image/'))
}

export function validarTipo(file: File): string | null {
    if (file.type && !TIPOS_ACEITOS.includes(file.type.toLowerCase())) {
        return 'Envie um PDF ou uma imagem (JPG, PNG, WEBP).'
    }
    return null
}

export function validarArquivo(file: File): string | null {
    if (file.size > TAMANHO_MAXIMO) return 'Arquivo maior que 10 MB.'
    return validarTipo(file)
}

export function formatarTamanho(bytes?: number): string {
    if (!bytes || bytes <= 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Reduz fotos grandes de laudo/exame mantendo leitura confortável (2000px, ~3 MB).
 * PDF e imagem pequena passam direto.
 */
async function comprimirSePreciso(file: File): Promise<File> {
    if (!ehImagem(file.type) || file.size <= COMPRIMIR_ACIMA_DE) return file
    try {
        const comprimido = await imageCompression(file, {
            maxWidthOrHeight: 2000,
            maxSizeMB: 3,
            useWebWorker: true,
            initialQuality: 0.82,
        })
        return new File([comprimido], file.name, {
            type: comprimido.type || file.type,
            lastModified: file.lastModified,
        })
    } catch {
        return file
    }
}

/**
 * Sobe um arquivo para o bucket privado mp-arquivos.
 * Caminho: <titularId>/<pasta>/<uuid>.<ext> — as policies do bucket olham a primeira pasta.
 */
export async function uploadArquivo({
    file,
    titularId,
    pasta,
}: {
    file: File
    titularId: string
    pasta: string
}): Promise<ArquivoAnexo> {
    const erroTipo = validarTipo(file)
    if (erroTipo) throw new Error(erroTipo)

    const enviar = await comprimirSePreciso(file)
    if (enviar.size > TAMANHO_MAXIMO) throw new Error('Arquivo maior que 10 MB.')

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${titularId}/${pasta}/${uuidv4()}.${ext}`

    const { error } = await supabase.storage.from(MP_BUCKET).upload(path, enviar, {
        cacheControl: '3600',
        upsert: false,
        contentType: enviar.type || file.type || undefined,
    })

    if (error) throw new Error(error.message)

    return {
        path,
        nome: file.name,
        mime: enviar.type || file.type || '',
        tamanho: enviar.size,
    }
}

/** Link temporário para abrir/baixar um arquivo do bucket privado. */
export async function assinarArquivo(path: string, segundos = 3600): Promise<string | null> {
    if (!path) return null
    const { data, error } = await supabase.storage
        .from(MP_BUCKET)
        .createSignedUrl(path, segundos)
    if (error) {
        console.warn('createSignedUrl:', error.message)
        return null
    }
    return data?.signedUrl ?? null
}

export async function removerArquivo(path: string): Promise<void> {
    if (!path) return
    await supabase.storage.from(MP_BUCKET).remove([path])
}
