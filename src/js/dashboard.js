import { supabase } from './supabase.js'
import { applyLang } from './i18n.js'

/* ─────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────── */
let currentUser = null   // usuario autenticado
let currentProfile = null   // fila profiles del usuario
let partnerProfile = null   // fila profiles de la pareja

let appSettings = {
    city1: 'Cali', city2: 'Facatativá',
    startDate: '', lang: 'es',
    darkTheme: false, notifications: true,
}

// Historial de conversación para que Qwen recuerde el contexto
let chatHistory = []

const SYSTEM_PROMPT = `Eres LoveIA, un consejero de parejas especializado en relaciones a distancia. 
Tu nombre es Dr. Love. Eres empático, cálido y práctico. 
Respondes siempre en español, de forma concisa (máximo 3 párrafos).
Nunca juzgas, siempre validas las emociones y das consejos concretos.
La pareja que usas esta app está en una relación a distancia entre Cali y Facatativá, Colombia.`

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */
async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
        window.location.href = '/src/pages/login.html'
        return null
    }
    currentUser = session.user
    return currentUser
}

async function doLogout() {
    closeLogoutModal()
    showToast('¡Hasta pronto! 💔')
    await supabase.auth.signOut()
    setTimeout(() => { window.location.href = '/src/pages/login.html' }, 1500)
}

/* ─────────────────────────────────────────
   PERFIL — carga usuario + pareja de Supabase
───────────────────────────────────────── */
async function loadProfile() {
    if (!currentUser) return

    const { data, error } = await supabase
        .from('profiles')
        .select('*, partner:partner_id(*)')
        .eq('id', currentUser.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error cargando perfil:', error)
        return
    }

    if (!data) {
        await supabase.from('profiles').insert({
            id: currentUser.id,
            name: currentUser.email.split('@')[0]
        })
        return await loadProfile()
    }

    // ✅ Primero asignar
    currentProfile = data
    partnerProfile = data.partner || null

    console.log('data completa:', data)
    console.log('partner:', data?.partner)

    const myName = currentProfile.name || currentUser.email.split('@')[0]

    setEl('s-name-display', myName)
    setEl('s-partner-display', partnerProfile?.name || 'Tu pareja')
    setEl('s-name-display-city', myName)
    setEl('s-partner-display-city', partnerProfile?.name || 'pareja')
    setEl('s-city1-display', currentProfile.city || '—')
    setEl('s-city2-display', partnerProfile?.city || '—')
    fetchWeather(appSettings.city1, 'weather-card-1')
    fetchWeather(appSettings.city2, 'weather-card-2')
    setEl('weather-city-1', appSettings.city1)
    setEl('weather-city-2', appSettings.city2)

    // ✅ Después usar
    const partnerAv = document.getElementById('partner-avatar')
    if (partnerAv && partnerProfile?.name)
        partnerAv.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerProfile.name)}&background=7209b7&color=fff`

    // Avatar
    const av = document.getElementById('settings-avatar')
    if (av) av.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=ff4d6d&color=fff`

    // Sincronizar startDate y ciudades a appSettings
    if (currentProfile.start_date) {
        appSettings.startDate = currentProfile.start_date
        updateHomeStats()
        updateSettingsDateDisplay()
    }
    if (currentProfile.city) appSettings.city1 = currentProfile.city
    if (partnerProfile?.city) appSettings.city2 = partnerProfile.city

    // Tarjeta principal
    const cardTitle = document.querySelector('.card-gradient h2')
    if (cardTitle) cardTitle.innerText = `${appSettings.city1} - ${appSettings.city2}`

    // Cargar estado de ánimo de la pareja y clima
    if (partnerProfile) loadPartnerMood()
    fetchWeather(appSettings.city1, 'weather-card-1')
    fetchWeather(appSettings.city2, 'weather-card-2')
}

