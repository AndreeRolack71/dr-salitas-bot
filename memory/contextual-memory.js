const fs = require('fs');
const path = require('path');

class ContextualMemory {
    constructor() {
        this.memoryFile = path.join(__dirname, 'user-memory.json');
        this.conversationHistory = new Map(); // Memoria temporal de la sesión
        this.userProfiles = new Map(); // Perfiles persistentes de usuarios
        this.maxHistoryPerUser = 50; // Máximo de mensajes por usuario en memoria
        this.maxConversationAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        this.loadMemoryFromFile();
        
        // Limpiar memoria antigua cada hora
        setInterval(() => this.cleanOldMemories(), 60 * 60 * 1000);
    }
    
    // Cargar memoria persistente desde archivo
    loadMemoryFromFile() {
        try {
            if (fs.existsSync(this.memoryFile)) {
                const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
                
                // Cargar perfiles de usuarios
                if (data.userProfiles) {
                    for (const [userId, profile] of Object.entries(data.userProfiles)) {
                        this.userProfiles.set(userId, {
                            ...profile,
                            lastSeen: new Date(profile.lastSeen),
                            firstSeen: new Date(profile.firstSeen),
                            favoriteTopics: new Map(Object.entries(profile.favoriteTopics || {})),
                            relationships: new Set(Array.isArray(profile.relationships) ? profile.relationships : Object.keys(profile.relationships || {})),
                            commonPhrases: new Map(Object.entries(profile.commonPhrases || {}))
                        });
                    }
                }
                
                console.log(`🧠 Memoria contextual cargada: ${this.userProfiles.size} usuarios conocidos`);
            }
        } catch (error) {
            console.error('Error cargando memoria:', error);
        }
    }
    
    // Guardar memoria persistente en archivo
    saveMemoryToFile() {
        try {
            const data = {
                userProfiles: Object.fromEntries(
                    Array.from(this.userProfiles.entries()).map(([userId, profile]) => [
                        userId,
                        {
                            ...profile,
                            lastSeen: profile.lastSeen.toISOString(),
                            firstSeen: profile.firstSeen.toISOString(),
                            favoriteTopics: Object.fromEntries(profile.favoriteTopics || new Map()),
                            relationships: Array.from(profile.relationships || new Set()),
                            commonPhrases: Object.fromEntries(profile.commonPhrases || new Map())
                        }
                    ])
                ),
                lastUpdated: new Date().toISOString()
            };
            
            // Crear directorio si no existe
            const dir = path.dirname(this.memoryFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(this.memoryFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error guardando memoria:', error);
        }
    }
    
    // Recordar un mensaje de usuario
    rememberMessage(userId, username, message, channelId) {
        const now = new Date();
        const messageData = {
            content: message.content,
            timestamp: now,
            channelId: channelId,
            username: username
        };
        
        // Actualizar historial de conversación temporal
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        
        const userHistory = this.conversationHistory.get(userId);
        userHistory.push(messageData);
        
        // Mantener solo los últimos N mensajes
        if (userHistory.length > this.maxHistoryPerUser) {
            userHistory.shift();
        }
        
        // Actualizar perfil persistente del usuario
        this.updateUserProfile(userId, username, message, now);
        
        // Guardar cambios cada 10 mensajes para no sobrecargar
        if (Math.random() < 0.1) {
            this.saveMemoryToFile();
        }
    }
    
    // Actualizar perfil de usuario
    updateUserProfile(userId, username, message, timestamp) {
        let profile = this.userProfiles.get(userId) || {
            username: username,
            firstSeen: timestamp,
            lastSeen: timestamp,
            messageCount: 0,
            favoriteTopics: new Map(),
            personality: {
                toxicity: 0,
                humor: 0,
                activity: 0
            },
            relationships: new Set(),
            commonPhrases: new Map()
        };
        
        // Actualizar datos básicos
        profile.username = username;
        profile.lastSeen = timestamp;
        profile.messageCount++;
        
        // Analizar contenido del mensaje
        this.analyzeMessageContent(profile, message.content);
        
        this.userProfiles.set(userId, profile);
    }
    
    // Analizar contenido del mensaje para extraer patrones
    analyzeMessageContent(profile, content) {
        const lowerContent = content.toLowerCase();
        
        // Detectar temas favoritos
        const topics = {
            'trabajo': ['trabajo', 'pega', 'oficina', 'jefe', 'banco', 'contador'],
            'ivan': ['ivan', 'dr.pene', 'dr pene'],
            'dani': ['dani', 'choropc', 'choro pc'],
            'moco': ['moco', 'verde', 'perro'],
            'anime': ['anime', 'manga', 'otaku', 'waifu'],
            'gaming': ['juego', 'game', 'gaming', 'pc', 'steam'],
            'chile': ['chile', 'chileno', 'wn', 'culiao', 'wea']
        };
        
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                const count = profile.favoriteTopics.get(topic) || 0;
                profile.favoriteTopics.set(topic, count + 1);
            }
        }
        
        // Detectar personalidad
        if (lowerContent.includes('culiao') || lowerContent.includes('wn')) {
            profile.personality.toxicity += 0.1;
        }
        
        if (lowerContent.includes('jaja') || lowerContent.includes('xd') || lowerContent.includes('😂')) {
            profile.personality.humor += 0.1;
        }
        
        profile.personality.activity += 0.05;
        
        // Normalizar valores de personalidad (0-1)
        Object.keys(profile.personality).forEach(key => {
            profile.personality[key] = Math.min(1, profile.personality[key]);
        });
        
        // Recordar frases comunes
        if (content.length > 10 && content.length < 100) {
            const phrase = content.toLowerCase().trim();
            const count = profile.commonPhrases.get(phrase) || 0;
            profile.commonPhrases.set(phrase, count + 1);
            
            // Mantener solo las 20 frases más comunes
            if (profile.commonPhrases.size > 20) {
                const sorted = Array.from(profile.commonPhrases.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 20);
                profile.commonPhrases = new Map(sorted);
            }
        }
    }
    
