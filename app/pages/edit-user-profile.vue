<script setup>
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from 'primevue/usetoast'
import {
  prefixes,
  genders,
  spokenLanguages,
  medicalSpecialties,
  boardCertifications,
  employmentTypes,
  rolePositions,
  emergencyContactRelationships,
} from '~/server/data/selectOptionsData.js'

const orgHospitals = ref([])

const fetchOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')

  if (error) {
    console.error('Error fetching organizations:', error)
    return
  }

  orgHospitals.value = data
    .map((org) => ({
      label: org.organization_name || org.name,
      value: org.organization_id || org.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

onMounted(() => {
  fetchOrganizations()
})

// Load Google Maps API with Places library
const runtimeConfig = useRuntimeConfig()
useHead({
  script: [
    {
      src: `https://maps.googleapis.com/maps/api/js?key=${runtimeConfig.public.googleMapsApiKey}&libraries=places&loading=async`,
      async: true,
      defer: true,
    },
  ],
})

const { user, userProfile } = useAuth()
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

// Refs
const UploadMediaREF = ref(null)
const addressInputRef = ref(null)
const address2InputRef = ref(null)
const signatureRef = ref(null)
const avatarREF = ref(null)

// Redirect if not logged in
watchEffect(() => {
  if (!user.value) {
    router.push('/login')
  }
})

// Form State
const initialValues = ref({
  prefix: null,
  first_name: "",
  last_name: "",
  suffix: "",
  dob: null,
  hospitals: [],
  email: "",
  personal_email: "",
  phone: "",
  role: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  gender: null,
  employment_type: null,
  spoken_languages: [],
  medical_license_number: "",
  medical_license_expiration_date: null,
  dea_number: "",
  npi_number: "",
  specialties: [],
  medical_school_attended: "",
  medical_school_year_of_graduation: null,
  board_certifications: [],
  malpractice_insurance_provider: "",
  malpractice_policy_number: "",
  avatar_url: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: null,
  signature: "",
})

// Validation Schema (Copied from reference)
const resolver = zodResolver(
  z.object({
      prefix: z.string().nullable().refine((val) => val !== null && val !== '', { message: "Please select a prefix." }),
      first_name: z.string().min(1, { message: "First name is required." }),
      last_name: z.string().min(1, { message: "Last name is required." }),
      suffix: z.string().nullable().optional(),
      dob: z.date().nullable().refine((date) => date !== null, { message: "Date of Birth is required." }),
      hospitals: z.array(z.string()).min(1, { message: "At least one hospital is required." }),
      personal_email: z.string().email({ message: "Invalid email address." }).min(1, { message: "Personal email is required." }),
      phone: z.string().min(10, { message: "Phone number is required and must be at least 10 digits." }),
      address: z.string({ invalid_type_error: "Street address is required.", required_error: "Street address is required." }).min(1, { message: "Street address is required." }),
      address2: z.string().optional(),
      city: z.string({ invalid_type_error: "City is required.", required_error: "City is required." }).min(1, { message: "City is required." }),
      state: z.string({ invalid_type_error: "State/Province is required.", required_error: "State/Province is required." }).min(1, { message: "State/Province is required." }),
      zip: z.string({ invalid_type_error: "ZIP/Postal Code is required.", required_error: "ZIP/Postal Code is required." }).min(1, { message: "ZIP/Postal Code is required." }),
      country: z.string({ invalid_type_error: "Country is required.", required_error: "Country is required." }).min(1, { message: "Country is required." }),
      gender: z.string().nullable().refine((val) => val !== null, { message: "Gender is required." }),
      employment_type: z.string().nullable().refine((val) => val !== null, { message: "Employment type is required." }),
      role: z.string().nullable().refine((val) => val !== null, { message: "Role/Position is required." }),
      spoken_languages: z.array(z.string()).min(1, { message: "At least one spoken language is required." }),
      specialties: z.array(z.string()).min(1, { message: "At least one specialty is required." }),
      medical_license_number: z.string().min(1, { message: "Medical License Number is required." }).regex(/^[A-Za-z0-9]{5,20}$/, { message: "Invalid Medical License Number format." }),
      medical_license_expiration_date: z.date().nullable().refine((date) => date !== null, { message: "License Expiration Date is required." }),
      dea_number: z.string().optional().refine((val) => !val || /^[A-Za-z]{2}[0-9]{7}$/.test(val), { message: "Invalid DEA Number format." }),
      npi_number: z.string().regex(/^\d{10}$/, { message: "NPI Number must be 10 digits." }),
      medical_school_attended: z.string().min(1, { message: "Medical School is required." }),
      medical_school_year_of_graduation: z.date().nullable().refine((date) => date !== null, { message: "Year of Graduation is required." }),
      board_certifications: z.array(z.string()).nullable().optional(),
      malpractice_insurance_provider: z.string().min(1, { message: "Malpractice Insurance Provider is required." }),
      malpractice_policy_number: z.string().min(1, { message: "Malpractice Policy Number is required." }),
      emergency_contact_name: z.string().min(1, { message: "Emergency contact name is required." }),
      emergency_contact_phone: z.string().min(10, { message: "Phone number is required and must be at least 10 digits." }),
      emergency_contact_relationship: z.string().nullable().refine((val) => val !== null, { message: "Emergency contact relationship is required." }),
      avatar_url: z.string().min(1, { message: "Avatar image is required." }),
      signature: z.string().min(1, { message: "Signature is required." }),
    })
)

// Load Data
watch(userProfile, (profile) => {
  if (profile) {
    initialValues.value = {
      ...initialValues.value,
      ...profile,
      email: user.value?.email || profile.email,
      address2: profile.address_line_2 || '',
      // Ensure string fields are not null to satisfy z.string()
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      personal_email: profile.personal_email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      zip: profile.zip || "",
      country: profile.country || "",
      medical_license_number: profile.medical_license_number || "",
      dea_number: profile.dea_number || "",
      npi_number: profile.npi_number || "",
      medical_school_attended: profile.medical_school_attended || "",
      malpractice_insurance_provider: profile.malpractice_insurance_provider || "",
      malpractice_policy_number: profile.malpractice_policy_number || "",
      emergency_contact_name: profile.emergency_contact_name || "",
      emergency_contact_phone: profile.emergency_contact_phone || "",
      avatar_url: profile.avatar_url || "",
      signature: profile.signature || "",
      
      // Ensure arrays and dates are correctly formatted
      // Parse dates as local timezone to avoid timezone offset issues
      dob: profile.dob ? new Date(profile.dob + 'T00:00:00') : null,
      medical_license_expiration_date: profile.medical_license_expiration_date ? new Date(profile.medical_license_expiration_date + 'T00:00:00') : null,
      medical_school_year_of_graduation: profile.medical_school_year_of_graduation ? new Date(profile.medical_school_year_of_graduation + 'T00:00:00') : null,
      spoken_languages: Array.isArray(profile.spoken_languages) ? profile.spoken_languages : [],
      specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
      board_certifications: Array.isArray(profile.board_certifications) ? profile.board_certifications : [],
      hospitals: Array.isArray(profile.hospitals) ? profile.hospitals : [],
    }
  }
}, { immediate: true })

// Google Maps Autocomplete
const initGoogleMapsAutocomplete = () => {
  if (typeof window === 'undefined' || !window.google?.maps?.places || !addressInputRef.value) return

  const inputElement = addressInputRef.value.$el.querySelector('input') || addressInputRef.value.$el
  const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
    types: ['address'],
    fields: ['address_components', 'geometry'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.address_components) return

    let streetAddress = ''
    let postcode = ''
    let city = ''
    let state = ''
    let country = ''
    let sublocality = ''

    for (const component of place.address_components) {
        const allTypes = component.types
        if (allTypes.includes("street_number")) {
          streetAddress = `${component.long_name} ${streetAddress}`
        } else if (allTypes.includes("route")) {
          streetAddress += component.short_name
        } else if (allTypes.includes("postal_code")) {
          postcode = `${component.long_name}${postcode}`
        } else if (allTypes.includes("postal_code_suffix")) {
          postcode = `${postcode}-${component.long_name}`
        } else if (allTypes.includes("locality")) {
          city = component.long_name
        } else if (allTypes.includes("sublocality_level_1")) {
          sublocality = component.long_name
        } else if (allTypes.includes("administrative_area_level_1")) {
          state = component.short_name
        } else if (allTypes.includes("country")) {
          country = component.long_name
        }
    }

    if (!city && sublocality) {
        city = sublocality
    }

    // Update form values directly
    initialValues.value.address = streetAddress
    initialValues.value.city = city
    initialValues.value.state = state
    initialValues.value.zip = postcode
    initialValues.value.country = country
    
    // Clear the autocomplete's full address and set only the street address
    nextTick(() => {
      inputElement.value = streetAddress
      // Trigger input event to notify the form of the change
      inputElement.dispatchEvent(new Event('input', { bubbles: true }))
      
      // Focus on address2
      const address2Input = address2InputRef.value?.$el?.querySelector('input') || address2InputRef.value?.$el
      address2Input?.focus()
    })
  })
}

onMounted(() => {
  const interval = setInterval(() => {
    if (window.google?.maps?.places) {
      initGoogleMapsAutocomplete()
      clearInterval(interval)
    }
  }, 500)
})

// Submit Handler
const onFormSubmit = async (e) => {
  if (e.valid) {
    try {
      // Upload Avatar if changed
      await UploadMediaREF.value?.uploadFiles()

      const updates = {
        ...e.values,
        id: user.value.sub,
        updated_at: new Date(),
        address_line_2: e.values.address2, // Map back
        avatar_url: initialValues.value.avatar_url, // Explicitly include avatar_url from initialValues
        // Explicitly include address fields from initialValues (disabled fields + address that might not update form state)
        address: initialValues.value.address,
        city: initialValues.value.city,
        state: initialValues.value.state,
        zip: initialValues.value.zip,
        country: initialValues.value.country,
      }

      // Cleanup
      delete updates.address2
      // delete updates.email // Don't update email here

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error

      toast.add({ severity: 'success', summary: 'Profile Updated', life: 3000 })
      
      // Navigate back to account page
      //router.push('/account')
    } catch (error) {
      console.error('Update error:', error)
      toast.add({ severity: 'error', summary: 'Update Failed', detail: error.message, life: 3000 })
    }
  } else {
      toast.add({ severity: 'error', summary: 'Validation Failed', detail: 'Please check the highlighted fields.', life: 3000 })
  }
}

const onAvatarUpload = (event) => {
  if (event.path) {
    // Construct the full public URL from the relative path
    const supabaseUrl = supabase.storage.from('media').getPublicUrl(event.path).data.publicUrl
    initialValues.value.avatar_url = supabaseUrl
    
    console.log('Avatar uploaded - relative path:', event.path)
    console.log('Avatar uploaded - full URL:', supabaseUrl)
    
    // Trigger validation
    const avatarInput = avatarREF.value?.$el
    if (avatarInput) {
      avatarInput.value = supabaseUrl
      avatarInput.dispatchEvent(new Event("input", { bubbles: true }))
    }
  }
}

const onFilesUpdated = (files) => {
  // This is called when files are selected but not yet uploaded
  // We just use this to clear validation errors, actual path comes from onAvatarUpload
  if (files && files.length > 0) {
    const avatarInput = avatarREF.value?.$el
    if (avatarInput) {
      // Set a temporary value to pass validation
      avatarInput.value = "uploading"
      avatarInput.dispatchEvent(new Event("input", { bubbles: true }))
    }
  }
}

const updateSignatureSvgData = (svgData) => {
  initialValues.value.signature = svgData

  // Update the hidden form field to trigger validation
  const signatureInput = signatureRef.value?.$el
  if (signatureInput) {
    signatureInput.value = svgData
    // Trigger input event to notify the form
    signatureInput.dispatchEvent(new Event("input", { bubbles: true }))
  }
}

</script>

<template>
  <div class="max-w-4xl mx-auto p-6 pb-24">
    <Toast />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
      <Button label="Back" icon="pi pi-arrow-left" text @click="router.back()" />
    </div>

    <Form :key="userProfile?.id || 'empty'" v-slot="$form" :initialValues="initialValues" :resolver="resolver" @submit="onFormSubmit" class="space-y-8">
      
      <!-- Account Info -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Account Information</h2>
        <div class="grid grid-cols-1 gap-4">
             <div class="flex flex-col gap-1">
              <label class="font-medium text-surface-700 dark:text-surface-300">Login Email</label>
              <InputText name="email" :modelValue="initialValues.email" disabled class="w-full" />
            </div>
            
            <div class="flex flex-col gap-1">
                <UploadMedia
                  ref="UploadMediaREF"
                  :invalid="$form.avatar_url?.invalid"
                  bucket="media"
                  subfolder="avatars"
                  header="Capture/Upload Avatar Photo"
                  :uploadButton="false"
                  :videoButton="false"
                  :maxFiles="1"
                  @upload-complete="onAvatarUpload"
                  @files-updated="onFilesUpdated"
                  :patientId="user?.sub"
                />
                <InputText ref="avatarREF" name="avatar_url" type="hidden" />
                <Message v-if="$form.avatar_url?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.avatar_url.error.message }}</Message>
            </div>
        </div>
      </div>

      <!-- Personal Info -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Personal Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Prefix</label>
            <Select name="prefix" :options="prefixes" optionLabel="label" optionValue="value" placeholder="Select a Prefix" class="w-full" />
            <Message v-if="$form.prefix?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.prefix.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">First Name</label>
            <InputText name="first_name" placeholder="First Name" class="w-full" />
            <Message v-if="$form.first_name?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.first_name.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Last Name</label>
            <InputText name="last_name" placeholder="Last Name" class="w-full" />
            <Message v-if="$form.last_name?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.last_name.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Suffix</label>
            <InputText name="suffix" placeholder="Suffix" class="w-full" />
            <Message v-if="$form.suffix?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.suffix.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Date of Birth</label>
            <DatePicker name="dob" :modelValue="initialValues.dob" dateFormat="mm/dd/yy" showIcon class="w-full" />
            <Message v-if="$form.dob?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.dob.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Gender</label>
            <Select name="gender" :options="genders" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" />
            <Message v-if="$form.gender?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.gender.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Personal Phone Number</label>
            <InputMask name="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" class="w-full" />
            <Message v-if="$form.phone?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.phone.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Personal Email</label>
            <InputText name="personal_email" placeholder="Personal Email" class="w-full" />
            <Message v-if="$form.personal_email?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.personal_email.error.message }}</Message>
          </div>
          <div class="flex flex-col col-span-full gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Spoken Language(s)</label>
            <MultiSelect name="spoken_languages" :options="spokenLanguages" optionLabel="label" optionValue="value" placeholder="Select Spoken Language(s)" display="chip" class="w-full" filter autoFilterFocus resetFilterOnHide />
            <Message v-if="$form.spoken_languages?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.spoken_languages.error.message }}</Message>
          </div>
          
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full mt-4">
             <div class="flex flex-col gap-1 col-span-full">
                <label class="font-medium text-surface-700 dark:text-surface-300">Street Address</label>
                <InputText ref="addressInputRef" name="address" placeholder="Start typing address..." class="w-full" />
                <Message v-if="$form.address?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.address.error.message }}</Message>
             </div>
             <div class="flex flex-col gap-1 col-span-full">
                <label class="font-medium text-surface-700 dark:text-surface-300">Apartment, unit, suite, or floor #</label>
                <InputText ref="address2InputRef" name="address2" placeholder="Apartment, unit, suite, or floor #" class="w-full" />
             </div>
             <div class="flex flex-col gap-1">
                <label class="font-medium text-surface-700 dark:text-surface-300">City</label>
                <InputText name="city" :modelValue="initialValues.city" placeholder="City" disabled class="w-full" />
                <Message v-if="$form.city?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.city.error.message }}</Message>
             </div>
             <div class="flex flex-col gap-1">
                <label class="font-medium text-surface-700 dark:text-surface-300">State/Province</label>
                <InputText name="state" :modelValue="initialValues.state" placeholder="State/Province" disabled class="w-full" />
                <Message v-if="$form.state?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.state.error.message }}</Message>
             </div>
             <div class="flex flex-col gap-1">
                <label class="font-medium text-surface-700 dark:text-surface-300">ZIP/Postal Code</label>
                <InputText name="zip" :modelValue="initialValues.zip" placeholder="ZIP/Postal Code" disabled class="w-full" />
                <Message v-if="$form.zip?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.zip.error.message }}</Message>
             </div>
             <div class="flex flex-col gap-1">
                <label class="font-medium text-surface-700 dark:text-surface-300">Country</label>
                <InputText name="country" :modelValue="initialValues.country" placeholder="Country" disabled class="w-full" />
                <Message v-if="$form.country?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.country.error.message }}</Message>
             </div>
           </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Emergency Contact Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Emergency Contact Name</label>
            <InputText name="emergency_contact_name" placeholder="Emergency Contact Name" class="w-full" />
            <Message v-if="$form.emergency_contact_name?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.emergency_contact_name.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Emergency Contact Phone</label>
            <InputMask name="emergency_contact_phone" mask="(999) 999-9999" placeholder="(999) 999-9999" class="w-full" />
            <Message v-if="$form.emergency_contact_phone?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.emergency_contact_phone.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Relationship to Emergency Contact</label>
            <Select name="emergency_contact_relationship" :options="emergencyContactRelationships" optionLabel="label" optionValue="value" placeholder="Select a Relationship" class="w-full" />
            <Message v-if="$form.emergency_contact_relationship?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.emergency_contact_relationship.error.message }}</Message>
          </div>
        </div>
      </div>

      <!-- Professional Info -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Professional Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Role / Position</label>
            <Select name="role" :options="rolePositions" optionLabel="label" optionValue="value" :modelValue="initialValues.role" class="w-full" />
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Employment Type</label>
            <Select name="employment_type" :options="employmentTypes" optionLabel="label" optionValue="value" placeholder="Select" class="w-full" />
            <Message v-if="$form.employment_type?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.employment_type.error.message }}</Message>
          </div>
          <div class="flex flex-col col-span-full gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Hospitals you work in</label>
            <MultiSelect name="hospitals" :options="orgHospitals" optionLabel="label" optionValue="value" placeholder="Select your hospitals" display="chip" class="w-full" filter autoFilterFocus resetFilterOnHide />
            <Message v-if="$form.hospitals?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.hospitals.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Medical License Number</label>
            <InputText name="medical_license_number" placeholder="License Number" class="w-full" />
            <Message v-if="$form.medical_license_number?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.medical_license_number.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">License Expiration Date</label>
            <DatePicker name="medical_license_expiration_date" :modelValue="initialValues.medical_license_expiration_date" dateFormat="mm/dd/yy" showIcon class="w-full" />
            <Message v-if="$form.medical_license_expiration_date?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.medical_license_expiration_date.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">DEA Number (Optional)</label>
            <InputText name="dea_number" placeholder="DEA Number" class="w-full" />
            <Message v-if="$form.dea_number?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.dea_number.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">NPI Number</label>
            <InputText name="npi_number" placeholder="NPI Number" class="w-full" />
            <Message v-if="$form.npi_number?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.npi_number.error.message }}</Message>
          </div>
           <div class="col-span-full flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Specialty/Specialties</label>
            <MultiSelect name="specialties" :options="medicalSpecialties" optionLabel="label" optionValue="value" placeholder="Select Specialty/Specialties" display="chip" class="w-full" filter autoFilterFocus resetFilterOnHide />
            <Message v-if="$form.specialties?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.specialties.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Medical School Attended</label>
            <InputText name="medical_school_attended" placeholder="Medical School" class="w-full" />
            <Message v-if="$form.medical_school_attended?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.medical_school_attended.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Year of Graduation</label>
            <DatePicker name="medical_school_year_of_graduation" :modelValue="initialValues.medical_school_year_of_graduation" view="year" dateFormat="yy" showIcon class="w-full" />
            <Message v-if="$form.medical_school_year_of_graduation?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.medical_school_year_of_graduation.error.message }}</Message>
          </div>
           <div class="col-span-full flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Board Certifications (Optional)</label>
            <MultiSelect name="board_certifications" :options="boardCertifications" optionLabel="label" optionValue="value" placeholder="Select Board Certifications" display="chip" class="w-full" filter autoFilterFocus resetFilterOnHide />
            <Message v-if="$form.board_certifications?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.board_certifications.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Malpractice Insurance Provider</label>
            <InputText name="malpractice_insurance_provider" placeholder="Insurance Provider" class="w-full" />
            <Message v-if="$form.malpractice_insurance_provider?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.malpractice_insurance_provider.error.message }}</Message>
          </div>
           <div class="flex flex-col gap-1">
            <label class="font-medium text-surface-700 dark:text-surface-300">Malpractice Policy Number</label>
            <InputText name="malpractice_policy_number" placeholder="Policy Number" class="w-full" />
            <Message v-if="$form.malpractice_policy_number?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.malpractice_policy_number.error.message }}</Message>
          </div>
        </div>
      </div>

      <!-- Signature -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Signature</h2>
        <div class="flex flex-col gap-1">
             <label class="font-medium text-surface-700 dark:text-surface-300">Digital Signature</label>
             <InputText ref="signatureRef" name="signature" type="hidden" />
             <SignaturePad
                @end-stroke="updateSignatureSvgData"
                @cleared="updateSignatureSvgData('')"
                :invalid="$form.signature?.invalid"
                :svgData="initialValues.signature || ''"
              />
              <Message v-if="$form.signature?.invalid" severity="error" size="small" variant="simple" class="mt-1">{{ $form.signature.error.message }}</Message>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
        <div class="max-w-4xl mx-auto flex justify-end gap-4">
          <Button label="Cancel" severity="secondary" @click="router.back()" />
          <Button label="Save Changes" type="submit" :loading="$form.submitting" />
        </div>
      </div>

    </Form>
  </div>
</template>

<style lang="scss">
.p-password {
  &.p-invalid .p-password-input {
    border-color: var(--p-inputtext-invalid-border-color) !important;
  }
}
</style>