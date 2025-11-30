<script setup>
import AutoSaveFormSupabase from "~/components/AutoSaveFormSupabase.vue"
import { zodResolver } from "@primevue/forms/resolvers/zod"
import { z } from "zod"
import { useToast } from "primevue/usetoast"
import {
  prefixes,
  genders,
  spokenLanguages,
  medicalSpecialties,
  boardCertifications,
  employmentTypes,
  rolePositions,
  emergencyContactRelationships,
} from "~/server/data/selectOptionsData"

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

const toast = useToast()

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const UploadMediaREF = ref(null)
const avatarREF = ref(null)
const signatureRef = ref(null)

// Google Maps Autocomplete refs
const addressInputRef = ref(null)
const address2InputRef = ref(null)

// Simple function to initialize Google Maps autocomplete
const initGoogleMapsAutocomplete = () => {
  // Check if everything is ready
  if (
    typeof window === "undefined" ||
    !window.google?.maps?.places ||
    !addressInputRef.value
  ) {
    return
  }

  try {
    // Get the actual input element from PrimeVue InputText
    const inputElement =
      addressInputRef.value.$el.querySelector("input") || addressInputRef.value.$el

    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ["address"],
      fields: ["address_components", "geometry"],
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()

      if (!place.address_components) return

      let streetAddress = ""
      let postcode = ""
      let city = ""
      let state = ""
      let country = ""
      let sublocality = ""

      // Process address components
      for (const component of place.address_components) {
        const componentType = component.types[0]
        const allTypes = component.types

        // Check all types in the component, not just the first one
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
          // Store sublocality for Brooklyn and other NYC areas
          sublocality = component.long_name
        } else if (allTypes.includes("administrative_area_level_1")) {
          state = component.short_name
        } else if (allTypes.includes("country")) {
          country = component.long_name
        }
      }

      // Use sublocality_level_1 if locality is empty (Brooklyn case)
      if (!city && sublocality) {
        city = sublocality
      }

      // Update form fields directly to work with PrimeVue Form system
      const updateFormField = (fieldId, value, dispatchInput = true) => {
        const input =
          document.querySelector(`#${fieldId} input`) || document.getElementById(fieldId)
        if (input) {
          input.value = value
          input.dispatchEvent(new Event("change", { bubbles: true }))
        }
        if (input && dispatchInput) {
          input.dispatchEvent(new Event("input", { bubbles: true }))
        }
      }

      // Update all address fields
      updateFormField("address", streetAddress, false)
      updateFormField("city", city)
      updateFormField("state", state)
      updateFormField("zip", postcode)
      updateFormField("country", country)

      // Also update initialValues for form submission
      initialValues.value.address = streetAddress
      initialValues.value.city = city
      initialValues.value.state = state
      initialValues.value.zip = postcode
      initialValues.value.country = country

      // Focus on address2 field
      nextTick(() => {
        if (address2InputRef.value) {
          const address2Input =
            address2InputRef.value.$el?.querySelector("input") ||
            address2InputRef.value.$el
          address2Input?.focus()
        }
      })
    })
  } catch (error) {
    console.error("Error initializing autocomplete:", error)
  }
}

// Initialize when component mounts and periodically check if Google Maps is ready
onMounted(() => {
  const checkAndInit = () => {
    initGoogleMapsAutocomplete()
    if (!window.google?.maps?.places) {
      setTimeout(checkAndInit, 500)
    }
  }
  checkAndInit()
})

const orgHospitals = [
  { label: "St. Jude Medical Center", value: "sjmc-uuid" },
  { label: "Community General Hospital", value: "cgh-uuid" },
  // to be populated by the orgs hospital list
]

const extractFormValues = (states) => {
  const values = {}

  // Extract values from form states
  for (const [key, fieldState] of Object.entries(states)) {
    values[key] = fieldState.value
  }

  // Merge with initialValues to include disabled fields and externally managed values
  // initialValues takes precedence for fields like signature, avatar_url, email, role, etc.
  const mergedValues = {
    ...values,
    ...initialValues.value,
  }

  return mergedValues
}

