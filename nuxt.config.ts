// https://nuxt.com/docs/api/configuration/nuxt-config
import MyPreset from './app/assets/theme.js'

export default defineNuxtConfig({
  css: ['~/assets/scss/main.scss', 'primeicons/primeicons.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@nuxtjs/supabase'
  ],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
  },
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark-mode',
        }
      }
    }
  }
})
