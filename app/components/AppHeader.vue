<script setup>
const { user } = useAuth()
const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <header class="bg-white dark:bg-gray-800 shadow">
    <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
      <NuxtLink to="/" class="text-xl font-bold text-gray-800 dark:text-white">Heavy Petting</NuxtLink>
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Home</NuxtLink>
      

        <template v-if="user">
          <NuxtLink to="/account">
            <Avatar :label="user.email?.charAt(0).toUpperCase()" shape="circle" class="bg-blue-500 text-white cursor-pointer" />
          </NuxtLink>
        </template>
        
        <template v-else>
          <NuxtLink to="/login" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Login</NuxtLink>
          <NuxtLink to="/signup" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Signup</NuxtLink>
        </template>
          
        <Button :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleDarkMode" text rounded severity="secondary" aria-label="Toggle Dark Mode" />
      </div>
    </nav>
  </header>
</template>
