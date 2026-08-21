import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

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

export type ArquivoAnexo = {
    path: string
    nome: string
    mime: string
    tamanho: number
}

export function validarArquivo(file: File): string | null {
    if (file.size > TAMANHO_MAXIMO) return 'Arquivo maior que 10 MB.'
    if (file.type && !TIPOS_ACEITOS.includes(file.type.toLowerCase())) {
        return 'Envie um PDF ou uma imagem (JPG, PNG, WEBP).'
    }
    return null
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
    const erro = validarArquivo(file)
    if (erro) throw new Error(erro)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${titularId}/${pasta}/${uuidv4()}.${ext}`

    const { error } = await supabase.storage.from(MP_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
    })

    if (error) throw new Error(error.message)

    return {
        path,
        nome: file.name,
        mime: file.type || '',
        tamanho: file.size,
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
