export const useAuth = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const userProfile = useState('userProfile', () => null)

    const fetchProfile = async () => {
        if (!user.value?.sub) {
            userProfile.value = null
            return
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.value.sub)
                .single()

            if (error) throw error
            userProfile.value = data
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    watch(user, () => {
        fetchProfile()
    }, { immediate: true, once: true })

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
    }

    const signup = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password
        })
        if (error) throw error
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        userProfile.value = null
    }

    return {
        user,
        userProfile,
        login,
        signup,
        logout
    }
}
