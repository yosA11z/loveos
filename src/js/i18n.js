// ─────────────────────────────────────────
// i18n.js — Traducciones LoveOS
// Importar en dashboard.js y llamar applyLang(lang) al cambiar idioma
// ─────────────────────────────────────────

export const translations = {
    es: {
        // Header
        'view-title-home': 'Pareja conectada',
        'view-title-chat': 'Dr. Love IA',
        'view-title-fights': 'Zona Anti-Peleas',
        'view-title-settings': 'Configuración',
        'partner-mood-label': 'Estado de tu pareja',

        // Modal: Nuevo estado
        'mood-modal-title': 'Nuevo Estado',
        'mood-emoji-label': 'Emoji',
        'mood-name-label': 'Nombre del estado',
        'mood-name-placeholder': 'Ej: Estudiando',
        'mood-cancel': 'Cancelar',
        'mood-save': 'Guardar',

        // Modal: Idioma
        'language-modal-title': 'Idioma / Language',

        // Modal: Tema
        'theme-modal-title': 'Tema',
        'theme-light-label': 'Claro',
        'theme-light-desc': 'Modo claro por defecto',
        'theme-dark-label': 'Oscuro',
        'theme-dark-desc': 'Modo oscuro para la noche',

        // Modal: Fecha
        'date-modal-title': 'Fecha de inicio',
        'date-modal-desc': 'Selecciona el día que comenzaron su historia de amor',
        'date-cancel': 'Cancelar',
        'date-save': 'Guardar',

        // Modal: Export
        'export-modal-title': 'Exportar datos',
        'export-modal-desc': 'Descarga un archivo con tus estadísticas y momentos especiales guardados en LoveOS.',
        'export-cancel': 'Cancelar',
        'export-download': 'Descargar JSON',

        // Modal: Logout
        'logout-modal-title': '¿Cerrar sesión?',
        'logout-modal-desc': 'Tu información está segura y podrás volver a acceder cuando quieras.',
        'logout-cancel': 'Cancelar',
        'logout-confirm': 'Salir',

        // Modal: Fight report
        'fight-report-title': '💬 Tu pareja necesita hablar',
        'fight-report-why': '¿Por qué se enojó?',
        'fight-report-what': '¿Qué pasó?',
        'fight-report-feel': '¿Cómo se sintió?',
        'fight-report-need': '¿Qué necesita?',
        'fight-report-close': 'Entendido',

        // Home
        'home-building': 'Construyendo un futuro',
        'home-since': 'Desde el inicio',
        'home-days-label': 'Días compartidos',
        'home-days-unit': 'días',
        'home-every-second': 'Cada segundo cuenta',
        'home-how-feel': '¿Cómo te sientes hoy?',
        'mood-radiante': 'Radiante',
        'mood-extrano': 'Te extraño',
        'mood-agotado': 'Agotado',
        'zumbido-label': 'Zumbido',
        'zumbido-love': 'Mandar un "Te amo"',
        'zumbido-miss': 'Mandar un "Te extraño"',

        // Chat
        'chat-subtitle': 'Dr. Love · Consejero de parejas',
        'chat-status': 'En línea',
        'chat-welcome': '¡Hola! Soy Dr. Love, tu consejero de pareja. ¿Cómo va todo hoy? ☕ Cuéntame lo que hay en tu corazón.',
        'chat-placeholder': 'Cuéntame lo que sientes...',
        'chat-hint': 'LoveIA puede cometer errores · Siempre habla con tu pareja',
        'quick-distancing': '😔 Nos estamos distanciando',
        'quick-date': '💡 Consejos para una cita',
        'quick-fight': '🌿 Cómo resolver una pelea',
        'quick-surprise': '✨ Sorprender a mi pareja',

        // Peleas
        'fight-alert-badge': 'Alerta de conflicto',
        'fight-alert-title': '¿Sientes que la conversación se está saliendo de control?',
        'fight-alert-desc': 'Antes de decir algo de lo que te arrepientas, activa el modo anti-peleas.',
        'fight-btn': 'Modo Anti-Peleas',
        'fight-protocol-badge': 'Protocolo de paz',
        'fight-protocol-title': 'Cuéntame qué pasó',
        'fight-why-label': '¿Por qué te estás enojando?',
        'fight-why-placeholder': 'Describe qué te hizo enojar...',
        'fight-what-label': '¿Qué hizo o dijo el otro?',
        'fight-what-placeholder': 'Solo hechos, sin interpretar...',
        'fight-feel-label': '¿Cómo te hizo sentir eso?',
        'fight-feel-placeholder': 'Tus emociones son válidas...',
        'fight-need-label': '¿Qué te gustaría que el otro hiciera?',
        'fight-need-placeholder': 'Sé específico/a...',
        'fight-send': 'Enviar',
        'fight-peace-badge': 'Protocolo activado',
        'fight-peace-title': 'Tiempo de reflexión',
        'fight-peace-desc': 'Piensen cada uno la discusión por aparte.',
        'fight-peace-desc2': 'Tómense 15 minutos y vuelvan para arreglarlo.',
        'fight-peace-min': 'minutos',
        'fight-step1-bold': 'Alejense un momento.',
        'fight-step1-text': 'Nada de mensajes ni pantallas.',
        'fight-step2-bold': 'Piensen',
        'fight-step2-text': 'cómo se pudo sentir el otro con lo que pasó.',
        'fight-step3-bold': 'Vuelvan con calma.',
        'fight-step3-text': 'El objetivo no es ganar, es entenderse.',
        'fight-quote': 'El amor no es la ausencia de conflicto, sino la voluntad de resolverlo juntos.',
        'fight-pause': 'Pausar',
        'fight-resolved': 'Ya hablamos',

        // Settings
        'settings-profile-title': 'Tu Perfil',
        'settings-sync-badge': 'SINCRONIZADO',
        'settings-cities-label': 'Ciudades',
        'settings-relation-title': 'Tu Relación',
        'settings-startdate-label': 'Fecha de inicio',
        'settings-startdate-placeholder': 'Seleccionar fecha',
        'settings-prefs-title': 'Preferencias',
        'settings-lang-label': 'Idioma',
        'settings-theme-label': 'Tema',
        'settings-logout': 'Cerrar sesión',

        // Dock
        'dock-home': 'Inicio',
        'dock-chat': 'LoveIA',
        'dock-fights': 'Peleas',
        'dock-settings': 'Ajustes',
    },

    en: {
        // Header
        'view-title-home': 'Connected couple',
        'view-title-chat': 'Dr. Love AI',
        'view-title-fights': 'Anti-Fight Zone',
        'view-title-settings': 'Settings',
        'partner-mood-label': 'Your partner\'s mood',

        // Modal: Nuevo estado
        'mood-modal-title': 'New Mood',
        'mood-emoji-label': 'Emoji',
        'mood-name-label': 'Mood name',
        'mood-name-placeholder': 'E.g.: Studying',
        'mood-cancel': 'Cancel',
        'mood-save': 'Save',

        // Modal: Idioma
        'language-modal-title': 'Idioma / Language',

        // Modal: Tema
        'theme-modal-title': 'Theme',
        'theme-light-label': 'Light',
        'theme-light-desc': 'Default light mode',
        'theme-dark-label': 'Dark',
        'theme-dark-desc': 'Dark mode for the night',

        // Modal: Fecha
        'date-modal-title': 'Start date',
        'date-modal-desc': 'Select the day your love story began',
        'date-cancel': 'Cancel',
        'date-save': 'Save',

        // Modal: Export
        'export-modal-title': 'Export data',
        'export-modal-desc': 'Download a file with your stats and special moments saved in LoveOS.',
        'export-cancel': 'Cancel',
        'export-download': 'Download JSON',

        // Modal: Logout
        'logout-modal-title': 'Sign out?',
        'logout-modal-desc': 'Your information is safe and you can sign back in whenever you want.',
        'logout-cancel': 'Cancel',
        'logout-confirm': 'Sign out',

        // Modal: Fight report
        'fight-report-title': '💬 Your partner needs to talk',
        'fight-report-why': 'Why were they upset?',
        'fight-report-what': 'What happened?',
        'fight-report-feel': 'How did they feel?',
        'fight-report-need': 'What do they need?',
        'fight-report-close': 'Got it',

        // Home
        'home-building': 'Building a future',
        'home-since': 'Since the beginning',
        'home-days-label': 'Days together',
        'home-days-unit': 'days',
        'home-every-second': 'Every second counts',
        'home-how-feel': 'How are you feeling today?',
        'mood-radiante': 'Glowing',
        'mood-extrano': 'Miss you',
        'mood-agotado': 'Exhausted',
        'zumbido-label': 'Buzz',
        'zumbido-love': 'Send an "I love you"',
        'zumbido-miss': 'Send an "I miss you"',

        // Chat
        'chat-subtitle': 'Dr. Love · Couples counselor',
        'chat-status': 'Online',
        'chat-welcome': 'Hi! I\'m Dr. Love, your couples counselor. How\'s everything today? ☕ Tell me what\'s in your heart.',
        'chat-placeholder': 'Tell me how you feel...',
        'chat-hint': 'LoveIA can make mistakes · Always talk to your partner',
        'quick-distancing': '😔 We\'re drifting apart',
        'quick-date': '💡 Date night tips',
        'quick-fight': '🌿 How to resolve a fight',
        'quick-surprise': '✨ Surprise my partner',

        // Peleas
        'fight-alert-badge': 'Conflict alert',
        'fight-alert-title': 'Do you feel the conversation is getting out of control?',
        'fight-alert-desc': 'Before saying something you\'ll regret, activate anti-fight mode.',
        'fight-btn': 'Anti-Fight Mode',
        'fight-protocol-badge': 'Peace protocol',
        'fight-protocol-title': 'Tell me what happened',
        'fight-why-label': 'Why are you getting angry?',
        'fight-why-placeholder': 'Describe what made you upset...',
        'fight-what-label': 'What did the other person do or say?',
        'fight-what-placeholder': 'Just the facts, no interpretation...',
        'fight-feel-label': 'How did that make you feel?',
        'fight-feel-placeholder': 'Your emotions are valid...',
        'fight-need-label': 'What would you like the other person to do?',
        'fight-need-placeholder': 'Be specific...',
        'fight-send': 'Send',
        'fight-peace-badge': 'Protocol activated',
        'fight-peace-title': 'Reflection time',
        'fight-peace-desc': 'Each of you think about the argument separately.',
        'fight-peace-desc2': 'Take 15 minutes and come back to work it out.',
        'fight-peace-min': 'minutes',
        'fight-step1-bold': 'Step away for a moment.',
        'fight-step1-text': 'No messages or screens.',
        'fight-step2-bold': 'Think',
        'fight-step2-text': 'about how the other person might have felt.',
        'fight-step3-bold': 'Come back calmly.',
        'fight-step3-text': 'The goal is not to win, it\'s to understand each other.',
        'fight-quote': 'Love is not the absence of conflict, but the willingness to resolve it together.',
        'fight-pause': 'Pause',
        'fight-resolved': 'We talked it out',

        // Settings
        'settings-profile-title': 'Your Profile',
        'settings-sync-badge': 'SYNCED',
        'settings-cities-label': 'Cities',
        'settings-relation-title': 'Your Relationship',
        'settings-startdate-label': 'Start date',
        'settings-startdate-placeholder': 'Select date',
        'settings-prefs-title': 'Preferences',
        'settings-lang-label': 'Language',
        'settings-theme-label': 'Theme',
        'settings-logout': 'Sign out',

        // Dock
        'dock-home': 'Home',
        'dock-chat': 'LoveIA',
        'dock-fights': 'Fights',
        'dock-settings': 'Settings',
    }
}

export function applyLang(lang) {
    const t = translations[lang] || translations['es']

    // Todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n')
        if (t[key]) el.innerText = t[key]
    })

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder')
        if (t[key]) el.placeholder = t[key]
    })

    // Actualizar lang en el html
    document.documentElement.lang = lang
}