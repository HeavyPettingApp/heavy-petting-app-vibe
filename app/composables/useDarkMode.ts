export const useDarkMode = () => {
    const isDark = useState('darkMode', () => false)

    const toggleDarkMode = () => {
        isDark.value = !isDark.value
        if (import.meta.client) {
            document.documentElement.classList.toggle('dark-mode', isDark.value)
        }
    }

    return {
        isDark,
        toggleDarkMode
    }
}