// Initial form values - pre-populate disabled fields if necessary
const initialValues = ref({
  prefix: null,
  first_name: "",
  last_name: "",
  suffix: "",
  dob: null,
  hospitals: ["sjmc-uuid", "cgh-uuid"], // Example pre-selected by admin/disabled
  email: "johndoe@example.com", // Example pre-selected/disabled
  password: "",
  confirm_password: "",
  personal_email: "",
  phone: "",
  role: "veterinarian", // Example pre-selected by admin/disabled
  address: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  gender: null,
  employment_type: "full-time", // Example pre-selected by admin/disabled
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
  emergency_contact_relationship: "",
  signature: "",
})

// Zod Schema for validation
const resolver = zodResolver(
  z
    .object({
      prefix: z.string().nullable().optional(),
      first_name: z.string().min(1, { message: "First name is required." }),
      last_name: z.string().min(1, { message: "Last name is required." }),
      suffix: z.string().optional(),
      dob: z
        .date()
        .nullable()
        .refine((date) => date !== null, { message: "Date of Birth is required." }),
      hospitals: z
        .array(z.string())
        .min(1, { message: "At least one hospital is required." }),
      // email: already pre-selected/disabled, no validation needed here for user input
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
      confirm_password: z.string().min(1, { message: "Confirm Password is required." }),
      personal_email: z
        .string()
        .email({ message: "Invalid email address." })
        .min(1, { message: "Personal email is required." }),
      phone: z
        .string()
        .min(10, { message: "Phone number is required and must be at least 10 digits." }),
      // role: already pre-selected/disabled
      address: z.string().min(1, { message: "Street address is required." }),
      city: z.string().min(1, { message: "City is required." }),
      state: z.string().min(1, { message: "State/Province is required." }),
      zip: z.string().min(1, { message: "ZIP/Postal Code is required." }),
      country: z.string().min(1, { message: "Country is required." }),
      gender: z
        .string()
        .nullable()
        .refine((val) => val !== null, { message: "Gender is required." }),
      employment_type: z
        .string()
        .nullable()
        .refine((val) => val !== null, { message: "Employment type is required." }),
      spoken_languages: z
        .array(z.string())
        .min(1, { message: "At least one spoken language is required." }),
      // Medical License Number: Placeholder regex, MUST be customized for specific region
      medical_license_number: z.string().regex(/^[A-Za-z0-9]{5,20}$/, {
        message: "Invalid Medical License Number format.",
      }),
      medical_license_expiration_date: z
        .date()
        .nullable()
        .refine((date) => date !== null, {
          message: "License Expiration Date is required.",
        }),
      // DEA Number: Placeholder regex, MUST be customized
      dea_number: z
        .string()
        .regex(/^[A-Za-z]{2}[0-9]{7}$/, { message: "Invalid DEA Number format." })
        .optional()
        .or(z.literal("")),
      npi_number: z
        .string()
        .regex(/^\d{10}$/, { message: "NPI Number must be 10 digits." }),
      // specialties: z
      //   .array(z.string())
      //   .min(1, { message: "At least one specialty is required." }),
      medical_school_attended: z
        .string()
        .min(1, { message: "Medical School is required." }),
      medical_school_year_of_graduation: z
        .date()
        .nullable()
        .refine((date) => date !== null, { message: "Year of Graduation is required." }),
      board_certifications: z.array(z.string()).optional(),
      malpractice_insurance_provider: z
        .string()
        .min(1, { message: "Malpractice Insurance Provider is required." }),
      malpractice_policy_number: z
        .string()
        .min(1, { message: "Malpractice Policy Number is required." }),
      emergency_contact_name: z
        .string()
        .min(1, { message: "Emergency contact name is required." }),
      emergency_contact_phone: z
        .string()
        .min(10, { message: "Phone number is required and must be at least 10 digits." }),
      emergency_contact_relationship: z
        .string()
        .nullable()
        .refine((val) => val !== null, {
          message: "Emergency contact relationship is required.",
        }),
      avatar_url: z.string().min(1, { message: "Avatar image is required." }),
      signature: z.string().min(1, { message: "Signature is required." }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match.",
      path: ["confirm_password"],
    })
)

const onFormSubmit = async (e) => {
  const formValues = extractFormValues(e.states)
  console.log("[Employee Registration] Form Values:", formValues)

  if (e.valid) {
    try {
      // Save the form data to Supabase

      // Use the traditional upload method
      UploadMediaREF.value?.uploadFiles()

      toast.add({
        severity: "success",
        summary: "Physician registration submitted successfully!",
        life: 3000,
      })
    } catch (error) {
      console.error("Error processing form submission:", error)
      toast.add({
        severity: "error",
        summary: "Submission failed",
        detail: "There was an error processing your submission.",
        life: 3000,
      })
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Form validation failed.",
      detail: "Please check the highlighted fields.",
      life: 3000,
    })
  }
}

