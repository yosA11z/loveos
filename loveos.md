# LoveOS — Documentación del Proyecto

> Proyecto indie de un solo desarrollador. En fase de construcción visual.
> Las integraciones de backend (Supabase, Ollama) están planificadas pero **aún no implementadas**.

---

## Visión del proyecto

LoveOS nació para combatir la superficialidad de las redes sociales modernas. No es una app de citas basada en fotos para deslizar — es un ecosistema donde la personalidad, los valores y la química real son los protagonistas. El proyecto tiene dos capas:

1. **Landing / onboarding público** — páginas informativas, login y registro
2. **App principal (`loveos.html`)** — la experiencia de pareja una vez autenticado

---

## Stack técnico

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | HTML5 + CSS3 + JS vanilla | ✅ En desarrollo |
| Estilos | Tailwind CSS (CDN) | ✅ Activo |
| Iconos | Font Awesome 6 | ✅ Activo |
| Tipografía | Outfit + Tiempos Headline (Google Fonts) | ✅ Activo |
| Autenticación | Supabase Auth | 🔜 Pendiente |
| Base de datos | Supabase (PostgreSQL) | 🔜 Pendiente |
| Almacenamiento | Supabase Storage | 🔜 Pendiente |
| Chatbot IA | Qwen 2.5 vía Ollama (local) | 🔜 Pendiente |
| Tiempo real | Supabase Realtime | 🔜 Pendiente |

---

## Paleta de colores y tokens de diseño

Todos los archivos comparten las mismas variables CSS raíz:

```css
--primary:   #ff4d6d   /* Rosa — acciones principales, CTAs */
--secondary: #7209b7   /* Morado — gradientes, acentos */
--accent:    #4cc9f0   /* Cian — detalles, badges informativos */
--bg-dark:   #1c1917   /* Fondo general (piedra oscura) */
--surface:   #292524   /* Superficies / cards */
```

**Tipografía:**
- `Outfit` — fuente principal en todas las vistas
- `Tiempos Headline` — títulos grandes en páginas públicas (landing, privacidad, términos)

---

## Mapa de archivos

```
/
├── index.html            Landing page pública
├── login.html            Inicio de sesión
├── reset-password.html   Recuperación de contraseña
├── saber-mas.html        Manifiesto / filosofía del producto
├── privacidad.html       Política de privacidad
├── terminos.html         Términos y condiciones
├── loveos.html           App principal (acceso post-login)
└── LoveOS-docs.md        Este documento
```

---

## Páginas públicas

### `index.html` — Landing page

Estructura de secciones:

- **Navbar** fija con glassmorphism — logo, links de navegación internos, botón "Iniciar Sesión"
- **Hero** — título serif grande con `gradient-text`, subtítulo, CTAs hacia `/login.html` y `/saber-mas.html`, y una card simulada de dashboard que muestra el concepto (perfil "Sofía 26", sugerencia de LoveIA, barra de compatibilidad 92%)
- **¿Qué es LoveOS?** (`#about`) — grid de stats y descripción de filosofía
- **Quién soy** (`#author`) — sección indie dev, dos cards (Mi Visión / Transparencia)
- **Funciones** (`#features`) — tres cards: Afinidad Ética, Asistente Social, Cero Perfiles Fake
- **Footer** — links a Privacidad y Términos

### `login.html` — Inicio de sesión

- Fondo `#1c1917` con glow morado centrado
- Card glassmorphism con avatar DiceBear (seed: Sofia)
- Campos: email + contraseña
- Link "¿Olvidaste tu contraseña?" → `reset-password.html`
- Link "Volver al inicio" → `index.html`
- Botón CTA con gradiente rosa→morado

### `reset-password.html` — Recuperar contraseña

- Mismo estilo que login, glow en cian en lugar de morado
- Campo de email único
- Texto explicativo sobre el "magic link"
- CTA con gradiente morado→cian
- Link "Volver al login"

### `saber-mas.html` — Manifiesto

- Navbar minimalista con link a Login
- Badge "Manifesto v1.0" + título serif grande
- Dos pilares en cards: **Inteligencia Emocional** y **Privacidad por Diseño**
- Proceso en 3 pasos numerados: Descubrimiento → Sincronización → Evolución
- CTA final hacia login

### `privacidad.html` — Política de privacidad

