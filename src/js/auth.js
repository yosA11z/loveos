import { supabase } from './supabase.js'

export async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        window.location.href = '/src/pages/login.html'
        return null
    }

    return session.user
}

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/src/pages/login.html'
}