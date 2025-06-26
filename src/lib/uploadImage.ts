import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'
import imageCompression from 'browser-image-compression'

type UploadImagemParams = {
    file: File
    folder: string
    filename?: string
    metadata?: Record<string, any>
    bucket?: string
}

export async function uploadImagem({
    file,
    folder,
    filename,
    metadata = {},
    bucket = 'imagens',
}: UploadImagemParams): Promise<string | null> {
    try {
        // Comprime e redimensiona a imagem (512px máx e 0.7 de qualidade)
        const compressedFile = await imageCompression(file, {
            maxWidthOrHeight: 512,
            maxSizeMB: 1,
            useWebWorker: true,
            initialQuality: 0.7,
        })

        const fileNameFinal = filename ?? `foto-${uuidv4()}.jpg`
        const filePath = `${folder}/${fileNameFinal}`

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile, {
                cacheControl: '3600',
                upsert: true,
                contentType: compressedFile.type,
                metadata,
            })

        if (error) {
            console.error('Erro ao fazer upload:', error.message)
            return null
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
        return data.publicUrl
    } catch (err) {
        console.error('Erro geral no upload:', err)
        return null
    }
}
