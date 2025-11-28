<script setup>
const { user, userProfile, logout } = useAuth()
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
</script>

<template>
  <div class="container mx-auto p-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>
      
      <div v-if="user" class="space-y-6">
        <!-- <pre>{{ user }}</pre>
          <pre>{{ userProfile }}</pre> -->
        <div class="flex items-center gap-4">
          <Avatar :image="userProfile?.avatar_url" :label="!userProfile?.avatar_url ? user.email?.charAt(0).toUpperCase() : ''" size="xlarge" shape="circle" class="flex-none bg-blue-500 text-white" />
          <div>
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {{ user.email }}
              <i v-if="user.role === 'authenticated'" class="pi pi-check-circle text-green-500 ml-2"></i>
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">User ID: {{ user.sub }}</p>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <div class="mt-1 text-gray-900 dark:text-white">{{ user.email }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Sign In</label>
              <div class="mt-1 text-gray-900 dark:text-white">{{ user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A' }}</div>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Provider</label>
              <div class="mt-1 text-gray-900 dark:text-white">{{ user.app_metadata.provider }}</div>
            </div>
            <template v-if="userProfile">
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.first_name || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.last_name || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.email || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.phone || 'N/A' }}</div>
              </div>
               <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.address || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Address Line 2</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.address_line_2 || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.city || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">State</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.state || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Zip</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.zip || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.country || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.role || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Admin</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.admin ? 'Yes' : 'No' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Specialization</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.specialization || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.notes || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Avatar URL</label>
                <div class="mt-1 text-gray-900 dark:text-white break-all">{{ userProfile.avatar_url || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.created_at ? new Date(userProfile.created_at).toLocaleString() : 'N/A' }}</div>
              </div>
               <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.updated_at ? new Date(userProfile.updated_at).toLocaleString() : 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Phone</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.emergency_phone || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Updated By Who</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.updated_by_who || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Primary Organization ID</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.primary_organization_id || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Suffix</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.suffix || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">DOB</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.dob || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Hospitals</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.hospitals || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Personal Email</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.personal_email || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.gender || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Employment Type</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.employment_type || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Spoken Languages</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.spoken_languages || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical License Number</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_license_number || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical License Issuing State</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_license_issuing_state || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical License Issuing Country</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_license_issuing_country || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical License Expiration Date</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_license_expiration_date || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">DEA Number</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.dea_number || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">NPI Number</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.npi_number || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Specialties</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.specialties || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical School Attended</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_school_attended || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Medical School Year of Graduation</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.medical_school_year_of_graduation || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Board Certifications</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.board_certifications || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Malpractice Insurance Provider</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.malpractice_insurance_provider || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Malpractice Policy Number</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.malpractice_policy_number || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact Name</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.emergency_contact_name || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact Phone</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.emergency_contact_phone || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact Relationship</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.emergency_contact_relationship || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Signature</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.signature || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Organization IDs</label>
                <div class="mt-1 text-gray-900 dark:text-white">{{ userProfile.organization_ids || 'N/A' }}</div>
              </div>
            </template>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end">
          <Button label="Logout" icon="pi pi-sign-out" severity="danger" @click="handleLogout" />
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Loading user information...</p>
      </div>
    </div>
  </div>
</template>
