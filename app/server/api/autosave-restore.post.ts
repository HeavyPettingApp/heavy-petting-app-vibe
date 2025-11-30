import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { fileId, userId, formId, patientId } = body

    if (!fileId || !userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required parameters'
        })
    }

    const supabase = serverSupabaseServiceRole(event)

    try {
        // Get the autosaved file reference from the database
        const { data: formData, error: queryError } = await supabase
            .from('form_autosave')
            .select('data')
            .eq('form_id', formId)
            .eq('user_id', userId)
            .eq('patient_id', patientId)
            .single()

        if (queryError || !formData) {
            console.error('Form data not found:', queryError)
            throw createError({
                statusCode: 404,
                statusMessage: 'Autosave data not found'
            })
        }

        const mediaFiles = (formData as any).data._autosave_media_files || []
        const fileRef = mediaFiles.find((f: any) => f.id === fileId)

        if (!fileRef) {
            console.error('File ref not found:', { fileId, availableIds: mediaFiles.map((f: any) => f.id) })
            throw createError({
                statusCode: 404,
                statusMessage: 'File not found in autosave data'
            })
        }

        // Get the file from autosave storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('form-autosave-files')
            .download(fileRef.autosave_path)

        if (downloadError || !fileData) {
            console.error('Storage download failed:', downloadError)
            throw createError({
                statusCode: 404,
                statusMessage: 'File not found in storage'
            })
        }

        // Set appropriate headers for file download
        // Properly encode the filename to avoid invalid characters in headers
        const encodedFilename = encodeURIComponent(fileRef.original_name).replace(/[!'()*]/g, (c) => {
            return '%' + c.charCodeAt(0).toString(16)
        })

        setHeader(event, 'Content-Type', fileRef.file_type || 'application/octet-stream')
        setHeader(event, 'Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`)
        setHeader(event, 'Content-Length', fileData.size)

        return fileData
    } catch (error) {
        console.error('Error restoring autosave file:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})
