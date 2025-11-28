<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const { login } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
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
    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2 text-left">
        <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
        <InputText id="email" v-model="email" type="email" required class="w-full" />
      </div>
      <div class="flex flex-col gap-2 text-left">
        <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
        <Password id="password" v-model="password" :feedback="false" toggleMask required inputClass="w-full" class="w-full" />
      </div>
      <div v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</div>
      <Button type="submit" label="Login" :loading="loading" />
    </form>
  </div>
</template>