- Header con punto verde animado y "Actualizado: Marzo 2025"
- 4 secciones: El compromiso Indie / Datos que recolectamos / Seguridad y Cifrado / Tus Derechos
- Tono directo, sin lenguaje legal complejo — voz de indie dev
- Link cruzado a `terminos.html`

### `terminos.html` — Términos y condiciones

- 5 secciones: Elegibilidad / Código de Conducta / Propiedad del Contenido / Responsabilidad / Terminación
- Lista con flechas `→` en rojo para las prohibiciones
- Nota de aceptación al pie
- Link cruzado a `privacidad.html`

---

## App principal — `loveos.html`

SPA simulada: una sola página HTML con secciones `div.view-section` que se muestran u ocultan vía JS según la navegación del dock. Toda la UI, lógica y estilos en un solo archivo.

### Navegación — Dock inferior

```
[ 🏠 Inicio ] [ 🤖 LoveIA ] [ ❤️ ] [ 🤝 Peleas ] [ ⚙️ Ajustes ]
```

> El botón ❤️ del centro es decorativo por ahora — sin acción asignada.

---

### Vista: Inicio (`#view-home`)

- **Tarjeta principal** — ciudades de la pareja, contador de días compartidos, horas totales y tiempo en formato "X años y X meses". Todo se calcula dinámicamente desde `appSettings.startDate`
- **Estados de ánimo** — chips con scroll horizontal. Predefinidos: ✨ Radiante, 🥺 Extrañando, 😴 Agotado. Se pueden agregar nuevos vía modal (emoji + nombre). El estado activo cambia la sugerencia del bloque LoveIA
- **Clima** — dos tarjetas por ciudad (valores estáticos por ahora, ver sección integración Open-Meteo)
- **Zumbidos** — botones "Te amo" y "Te extraño" (simulados con toast, sin backend aún)
- **Sugerencia LoveIA** — bloque morado con consejo dinámico según el estado de ánimo activo

---

### Vista: LoveIA (`#view-chat`)

Chat inspirado visualmente en Claude.ai — fondo `#1c1917`, tonos tierra, acentos naranja cobre.

**Componentes:**
- Topbar: icono llama naranja, nombre "LoveIA", badge "Sonnet", indicador "En línea"
- Área de mensajes: burbujas diferenciadas — usuario (gradiente rosa) / IA (superficie oscura con borde sutil)
- Animación de entrada por mensaje (`msgIn` keyframe)
- Indicador de "escribiendo" con tres puntos rebotando en naranja
- Quick prompts temáticos al inicio (desaparecen al primer mensaje enviado)
- Textarea auto-expandible. Enter envía, Shift+Enter inserta salto de línea

**Estado actual:** respuestas simuladas con un array de textos predefinidos en JS.

**Plan de integración:**
Reemplazar con llamadas a **Qwen 2.5 corriendo en Ollama local**:
```
POST http://localhost:11434/api/chat
{
  "model": "qwen2.5",
  "messages": [{ "role": "user", "content": "..." }]
}
```
Con un system prompt especializado en consejería de parejas a distancia. En producción, el endpoint de Ollama se proxearía desde un servidor propio para no exponer el puerto local.

---

### Vista: Peleas (`#view-fights`)

Flujo de 3 estados secuenciales:

1. **Inicial** — alerta amarilla tipo post-it + botón rojo "Modo Anti-Peleas" con animación pulse
2. **Formulario** — 4 campos sobre fondo oscuro (`#111118 → #1c0a14`):
   - ¿Por qué te estás enojando?
   - ¿Qué hizo o dijo el otro?
   - ¿Cómo te hizo sentir?
   - ¿Qué necesitas que hagan?
3. **Pantalla de paz** — timer circular SVG animado de 15 minutos, 3 pasos de reflexión, frase motivacional en rojo, botones pausar/reanudar y "Ya hablamos" que resetea el flujo

---

### Vista: Ajustes (`#view-settings`)

Diseño tipo iOS settings nativo. CSS inspirado en el diseño de Kimi.

#### Tu Perfil *(solo lectura — datos sincronizados del usuario)*
- Avatar generado con UI Avatars desde el nombre del usuario
- Nombre propio + nombre de la pareja con badge verde **SINCRONIZADO**
- Ciudades de ambos en una sola fila

> Estos campos **no son editables en la app** — en producción vendrán del perfil en Supabase. Actualmente se leen de `localStorage` (`appSettings`).

