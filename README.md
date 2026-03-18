# LoveOS 💕

Aplicación web personal para parejas a distancia. Construida para Matias (Cali) y Mariana (Facatativá), con chat IA, estados de ánimo, zumbidos en tiempo real y modo anti-peleas.

🔗 **[loveos-flame.vercel.app](https://loveos-flame.vercel.app)**

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JavaScript vanilla |
| Estilos | Tailwind CDN + CSS propio |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| IA | Ollama + Qwen2.5:3b (local) vía proxy Node.js |
| Túnel | Cloudflare Tunnel (expone Ollama al exterior) |
| Deploy | Vercel |
| Clima | Open-Meteo API (sin API key) |

---

## Estructura del proyecto

```
loveos/
├── src/
│   ├── pages/
│   │   ├── dashboard.html      # SPA principal
│   │   └── login.html          # Pantalla de login
│   ├── js/
│   │   ├── dashboard.js        # Toda la lógica de la app
│   │   ├── supabase.js         # Cliente Supabase
│   │   ├── i18n.js             # Traducciones ES/EN
│   │   └── ollama-proxy.js     # Proxy Node.js para Ollama
│   └── styles/
│       └── dashboard.css       # Estilos completos
├── .env                        # Variables de entorno (no subir)
├── .gitignore
├── DEV.md                      # Guía de inicio del servidor
└── README.md
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz (ya está en `.gitignore`):

```env
VITE_SUPABASE_URL=https://tjvgwsovamxpxprxerkv.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_OLLAMA_URL=https://tu-url-cloudflare.trycloudflare.com
```

En Vercel, agregar estas mismas variables en **Settings → Environment Variables**.

---

## Desarrollo

Ver [DEV.md](./DEV.md) para instrucciones paso a paso de cómo levantar el servidor local, el proxy de Ollama y el túnel de Cloudflare.

---

## Base de datos (Supabase)

Proyecto: `tjvgwsovamxpxprxerkv.supabase.co`

### Tablas

```sql
-- Perfiles de usuario
profiles (
  id uuid PRIMARY KEY,
  partner_id uuid REFERENCES profiles(id),
  name text,
  city text,
  start_date date,
  created_at timestamptz
)

-- Estado de ánimo actual
moods (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES profiles(id),
  emoji text,
  label text,
  updated_at timestamptz
)

-- Zumbidos (te amo / te extraño)
zumbidos (
  id uuid PRIMARY KEY,
  sender_id uuid,
  receiver_id uuid,
  type text,  -- 'te_amo' | 'te_extrano'
  seen boolean,
  created_at timestamptz
)

-- Reportes de peleas
fights (
  id uuid PRIMARY KEY,
  user_id uuid,
  receiver_id uuid,
  why text,
  what text,
  feel text,
  need text,
  seen boolean DEFAULT false,
  resolved boolean DEFAULT false,
  created_at timestamptz
)

-- Estados de ánimo personalizados
custom_moods (
  id uuid PRIMARY KEY,
  user_id uuid,
  emoji text,
  label text,
  created_at timestamptz
)
```

### Función RLS (evita recursión infinita en profiles)

```sql
CREATE OR REPLACE FUNCTION get_partner_id(uid uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT partner_id FROM profiles WHERE id = uid;
$$;
```

### Realtime habilitado en
- `zumbidos`
- `moods`
- `fights`

### Vínculo de pareja (ejecutar una sola vez)

```sql
UPDATE profiles SET partner_id = '3aab55c2-5066-444f-ae3d-11c8d03d7447'
WHERE id = 'eba1a9c6-8f21-482c-b3a7-f6cb631857dd';

UPDATE profiles SET partner_id = 'eba1a9c6-8f21-482c-b3a7-f6cb631857dd'
WHERE id = '3aab55c2-5066-444f-ae3d-11c8d03d7447';
```

---

## Usuarios

| Usuario | UUID | Ciudad |
|---------|------|--------|
| Matias | `eba1a9c6-8f21-482c-b3a7-f6cb631857dd` | Facatativá |
| Mariana | `3aab55c2-5066-444f-ae3d-11c8d03d7447` | Cali |

---

## Arquitectura del chat IA (LoveIA)

```
Browser → Cloudflare Tunnel → ollama-proxy.js (:3001) → Ollama (:11434) → qwen2.5:3b
```

---

## Funcionalidades

### 🏠 Home
- Contador de días juntos (calculado desde `start_date` en Supabase)
- Clima en tiempo real para ambas ciudades (Open-Meteo, sin API key)
- Estado de ánimo propio con chips personalizables (guardado en Supabase)
- Estado de ánimo de la pareja en tiempo real (Supabase Realtime)
- Zumbidos — enviar "Te amo" y "Te extraño" con notificación instantánea

### 💬 LoveIA (Chat)
- Chat con Dr. Love, consejero de parejas
- Modelo Qwen2.5:3b corriendo localmente vía Ollama
- Historial de conversación en memoria (contexto multi-turn)
- Efecto de máquina de escribir en respuestas
- Quick prompts para iniciar conversaciones
- Selector de modelo con dropdown animado

### 🤝 Modo Anti-Peleas
- Formulario estructurado: por qué, qué pasó, cómo me sentí, qué necesito
- Envía reporte a la pareja vía Supabase
- Timer de 15 minutos de reflexión con anillo animado
- Notificación en tiempo real al receptor
- Badge en el dock cuando hay reportes pendientes

### ⚙️ Configuración
- Cambio de idioma (ES/EN) con i18n completo
- Tema claro/oscuro
- Fecha de inicio de la relación (guardada en Supabase)
- Exportar datos en JSON
- Avatares generados automáticamente con ui-avatars.com

---

## Decisiones de diseño

- **Un solo archivo JS** — proyecto pequeño, más simple de mantener
- **Solo 2 usuarios** — no hay sistema de vinculación, `partner_id` hardcodeado en DB
- **Cloudflare Tunnel gratuito** — para exponer Ollama local (URL temporal)
- **Tailwind CDN** — para desarrollo; en producción conviene migrar a PostCSS
- **Sin localStorage para datos críticos** — todo persiste en Supabase

---

## Pendiente / Roadmap

- [ ] Pantalla de registro de nuevos usuarios
- [ ] URL fija para Cloudflare (requiere cuenta paga) o migrar a ngrok
- [ ] Mensajería real entre pareja (tabla `messages`)
- [ ] Notas de voz (Supabase Storage)
- [ ] Skeletons y estados de carga
- [ ] Internacionalización completa de toasts y mensajes JS dinámicos
- [ ] Migrar Tailwind CDN a PostCSS para producción