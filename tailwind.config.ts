import type { Config } from 'tailwindcss'
import primeui from 'tailwindcss-primeui'

export default <Config>{
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue'
    ],
    theme: {
        screens: {
            xs: '320px',
            sm: '375px',
            md: '768px',
            lg: '1024px',
            xl: '1366px',
            xxl: '1920px',
        },
    },
    plugins: [primeui],
    darkMode: ['class', '.dark-mode'],
}
