import { useSupabaseClient, useSupabaseUser} from '#imports'
import type { User } from '@supabase/supabase-js'
import type {Database} from '~/types/database.types'

export type UserRole = 'alumno' | 'profesor'

export interface UserProfile {
    id: string
    email: string
    role: UserRole
    first_name: string | null
    last_name: string | null
    created_at: string
    updated_at: string
}

export const useAuthUser = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const userProfile = ref<UserProfile | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Fetch user profile
    const fetchUserProfile = async () => {
        if (!user.value) return null

        isLoading.value = true
        error.value = null

        try {
            const {data, error: profileError} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.value.id)
                .single()

            if (profileError) throw profileError
            
            userProfile.value = data

            return data

        } catch (err:any) {
            error.value= err.message
            return null
        } finally {
            isLoading.value = false
        }
        
    }

    // Register a new user
    const register = async (email: string, password: string, role: UserRole, first_name: string, last_name:string) => {
        isLoading.value = true
        error.value = null

        try {
            const {data: authData, error: authError} = await supabase.auth.signUp({
                email,
                password
            })

            if (authError) throw authError

            if(authData.user){
                const {error: profileError} = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        email,
                        role,
                        first_name: first_name,
                        last_name: last_name
                    })

                if (profileError) throw profileError
            }

            return authData
        }catch (err:any) {
            error.value = err.message
            return null
        }finally {
            isLoading.value = false
        }
    }

    // Login user
    const login = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            const {data, error: authError} = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw authError

            if (data.user) {
                await fetchUserProfile()
            }

            return data
        }catch (err:any) {
            error.value = err.message
            return null
        }finally{
            isLoading.value = false
        }   
    }

    // Logout user
    const logout = async () => {
        isLoading.value = true
        error.value = null

        try {
            const {error: logoutError} = await supabase.auth.signOut()

            if (logoutError) throw logoutError

            userProfile.value = null
        }catch (err:any) {
            error.value = err.message
        }finally{
            isLoading.value = false
        }
    }

    // Verify if user has a role
    const hasRole = (role: UserRole) => {
        return userProfile.value?.role === role
    }

    // Here we load user profile when user is authenticated
    watch(user, async (newUser) => {
        if (newUser) {
            await fetchUserProfile()
        } else {
            userProfile.value = null
        }
    }, { immediate: true })

    return {
        user,
        userProfile,
        isLoading,
        error,
        fetchUserProfile,
        register,
        login,
        logout,
        hasRole
    }
}