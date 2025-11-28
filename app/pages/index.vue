<script setup>
const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center transition-colors duration-300">
      <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">Hello Tailwind!</h1>
      <p class="text-gray-700 dark:text-gray-300">Tailwind CSS is successfully configured.</p>
      <div class="mt-6 flex flex-col gap-4 items-center">
        <Button label="PrimeVue Button" icon="pi pi-check" />
        <div class="card flex justify-center">
             <Button label="Verify" />
        </div>
        <p class="text-primary-500 font-bold">This text uses PrimeVue primary color.</p>
        <Button :label="isDark ? 'Light Mode' : 'Dark Mode'" :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleDarkMode" severity="secondary" />
      </div>
    </div>
  </div>
</template>