#### Tu Relación
- **Fecha de inicio** — abre `#date-modal` con date picker. Al guardar, recalcula inmediatamente los contadores en la vista Inicio y actualiza el display en settings

#### Preferencias
- **Idioma** — abre `#language-modal` con opciones Español 🇪🇸 / English 🇺🇸 + checkmark animado. Guarda en `appSettings.lang`
- **Tema** — abre `#theme-modal` con opciones Claro ☀️ / Oscuro 🌙. Aplica/quita clase `dark-theme` en el body

#### ~~Privacidad y Datos~~ *(eliminado manualmente por el usuario)*
> Contenía: exportar datos como JSON descargable + indicador de última sincronización.

#### ~~Soporte~~ *(eliminado manualmente por el usuario)*
> Contenía: Centro de ayuda (toast "próximamente") + Acerca de (versión 2.0) + footer "LoveOS v2.0 · Hecho con ❤️".

#### Cerrar sesión
- Abre `#logout-modal` con overlay blur y confirmación
- Al confirmar: toast "¡Hasta pronto! 💔" → redirect a `index.html` tras 1.5s

---

### Modales activos en la app

| ID | Se abre desde | Función |
|---|---|---|
| `#mood-modal` | Botón + en estados | Agregar nuevo estado de ánimo |
| `#language-modal` | Ajustes → Idioma | Selector ES / EN |
| `#theme-modal` | Ajustes → Tema | Selector Claro / Oscuro |
| `#date-modal` | Ajustes → Fecha de inicio | Date picker + guardar |
| `#logout-modal` | Ajustes → Cerrar sesión | Confirmación + redirect |

---

### `appSettings` — estado persistido

Objeto en `localStorage` bajo la key `loveos-settings`:

```json
{
  "name": "",
  "partner": "",
  "city1": "Cali",
  "city2": "Facatativá",
  "startDate": "YYYY-MM-DD",
  "lang": "es",
  "darkTheme": false
}
```

> En producción, `name`, `partner`, `city1` y `city2` no vivirán en localStorage sino en la tabla `profiles` de Supabase.

---

## Arquitectura backend planeada

### Supabase Auth
- Registro + login con email/contraseña
- Magic links para recuperación (la UI ya existe en `reset-password.html`)
- Los datos del perfil se guardarán en una tabla `profiles` enlazada a `auth.users`

### Tablas previstas

```sql
profiles
  id            uuid  PRIMARY KEY  REFERENCES auth.users
  name          text
  partner_name  text
  city          text
  partner_city  text
  start_date    date
  created_at    timestamptz

messages
  id            uuid  PRIMARY KEY
  sender_id     uuid  REFERENCES profiles
  receiver_id   uuid  REFERENCES profiles
  type          text  -- 'text' | 'audio'
  content       text  -- texto plano o URL de Supabase Storage
  created_at    timestamptz
```

### Supabase Storage
- Bucket `audios` — notas de voz del chat entre la pareja
- Bucket `avatars` — fotos de perfil (si se implementa subida de foto)

### Supabase Realtime
- Canal por pareja para mensajería instantánea sin polling:
```js
supabase.channel(`pair:${userId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, handleNewMessage)
  .subscribe()
```

### Chatbot — Qwen 2.5 + Ollama
- Qwen 2.5 corriendo localmente con Ollama
- El frontend hace `fetch` al endpoint local (`http://localhost:11434/api/chat`)
- System prompt orientado a consejería de parejas a distancia
- En producción: proxear desde servidor propio para no exponer el puerto local al cliente

---

## Dos registros visuales del proyecto

**Páginas públicas** (`index`, `login`, `reset-password`, `saber-mas`, `privacidad`, `terminos`):
- Dark mode puro, fondo `#1c1917`
- Glassmorphism con `backdrop-filter: blur`
- Tipografía serif (Tiempos Headline) para títulos grandes
- Glows radiales de fondo en morado y cian
- Avatar de onboarding: DiceBear avataaars, seed "Sofia"

**App principal** (`loveos.html`):
- Fondo rosado suave `#fff5f7` en modo claro
- Cards blancas con bordes sutiles y sombras suaves
- Dock inferior fijo con glassmorphism
- Vista LoveIA con estética Claude: fondo `#1c1917`, superficie `#292524`, acentos naranja cobre (`#e8703a`)

