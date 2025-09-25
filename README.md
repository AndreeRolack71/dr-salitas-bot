<div align="center">

# 🤖 Dr. Salitas Bot

### *El perrito con terno más inteligente del universo Dr. Pene* 🐕‍🦺

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-blue.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Railway](https://img.shields.io/badge/Deploy-Railway-purple.svg)](https://railway.app)

*Un bot de Discord con IA avanzada, personalidad única y sistema de detección de patrones para crear experiencias conversacionales memorables.*

---

</div>

## 📋 Tabla de Contenidos

- [🌟 Características Principales](#-características-principales)
- [🎭 Personalidad](#-personalidad)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [⚙️ Instalación Detallada](#️-instalación-detallada)
- [🔧 Configuración](#-configuración)
- [📖 Comandos Disponibles](#-comandos-disponibles)
- [🧠 Sistema de IA](#-sistema-de-ia)
- [🌐 Despliegue](#-despliegue)
- [🛠️ Desarrollo](#️-desarrollo)
- [📊 Arquitectura](#-arquitectura)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

## 🌟 Características Principales

### 🧠 **Inteligencia Artificial Avanzada**
- **Sistema de Patrones**: Detecta comportamientos y responde contextualmente
- **Memoria Conversacional**: Recuerda interacciones previas con usuarios
- **Análisis de Sentimientos**: Adapta respuestas según el estado emocional
- **Anti-Spam Inteligente**: Previene respuestas repetitivas con cooldowns dinámicos

### 🎮 **Funcionalidades Interactivas**
- **Comandos Slash**: Interface moderna y fácil de usar
- **Batallas Épicas**: Sistema de combates entre personajes del universo
- **Respuestas Contextuales**: Más de 200+ respuestas únicas
- **Estados de Ánimo**: El bot cambia su personalidad según el contexto

### 🔒 **Seguridad y Rendimiento**
- **Rate Limiting**: Protección contra spam y abuso
- **Manejo de Errores**: Sistema robusto de recuperación
- **Logging Avanzado**: Monitoreo completo de actividades
- **Escalabilidad**: Optimizado para servidores grandes

## 🎭 Personalidad

> *"¡Wena po, soy el Dr. Salitas! Un perrito con terno que sabe más que tu profe de matemáticas."*

**Dr. Salitas** es un personaje único del universo **Dr. Pene** con características distintivas:

- 🐕 **Especie**: Perrito antropomórfico con terno elegante
- 🇨🇱 **Origen**: Habla como chileno auténtico con modismos locales
- 🎓 **Personalidad**: Intelectual, sarcástico, pero entrañable
- 💬 **Estilo**: Humor bizarro y frases memorables
- 🧠 **Habilidades**: Conocimiento enciclopédico con toques de locura

### Frases Características:
- *"¡Eso está más claro que agua de bidé!"*
- *"¡Wena po, cabros!"*
- *"¡Más perdido que turista en feria!"*

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ instalado
- Token de bot de Discord
- Cuenta en GitHub (para despliegue)

### Instalación Express (5 minutos)

```bash
# 1. Clonar el repositorio
git clone https://github.com/AndreeRolack71/dr-salitas-bot.git
cd dr-salitas-bot

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DISCORD_TOKEN

# 4. Ejecutar el bot
npm start
```

## ⚙️ Instalación Detallada

### 1. **Preparación del Entorno**

```bash
# Verificar versión de Node.js
node --version  # Debe ser 18+

# Clonar repositorio
git clone https://github.com/AndreeRolack71/dr-salitas-bot.git
cd dr-salitas-bot
```

### 2. **Instalación de Dependencias**

```bash
# Instalar paquetes principales
npm install

# Verificar instalación
npm list --depth=0
```

### 3. **Configuración del Bot de Discord**

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a la sección "Bot"
4. Copia el token del bot
5. Invita el bot a tu servidor con permisos necesarios

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# 🔑 CONFIGURACIÓN PRINCIPAL
DISCORD_TOKEN=tu_token_de_discord_aqui
NODE_ENV=production

# 🤖 CONFIGURACIÓN DE IA (Opcional)
OPENAI_API_KEY=tu_api_key_de_openai

# 📊 CONFIGURACIÓN DE LOGGING
LOG_LEVEL=info
LOG_TO_FILE=true

# ⚡ CONFIGURACIÓN DE RENDIMIENTO
MAX_MEMORY_USERS=1000
CLEANUP_INTERVAL=3600000
RESPONSE_TIMEOUT=5000
```

### Configuración Avanzada

#### `config/bot-config.js`
```javascript
module.exports = {
    // Cooldowns en milisegundos
    cooldowns: {
        general: 30000,      // 30 segundos
        triggered: 5000,     // 5 segundos para usuarios "triggeados"
        mention: 0           // Sin cooldown para menciones directas
    },
    
    // Probabilidades de respuesta
    probabilities: {
        chain: 0.3,          // 30% para cadenas de mensajes
        highIntensity: 0.7,  // 70% para alta intensidad
        random: 0.1          // 10% respuestas aleatorias
    }
};
```

## 📖 Comandos Disponibles

### Comandos Slash

| Comando | Descripción | Uso | Ejemplo |
|---------|-------------|-----|---------|
| `/saludo` | Saluda de manera personalizada | `/saludo [usuario]` | `/saludo @usuario` |
| `/batalla` | Inicia una batalla épica | `/batalla [oponente]` | `/batalla Dr. Pene` |
| `/estado` | Muestra el estado del bot | `/estado` | - |
| `/ayuda` | Información de comandos | `/ayuda` | - |
| `/personalidad` | Cambia el modo del bot | `/personalidad [modo]` | `/personalidad serio` |

### Comandos de Texto

| Trigger | Respuesta | Ejemplo |
|---------|-----------|---------|
| `moco` | Respuesta especial instantánea | "Hay moco en el chat" |
| `@Dr. Salitas` | Respuesta directa sin cooldown | "@Dr. Salitas ¿cómo estás?" |
| Patrones de cadena | Respuestas contextuales | Mensajes consecutivos similares |

## 🧠 Sistema de IA

### Arquitectura de Patrones

```
📁 patterns/
├── pattern-detection.js    # Motor de detección
├── pattern-responses.js    # Base de respuestas
└── contextual-memory.js    # Sistema de memoria
```

#### Detección de Patrones
- **Usuarios Triggeados**: Detecta comportamientos repetitivos
- **Cadenas de Mensajes**: Identifica conversaciones en cadena
- **Análisis de Intensidad**: Mide la "intensidad" de las conversaciones
- **Memoria Contextual**: Recuerda interacciones previas

#### Sistema de Respuestas
- **200+ Respuestas Únicas**: Variedad garantizada
- **Respuestas Contextuales**: Basadas en el historial
- **Anti-Repetición**: Evita respuestas duplicadas
- **Escalado de Intensidad**: Respuestas más frecuentes en conversaciones activas

## 🌐 Despliegue

### ✅ Render (Recomendado - Gratuito)

**Dr. Salitas está actualmente desplegado y funcionando 24/7 en Render.**

#### Configuración Exitosa:
1. **Tipo de Servicio**: Background Worker (correcto para bots de Discord)
2. **Auto-Deploy**: Habilitado desde GitHub
3. **Variables de Entorno**: Configuradas correctamente
4. **Estado**: ✅ **FUNCIONANDO**

#### Pasos para replicar:
```bash
# 1. Crear Background Worker en Render
# 2. Conectar repositorio GitHub
# 3. Configurar variables de entorno:
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id
NODE_ENV=production

# 4. Configuración del servicio:
Build Command: npm install
Start Command: node index.js
```

#### Ventajas de Render:
- ✅ **Completamente gratuito**
- ✅ **750 horas/mes** (suficiente para 24/7)
- ✅ **Auto-deploy** desde GitHub
- ✅ **SSL incluido**
- ✅ **Logs en tiempo real**
- ⚠️ Se "duerme" tras 15 min de inactividad (se despierta automáticamente)

### Alternativas de Despliegue

<details>
<summary><strong>Railway</strong></summary>

⚠️ **Nota**: Railway ahora requiere pago mínimo de $5 USD/mes.

1. **Conectar Repositorio**
   ```bash
   # El repositorio ya está listo para Railway
   # Solo necesitas conectarlo en railway.app
   ```

2. **Variables de Entorno en Railway**
   ```
   DISCORD_TOKEN=tu_token
   NODE_ENV=production
   ```

3. **Despliegue Automático**
   - Railway detecta el `Procfile` automáticamente
   - Despliegue en menos de 2 minutos
   - SSL y dominio incluidos

</details>

### 🌐 Otras Plataformas

<details>
<summary><strong>Render</strong></summary>

```yaml
# render.yaml
services:
  - type: web
    name: dr-salitas-bot
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DISCORD_TOKEN
        sync: false
```
</details>

<details>
<summary><strong>Heroku</strong></summary>

```bash
# Heroku CLI
heroku create dr-salitas-bot
heroku config:set DISCORD_TOKEN=tu_token
git push heroku main
```
</details>

<details>
<summary><strong>Fly.io</strong></summary>

```toml
# fly.toml
app = "dr-salitas-bot"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
```
</details>

## 🛠️ Desarrollo

### Estructura del Proyecto

```
dr-salitas-bot/
├── 📁 data/                    # Datos del bot
│   ├── character-lore.js       # Historia del personaje
│   └── personality.json        # Configuración de personalidad
├── 📁 memory/                  # Sistema de memoria
│   └── contextual-memory.js    # Memoria conversacional
├── 📁 mood/                    # Sistema de estados de ánimo
│   └── mood-system.js          # Lógica de emociones
├── 📁 patterns/                # Sistema de patrones de IA
│   ├── pattern-detection.js    # Detección de patrones
│   └── pattern-responses.js    # Respuestas contextuales
├── 📁 personality/             # Personalidad del bot
│   └── drpene-personality.js   # Personalidad Dr. Pene
├── 📁 scripts/                 # Herramientas de desarrollo
│   └── chat-analyzer.js        # Analizador de conversaciones
├── 📄 index.js                 # Archivo principal
├── 📄 package.json             # Dependencias
├── 📄 Procfile                 # Configuración de despliegue
└── 📄 README.md               # Este archivo
```

### Scripts de Desarrollo

```bash
# Desarrollo con auto-reload
npm run dev

# Análisis de patrones
npm run analyze

# Linting y formato
npm run lint
npm run format

# Tests
npm test
```

### Contribuir al Desarrollo

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

## 📊 Arquitectura

### Flujo de Procesamiento de Mensajes

```mermaid
graph TD
    A[Mensaje Recibido] --> B{¿Es mención directa?}
    B -->|Sí| C[Respuesta Inmediata]
    B -->|No| D{¿Contiene 'moco'?}
    D -->|Sí| C
    D -->|No| E[Análisis de Patrones]
    E --> F{¿Cooldown activo?}
    F -->|Sí| G[No Responder]
    F -->|No| H[Evaluar Probabilidades]
    H --> I{¿Debe responder?}
    I -->|Sí| J[Seleccionar Respuesta]
    I -->|No| G
    J --> K[Enviar Respuesta]
    K --> L[Actualizar Memoria]
```

### Componentes Principales

- **🎯 Event Handler**: Procesa eventos de Discord
- **🧠 Pattern Engine**: Analiza y detecta patrones
- **💾 Memory System**: Gestiona memoria conversacional

## 📊 Estado del Bot

### 🟢 Estado Actual: ACTIVO
- **Plataforma**: Render (Background Worker)
- **Uptime**: 24/7 (con hibernación automática)
- **Última actualización**: Enero 2025
- **Versión**: 1.0.0

### ✅ Funcionalidades Verificadas
- ✅ Comandos slash (`/ping`, `/frase`, `/chiste`)
- ✅ Respuestas automáticas a menciones
- ✅ Sistema de estados de ánimo
- ✅ Detección de patrones
- ✅ Memoria contextual
- ✅ Auto-deploy desde GitHub

### 🔧 Correcciones Recientes
- **Enero 2025**: Corregidos errores críticos en `drpene-personality.js`
  - Validación de propiedades undefined
  - Manejo robusto del sistema de estados de ánimo
  - Validación de entrada en métodos críticos
  - Fallbacks para respuestas por defecto

---

<div align="center">
  <strong>🎉 Dr. Salitas está listo para hacer reír a tu servidor de Discord 🎉</strong>
</div>

## 🤝 Contribuir

### Reportar Bugs

Usa el [sistema de issues](https://github.com/AndreeRolack71/dr-salitas-bot/issues) con:
- Descripción detallada del problema
- Pasos para reproducir
- Logs relevantes
- Información del entorno

### Sugerir Mejoras

- Abre un issue con la etiqueta `enhancement`
- Describe la funcionalidad propuesta
- Explica el caso de uso
- Proporciona ejemplos si es posible

### Código de Conducta

Este proyecto sigue el [Contributor Covenant](https://www.contributor-covenant.org/). Se espera que todos los participantes respeten estas pautas.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

### 🌟 ¡Dale una estrella si te gusta el proyecto! ⭐

**Hecho con ❤️ por [AndreeRolack71](https://github.com/AndreeRolack71)**

*Dr. Salitas Bot - Donde la IA se encuentra con el humor chileno* 🇨🇱🤖

</div>