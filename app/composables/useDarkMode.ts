export const useDarkMode = () => {
    const isDark = useState('darkMode', () => false)

    onMounted(() => {
        const savedMode = localStorage.getItem('darkMode')
        if (savedMode) {
            isDark.value = savedMode === 'true'
        } else {
            // Optional: Check system preference if no saved preference
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
            localStorage.setItem('darkMode', isDark.value.toString())
        }
        // Apply initial class
        document.documentElement.classList.toggle('dark-mode', isDark.value)
    })

    const toggleDarkMode = () => {
        isDark.value = !isDark.value
        if (import.meta.client) {
            localStorage.setItem('darkMode', isDark.value.toString())
            document.documentElement.classList.toggle('dark-mode', isDark.value)
        }
    }

    return {
        isDark,
        toggleDarkMode
    }
}
