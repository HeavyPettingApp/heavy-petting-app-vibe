<script setup>
const { user, logout } = useAuth()
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
        <div class="flex items-center gap-4">
          <Avatar :label="user.email?.charAt(0).toUpperCase()" size="xlarge" shape="circle" class="bg-blue-500 text-white" />
          <div>
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{{ user.email }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">User ID: {{ user.id }}</p>
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