    // Obtener contexto de un usuario
    getUserContext(userId) {
        const profile = this.userProfiles.get(userId);
        const recentHistory = this.conversationHistory.get(userId) || [];
        
        return {
            profile: profile,
            recentMessages: recentHistory.slice(-10), // Últimos 10 mensajes
            isFrequentUser: profile && profile.messageCount > 20,
            favoriteTopics: profile ? Array.from(profile.favoriteTopics.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3) : [],
            personality: profile ? profile.personality : null
        };
    }
    
    // Generar respuesta contextual personalizada
    generateContextualResponse(userId, currentMessage) {
        const context = this.getUserContext(userId);
        
        if (!context.profile) {
            return null; // Usuario nuevo, sin contexto
        }
        
        const responses = [];
        
        // Respuestas para usuarios frecuentes
        if (context.isFrequentUser) {
            const daysSinceLastSeen = Math.floor((new Date() - context.profile.lastSeen) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastSeen > 7) {
                responses.push(`¡Oye ${context.profile.username}! ¿Dónde andabas culiao? Dr.Salitas te echaba de menos 🐕`);
            } else if (daysSinceLastSeen > 1) {
                responses.push(`¡${context.profile.username} ha vuelto! El perrito elegante se alegra de verte 🤵`);
            }
        }
        
        // Respuestas basadas en temas favoritos
        const topTopic = context.favoriteTopics[0];
        if (topTopic) {
            const [topic, count] = topTopic;
            
            switch (topic) {
                case 'trabajo':
                    if (currentMessage.toLowerCase().includes('trabajo') || currentMessage.toLowerCase().includes('pega')) {
                        responses.push(`Ah, el ${context.profile.username} otra vez hablando de la pega... Dr.Salitas entiende el sufrimiento laboral 💼`);
                    }
                    break;
                    
                case 'ivan':
                    if (currentMessage.toLowerCase().includes('ivan')) {
                        responses.push(`${context.profile.username} siempre mencionando a Ivan... ¿será amor secreto? 🍆💕`);
                    }
                    break;
                    
                case 'gaming':
                    if (currentMessage.toLowerCase().includes('juego') || currentMessage.toLowerCase().includes('game')) {
                        responses.push(`El gamer ${context.profile.username} otra vez con los videojuegos... Dr.Salitas aprueba 🎮`);
                    }
                    break;
            }
        }
        
        // Respuestas basadas en personalidad
        if (context.personality) {
            if (context.personality.toxicity > 0.7) {
                responses.push(`${context.profile.username} anda tóxico hoy... Dr.Salitas te entiende, a veces hay que desahogarse 😤`);
            }
            
            if (context.personality.humor > 0.8) {
                responses.push(`El comediante ${context.profile.username} siempre alegre... Dr.Salitas admira tu energía positiva 😄`);
            }
        }
        
        return responses.length > 0 ? responses[Math.floor(Math.random() * responses.length)] : null;
    }
    
    // Limpiar memorias antiguas
    cleanOldMemories() {
        const now = new Date();
        const cutoffTime = now.getTime() - this.maxConversationAge;
        
        // Limpiar historial de conversación temporal
        for (const [userId, history] of this.conversationHistory.entries()) {
            const filteredHistory = history.filter(msg => msg.timestamp.getTime() > cutoffTime);
            
            if (filteredHistory.length === 0) {
                this.conversationHistory.delete(userId);
            } else {
                this.conversationHistory.set(userId, filteredHistory);
            }
        }
        
        console.log(`🧹 Memoria limpiada: ${this.conversationHistory.size} usuarios activos en memoria`);
    }
    
    // Obtener estadísticas de memoria
    getMemoryStats() {
        return {
            totalUsers: this.userProfiles.size,
            activeUsers: this.conversationHistory.size,
            totalMessages: Array.from(this.userProfiles.values())
                .reduce((sum, profile) => sum + profile.messageCount, 0),
            topUsers: Array.from(this.userProfiles.entries())
                .sort((a, b) => b[1].messageCount - a[1].messageCount)
                .slice(0, 5)
                .map(([userId, profile]) => ({
                    username: profile.username,
                    messages: profile.messageCount,
                    lastSeen: profile.lastSeen
                }))
        };
    }
}

module.exports = ContextualMemory;