<script setup>
definePageMeta({
  layout: 'blank'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center w-full max-w-md">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Login</h1>
      <LoginForm />
      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Don't have an account? <NuxtLink to="/signup" class="text-blue-600 hover:underline">Sign up</NuxtLink>
      </div>
    </div>
  </div>
</template>
