import { ref, watch, onMounted, readonly } from "vue"

// Debounce function
function debounce (func, delay) {
  let timeoutId = null
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const useFormAutosaveSupabase = (formId, initialData, patient_id = 'currentUser', debounceMs = 1000) => {
  const formData = ref({ ...initialData })
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const isLoaded = ref(false)

  // Track autosaved media files
  const autosaveMediaFiles = ref([])

  // --- Internal Functions ---

  // Helper function to convert date strings back to Date objects
  const convertDateStrings = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return data

    // Helper to check if a string looks like an ISO date
    const isISODateString = (value) => {
      if (typeof value !== 'string') return false
      // Check for ISO date pattern (YYYY-MM-DDTHH:mm:ss.sssZ or similar)
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
      return isoDateRegex.test(value)
    }

    const converted = { ...data }

    // Only process top-level properties (typical form structure)
    for (const [key, value] of Object.entries(converted)) {
      if (isISODateString(value)) {
        try {
          const dateValue = new Date(value)
          if (!isNaN(dateValue.getTime())) {
            converted[key] = dateValue
          }
        } catch (error) {
          console.warn(`[AutosaveSupabase] Failed to convert ${ key } to date:`, error)
        }
      }
    }

    return converted
  }

  const _save = async () => {
    if (!formId || !user.value || !isLoaded.value) return

    try {
      // Include media files in the form data
      const dataToSave = {
        ...formData.value,
        _autosave_media_files: autosaveMediaFiles.value
      }

      const { error } = await supabase.from("form_autosave").upsert(
        {
          form_id: formId,
          user_id: user.value.id,
          patient_id: patient_id,
          data: dataToSave,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,form_id,patient_id'
        }
      )

      if (error) {
        console.error("Supabase upsert error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
    } catch (error) {
      console.error(`[AutosaveSupabase] Error saving form ${ formId } to Supabase:`, error)
    }
  }

  const debouncedSave = debounce(_save, debounceMs)

  // --- Public API ---

  /**
   * Loads form data from Supabase if it exists.
   * This is called automatically on mount.
   */
  const load = async () => {
    if (!formId || !user.value) {
      isLoaded.value = true
      return
    }

    try {
      const { data, error } = await supabase
        .from("form_autosave")
        .select("data")
        .eq("form_id", formId)
        .eq("user_id", user.value.id)
        .eq("patient_id", patient_id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116: "exact one row not found"
        console.error(`[AutosaveSupabase] Supabase error details:`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      if (data) {
        // Extract media files if they exist
        const mediaFiles = data.data._autosave_media_files || []
        autosaveMediaFiles.value = mediaFiles

        // Merge autosaved data with initial data, autosaved takes precedence
        // Exclude the media files from the regular form data
        const { _autosave_media_files, ...regularFormData } = data.data

        // Convert date strings back to Date objects
        const convertedFormData = convertDateStrings(regularFormData)

        formData.value = { ...initialData, ...convertedFormData }
      }

      isLoaded.value = true
    } catch (error) {
      console.error(
        `[AutosaveSupabase] Error loading form ${ formId } from Supabase:`,
        error
      )
      isLoaded.value = true // Still mark as loaded even if there was an error
    }
  }

  /**
   * Updates form data programmatically (useful for form state changes)
   */
  const updateFormData = (newData) => {
    if (!isLoaded.value) return
    Object.assign(formData.value, newData)
  }

  /**
   * Clears the form data from Supabase.
   * Call this after a successful form submission.
   */
  const clear = async () => {
    if (!formId || !user.value) return
    try {
      // First, clean up any autosaved media files
      await clearAutosaveMediaFiles()

      // Then remove the form data record
      const { error } = await supabase
        .from("form_autosave")
        .delete()
        .eq("form_id", formId)
        .eq("user_id", user.value.id)
        .eq("patient_id", patient_id)

      if (error) throw error

      // Clear local state
      autosaveMediaFiles.value = []
    } catch (error) {
      console.error(
        `[AutosaveSupabase] Error clearing form ${ formId } from Supabase:`,
        error
      )
    }
  }

  /**
   * Saves a media file to the autosave bucket and returns the file reference
   */
  const saveAutosaveMediaFile = async (file, metadata = {}) => {
    if (!formId || !user.value || !file) {
      return null
    }

    try {
      // Generate unique filename
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop()
      const autosaveFileName = `${ formId }_${ user.value.id }_${ patient_id }_${ timestamp }.${ fileExtension }`

      // Upload to autosave bucket with timeout
      const uploadPromise = supabase.storage
        .from('form-autosave-files')
        .upload(autosaveFileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      // Add a timeout to detect hanging uploads
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      })

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise])

      if (error) {
        console.error('[AutosaveSupabase] Error uploading autosave media file:', error)
        throw error
      }

      // Create file reference - use the generated filename, not data.path
      const fileRef = {
        id: timestamp.toString(),
        autosave_path: autosaveFileName, // Use the generated filename that matches what's in storage
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        metadata: metadata,
        uploaded_at: new Date().toISOString()
      }

      // Add to local array and trigger save
      autosaveMediaFiles.value.push(fileRef)

      return fileRef
    } catch (error) {
      console.error(`[AutosaveSupabase] Error saving autosave media file:`, error)
      return null
    }
  }

  /**
   * Removes a media file from autosave
   */
  const removeAutosaveMediaFile = async (fileId) => {
    if (!formId || !user.value || !fileId) return

    try {
      // Find the file reference
      const fileIndex = autosaveMediaFiles.value.findIndex(f => f.id === fileId)
      if (fileIndex === -1) return

      const fileRef = autosaveMediaFiles.value[fileIndex]

      // Remove from storage
      const { error } = await supabase.storage
        .from('form-autosave-files')
        .remove([fileRef.autosave_path])

      if (error) {
        console.error('[AutosaveSupabase] Error removing autosave media file:', error)
        // Don't throw here, still remove from local array
      }

      // Remove from local array
      autosaveMediaFiles.value.splice(fileIndex, 1)
    } catch (error) {
      console.error(`[AutosaveSupabase] Error removing autosave media file:`, error)
    }
  }

  /**
   * Clears all autosaved media files
   */
  const clearAutosaveMediaFiles = async () => {
    if (!autosaveMediaFiles.value.length) return

    try {
      // Get all file paths
      const filePaths = autosaveMediaFiles.value.map(f => f.autosave_path)

      // Remove all files from storage
      const { error } = await supabase.storage
        .from('form-autosave-files')
        .remove(filePaths)

      if (error) {
        console.error('[AutosaveSupabase] Error clearing autosave media files:', error)
      }
    } catch (error) {
      console.error(`[AutosaveSupabase] Error clearing autosave media files:`, error)
    }
  }

  /**
   * Gets a signed URL for an autosaved media file
   */
  const getAutosaveMediaFileUrl = async (fileRef, expiresIn = 3600) => {
    if (!fileRef?.autosave_path) return null

    try {
      const { data, error } = await supabase.storage
        .from('form-autosave-files')
        .createSignedUrl(fileRef.autosave_path, expiresIn)

      if (error) throw error

      return data.signedUrl
    } catch (error) {
      console.error(`[AutosaveSupabase] Error getting signed URL:`, error)
      return null
    }
  }

  // --- Lifecycle and Watchers ---

  // Load data when the composable is first used
  onMounted(async () => {
    try {
      awai load()
      // Only start watching after data is loaded to prevent unnecessary saves
      watch(
        formData,
        (newData) => {
          if (newData && isLoaded.value) {
            debouncedSave()
          }
        },
        { deep: true }
      )
    } catch (error) {
      console.error(`[AutosaveSupabase] Error during initialization:`, error)
      isLoaded.value = true // Mark as loaded even if there was an error
    }
  })

  return {
    formData,
    load,
    clear,
    updateFormData,
    isLoaded,
    // Expose user and other properties needed for API calls
    user: readonly(user),
    formId,
    patient_id,
    // Media file methods
    autosaveMediaFiles: readonly(autosaveMediaFiles),
    saveAutosaveMediaFile,
    removeAutosaveMediaFile,
    getAutosaveMediaFileUrl,
  }
}
