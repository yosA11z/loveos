const LOVEAI_RESPONSES = [
    "Entiendo perfectamente cómo te sientes.",
    "Eso que dices es importante.",
    "Hablarlo siempre ayuda.",
    "Tus emociones son válidas.",
    "Intenten hacer algo juntos.",
]

let responseIdx = 0

function appendMessage(text, isUser) {
    const box = document.getElementById('chat-box')
    if (!box) return

    const div = document.createElement('div')
    div.className = isUser ? 'msg user' : 'msg ai'
    div.innerText = text

    box.appendChild(div)
    box.scrollTop = box.scrollHeight
}

export function sendMessage() {
    const input = document.getElementById('chat-input')
    if (!input) return

    const text = input.value.trim()
    if (!text) return

    appendMessage(text, true)
    input.value = ''

    setTimeout(() => {
        const reply = LOVEAI_RESPONSES[responseIdx % LOVEAI_RESPONSES.length]
        responseIdx++
        appendMessage(reply, false)
    }, 1000)
}

export function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
    }
}

export function autoResize(el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}