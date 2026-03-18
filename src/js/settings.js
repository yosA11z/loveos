let appSettings = {
    name: '', partner: '',
    city1: 'Cali', city2: 'Facatativá',
    startDate: '', relType: 'distancia',
    nextMeet: '', lang: 'es',
    darkTheme: false, notifications: true,
}

export function loadSettings() {
    try {
        const saved = localStorage.getItem('loveos-settings')
        if (saved) appSettings = { ...appSettings, ...JSON.parse(saved) }
    } catch (e) { }

    applySettings()
}

function applySettings() {
    const nameDisplay = document.getElementById('s-name-display')
    const partnerDisplay = document.getElementById('s-partner-display')

    if (nameDisplay) nameDisplay.innerText = appSettings.name || 'Tu nombre'
    if (partnerDisplay) partnerDisplay.innerText = appSettings.partner || 'Pareja'

    if (appSettings.darkTheme) document.body.classList.add('dark-theme')
    else document.body.classList.remove('dark-theme')
}

export function saveSettings() {
    localStorage.setItem('loveos-settings', JSON.stringify(appSettings))
    applySettings()
}

export function toggleTheme() {
    appSettings.darkTheme = !appSettings.darkTheme
    saveSettings()
}

export function openDateModal() {
    document.getElementById('date-modal')?.classList.add('active')
}