class PatternDetection {
    constructor() {
        this.messageHistory = new Map(); // userId -> array de mensajes recientes
        this.triggerPatterns = this.getTriggerPatterns();
        this.chainPatterns = this.getChainPatterns();
        this.userStates = new Map(); // userId -> estado emocional
        this.maxHistoryLength = 10; // Máximo de mensajes por usuario
        this.triggerThreshold = 3; // Mensajes consecutivos para considerar "triggered"
        this.lastResponses = new Map(); // userId -> última respuesta enviada
        this.responseCooldowns = new Map(); // userId -> timestamp del último response
    }

    // Patrones que indican que un usuario está "triggeado"
    getTriggerPatterns() {
        return {
            anger: [
                /\b(puta|mierda|ctm|conchetumare|weon|culiao|bastardo)\b/gi,
                /\b(odio|detesto|me carga|que rabia|me molesta)\b/gi,
                /\b(no puede ser|es increible|no lo puedo creer)\b/gi,
                /[!]{2,}|[?]{2,}/g, // Múltiples signos de exclamación/interrogación
                /[A-Z]{4,}/g // Texto en mayúsculas (gritando)
            ],
            frustration: [
                /\b(no entiendo|que wea|como|por que|wtf|que chucha)\b/gi,
                /\b(ya no|basta|suficiente|para|stop)\b/gi,
                /\b(me rindo|no puedo|imposible|dificil)\b/gi
            ],
            excitement: [
                /\b(genial|bacán|wena|increible|amazing|wow|brutal)\b/gi,
                /\b(me encanta|amo|adoro|perfecto|excelente)\b/gi,
                /[!]{1,}/g, // Signos de exclamación
                /\b(jajaja|jeje|lol|xd|😂|🤣|😄|😆)\b/gi
            ],
            confusion: [
                /\b(que|como|cuando|donde|por que|wtf|huh)\b/gi,
                /\b(no cacho|no entiendo|confundido|perdido)\b/gi,
                /[?]{1,}/g // Signos de interrogación
            ]
        };
    }

    // Patrones para detectar cadenas de mensajes relacionados
    getChainPatterns() {
        return {
            // Temas del universo Dr. Pene
            drPeneUniverse: [
                /\b(dr\.?\s*pene|ivan|pene|glande|bisturi|calculadora)\b/gi,
                /\b(choro\s*pc|dani|pegamento|semen|piso\s*flotante)\b/gi,
                /\b(emanuel|infinito|memes|whatsapp)\b/gi,
                /\b(toromasu|ninja|placer|tentaculos)\b/gi,
                /\b(dr\.?\s*salitas|perrito|terno|moco)\b/gi,
                /\b(dr\.?\s*piña|pina|espinas|frutal)\b/gi
            ],
            // Temas técnicos/gaming
            tech: [
                /\b(pc|computadora|gaming|setup|hardware|software)\b/gi,
                /\b(ram|cpu|gpu|ssd|monitor|teclado|mouse)\b/gi,
                /\b(juego|game|fps|lag|ping|server)\b/gi
            ],
            // Temas de trabajo/estudio
            work: [
                /\b(trabajo|oficina|jefe|reunion|proyecto|deadline)\b/gi,
                /\b(estudio|universidad|examen|tarea|profesor)\b/gi,
                /\b(codigo|programacion|bug|debug|commit)\b/gi
            ],
            // Temas cotidianos
            daily: [
                /\b(comida|almuerzo|cena|hambre|cocinar)\b/gi,
                /\b(clima|lluvia|sol|frio|calor)\b/gi,
                /\b(familia|amigos|pareja|casa|dormir)\b/gi
            ]
        };
    }

