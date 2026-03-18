import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
    try {
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        })
        const data = await ollamaRes.json()
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

app.listen(3001, () => console.log('Proxy corriendo en http://localhost:3001'))