// File upload handler
const onAvatarUpload = (event) => {
  if (event.path) {
    initialValues.value.avatar_url = event.path
    toast.add({
      severity: "info",
      summary: "File Uploaded",
      detail: "Headshot uploaded successfully.",
      life: 3000,
    })
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

const onFilesUpdated = (files) => {
  const name = files[0]?.file.name || ""
  initialValues.value.avatar_url = name

  // Update the hidden form field to trigger validation
  const avatarInput = avatarREF.value?.$el
  if (avatarInput) {
    avatarInput.value = name
    // Trigger input event to notify the form
    avatarInput.dispatchEvent(new Event("input", { bubbles: true }))
  }
}
</script>

<template>
  <div class="card flex justify-center mt-6">
    <Toast />
    <AutoSaveFormSupabase
      formId="employee-registration"
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full sm:w-full md:w-3/4 lg:w-1/2 p-4"
    >
      <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
          Account Information
        </h2>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-1">
            <div class="flex flex-col gap-1">
              <label
                for="email"
                class="font-medium text-surface-700 dark:text-surface-300"
                >Login Email (Pre-selected)</label
              >
              <InputText
                id="email"
                name="email"
                type="email"
                :modelValue="initialValues.email"
                disabled
                class="w-full"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="password"
                class="font-medium text-surface-700 dark:text-surface-300"
                >Password</label
              >
              <Password
                id="password"
                name="password"
                :feedback="true"
                toggleMask
                fluid
                :inputStyle="{ width: '100%' }"
                class="w-full"
                :class="{ 'p-invalid': $form.password?.invalid }"
              />
              <Message
                v-if="$form.password?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
                >{{ $form.password.error.message }}</Message
              >
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="confirm_password"
                class="font-medium text-surface-700 dark:text-surface-300"
                >Confirm Password</label
              >
              <Password
                id="confirm_password"
                name="confirm_password"
                :feedback="false"
                toggleMask
                fluid
                :inputStyle="{ width: '100%' }"
                class="w-full"
                :class="{ 'p-invalid': $form.confirm_password?.invalid }"
              />
              <Message
                v-if="$form.confirm_password?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
              >
                {{ $form.confirm_password.error.message }}</Message
              >
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 mt-6">
            <div class="flex flex-col gap-1">
              <div class="flex flex-col gap-1 col-span-full">
                <UploadMedia
                  ref="UploadMediaREF"
                  :invalid="$form.avatar_url?.invalid"
                  bucket="media"
                  subfolder="avatars"
                  header="Capture/Upload Avatar Photo"
                  :uploadButton="false"
                  :videoButton="false"
                  :maxFiles="1"
                  :autosaveComposable="$form.autosaveComposable"
                  @upload-complete="onAvatarUpload"
                  @upload-error=""
                  @files-updated="onFilesUpdated"
                  :metadata="[]"
                  :patientId="user?.id"
                />

                <InputText
                  ref="avatarREF"
                  id="avatar_url"
                  name="avatar_url"
                  type="hidden"
                  placeholder="Avatar"
                />
                <Message
                  v-if="$form.avatar_url?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  class="mt-1"
                  >{{ $form.avatar_url.error.message }}</Message
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
          Personal Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label for="prefix" class="font-medium text-surface-700 dark:text-surface-300"
              >Prefix</label
            >
            <Select
              id="prefix"
              name="prefix"
              :options="prefixes"
              optionLabel="label"
              optionValue="value"
              placeholder="Select a Prefix"
              class="w-full"
            />
            <Message
              v-if="$form.prefix?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.prefix.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="first_name"
              class="font-medium text-surface-700 dark:text-surface-300"
              >First Name</label
            >
            <InputText
              id="first_name"
              name="first_name"
              type="text"
              placeholder="First Name"
              class="w-full"
            />
            <Message
              v-if="$form.first_name?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.first_name.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="last_name"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Last Name</label
            >
            <InputText
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Last Name"
              class="w-full"
            />
            <Message
              v-if="$form.last_name?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.last_name.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label for="suffix" class="font-medium text-surface-700 dark:text-surface-300"
              >Suffix</label
            >
            <InputText
              id="suffix"
              name="suffix"
              type="text"
              placeholder="Suffix"
              class="w-full"
            />
            <Message
              v-if="$form.suffix?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.suffix.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label for="dob" class="font-medium text-surface-700 dark:text-surface-300"
              >Date of Birth</label
            >
            <DatePicker
              id="dob"
              name="dob"
              dateFormat="mm/dd/yy"
              showIcon
              class="w-full"
            />
            <Message
              v-if="$form.dob?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.dob.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label for="gender" class="font-medium text-surface-700 dark:text-surface-300"
              >Gender</label
            >
            <Select
              id="gender"
              name="gender"
              :options="genders"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Gender"
              class="w-full"
            />
            <Message
              v-if="$form.gender?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.gender.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label for="phone" class="font-medium text-surface-700 dark:text-surface-300"
              >Personal Phone Number</label
            >
            <InputMask
              id="phone"
              name="phone"
              mask="(999) 999-9999"
              placeholder="(999) 999-9999"
              class="w-full"
            />
            <Message
              v-if="$form.phone?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.phone.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="personal_email"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Personal Email</label
            >
            <InputText
              id="personal_email"
              name="personal_email"
              type="email"
              placeholder="Personal Email"
              class="w-full"
            />
            <Message
              v-if="$form.personal_email?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.personal_email.error.message }}</Message
            >
          </div>

          <div class="flex flex-col col-span-full gap-1">
            <label
              for="spoken_languages"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Spoken Language(s)</label
            >
            <MultiSelect
              id="spoken_languages"
              name="spoken_languages"
              :options="spokenLanguages"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Spoken Language(s)"
              display="chip"
              class="w-full"
              filter
              autoFilterFocus
              resetFilterOnHide
            />
            <Message
              v-if="$form.spoken_languages?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
            >
              {{ $form.spoken_languages.error.message }}</Message
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full mt-8">
            <div class="flex flex-col gap-1 col-span-full">
              <label
                for="address"
                class="font-medium text-surface-700 dark:text-surface-300"
                >Street Address</label
              >
              <InputText
                ref="addressInputRef"
                id="address"
                name="address"
                type="text"
                placeholder="Start typing address..."
                class="w-full"
              />
              <Message
                v-if="$form.address?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
                >{{ $form.address.error.message }}</Message
              >
            </div>

            <div class="flex flex-col gap-1 col-span-full">
              <label
                for="address2"
                class="font-medium text-surface-700 dark:text-surface-300"
                >Apartment, unit, suite, or floor #</label
              >
              <InputText
                ref="address2InputRef"
                id="address2"
                name="address2"
                type="text"
                placeholder="Apartment, unit, suite, or floor #"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="city" class="font-medium text-surface-700 dark:text-surface-300"
                >City</label
              >
              <InputText
                id="city"
                name="city"
                type="text"
                placeholder="City"
                class="w-full"
              />
              <Message
                v-if="$form.city?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
                >{{ $form.city.error.message }}</Message
              >
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="state"
                class="font-medium text-surface-700 dark:text-surface-300"
                >State/Province</label
              >
              <InputText
                id="state"
                name="state"
                type="text"
                placeholder="State/Province"
                class="w-full"
              />
              <Message
                v-if="$form.state?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
                >{{ $form.state.error.message }}</Message
              >
            </div>

            <div class="flex flex-col gap-1">
              <label for="zip" class="font-medium text-surface-700 dark:text-surface-300"
                >ZIP/Postal Code</label
              >
              <InputText
                id="zip"
                name="zip"
                type="text"
                placeholder="ZIP/Postal Code"
                class="w-full"
              />
              <Message
                v-if="$form.zip?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
                >{{ $form.zip.error.message }}</Message
              >
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="country"
                class="font-medium text-surface-700 dark:text-surface-300"
                >Country</label
              >
              <InputText
                id="country"
                name="country"
                type="text"
                placeholder="Country"
                class="w-full"
              />
              <Message
                v-if="$form.country?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="mt-1"
                >{{ $form.country.error.message }}</Message
              >
            </div>
          </div>
        </div>
      </div>

      <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
          Emergency Contact Information
        </h2>

        <div class="flex flex-col gap-1">
          <label
            for="emergency_contact_name"
            class="font-medium text-surface-700 dark:text-surface-300"
          >
            Emergency Contact Name
          </label>
          <InputText
            id="emergency_contact_name"
            name="emergency_contact_name"
            type="text"
            placeholder="Emergency Contact Name"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label
            for="emergency_contact_phone"
            class="font-medium text-surface-700 dark:text-surface-300"
          >
            Emergency Contact Phone
          </label>
          <InputMask
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            mask="(999) 999-9999"
            placeholder="(999) 999-9999"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label
            for="emergency_contact_relationship"
            class="font-medium text-surface-700 dark:text-surface-300"
            >Relationship to Emergency Contact</label
          >
          <Select
            id="emergency_contact_relationship"
            name="emergency_contact_relationship"
            :options="emergencyContactRelationships"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a Relationship"
            class="w-full"
          />
          <Message
            v-if="$form.emergency_contact_relationship?.invalid"
            severity="error"
            size="small"
            variant="simple"
            class="mt-1"
            >{{ $form.emergency_contact_relationship.error.message }}</Message
          >
        </div>
      </div>

      <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
          Professional Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label for="role" class="font-medium text-surface-700 dark:text-surface-300"
              >Role / Position (Pre-selected)</label
            >
            <Select
              id="role"
              name="role"
              :options="rolePositions"
              optionLabel="label"
              optionValue="value"
              :modelValue="initialValues.role"
              disabled
              filter
              autoFilterFocus
              resetFilterOnHide
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              for="employment_type"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Employment Type</label
            >
            <Select
              id="employment_type"
              name="employment_type"
              :options="employmentTypes"
              optionLabel="label"
              optionValue="value"
              :modelValue="initialValues.employment_type"
              disabled
              class="w-full"
            />
          </div>

          <div class="flex flex-col col-span-full gap-1">
            <label
              for="hospitals"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Hospitals you work in</label
            >
            <MultiSelect
              id="hospitals"
              name="hospitals"
              :options="orgHospitals"
              optionLabel="label"
              optionValue="value"
              disabled
              placeholder="Select your hospitals"
              display="chip"
              class="w-full"
              filter
              autoFilterFocus
              resetFilterOnHide
            />
            <Message
              v-if="$form.hospitals?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
            >
              {{ $form.hospitals.error.message }}</Message
            >
            <small class="text-surface-500"
              >This field is pre-populated and cannot be changed.</small
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="medical_license_number"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Medical License Number</label
            >
            <InputText
              id="medical_license_number"
              name="medical_license_number"
              type="text"
              placeholder="License Number"
              class="w-full"
            />
            <Message
              v-if="$form.medical_license_number?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.medical_license_number.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="medical_license_expiration_date"
              class="font-medium text-surface-700 dark:text-surface-300"
              >License Expiration Date</label
            >
            <DatePicker
              id="medical_license_expiration_date"
              name="medical_license_expiration_date"
              dateFormat="mm/dd/yy"
              showIcon
              class="w-full"
            />
            <Message
              v-if="$form.medical_license_expiration_date?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.medical_license_expiration_date.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="dea_number"
              class="font-medium text-surface-700 dark:text-surface-300"
              >DEA Number (Optional)</label
            >
            <InputText
              id="dea_number"
              name="dea_number"
              type="text"
              placeholder="DEA Number"
              class="w-full"
            />
            <Message
              v-if="$form.dea_number?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.dea_number.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="npi_number"
              class="font-medium text-surface-700 dark:text-surface-300"
              >NPI Number</label
            >
            <InputText
              id="npi_number"
              name="npi_number"
              type="text"
              placeholder="NPI Number"
              class="w-full"
            />
            <Message
              v-if="$form.npi_number?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.npi_number.error.message }}</Message
            >
          </div>

          <div class="flex flex-col col-span-full gap-1">
            <label
              for="specialties"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Specialty/Specialties</label
            >
            <MultiSelect
              id="specialties"
              name="specialties"
              :options="medicalSpecialties"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Specialty/Specialties"
              display="chip"
              class="w-full"
              filter
              autoFilterFocus
              resetFilterOnHide
            />
            <Message
              v-if="$form.specialties?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.specialties.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="medical_school_attended"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Medical School Attended</label
            >
            <InputText
              id="medical_school_attended"
              name="medical_school_attended"
              type="text"
              placeholder="Medical School"
              class="w-full"
            />
            <Message
              v-if="$form.medical_school_attended?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.medical_school_attended.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="medical_school_year_of_graduation"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Year of Graduation</label
            >
            <DatePicker
              id="medical_school_year_of_graduation"
              name="medical_school_year_of_graduation"
              view="year"
              dateFormat="yy"
              showIcon
              class="w-full"
            />
            <Message
              v-if="$form.medical_school_year_of_graduation?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
            >
              {{ $form.medical_school_year_of_graduation.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1 col-span-full">
            <label
              for="board_certifications"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Board Certifications (Optional)</label
            >
            <MultiSelect
              id="board_certifications"
              name="board_certifications"
              :options="boardCertifications"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Board Certifications"
              display="chip"
              class="w-full"
              filter
              autoFilterFocus
              resetFilterOnHide
            />
            <Message
              v-if="$form.board_certifications?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.board_certifications.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="malpractice_insurance_provider"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Malpractice Insurance Provider</label
            >
            <InputText
              id="malpractice_insurance_provider"
              name="malpractice_insurance_provider"
              type="text"
              placeholder="Insurance Provider"
              class="w-full"
            />
            <Message
              v-if="$form.malpractice_insurance_provider?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.malpractice_insurance_provider.error.message }}</Message
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="malpractice_policy_number"
              class="font-medium text-surface-700 dark:text-surface-300"
              >Malpractice Policy Number</label
            >
            <InputText
              id="malpractice_policy_number"
              name="malpractice_policy_number"
              type="text"
              placeholder="Policy Number"
              class="w-full"
            />
            <Message
              v-if="$form.malpractice_policy_number?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="mt-1"
              >{{ $form.malpractice_policy_number.error.message }}</Message
            >
          </div>
        </div>
      </div>

      <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">
          Signature
        </h2>
        <div class="flex flex-col gap-1">
          <label
            for="signature"
            class="font-medium text-surface-700 dark:text-surface-300"
            >Digital Signature</label
          >
          <InputText
            ref="signatureRef"
            id="signature"
            name="signature"
            type="hidden"
            placeholder="Signature"
          />

          <SignaturePad
            @end-stroke="updateSignatureSvgData"
            @cleared="updateSignatureSvgData('')"
            :invalid="$form.signature?.invalid"
            :svgData="$form.signature?.value || ''"
          />

          <Message
            v-if="$form.signature?.invalid"
            severity="error"
            size="small"
            variant="simple"
            class="mt-1"
            >{{ $form.signature.error.message }}</Message
          >
        </div>
      </div>

      <Button type="submit" label="Register Physician" class="mt-4" />
    </AutoSaveFormSupabase>
  </div>
</template>

<style lang="scss">
.p-password {
  &.p-invalid .p-password-input {
    border-color: var(--p-inputtext-invalid-border-color) !important;
    //box-shadow: 0 0 0 0.2rem rgba(244, 67, 54, 0.25) !important; /* Optional shadow */
  }
}
</style>
