import { supabase } from './supabase.js'

const loginForm = document.querySelector('form')

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Obtenemos los datos de los inputs
    const email = loginForm.querySelector('input[type="email"]').value
    const password = loginForm.querySelector('input[type="password"]').value
    const submitBtn = loginForm.querySelector('button')

    // Feedback visual básico
    const originalText = submitBtn.innerText
    submitBtn.innerText = 'CONECTANDO...'
    submitBtn.disabled = true

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        alert("Error de acceso: " + error.message)
        submitBtn.innerText = originalText
        submitBtn.disabled = false
    } else {
        // Guardamos algo en sesión si quieres, aunque Supabase lo hace solo
        window.location.href = '/src/pages/dashboard.html'
    }
})