/* ─────────────────────────────────────────
   ESTADO DE ÁNIMO DE LA PAREJA
───────────────────────────────────────── */
async function loadPartnerMood() {
    if (!partnerProfile) {
        console.log('loadPartnerMood: partnerProfile es null')
        return
    }
    console.log('loadPartnerMood: buscando mood de', partnerProfile.id)

    const { data, error } = await supabase
        .from('moods')
        .select('emoji, label, updated_at')
        .eq('user_id', partnerProfile.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    console.log('loadPartnerMood resultado:', data, error)
    if (error) { console.error('Error:', error); return }
    renderPartnerMood(data)
}

function subscribePartnerMood() {
    if (!partnerProfile) {
        console.log('subscribePartnerMood: partnerProfile es null')
        return
    }
    console.log('Suscribiendo a mood de pareja:', partnerProfile.id)

    supabase.channel('partner-mood')
        .on('postgres_changes', {
            event: '*', schema: 'public', table: 'moods'
        }, payload => {
            console.log('Realtime mood recibido:', payload)
            if (payload.new?.user_id === partnerProfile.id) {
                renderPartnerMood(payload.new)
            }
        })
        .subscribe(status => console.log('Estado suscripción:', status))
}

function renderPartnerMood(mood) {
    const el = document.getElementById('partner-mood-display')
    if (!el) return
    el.innerText = mood ? `${mood.emoji} ${mood.label}` : 'Sin estado aún'
}


/* ─────────────────────────────────────────
   MOOD PROPIO — guardar en Supabase
───────────────────────────────────────── */
const moodSuggestions = {
    '✨ Radiante': '"Si te sientes radiante, envíale una foto de tu sonrisa ahora mismo."',
    '🥺 Te extraño': '"Dile cuánto le extrañas, a veces un mensaje corto cambia todo el día."',
    '😴 Agotado': '"Dile que hoy necesitas mimos extra por videollamada."'
}

async function setMood(mood, element) {
    document.querySelectorAll('.mood-tag').forEach(t => t.classList.remove('mood-active'))
    element.classList.add('mood-active')
    setEl('current-mood-text', mood)
    const sugg = document.getElementById('ai-suggestion')
    if (sugg) sugg.innerText = moodSuggestions[mood] || '"¡Comparte ese estado con tu personita especial!"'

    if (!currentUser) return
    const [emoji, ...rest] = mood.split(' ')
    const label = rest.join(' ')

    const { error } = await supabase.from('moods').upsert(
        { user_id: currentUser.id, emoji, label, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
    )
    if (error) console.error('Error guardando mood:', error)
}

function openMoodModal() { document.getElementById('mood-modal').classList.add('active') }
function closeMoodModal() { document.getElementById('mood-modal').classList.remove('active') }

async function addNewMood() {
    const emoji = document.getElementById('new-mood-emoji').value.trim()
    const name = document.getElementById('new-mood-name').value.trim()
    if (!emoji || !name) return

    document.getElementById('new-mood-emoji').value = ''
    document.getElementById('new-mood-name').value = ''
    closeMoodModal()

    if (currentUser) {
        const { data, error } = await supabase
            .from('custom_moods')
            .insert({ user_id: currentUser.id, emoji, label: name })
            .select('id')
            .single()

        if (!error) appendCustomMoodChip(data.id, emoji, name)
    }

    const chip = document.querySelector(`#mood-list .mood-tag:last-child`)
    if (chip) setMood(emoji + ' ' + name, chip)
}

/* ─────────────────────────────────────────
   ZUMBIDOS — enviar y recibir en tiempo real
───────────────────────────────────────── */
async function sendInteraction(type) {
    if (!currentUser || !partnerProfile) { showToast('Pareja no conectada aún'); return }

    const { error } = await supabase.from('zumbidos').insert({
        sender_id: currentUser.id,
        receiver_id: partnerProfile.id,
        type: type === 'te amo' ? 'te_amo' : 'te_extrano'
    })
    if (error) { console.error('Error enviando zumbido:', error); return }
    showToast(type === 'te amo' ? '¡Te amo enviado! ❤️' : '¡Te extraño enviado! 🥺')
}

function subscribeZumbidos() {
    if (!currentUser) return
    supabase.channel('zumbidos-incoming')
        .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'zumbidos',
            filter: `receiver_id=eq.${currentUser.id}`
        }, payload => {
            const msg = payload.new.type === 'te_amo'
                ? `💗 ${partnerProfile?.name || 'Tu pareja'} te envió un "Te amo"`
                : `🥺 ${partnerProfile?.name || 'Tu pareja'} te envió un "Te extraño"`
            showToast(msg)
        })
        .subscribe()
}

/* ─────────────────────────────────────────
   PELEAS — guardar en Supabase
───────────────────────────────────────── */
function activateAntiFight() {
    document.getElementById('fight-initial').classList.add('hidden')
    document.getElementById('fight-form').classList.remove('hidden')
    document.getElementById('fight-peace').classList.add('hidden')
}

