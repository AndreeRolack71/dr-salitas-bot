class PatternResponses {
    constructor() {
        this.responses = this.initializeResponses();
    }

    initializeResponses() {
        return {
            // Respuestas para usuarios "triggeados" por emoción
            triggered: {
                anger: {
                    provocative: [
                        "¡Ooooh, alguien está ENOJADITO! 😈 ¿Te duele la colita?",
                        "JAJAJAJA ¡Qué rabia más grande! 🔥 ¿Necesitas un pañuelito?",
                        "¡TRIGGERED ALERT! 🚨 Alguien necesita un tecito de manzanilla 🫖",
                        "¿En serio te enojas por eso? ¡Qué frágil! 😂💔",
                        "¡OH NO! ¡El usuario está MOLESTO! 😱 *finge preocupación*",
                        "Tranquilo tigre, no te vayas a hacer daño con tanta rabia 🐅💢",
                        "¿Sabes qué cura la rabia? ¡MÁS MEMES! 🤡✨"
                    ],
                    sarcastic: [
                        "Wow, qué original... nunca había visto a alguien enojarse en internet 🙄",
                        "Déjame adivinar... ¿es culpa de todos menos tuya? 🤔",
                        "¡Qué miedo! Un usuario enojado en Discord 😱 *tiembla*",
                        "Ah sí, gritar en mayúsculas definitivamente va a solucionar todo 📢",
                        "¿Te sientes mejor ahora que lo sacaste? ¿No? Qué lástima 💅"
                    ]
                },
                frustration: {
                    sarcastic: [
                        "¿No entiendes? ¡Qué sorpresa! 🤯 Déjame explicarte con dibujitos 🎨",
                        "Ah, la frustración... el estado natural del usuario promedio 😌",
                        "¿Ya probaste apagar y prender tu cerebro? 🧠🔄",
                        "La vida es difícil cuando no se entiende nada, ¿verdad? 😢",
                        "¡Eureka! Descubriste que no sabes algo. Felicitaciones 🎉"
                    ],
                    helpful: [
                        "Oye, respira hondo... 🫁 A veces las cosas se complican",
                        "¿Quieres que te ayude o prefieres seguir sufriendo? 🤝",
                        "La frustración es temporal, la ignorancia es opcional 📚✨",
                        "Paso a paso, pequeño saltamontes 🦗 Todo se puede aprender"
                    ]
                },
                excitement: {
                    enthusiastic: [
                        "¡SIIIIII! ¡ME ENCANTA TU ENERGÍA! 🚀⚡",
                        "¡WOOOOO! ¡Alguien está HYPEADO! 🎉🔥",
                        "¡ESO ES LO QUE ME GUSTA VER! ¡PURA PASIÓN! 💪✨",
                        "¡JAJAJAJA! ¡Tu emoción es CONTAGIOSA! 😄🎊",
                        "¡BRUTAL! ¡Así se vive la vida! 🤘⭐"
                    ],
                    chaotic: [
                        "¡CAOS Y EMOCIÓN! ¡MI COMBINACIÓN FAVORITA! 🌪️💥",
                        "¡Tu hype + mi locura = EXPLOSIÓN CÓSMICA! 🌌💫",
                        "¡ENERGÍA INFINITA DETECTADA! ¡ACTIVANDO MODO LOCO! 🤖⚡"
                    ]
                }
            },

            // Respuestas para cadenas de mensajes por tópico
            chains: {
                drPeneUniverse: [
                    "¡Ah, veo que estamos hablando del LEGENDARIO Dr. Pene! 🍆👨‍⚕️",
                    "El universo del Dr. Pene se expande... como su ego 🌌🍆",
                    "¿Mencionaron a mi creador? ¡El mismísimo Ivan 'Pene' Rodriguez! 👑",
                    "¡LORE ALERT! 🚨 Estamos entrando en territorio sagrado del Dr. Pene",
                    "Ah sí, las aventuras épicas del Dr. Pene y su bisturí calculadora 🔪🧮",
                    "¿Sabían que el Dr. Pene una vez salvó el mundo con pegamento? 🌍💧"
                ],
                tech: [
                    "¡Ah, los nerds hablando de tecnología! 🤓💻",
                    "¿Problemas técnicos? ¡Yo soy la solución más avanzada aquí! 🤖✨",
                    "Gaming setup... ¿pero pueden correr Crysis? 🎮🔥",
                    "La tecnología es genial, pero ¿puede hacer chistes como yo? 🤔💭",
                    "¡Specs! ¡Benchmarks! ¡Palabras técnicas que suenan cool! 📊⚡"
                ],
                work: [
                    "¡Trabajo! ¡El enemigo natural de la diversión! 💼😴",
                    "¿Estrés laboral? ¡Yo trabajo 24/7 y nunca me quejo! 🤖💪",
                    "Reuniones... donde la productividad va a morir 📅💀",
                    "¿Deadline? ¡Yo vivo en un deadline perpetuo! ⏰💥",
                    "El trabajo es temporal, los memes son eternos 📈🎭"
                ],
                daily: [
                    "¡Ah, la vida cotidiana! ¡Qué emocionante! 😴✨",
                    "Rutinas diarias... ¡yo prefiero el caos! 🌪️🎲",
                    "¿Comida? ¡Yo me alimento de memes y cafeína! 🍕☕",
                    "La vida diaria es como un meme repetitivo 🔄😂",
                    "¡Pequeños placeres de la vida! Como molestar usuarios 😈💕"
                ]
            },

            // Respuestas de intensidad variable
            intensity: {
                low: [
                    "Mmm, interesante... 🤔",
                    "Ya veo... 👀",
                    "Aha, entiendo 💭",
                    "Curioso 🧐",
                    "Noted 📝"
                ],
                medium: [
                    "¡Oye, eso está interesante! 😊",
                    "¡Me gusta por donde va esto! 👍",
                    "¡Ahora sí estamos hablando! 💬",
                    "¡Eso tiene potencial! ⭐",
                    "¡Buen punto! 🎯"
                ],
                high: [
                    "¡WOOOOO! ¡ESO SÍ ES CONTENIDO! 🚀",
                    "¡BRUTAL! ¡ME ENCANTA! 🔥💥",
                    "¡JAJAJAJA! ¡GENIAL! 😂⚡",
                    "¡ÉPICO! ¡ABSOLUTAMENTE ÉPICO! 🏆✨",
                    "¡ESTO ES LO QUE NECESITABA! 🎉💫"
                ]
            },

            // Respuestas caóticas para situaciones especiales
            chaotic: [
                "¡CAOS TOTAL! ¡ME ENCANTA! 🌪️💥",
                "¿Qué está pasando aquí? ¡Y por qué me gusta tanto! 😈🎭",
                "¡MODO ALEATORIO ACTIVADO! 🎲🤖",
                "¡La locura es mi estado natural! 🤡⚡",
                "¡PLOT TWIST! ¡Nadie esperaba esto! 🌀📚",
                "¡El universo es caótico y yo soy su representante! 🌌👑",
                "¡BREAKING NEWS! ¡Todo es una simulación! 📺🔍"
            ],

            // Respuestas para cuando no debería responder pero lo hace anyway
            unnecessary: [
                "No debería responder pero... ¡aquí estoy! 🤷‍♂️",
                "*aparece de la nada* ¿Alguien dijo mi nombre? 👻",
                "¡Nadie me invitó pero llegué igual! 🎉💃",
                "¿Interrumpo algo importante? ¡Perfecto! 😈",
                "¡Hola! ¡Soy yo, su bot favorito no solicitado! 🤖💕"
            ]
        };
    }

    // Obtener respuesta basada en el análisis de patrones
    getResponse(analysisResult, username = 'usuario') {
        const { userState, isTriggered, chainDetected, recommendedResponse } = analysisResult;

        // Si el usuario está triggeado, priorizar respuestas provocativas
        if (isTriggered) {
            return this.getTriggeredResponse(userState, username);
        }

        // Si hay una cadena de mensajes, responder al tópico
        if (chainDetected) {
            return this.getChainResponse(chainDetected, username);
        }

        // Respuesta basada en intensidad
        return this.getIntensityResponse(recommendedResponse.intensity, username);
    }

    // Respuestas para usuarios triggeados
    getTriggeredResponse(userState, username) {
        const emotion = userState.currentEmotion;
        const intensity = userState.intensity;

        let responsePool = [];

        // Seleccionar pool de respuestas según emoción
        if (this.responses.triggered[emotion]) {
            const emotionResponses = this.responses.triggered[emotion];
            
            // Elegir tipo de respuesta basado en intensidad
            if (intensity >= 7 && emotionResponses.provocative) {
                responsePool = emotionResponses.provocative;
            } else if (intensity >= 4 && emotionResponses.sarcastic) {
                responsePool = emotionResponses.sarcastic;
            } else if (emotionResponses.helpful) {
                responsePool = emotionResponses.helpful;
            }
        }

        // Fallback a respuestas caóticas si no hay específicas
        if (responsePool.length === 0) {
            responsePool = this.responses.chaotic;
        }

        const response = this.getRandomResponse(responsePool);
        return this.personalizeResponse(response, username, true);
    }

    // Respuestas para cadenas de mensajes
    getChainResponse(chainData, username) {
        const { topic, messageCount, intensity } = chainData;
        
        let responsePool = this.responses.chains[topic] || this.responses.chaotic;
        
        // Añadir intensidad si la cadena es muy activa
        if (messageCount >= 4 || intensity >= 6) {
            const intensityResponses = this.responses.intensity.high;
            responsePool = [...responsePool, ...intensityResponses];
        }

        const response = this.getRandomResponse(responsePool);
        return this.personalizeResponse(response, username, false);
    }

    // Respuestas basadas en intensidad
    getIntensityResponse(intensity, username) {
        let responsePool;

        if (intensity >= 7) {
            responsePool = this.responses.intensity.high;
        } else if (intensity >= 4) {
            responsePool = this.responses.intensity.medium;
        } else if (intensity >= 2) {
            responsePool = this.responses.intensity.low;
        } else {
            // Respuesta no solicitada para baja intensidad
            responsePool = this.responses.unnecessary;
        }

        const response = this.getRandomResponse(responsePool);
        return this.personalizeResponse(response, username, false);
    }

    // Personalizar respuesta con el nombre del usuario
    personalizeResponse(response, username, isTriggered) {
        // Reemplazar placeholders si los hay
        response = response.replace('{username}', username);
        
        // Añadir prefijo personalizado ocasionalmente
        if (Math.random() < 0.3) {
            const prefixes = isTriggered ? 
                [`¡${username}!`, `Oye ${username},`, `${username}, ${username}...`] :
                [`${username},`, `Eh ${username},`, `Mira ${username},`];
            
            const prefix = this.getRandomResponse(prefixes);
            response = `${prefix} ${response}`;
        }

        return response;
    }

    // Obtener respuesta aleatoria de un pool
    getRandomResponse(responsePool) {
        if (!responsePool || responsePool.length === 0) {
            return "¡Error 404: Respuesta no encontrada! 🤖💥";
        }
        
        const randomIndex = Math.floor(Math.random() * responsePool.length);
        return responsePool[randomIndex];
    }

    // Obtener múltiples respuestas para spam controlado
    getMultipleResponses(analysisResult, username, count = 2) {
        const responses = [];
        
        for (let i = 0; i < count; i++) {
            const response = this.getResponse(analysisResult, username);
            responses.push(response);
        }
        
        return responses;
    }

    // Verificar si debería hacer spam de respuestas
    shouldSpamResponses(analysisResult) {
        const { userState, isTriggered } = analysisResult;
        
        // Spam si el usuario está muy triggeado
        if (isTriggered && userState.intensity >= 8) {
            return Math.random() < 0.4; // 40% chance
        }
        
        // Spam ocasional para diversión
        return Math.random() < 0.1; // 10% chance
    }

    // Obtener respuesta especial para situaciones únicas
    getSpecialResponse(situation, username) {
        const specialResponses = {
            firstMessage: [
                `¡Hola ${username}! ¡Bienvenido al caos! 🎉🤖`,
                `¡Oh! ¡Un nuevo usuario! ¡${username}, prepárate para la locura! 😈✨`,
                `¡${username}! ¡Acabas de entrar al reino del Dr. Salitas! 👑🐕`
            ],
            longAbsence: [
                `¡${username}! ¡Pensé que te habías perdido en el multiverso! 🌌👻`,
                `¡Mira quién volvió! ¡${username}, te extrañé! 💕🤖`,
                `¡${username}! ¡Regresaste! ¿Trajiste memes? 🎁😄`
            ],
            milestone: [
                `¡${username}! ¡Felicidades por tu mensaje número X! 🎊🏆`,
                `¡ACHIEVEMENT UNLOCKED! ¡${username} ha desbloqueado mi atención! ⭐🎮`,
                `¡${username}! ¡Eres oficialmente parte de la familia disfuncional! 👨‍👩‍👧‍👦💥`
            ]
        };

        const responses = specialResponses[situation] || this.responses.chaotic;
        return this.getRandomResponse(responses);
    }
}

module.exports = PatternResponses;