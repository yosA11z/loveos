# 🚀 Guía de Inicio del Servidor

> Sigue los pasos **en el orden indicado** para levantar el entorno correctamente.

---

## 1. Abrir 4 terminales

### 1.1 — Ollama (antigravity)
```bash
OLLAMA_ORIGINS="*" ollama serve
```

### 1.2 — Proxy (antigravity)
```bash
cd src/js && node ollama-proxy.js
```

### 1.3 — Dev server (antigravity)
```bash
npm run dev
```

### 1.4 — Túnel Cloudflare (consola local)
```bash
./cloudflared tunnel --url http://localhost:3001
```

---

## 2. Actualizar variable de entorno en Vercel

1. Ir a **[Environment Variables – loveOS](https://vercel.com/yosa11zs-projects/loveos/settings/environment-variables)**
2. Cambiar el valor de `VITE_OLLAMA_URL` por la **URL generada por cloudflared**

---

## 3. Subir a producción

Despliega los cambios en Vercel para que tome la nueva URL.

---

## ✅ Servidor corriendo en

🔗 **[https://loveos-flame.vercel.app](https://loveos-flame.vercel.app)**

> ⚠️ Solo necesitás redeplegar si cambiaste código.
> Si solo actualizaste `VITE_OLLAMA_URL`, alcanza con hacer
> **Redeploy** desde el dashboard de Vercel sin tocar el repo.