function cancelFight() {
    document.getElementById('fight-initial').classList.remove('hidden')
    document.getElementById('fight-form').classList.add('hidden')
    document.getElementById('fight-peace').classList.add('hidden')
}

async function submitFight() {
    const why = document.getElementById('f-why')?.value.trim()
    const what = document.getElementById('f-what')?.value.trim()
    const feel = document.getElementById('f-feel')?.value.trim()
    const need = document.getElementById('f-need')?.value.trim()

    if (!why || !what) { showToast('Llena al menos los campos principales'); return }

    if (currentUser && partnerProfile) {
        const { error } = await supabase.from('fights').insert({
            user_id: currentUser.id,
            receiver_id: partnerProfile.id,  // ← agregar esto
            why, what, feel, need
        })
        if (error) console.error('Error guardando pelea:', error)
    }

    document.getElementById('fight-form').classList.add('hidden')
    document.getElementById('fight-peace').classList.remove('hidden')
    startTimer()
}

function resetFight() {
    stopTimer()
    timerSeconds = 15 * 60
    updateTimerDisplay()
        ;['f-why', 'f-what', 'f-feel', 'f-need'].forEach(id => {
            const el = document.getElementById(id)
            if (el) el.value = ''
        })
    document.getElementById('fight-initial').classList.remove('hidden')
    document.getElementById('fight-form').classList.add('hidden')
    document.getElementById('fight-peace').classList.add('hidden')
    showToast('¡Bien hecho! El amor siempre gana')
}

/* ─────────────────────────────────────────
   TIMER
───────────────────────────────────────── */
let timerInterval = null
let timerSeconds = 15 * 60
let timerRunning = false

function startTimer() {
    timerSeconds = 15 * 60
    updateTimerDisplay()
    timerRunning = true
    document.getElementById('btn-stop-timer').innerHTML = '<i class="fa-solid fa-pause mr-1"></i> Pausar'
    clearInterval(timerInterval)
    timerInterval = setInterval(() => {
        if (timerSeconds <= 0) { clearInterval(timerInterval); showToast('¡Ya pasaron los 15 minutos! Vuelvan a hablar'); return }
        timerSeconds--
        updateTimerDisplay()
    }, 1000)
}

function stopTimer() {
    if (timerRunning) {
        clearInterval(timerInterval)
        timerRunning = false
        document.getElementById('btn-stop-timer').innerHTML = '<i class="fa-solid fa-play mr-1"></i> Reanudar'
    } else {
        timerRunning = true
        document.getElementById('btn-stop-timer').innerHTML = '<i class="fa-solid fa-pause mr-1"></i> Pausar'
        timerInterval = setInterval(() => {
            if (timerSeconds <= 0) { clearInterval(timerInterval); return }
            timerSeconds--
            updateTimerDisplay()
        }, 1000)
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timerSeconds / 60)
    const s = timerSeconds % 60
    setEl('timer-display', String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'))
    const circle = document.getElementById('timer-circle')
    if (circle) circle.style.strokeDashoffset = 314 * (1 - timerSeconds / (15 * 60))
}

/* ─────────────────────────────────────────
   CLIMA — Open-Meteo (sin API key)
───────────────────────────────────────── */
const WMO_ICONS = {
    0: 'fa-sun', 1: 'fa-cloud-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog',
    51: 'fa-cloud-drizzle', 53: 'fa-cloud-drizzle', 55: 'fa-cloud-drizzle',
    61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-rain',
    71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
    80: 'fa-cloud-showers-heavy', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
    95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt',
}

function wmoToIcon(code) {
    return WMO_ICONS[code] || WMO_ICONS[Math.floor(code / 10) * 10] || 'fa-cloud'
}

async function fetchWeather(cityName, cardId) {
    const card = document.getElementById(cardId)
    if (!card || !cityName) return
    const tempEl = card.querySelector('.weather-temp')
    const iconEl = card.querySelector('.weather-icon')
    if (tempEl) tempEl.innerText = '...'
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=es`)
        const geoData = await geoRes.json()
        if (!geoData.results?.length) { if (tempEl) tempEl.innerText = '—'; return }

        const { latitude, longitude } = geoData.results[0]
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`)
        const wData = await wRes.json()
        const { temperature_2m, weathercode } = wData.current

        if (tempEl) tempEl.innerText = `${Math.round(temperature_2m)}°C`
        if (iconEl) iconEl.className = `fa-solid ${wmoToIcon(weathercode)} weather-icon`
    } catch (e) {
        console.error('Error cargando clima para', cityName, e)
        if (tempEl) tempEl.innerText = '—'
    }
}

