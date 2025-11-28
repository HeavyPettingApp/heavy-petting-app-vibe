export const useAuth = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

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
    }

    return {
        user,
        login,
        signup,
        logout
    }
}
