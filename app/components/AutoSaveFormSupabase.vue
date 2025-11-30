<script setup>
import { useFormAutosaveSupabase } from "~/composables/useFormAutosaveSupabase"
import { toRefs, useAttrs, ref, watch, computed } from "vue"

const props = defineProps({
  formId: {
    type: String,
    required: true,
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  resolver: {
    type: Function,
    required: true,
  },
})

const attrs = useAttrs()
const emit = defineEmits(["submit"])

const { formId, initialValues } = toRefs(props)

// Use the Supabase autosave composable
const autosaveComposable = useFormAutosaveSupabase(formId.value, initialValues.value)

const {
  formData,
  clear: clearAutosavedData,
  updateFormData,
  isLoaded,
} = autosaveComposable

// Create merged initial values for the form (initial + autosaved)
// This ensures autosaved data takes precedence over initial values
const mergedInitialValues = computed(() => {
  if (!isLoaded.value) return {}

  const merged = { ...initialValues.value, ...formData.value }
  return merged
})

// Track current form state for autosaving
const currentFormState = ref(null)

// Extract current values from form state and save them
const updateAutosaveData = (formState) => {
  if (!formState || !isLoaded.value) return

  const currentValues = {}
  for (const [key, fieldState] of Object.entries(formState)) {
    if (fieldState && fieldState.value !== undefined) {
      currentValues[key] = fieldState.value
    }
  }

  // Update formData using the composable's method to avoid circular updates
  updateFormData(currentValues)
}

// Single watcher for form state changes
watch(currentFormState, updateAutosaveData, { deep: true })

// Handle the submit event from the underlying PrimeVue Form
const handleSubmit = (event) => {
  if (event.valid) {
    clearAutosavedData()
  }
  emit("submit", event)
}

// Function to capture form state changes
const captureFormState = (formState) => {
  try {
    currentFormState.value = formState
  } catch (error) {
    console.warn("[AutoSaveFormSupabase] Error capturing form state:", error)
  }
}

// Safe way to provide autosave composable to the form
const safeAutosaveComposable = computed(() => {
  try {
    return autosaveComposable
  } catch (error) {
    console.warn("[AutoSaveFormSupabase] Error accessing autosave composable:", error)
    return null
  }
})
</script>

<template>
  <!-- Only render the form after data is loaded -->
  <Form
    v-if="isLoaded"
    v-slot="$form"
    :initialValues="mergedInitialValues"
    :resolver="props.resolver"
    @submit="handleSubmit"
    v-bind="attrs"
  >
    <!-- Capture form state changes for autosave -->
    <div style="display: none">{{ captureFormState($form) }}</div>
    <!-- Provide autosave composable to child components -->
    <div style="display: none">
      {{ ($form.autosaveComposable = safeAutosaveComposable) }}
    </div>
    <slot v-bind="{ ...$form, autosaveComposable: safeAutosaveComposable }"></slot>
  </Form>

  <!-- Loading state while data is being loaded -->
  <div v-else class="flex justify-center items-center p-8">
    <div class="text-surface-500">Loading saved form data...</div>
  </div>
</template>