/* ─────────────────────────────────────────
   SETTINGS
───────────────────────────────────────── */
function loadSettings() {
    try {
        const saved = localStorage.getItem('loveos-settings')
        if (saved) appSettings = { ...appSettings, ...JSON.parse(saved) }
    } catch (e) { }
    applyLang(appSettings.lang)    // ← única línea nueva
    applySettings()
}

function applySettings() {
    document.body.classList.toggle('dark-theme', appSettings.darkTheme)
    const curTheme = document.getElementById('current-theme')
    const curLang = document.getElementById('current-language')
    if (curTheme) curTheme.textContent = appSettings.darkTheme ? 'Oscuro' : 'Claro'
    if (curLang) curLang.textContent = appSettings.lang === 'en' ? 'English' : 'Español'
    updateHomeStats()
    updateSettingsDateDisplay()
}

function updateHomeStats() {
    if (!appSettings.startDate) return
    const start = new Date(appSettings.startDate + 'T00:00:00')
    const now = new Date()
    if (isNaN(start.getTime()) || start > now) return

    const diffMs = now - start
    const totalDays = Math.floor(diffMs / 86400000)
    const totalHours = Math.floor(diffMs / 3600000)

    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()
    if (months < 0) { years--; months += 12 }

    let timeStr
    if (years > 0 && months > 0) timeStr = `${years} Año${years > 1 ? 's' : ''} y ${months} Mes${months > 1 ? 'es' : ''}`
    else if (years > 0) timeStr = `${years} Año${years > 1 ? 's' : ''}`
    else if (months > 0) timeStr = `${months} Mes${months > 1 ? 'es' : ''}`
    else timeStr = `${totalDays} Días`

    const daysEl = document.querySelector('.text-7xl.font-black')
    if (daysEl) daysEl.innerText = totalDays.toLocaleString()

    const hoursEl = document.querySelector('.fa-clock')?.parentElement
    if (hoursEl) hoursEl.innerHTML = `<i class="fa-solid fa-clock mr-1"></i> ${totalHours.toLocaleString()} Horas`

    const calEl = document.querySelector('.fa-calendar')?.parentElement
    if (calEl) calEl.innerHTML = `<i class="fa-solid fa-calendar mr-1"></i> ${timeStr}`
}