    // Analizar un mensaje y actualizar el historial del usuario
    analyzeMessage(userId, username, message, timestamp = Date.now()) {
        // Inicializar historial del usuario si no existe
        if (!this.messageHistory.has(userId)) {
            this.messageHistory.set(userId, []);
            this.userStates.set(userId, { 
                currentEmotion: 'neutral', 
                intensity: 0, 
                consecutiveMessages: 0,
                lastMessageTime: 0,
                topics: new Set()
            });
        }

        const userHistory = this.messageHistory.get(userId);
        const userState = this.userStates.get(userId);

        // Agregar mensaje al historial
        const messageData = {
            content: message,
            timestamp: timestamp,
            username: username,
            emotion: this.detectEmotion(message),
            topics: this.detectTopics(message),
            intensity: this.calculateIntensity(message)
        };

        userHistory.push(messageData);

        // Mantener solo los últimos N mensajes
        if (userHistory.length > this.maxHistoryLength) {
            userHistory.shift();
        }

        // Actualizar estado del usuario
        this.updateUserState(userId, messageData);

        return {
            messageData: messageData,
            userState: this.userStates.get(userId),
            isTriggered: this.isUserTriggered(userId),
            chainDetected: this.detectMessageChain(userId),
            recommendedResponse: this.getRecommendedResponse(userId)
        };
    }

    // Detectar la emoción predominante en un mensaje
    detectEmotion(message) {
        const emotions = {};
        
        for (const [emotion, patterns] of Object.entries(this.triggerPatterns)) {
            emotions[emotion] = 0;
            
            for (const pattern of patterns) {
                const matches = message.match(pattern);
                if (matches) {
                    emotions[emotion] += matches.length;
                }
            }
        }

        // Encontrar la emoción con mayor puntuación
        const dominantEmotion = Object.keys(emotions).reduce((a, b) => 
            emotions[a] > emotions[b] ? a : b
        );

        return emotions[dominantEmotion] > 0 ? dominantEmotion : 'neutral';
    }

    // Detectar temas/tópicos en el mensaje
    detectTopics(message) {
        const detectedTopics = new Set();

        for (const [topic, patterns] of Object.entries(this.chainPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(message)) {
                    detectedTopics.add(topic);
                    break; // Solo necesitamos saber que el tópico está presente
                }
            }
        }

