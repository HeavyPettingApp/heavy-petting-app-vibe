<script setup>
definePageMeta({
  layout: 'blank'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center w-full max-w-md">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Signup</h1>
      <SignupForm />
      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Already have an account? <NuxtLink to="/login" class="text-blue-600 hover:underline">Login</NuxtLink>
      </div>
    </div>
  </div>
</template>