function updateSettingsDateDisplay() {
    const el = document.getElementById('settings-date-display')
    if (!el || !appSettings.startDate) return
    const d = new Date(appSettings.startDate + 'T12:00:00')
    el.textContent = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function updateNextMeetPreview() {
    const el = document.getElementById('s-next-meet-preview')
    if (!el || !appSettings.nextMeet) return
    const d = new Date(appSettings.nextMeet + 'T12:00:00')
    const diff = Math.ceil((d - new Date()) / 86400000)
    if (diff > 0) el.innerText = `En ${diff} días — ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`
    else if (diff === 0) el.innerText = '¡Hoy es el día! 🎉'
    else el.innerText = `Fue hace ${Math.abs(diff)} días`
}

async function saveRelationshipDate() {
    const val = document.getElementById('relationship-date-input')?.value
    if (val) {
        appSettings.startDate = val
        localStorage.setItem('loveos-settings', JSON.stringify(appSettings))
        updateHomeStats()
        updateSettingsDateDisplay()
        if (currentUser) {
            const { error } = await supabase.from('profiles').update({ start_date: val }).eq('id', currentUser.id)
            if (error) console.error('Error guardando fecha en Supabase:', error)
        }
        showToast('Fecha actualizada correctamente')
    }
    closeDateModal()
}

function toggleSetting(id) {
    const el = document.getElementById(id)
    if (!el) return
    el.classList.toggle('on')
    if (id === 'notif-toggle') appSettings.notifications = el.classList.contains('on')
}

/* ─────────────────────────────────────────
   MODALES
───────────────────────────────────────── */
function openLanguageModal() { document.getElementById('language-modal').classList.add('active') }
function closeLanguageModal() { document.getElementById('language-modal').classList.remove('active') }

function selectLanguage(lang, el) {
    appSettings.lang = lang
    document.querySelectorAll('.language-option').forEach(o => {
        o.classList.remove('selected')
        o.querySelector('.check-icon').style.opacity = '0'
    })
    el.classList.add('selected')
    el.querySelector('.check-icon').style.opacity = '1'
    document.getElementById('current-language').textContent = lang === 'es' ? 'Español' : 'English'
    localStorage.setItem('loveos-settings', JSON.stringify(appSettings))
    applyLang(lang)    // ← única línea nueva
    setTimeout(closeLanguageModal, 300)
}

function openThemeModal() { document.getElementById('theme-modal').classList.add('active') }
function closeThemeModal() { document.getElementById('theme-modal').classList.remove('active') }

function selectTheme(theme, el) {
    appSettings.darkTheme = theme === 'dark'
    document.querySelectorAll('.theme-option').forEach(o => {
        o.classList.remove('selected')
        o.querySelector('.check-icon').style.opacity = '0'
    })
    el.classList.add('selected')
    el.querySelector('.check-icon').style.opacity = '1'
    document.getElementById('current-theme').textContent = theme === 'dark' ? 'Oscuro' : 'Claro'
    document.body.classList.toggle('dark-theme', appSettings.darkTheme)
    localStorage.setItem('loveos-settings', JSON.stringify(appSettings))
    setTimeout(closeThemeModal, 300)
}

function openDateModal() {
    const inp = document.getElementById('relationship-date-input')
    if (inp && appSettings.startDate) inp.value = appSettings.startDate
    document.getElementById('date-modal').classList.add('active')
}
function closeDateModal() { document.getElementById('date-modal').classList.remove('active') }

function openExportModal() { document.getElementById('export-modal').classList.add('active') }
function closeExportModal() { document.getElementById('export-modal').classList.remove('active') }

function exportData() {
    const data = { startDate: appSettings.startDate, lang: appSettings.lang, theme: appSettings.darkTheme ? 'dark' : 'light', exportDate: new Date().toISOString(), version: '2.0' }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `loveos_backup_${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(url)
    showToast('Datos exportados correctamente')
    closeExportModal()
}

function openLogoutModal() { document.getElementById('logout-modal').classList.add('active') }
function closeLogoutModal() { document.getElementById('logout-modal').classList.remove('active') }
function confirmLogout() { openLogoutModal() }

/* ─────────────────────────────────────────
   NAVEGACIÓN
───────────────────────────────────────── */
function switchView(viewId, btn) {
    const titles = { home: 'Pareja conectada', chat: 'Dr. Love IA', fights: 'Zona Anti-Peleas', settings: 'Configuración' }
    setEl('view-title', titles[viewId] || 'LoveOS')
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'))
    document.getElementById('view-' + viewId)?.classList.add('active')
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'))
    if (btn?.classList.contains('emoji-btn')) btn.classList.add('active')
    else if (viewId === 'home') document.querySelector('.emoji-btn')?.classList.add('active')
}

/* ─────────────────────────────────────────
   CHAT (LoveIA — simulado por ahora)
───────────────────────────────────────── */
const LOVEAI_RESPONSES = [
    'Entiendo perfectamente cómo te sientes. Las relaciones a distancia tienen sus propios retos únicos, y es completamente normal sentir eso.',
    'Eso que describes es muy valioso. ¿Has pensado en contarle exactamente cómo te sientes? A veces el simple acto de verbalizarlo cambia todo.',
    'La comunicación es la base de todo. Te sugiero crear un espacio seguro para hablar, sin juicios y con mucha escucha activa.',
    'Lo que sientes es válido. Recuerda que los conflictos no significan que el amor se acabó, sino que ambos importan lo suficiente para querer mejorar.',
    'Una idea bonita: planeen algo juntos, aunque sea a distancia. Una cita virtual, una película sincronizada... los rituales compartidos fortalecen el vínculo.',
    '¿Has intentado escribirle una carta? No un mensaje, sino una carta de verdad. A veces las palabras escritas llegan diferente al corazón.'
]
let responseIdx = 0

const AI_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;fill:white"><path d="M12 2C9.5 5.5 8 8 9 11c-2-1-2.5-3-2.5-3C4 11 3 14 3 16c0 4.4 4 8 9 8s9-3.6 9-8c0-5-4-9-9-14zm0 18c-2.8 0-5-1.8-5-4 0-1 .5-2 1.5-3 .3 1 1 2 2 2.5-.2-1.5.5-3 1.5-4 .5 2 2 3 2 4.5 0 .3 0 .5-.1.8.6-.5 1.1-1.2 1.1-2.3.8.8 1 2 1 3 0 1.4-1.8 2.5-4 2.5z"/></svg>`

function createAvatarEl(isUser) {
    const av = document.createElement('div')
    av.className = 'msg-avatar ' + (isUser ? 'user-avatar' : 'ai-avatar')
    if (!isUser) av.innerHTML = AI_SVG
    return av
}

function typewriterEffect(element, text, speed = 14) {
    return new Promise(resolve => {
        let i = 0
        element.textContent = ''
        const interval = setInterval(() => {
            i++
            element.textContent = text.slice(0, i)
            const box = document.getElementById('chat-box')
            if (box) box.scrollTop = box.scrollHeight
            if (i >= text.length) {
                clearInterval(interval)
                resolve()
            }
        }, speed)
    })
}

function appendMessage(text, isUser) {
    const box = document.getElementById('chat-box')
    if (!box) return
    const row = document.createElement('div')
    row.className = 'msg-row' + (isUser ? ' user' : '')
    row.appendChild(createAvatarEl(isUser))
    const wrap = document.createElement('div')
    wrap.style.minWidth = '0'
    wrap.style.maxWidth = '78%'
    const meta = document.createElement('div')
    meta.className = 'msg-meta'
    meta.innerText = isUser ? 'Tú' : 'LoveIA'
    const bubble = document.createElement('div')
    bubble.className = 'msg-bubble ' + (isUser ? 'user' : 'ai')
    if (isUser) {
        bubble.textContent = text.replace(/\n/g, ' ')
    } else {
        typewriterEffect(bubble, text)
    }
    wrap.appendChild(meta); wrap.appendChild(bubble); row.appendChild(wrap)
    box.appendChild(row)
    box.scrollTop = box.scrollHeight
}

function showTyping() {
    const box = document.getElementById('chat-box')
    if (!box) return
    const row = document.createElement('div')
    row.className = 'msg-row'; row.id = 'typing-row'
    row.appendChild(createAvatarEl(false))
    const wrap = document.createElement('div')

    // Texto "Pensando..." animado encima
    const thinking = document.createElement('div')
    thinking.className = 'typing-text'
    thinking.innerHTML = 'Pensando<span class="typing-dots-text"></span>'

    // Los tres puntitos rebotando abajo
    const bubble = document.createElement('div')
    bubble.className = 'msg-bubble ai'
    bubble.style.padding = '0'
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>'

    wrap.appendChild(thinking)
    wrap.appendChild(bubble)
    row.appendChild(wrap)
    box.appendChild(row)
    box.scrollTop = box.scrollHeight
}

function removeTyping() { document.getElementById('typing-row')?.remove() }

async function sendMessage() {
    const sendBtn = document.getElementById('send-btn')
    if (sendBtn?.disabled) return

    const input = document.getElementById('chat-input')
    const text = input?.value.trim()
    if (!text) return

    // Primera vez: ocultar logo, mostrar mensajes
    const brand = document.getElementById('loveai-brand')
    const chatBox = document.getElementById('chat-box')
    const shell = document.querySelector('.loveai-shell')
    if (brand && !brand.classList.contains('hidden')) {
        brand.classList.add('hidden')
        chatBox?.classList.add('has-messages')
        shell?.classList.add('has-chat')
    }
    document.getElementById('quick-prompts')?.classList.add('pills-hidden')

    appendMessage(text, true)
    input.value = ''
    input.style.height = '44px'

    // ← ya no hay segunda declaración de sendBtn acá
    if (sendBtn) { sendBtn.disabled = true; sendBtn.classList.remove('active') }

    chatHistory.push({ role: 'user', content: text })
    showTyping()

    try {
        const res = await fetch(`${import.meta.env.VITE_OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5:3b',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatHistory],
                stream: false
            })
        })
        const data = await res.json()
        const reply = data.message?.content || 'No pude responder, intentá de nuevo.'
        chatHistory.push({ role: 'assistant', content: reply })
        removeTyping()
        appendMessage(reply, false)
    } catch (e) {
        removeTyping()
        appendMessage('No pude conectarme a LoveIA. ¿Está Ollama corriendo?', false)
        console.error('Error Ollama:', e)
    }

    if (sendBtn) sendBtn.disabled = false
}

function sendQuick(text) {
    const input = document.getElementById('chat-input')
    if (input) { input.value = text; chatInputChanged(input) }
    sendMessage()
}

function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const sendBtn = document.getElementById('send-btn')
        if (sendBtn?.disabled) return  // ← agregar esto
        sendMessage()
    }
}

function autoResize(el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

function chatInputChanged(el) {
    const sendBtn = document.getElementById('send-btn')
    const hasText = el.value.trim() !== ''
    if (sendBtn && !sendBtn.disabled) {
        sendBtn.classList.toggle('active', hasText)
    }
    const chatBox = document.getElementById('chat-box')
    if (!chatBox?.classList.contains('has-messages')) {
        document.getElementById('quick-prompts')?.classList.toggle('pills-hidden', hasText)
    }
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'fixed top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full text-xs font-bold z-[5000] shadow-2xl'
    t.innerText = msg
    document.body.appendChild(t)
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300) }, 2300)
}

/* ─────────────────────────────────────────
   UTILIDAD
───────────────────────────────────────── */
function setEl(id, text) {
    const el = document.getElementById(id)
    if (el) el.innerText = text
}

// Al cargar, trae tu propio mood guardado
async function loadOwnMood() {
    if (!currentUser) return

    const { data } = await supabase
        .from('moods')
        .select('emoji, label')
        .eq('user_id', currentUser.id)
        .maybeSingle()

    console.log('loadOwnMood data:', data)
    if (!data) return

    const chips = document.querySelectorAll('.mood-tag')
    console.log('chips encontrados:', chips.length)  // ← esto

    setEl('current-mood-text', `${data.emoji} ${data.label}`)

    chips.forEach(t => {
        t.classList.remove('mood-active')
        const emoji = t.querySelector('span:first-child')?.innerText?.trim()
        const label = t.querySelector('.mood-label')?.innerText?.trim()
        console.log(`chip: "${emoji}" "${label}"`)
        if (emoji === data.emoji && label?.toLowerCase() === data.label?.toLowerCase()) {
            t.classList.add('mood-active')
        }
    })
}

async function loadCustomMoods() {
    if (!currentUser) return

    const { data, error } = await supabase
        .from('custom_moods')
        .select('id, emoji, label')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true })

    if (error || !data?.length) return

    data.forEach(({ id, emoji, label }) => {
        appendCustomMoodChip(id, emoji, label)
    })
}

function appendCustomMoodChip(id, emoji, label) {
    const list = document.getElementById('mood-list')
    const div = document.createElement('div')
    div.className = 'mood-tag flex-shrink-0 bg-white border border-gray-100 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[100px] relative'
    div.innerHTML = `
    <span class="text-2xl mb-1">${emoji}</span>
    <span class="mood-label text-[10px] font-bold text-gray-700 uppercase tracking-tighter">${label}</span>
    <button class="delete-mood-btn absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden items-center justify-center">×</button>
`
    div.onclick = function () { setMood(emoji + ' ' + label, this) }

    // Long press para mostrar botón de borrar
    let pressTimer
    div.addEventListener('pointerdown', () => {
        pressTimer = setTimeout(() => {
            div.querySelector('.delete-mood-btn').classList.remove('hidden')
            div.querySelector('.delete-mood-btn').classList.add('flex')
        }, 600)
    })
    div.addEventListener('pointerup', () => clearTimeout(pressTimer))
    div.addEventListener('pointerleave', () => clearTimeout(pressTimer))

    div.querySelector('.delete-mood-btn').addEventListener('click', async (e) => {
        e.stopPropagation()
        await supabase.from('custom_moods').delete().eq('id', id)
        div.remove()
    })

    list.appendChild(div)
}

function openFightReportModal(fight) {
    document.getElementById('fr-why').innerText = fight.why || '—'
    document.getElementById('fr-what').innerText = fight.what || '—'
    document.getElementById('fr-feel').innerText = fight.feel || '—'
    document.getElementById('fr-need').innerText = fight.need || '—'
    document.getElementById('fight-report-modal').classList.add('active')
}

function closeFightReportModal() {
    document.getElementById('fight-report-modal').classList.remove('active')
    markFightsAsSeen()
}

function subscribeFights() {
    if (!currentUser || !partnerProfile) return

    supabase.channel('fights-incoming')
        .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'fights',
            filter: `receiver_id=eq.${currentUser.id}`
        }, payload => {
            const fight = payload.new
            showFightsBadge()
            const t = document.createElement('div')
            t.className = 'fixed top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full text-xs font-bold z-[5000] shadow-2xl flex items-center gap-3'
            t.innerHTML = `
                <span>💬 ${partnerProfile.name} envió un reporte</span>
                <button onclick="openFightReportModal(${JSON.stringify(fight).replace(/"/g, '&quot;')}); this.closest('.fixed').remove()" 
                    style="background:#4cc9f0;color:#0a1628;border:none;border-radius:20px;padding:4px 12px;font-weight:900;cursor:pointer;font-size:11px;">
                    Ver
                </button>
            `
            document.body.appendChild(t)
            setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300) }, 6000)
        })
        .subscribe()
}
// Verificar reportes no leídos al cargar
async function checkPendingFights() {
    if (!currentUser || !partnerProfile) {
        console.log('checkPendingFights: sin usuario o pareja')
        return
    }

    const { data, error } = await supabase
        .from('fights')
        .select('*')
        .eq('receiver_id', currentUser.id)
        .eq('seen', false)
        .order('created_at', { ascending: false })

    console.log('fights pendientes:', data, error)

    if (error || !data?.length) return

    showFightsBadge()

    // Mostrar botón "Ver reporte" dentro de la vista de peleas
    const fightInitial = document.getElementById('fight-initial')
    if (fightInitial) {
        const existing = document.getElementById('pending-fight-btn')
        if (existing) existing.remove()

        const btn = document.createElement('button')
        btn.id = 'pending-fight-btn'
        btn.onclick = () => { openFightReportModal(data[0]); btn.remove() }
        btn.className = 'w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white mt-4 flex items-center justify-center gap-2'
        btn.style.background = 'linear-gradient(135deg, #4cc9f0, #0096c7)'
        btn.innerHTML = '<i class="fa-solid fa-envelope-open"></i> Ver reporte de tu pareja'
        fightInitial.appendChild(btn)
    }

    // También abrir el modal automáticamente al cargar
    openFightReportModal(data[0])
}

function showFightsBadge() {
    const badge = document.getElementById('fights-badge')
    if (badge) { badge.classList.remove('hidden'); badge.classList.add('flex') }
}

function hideFightsBadge() {
    const badge = document.getElementById('fights-badge')
    if (badge) { badge.classList.add('hidden'); badge.classList.remove('flex') }
}

async function markFightsAsSeen() {
    if (!currentUser) return
    await supabase.from('fights')
        .update({ seen: true })
        .eq('receiver_id', currentUser.id)
        .eq('seen', false)
    hideFightsBadge()
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession()
    loadSettings()
    await loadProfile()
    await loadCustomMoods()
    await loadOwnMood()
    subscribeZumbidos()
    subscribePartnerMood()
    subscribeFights()
    await checkPendingFights()

    const nm = document.getElementById('s-next-meet')
    if (nm) nm.addEventListener('change', function () {
        appSettings.nextMeet = this.value
        updateNextMeetPreview()
    })

    // Dropdown modelo
    const modelTrigger = document.getElementById('modelTrigger')
    const modelDropdown = document.getElementById('modelDropdown')
    if (modelTrigger && modelDropdown) {
        modelTrigger.addEventListener('click', (e) => {
            e.stopPropagation()
            const isOpen = modelDropdown.classList.toggle('show')
            modelTrigger.classList.toggle('open', isOpen)
        })
        document.addEventListener('click', () => {
            modelDropdown.classList.remove('show')
            modelTrigger.classList.remove('open')
        })
    }
})

/* ─────────────────────────────────────────
   EXPOSICIÓN AL HTML
───────────────────────────────────────── */
Object.assign(window, {
    switchView,
    sendMessage, sendQuick, handleChatKey, autoResize, chatInputChanged,
    setMood, openMoodModal, closeMoodModal, addNewMood,
    openLanguageModal, closeLanguageModal, selectLanguage,
    openThemeModal, closeThemeModal, selectTheme,
    openDateModal, closeDateModal, saveRelationshipDate,
    openExportModal, closeExportModal, exportData,
    confirmLogout, closeLogoutModal, doLogout,
    activateAntiFight, cancelFight, submitFight, resetFight, stopTimer,
    sendInteraction, toggleSetting, closeFightReportModal,
    markFightsAsSeen,
})