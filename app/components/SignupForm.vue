<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const { signup } = useAuth()
const router = useRouter()

const handleSignup = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await signup(email.value, password.value)
    // Optionally redirect to login or show success message
    // For now, redirect to home assuming auto-login or just to show flow
    router.push('/')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <form @submit.prevent="handleSignup" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2 text-left">
        <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
        <InputText id="email" v-model="email" type="email" required class="w-full" />
      </div>
      <div class="flex flex-col gap-2 text-left">
        <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
        <Password id="password" v-model="password" toggleMask required inputClass="w-full" class="w-full" />
      </div>
      <div v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</div>
      <Button type="submit" label="Sign Up" :loading="loading" />
    </form>
  </div>
</template>
