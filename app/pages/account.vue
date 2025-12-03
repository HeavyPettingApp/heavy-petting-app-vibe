<script setup>
import SignaturePadRenderer from '~/components/SignaturePadRenderer.vue'

const { user, userProfile, logout } = useAuth()
const {
  getLabel,
  getLabels,
  getSupabaseLabels,
  prefixes,
  genders,
  spokenLanguages,
  medicalSpecialties,
  boardCertifications,
  employmentTypes,
  rolePositions,
  emergencyContactRelationships,
} = useSupabase()
const router = useRouter()

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Redirect if not logged in
watchEffect(() => {
  if (!user.value) {
    router.push('/login')
  }
})

// Date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // Handle both ISO string and potential other formats if needed, but usually ISO from DB
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="container mx-auto p-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        <div class="flex gap-2">
             <Button label="Edit Profile" icon="pi pi-user-edit" @click="router.push('/edit-user-profile')" />
        </div>
      </div>
      
      <div v-if="userProfile" class="space-y-8">
        
        <!-- Account Info -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div class="flex flex-col gap-1">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Login Email</label>
                    <div class="text-gray-900 dark:text-white">{{ user.email }}</div>
                 </div>
                 <div class="flex flex-col gap-1">
                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Avatar</label>
                    <div class="flex items-center gap-4">
                        <Avatar :image="userProfile.avatar_url" :label="!userProfile.avatar_url ? user.email?.charAt(0).toUpperCase() : ''" size="xlarge" shape="circle" class="flex-none bg-blue-500 text-white" />
                    </div>
                 </div>
            </div>
        </div>

        <!-- Personal Info -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personal Information</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Prefix</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabel(userProfile.prefix, prefixes) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.first_name || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.last_name || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Suffix</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.suffix || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ formatDate(userProfile.dob) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabel(userProfile.gender, genders) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Personal Phone</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.phone || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Personal Email</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.personal_email || 'N/A' }}</div>
                </div>
                <div class="col-span-full">
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Spoken Language(s)</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabels(userProfile.spoken_languages, spokenLanguages) }}</div>
                </div>
                
                <!-- Address -->
                <div class="col-span-full mt-2">
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <div class="mt-1 text-gray-900 dark:text-white">
                        {{ userProfile.address }}<br v-if="userProfile.address">
                        {{ userProfile.address_line_2 }}<br v-if="userProfile.address_line_2">
                        <span v-if="userProfile.city">{{ userProfile.city }}, </span>
                        <span v-if="userProfile.state">{{ userProfile.state }} </span>
                        <span v-if="userProfile.zip">{{ userProfile.zip }}</span>
                        <div v-if="userProfile.country">{{ userProfile.country }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Emergency Contact -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Emergency Contact Information</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.emergency_contact_name || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.emergency_contact_phone || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Relationship</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabel(userProfile.emergency_contact_relationship, emergencyContactRelationships) }}</div>
                </div>
            </div>
        </div>

        <!-- Professional Info -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Professional Information</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Role / Position</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabel(userProfile.role, rolePositions) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Employment Type</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabel(userProfile.employment_type, employmentTypes) }}</div>
                </div>
                <div class="col-span-full">
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Hospitals</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getSupabaseLabels(userProfile.hospitals, 'organizations', 'organization_name', 'organization_id') }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical License Number</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_license_number || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">License Expiration Date</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ formatDate(userProfile.medical_license_expiration_date) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">DEA Number</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.dea_number || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">NPI Number</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.npi_number || 'N/A' }}</div>
                </div>
                <div class="col-span-full">
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Specialties</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabels(userProfile.specialties, medicalSpecialties) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical School</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_school_attended || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Graduation Year</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ formatDate(userProfile.medical_school_year_of_graduation) }}</div>
                </div>
                <div class="col-span-full">
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Board Certifications</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ getLabels(userProfile.board_certifications, boardCertifications) }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Malpractice Insurance Provider</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.malpractice_insurance_provider || 'N/A' }}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Malpractice Policy Number</label>
                    <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.malpractice_policy_number || 'N/A' }}</div>
                </div>
            </div>
        </div>

        <!-- Signature -->
        <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Signature</h2>
            <div class="border rounded-lg p-4 bg-white">
                <SignaturePadRenderer v-if="userProfile.signature" :svgString="userProfile.signature" />
                <div v-else class="text-gray-500 dark:text-gray-400 italic">No signature on file</div>
            </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
             <Button label="Logout" icon="pi pi-sign-out" severity="danger" @click="handleLogout" />
        </div>

      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Loading user information...</p>
      </div>
    </div>
  </div>
</template>