        return Array.from(detectedTopics);
    }

    // Calcular la intensidad emocional del mensaje
    calculateIntensity(message) {
        let intensity = 0;

        // Factores que aumentan la intensidad
        const capsWords = message.match(/[A-Z]{3,}/g);
        if (capsWords) intensity += capsWords.length * 2;

        const exclamations = message.match(/[!]/g);
        if (exclamations) intensity += exclamations.length;

        const questions = message.match(/[?]/g);
        if (questions) intensity += questions.length;

        const strongWords = message.match(/\b(muy|super|ultra|mega|extremo|total)\b/gi);
        if (strongWords) intensity += strongWords.length * 1.5;

        const swearWords = message.match(/\b(puta|mierda|ctm|conchetumare|weon|culiao)\b/gi);
        if (swearWords) intensity += swearWords.length * 2;

        // Normalizar intensidad (0-10)
        return Math.min(Math.round(intensity), 10);
    }

    // Actualizar el estado emocional del usuario
    updateUserState(userId, messageData) {
        const userState = this.userStates.get(userId);
        const timeDiff = messageData.timestamp - userState.lastMessageTime;

        // Si han pasado más de 10 minutos, resetear contador de mensajes consecutivos
        if (timeDiff > 600000) { // 10 minutos
            userState.consecutiveMessages = 1;
        } else {
            userState.consecutiveMessages++;
        }

        // Actualizar emoción y intensidad
        userState.currentEmotion = messageData.emotion;
        userState.intensity = Math.max(userState.intensity, messageData.intensity);
        userState.lastMessageTime = messageData.timestamp;

        // Agregar tópicos detectados
        messageData.topics.forEach(topic => userState.topics.add(topic));

        // Decaer la intensidad gradualmente
        if (timeDiff > 60000) { // 1 minuto
            userState.intensity = Math.max(0, userState.intensity - 1);
        }
    }

    // Determinar si un usuario está "triggeado"
    isUserTriggered(userId) {
        const userState = this.userStates.get(userId);
        if (!userState) return false;

        const userHistory = this.messageHistory.get(userId);
        if (!userHistory || userHistory.length < this.triggerThreshold) return false;

        // Verificar cooldown - no triggear si respondimos hace menos de 2 minutos
        const lastResponse = this.responseCooldowns.get(userId);
        if (lastResponse && Date.now() - lastResponse < 120000) { // 2 minutos
            return false;
        }

        // Verificar mensajes recientes
        const recentMessages = userHistory.slice(-this.triggerThreshold);
        
        // Criterios para estar "triggeado":
        // 1. Múltiples mensajes consecutivos con alta intensidad
        const highIntensityMessages = recentMessages.filter(msg => msg.intensity >= 3).length;
        
        // 2. Emociones negativas predominantes
        const negativeEmotions = recentMessages.filter(msg => 
            ['anger', 'frustration'].includes(msg.emotion)
        ).length;

        // 3. Mensajes muy seguidos (menos de 30 segundos entre ellos)
        const rapidMessages = this.checkRapidMessaging(recentMessages);

        // 4. Palabras agresivas o insultos repetidos
        const aggressiveWords = recentMessages.filter(msg => 
            msg.message.toLowerCase().includes('culiao') || 
            msg.message.toLowerCase().includes('ctm') ||
            msg.message.toLowerCase().includes('conchetumare') ||
            msg.message.toLowerCase().includes('hijo') ||
            msg.message.toLowerCase().includes('matar')
        ).length;

        return (
            userState.consecutiveMessages >= this.triggerThreshold &&
            (highIntensityMessages >= 2 || negativeEmotions >= 2 || rapidMessages || aggressiveWords >= 2)
        );
    }

    // Verificar si hay mensajes muy seguidos
    checkRapidMessaging(messages) {
        if (messages.length < 2) return false;

        for (let i = 1; i < messages.length; i++) {
            const timeDiff = messages[i].timestamp - messages[i-1].timestamp;
            if (timeDiff < 30000) { // Menos de 30 segundos
                return true;
            }
        }
        return false;
    }

    // Detectar cadenas de mensajes relacionados
    detectMessageChain(userId) {
        const userHistory = this.messageHistory.get(userId);
        if (!userHistory || userHistory.length < 2) return null;

        const recentMessages = userHistory.slice(-5); // Últimos 5 mensajes
        const topicCounts = {};

        // Contar tópicos en mensajes recientes
        recentMessages.forEach(msg => {
            msg.topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        // Encontrar tópico dominante
        const dominantTopic = Object.keys(topicCounts).reduce((a, b) => 
            topicCounts[a] > topicCounts[b] ? a : b, null
        );

        if (dominantTopic && topicCounts[dominantTopic] >= 2) {
            return {
                topic: dominantTopic,
                messageCount: topicCounts[dominantTopic],
                intensity: recentMessages.reduce((sum, msg) => sum + msg.intensity, 0) / recentMessages.length
            };
        }

        return null;
    }

    // Obtener recomendación de respuesta basada en el análisis
    getRecommendedResponse(userId) {
        const userState = this.userStates.get(userId);
        const isTriggered = this.isUserTriggered(userId);
        const chain = this.detectMessageChain(userId);

        return {
            responseType: this.determineResponseType(userState, isTriggered, chain),
            intensity: this.calculateResponseIntensity(userState, isTriggered),
            topics: Array.from(userState.topics),
            shouldRespond: this.shouldBotRespond(userState, isTriggered, chain)
        };
    }

    // Determinar el tipo de respuesta apropiada
    determineResponseType(userState, isTriggered, chain) {
        if (isTriggered) {
            switch (userState.currentEmotion) {
                case 'anger': return 'provocative'; // Provocar más
                case 'frustration': return 'sarcastic'; // Sarcasmo
                case 'excitement': return 'enthusiastic'; // Seguir la energía
                default: return 'chaotic'; // Respuesta caótica
            }
        }

        if (chain) {
            return 'topical'; // Respuesta relacionada al tópico
        }

        return 'normal'; // Respuesta normal
    }

    // Calcular intensidad de respuesta recomendada
    calculateResponseIntensity(userState, isTriggered) {
        let intensity = userState.intensity;

        if (isTriggered) {
            intensity += 3; // Intensificar si está triggeado
        }

        return Math.min(intensity, 10);
    }

    // Determinar si el bot debería responder
    shouldBotRespond(userState, isTriggered, chain) {
        if (!userState) return false;

        // Verificar cooldown general - no responder si ya respondimos hace menos de 30 segundos
        const lastResponse = this.responseCooldowns.get(userState.userId);
        if (lastResponse && Date.now() - lastResponse < 30000) { // 30 segundos
            return false;
        }

        // Siempre responder si está triggeado (pero respetando el cooldown de trigger)
        if (isTriggered) {
            return true;
        }

        // Responder a cadenas de mensajes con probabilidad
        if (chain) {
            return Math.random() < 0.4; // 40% probabilidad para cadenas
        }

        // Responder a mensajes con alta intensidad
        if (userState.intensity >= 4) {
            return Math.random() < 0.3; // 30% probabilidad para alta intensidad
        }

        // Responder ocasionalmente a mensajes normales
        return Math.random() < 0.1; // 10% probabilidad base
    }

    // Marcar que se envió una respuesta (para cooldowns)
    markResponseSent(userId, responseText) {
        this.responseCooldowns.set(userId, Date.now());
        this.lastResponses.set(userId, responseText);
    }

    // Verificar si la respuesta es muy similar a la anterior
    isResponseTooSimilar(userId, newResponse) {
        const lastResponse = this.lastResponses.get(userId);
        if (!lastResponse) return false;

        // Verificar si es exactamente la misma respuesta
        if (lastResponse === newResponse) return true;

        // Verificar si contiene las mismas palabras clave
        const lastWords = lastResponse.toLowerCase().split(' ');
        const newWords = newResponse.toLowerCase().split(' ');
        const commonWords = lastWords.filter(word => newWords.includes(word) && word.length > 3);
        
        return commonWords.length > 2; // Si comparten más de 2 palabras significativas
    }

    // Obtener estadísticas del sistema
    getPatternStats() {
        const totalUsers = this.userStates.size;
        const triggeredUsers = Array.from(this.userStates.entries())
            .filter(([userId]) => this.isUserTriggered(userId)).length;

        const emotionCounts = {};
        const topicCounts = {};

        this.userStates.forEach(state => {
            emotionCounts[state.currentEmotion] = (emotionCounts[state.currentEmotion] || 0) + 1;
            state.topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        return {
            totalUsers,
            triggeredUsers,
            emotionDistribution: emotionCounts,
            popularTopics: topicCounts,
            averageIntensity: Array.from(this.userStates.values())
                .reduce((sum, state) => sum + state.intensity, 0) / totalUsers || 0
        };
    }

    // Limpiar datos antiguos (llamar periódicamente)
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas

        this.messageHistory.forEach((history, userId) => {
            // Filtrar mensajes antiguos
            const recentMessages = history.filter(msg => 
                now - msg.timestamp < maxAge
            );
            
            if (recentMessages.length === 0) {
                this.messageHistory.delete(userId);
                this.userStates.delete(userId);
            } else {
                this.messageHistory.set(userId, recentMessages);
            }
        });

        // Limpiar cooldowns antiguos (más de 1 hora)
        this.responseCooldowns.forEach((timestamp, userId) => {
            if (now - timestamp > 60 * 60 * 1000) { // 1 hora
                this.responseCooldowns.delete(userId);
                this.lastResponses.delete(userId);
            }
        });
    }
}

module.exports = PatternDetection;