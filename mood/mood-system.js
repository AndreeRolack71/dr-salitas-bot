// Sistema de Estados de Ánimo del Dr. Salitas
class MoodSystem {
    constructor() {
        this.currentMood = null;
        this.lastMoodUpdate = null;
        this.moodOverride = null; // Para eventos especiales
    }

    // Obtener el estado de ánimo actual basado en la hora
    getCurrentMood() {
        // Obtener hora actual en zona horaria de Chile
        const now = new Date();
        const chileTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santiago"}));
        const hour = chileTime.getHours();
        
        // Si hay un override activo, usarlo
        if (this.moodOverride) {
            return this.moodOverride;
        }
        
        // Determinar mood basado en la hora (horario chileno)
        if (hour >= 6 && hour < 12) {
            return 'matutino_grumpy';
        } else if (hour >= 12 && hour < 19) {
            return 'tarde_cosmica';
        } else {
            return 'noche_bizarra';
        }
    }

    // Obtener información detallada del mood actual
    getMoodInfo() {
        const mood = this.getCurrentMood();
        const moodData = this.getMoodData();
        return moodData[mood];
    }

    // Base de datos de estados de ánimo
    getMoodData() {
        return {
            matutino_grumpy: {
                name: "Matutino Grumpy",
                emoji: "😤",
                description: "Dr. Salitas está gruñón en las mañanas, como cualquier perro que no ha tomado su café cósmico",
                timeRange: "6:00 - 12:00",
                characteristics: [
                    "Respuestas más sarcásticas",
                    "Referencias a café y despertar",
                    "Humor más ácido",
                    "Quejas sobre madrugar"
                ],
                battleModifier: "agresivo",
                greetings: [
                    "😤 ¿Qué quieren tan temprano, culiaos?",
                    "🌅 Ni el sol debería estar despierto a esta hora...",
                    "☕ Necesito café cósmico para funcionar, weon",
                    "😴 ¿No pueden esperar a que termine mi siesta matutina?",
                    "🐕 Un perro con terno también necesita sus 8 horas, ctm"
                ],
                responses: [
                    "Estoy más gruñón que perro sin desayuno",
                    "Las mañanas son para los masoquistas cósmicos",
                    "Mi elegancia matutina está en modo hibernación",
                    "Hasta mi terno está arrugado de tanto dormir"
                ]
            },
            tarde_cosmica: {
                name: "Tarde Cósmica",
                emoji: "🌟",
                description: "En las tardes, Dr. Salitas alcanza su máximo poder cósmico y elegancia bizarra",
                timeRange: "12:00 - 19:00",
                characteristics: [
                    "Máxima creatividad",
                    "Respuestas más elaboradas",
                    "Humor cósmico en su peak",
                    "Elegancia suprema"
                ],
                battleModifier: "equilibrado",
                greetings: [
                    "🌟 ¡Ah, las tardes! Cuando mi poder cósmico está en su peak",
                    "✨ La elegancia bizarra fluye por mis venas como nunca",
                    "🎭 Es la hora perfecta para crear caos organizado",
                    "🌅 El sol de la tarde ilumina mi terno con majestuosidad",
                    "💫 Mi humor cósmico está calibrado para la perfección"
                ],
                responses: [
                    "Las tardes son cuando el universo Dr. Pene cobra vida",
                    "Mi elegancia alcanza niveles interdimensionales",
                    "El cosmos susurra secretos bizarros en mis orejas",
                    "Soy la personificación de la tarde perfecta, culiaos"
                ]
            },
            noche_bizarra: {
                name: "Noche Bizarra",
                emoji: "🌙",
                description: "Por las noches, Dr. Salitas se vuelve más misterioso, filosófico y bizarramente profundo",
                timeRange: "19:00 - 6:00",
                characteristics: [
                    "Humor más oscuro",
                    "Reflexiones filosóficas bizarras",
                    "Misterio y profundidad",
                    "Referencias nocturnas"
                ],
                battleModifier: "misterioso",
                greetings: [
                    "🌙 Las sombras nocturnas revelan verdades bizarras...",
                    "🦇 En la oscuridad, mi elegancia se vuelve más intensa",
                    "✨ La noche es cuando los secretos cósmicos emergen",
                    "🌃 Las estrellas susurran memes interdimensionales",
                    "🔮 Mi sabiduría nocturna trasciende lo ordinario"
                ],
                responses: [
                    "La noche revela la verdadera naturaleza del cosmos",
                    "En la oscuridad, hasta mi terno brilla con misterio",
                    "Los secretos más bizarros emergen cuando el sol se oculta",
                    "Soy un filósofo canino de las profundidades nocturnas"
                ]
            }
        };
    }

    // Obtener saludo según el mood actual
    getMoodGreeting() {
        const moodInfo = this.getMoodInfo();
        const greetings = moodInfo.greetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Obtener respuesta según el mood actual
    getMoodResponse() {
        const moodInfo = this.getMoodInfo();
        const responses = moodInfo.responses;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Obtener modificador de batalla según el mood
    getBattleModifier() {
        const moodInfo = this.getMoodInfo();
        return moodInfo.battleModifier;
    }

    // Forzar un mood específico (para eventos especiales)
    setMoodOverride(mood, duration = 3600000) { // 1 hora por defecto
        this.moodOverride = mood;
        
        // Remover override después del tiempo especificado
        setTimeout(() => {
            this.moodOverride = null;
        }, duration);
    }

    // Obtener estado completo del sistema
    getSystemStatus() {
        const currentMood = this.getCurrentMood();
        const moodInfo = this.getMoodInfo();
        // Usar la misma lógica de zona horaria que getCurrentMood
        const now = new Date();
        const chileTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santiago"}));
        
        return {
            currentTime: chileTime.toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
            currentMood: currentMood,
            moodName: moodInfo.name,
            moodEmoji: moodInfo.emoji,
            description: moodInfo.description,
            timeRange: moodInfo.timeRange,
            isOverride: !!this.moodOverride,
            characteristics: moodInfo.characteristics
        };
    }

    // Generar reporte de mood para comando
    generateMoodReport() {
        const status = this.getSystemStatus();
        
        return `${status.moodEmoji} **ESTADO DE ÁNIMO ACTUAL** ${status.moodEmoji}

🕐 **Hora:** ${status.currentTime}
🎭 **Mood:** ${status.moodName}
⏰ **Rango:** ${status.timeRange}
${status.isOverride ? '⚠️ **Modo Especial Activo**' : ''}

📝 **Descripción:**
${status.description}

✨ **Características Actuales:**
${status.characteristics.map(char => `• ${char}`).join('\n')}

${this.getMoodGreeting()}`;
    }
}

module.exports = MoodSystem;