---

## Integración de clima — Open-Meteo

Sin API key, completamente gratuita, 100% client-side. Dos llamadas encadenadas por ciudad.

### Por qué Open-Meteo
- Sin registro ni API key
- HTTPS, CORS habilitado — funciona directo desde el navegador con `fetch`
- Cobertura global
- Datos actualizados cada hora

### Flujo de implementación

**Paso 1 — Geocoding:** convertir el nombre de la ciudad a coordenadas
```
GET https://geocoding-api.open-meteo.com/v1/search?name=Cali&count=1&language=es
```
Respuesta relevante:
```json
{
  "results": [{
    "latitude": 3.4372,
    "longitude": -76.5225,
    "name": "Cali"
  }]
}
```

**Paso 2 — Clima actual:** con las coordenadas obtenidas
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=3.4372
  &longitude=-76.5225
  &current=temperature_2m,weathercode,relative_humidity_2m
  &timezone=auto
```
Respuesta relevante:
```json
{
  "current": {
    "temperature_2m": 28.4,
    "weathercode": 3,
    "relative_humidity_2m": 72
  }
}
```

### WMO Weather Codes → íconos

El `weathercode` sigue el estándar WMO. Mapeo sugerido para los íconos de Font Awesome:

| Código | Condición | Ícono FA |
|---|---|---|
| 0 | Despejado | `fa-sun` |
| 1, 2, 3 | Parcialmente nublado | `fa-cloud-sun` |
| 45, 48 | Niebla | `fa-smog` |
| 51–67 | Llovizna / Lluvia | `fa-cloud-rain` |
| 71–77 | Nieve | `fa-snowflake` |
| 80–82 | Chubascos | `fa-cloud-showers-heavy` |
| 95–99 | Tormenta | `fa-bolt` |

### Implementación en `loveos.html`

Las ciudades vienen de `appSettings.city1` y `appSettings.city2`. La función se llama al cargar la vista home y cada vez que se guardan nuevos ajustes.

```js
async function fetchWeather(cityName, cardId) {
  // 1. Geocoding
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
  );
  const geoData = await geoRes.json();
  if (!geoData.results?.length) return;
  const { latitude, longitude } = geoData.results[0];

  // 2. Clima actual
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`
  );
  const weatherData = await weatherRes.json();
  const { temperature_2m, weathercode } = weatherData.current;

  // 3. Actualizar card en el DOM
  const card = document.getElementById(cardId);
  card.querySelector('.weather-temp').innerText = `${Math.round(temperature_2m)}°C`;
  card.querySelector('.weather-icon').className = `fa-solid ${wmoToIcon(weathercode)}`;
}

function wmoToIcon(code) {
  if (code === 0) return 'fa-sun';
  if (code <= 3)  return 'fa-cloud-sun';
  if (code <= 48) return 'fa-smog';
  if (code <= 67) return 'fa-cloud-rain';
  if (code <= 77) return 'fa-snowflake';
  if (code <= 82) return 'fa-cloud-showers-heavy';
  return 'fa-bolt';
}
```

### Consideraciones
- Las tarjetas deben mostrar un estado de carga (skeleton o "..." ) mientras llega la respuesta
- Si el geocoding no encuentra la ciudad (nombre mal escrito, ciudad muy pequeña) la tarjeta debe mantener el valor anterior o mostrar "—"
- Las coordenadas pueden cachearse en `localStorage` para no repetir el geocoding en cada carga

---

## Pendiente / Roadmap

**Visual (en curso)**
- [ ] Definir qué hace el botón ❤️ del centro del dock
- [ ] Pantalla de registro (actualmente solo existe login)
- [ ] Skeletons / estados de carga para cuando lleguen datos reales

**Backend (próxima fase)**
- [ ] Conectar Supabase Auth en `login.html` y `reset-password.html`
- [ ] Crear tabla `profiles` y poblar datos en `loveos.html` reemplazando localStorage
- [ ] Implementar Ollama + Qwen 2.5 para LoveIA
- [ ] Mensajería en tiempo real con Supabase Realtime + Storage para audios
- [ ] **Clima real** — integrar Open-Meteo (geocoding + forecast, sin API key) — ver sección dedicada arriba
- [ ] Zumbidos reales vía Supabase Realtime o push notifications
- [ ] Internacionalización completa según `appSettings.lang`