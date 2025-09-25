const Joi = require('joi');
const logger = require('./logger');

/**
 * Sistema de validación robusta para el bot Dr. Salitas
 * Incluye validación de entrada, sanitización y prevención de ataques
 */
class ValidationSystem {
    constructor() {
        // Esquemas de validación para diferentes tipos de datos
        this.schemas = {
            // Validación para mensajes de usuario
            userMessage: Joi.object({
                content: Joi.string()
                    .min(1)
                    .max(2000)
                    .pattern(/^[^<>{}[\]\\]*$/) // Prevenir caracteres peligrosos
                    .required(),
                userId: Joi.string()
                    .pattern(/^\d{17,19}$/) // Discord user ID format
                    .required(),
                guildId: Joi.string()
                    .pattern(/^\d{17,19}$/)
                    .allow(null),
                channelId: Joi.string()
                    .pattern(/^\d{17,19}$/)
                    .required()
            }),

            // Validación para comandos slash
            slashCommand: Joi.object({
                commandName: Joi.string()
                    .alphanum()
                    .min(1)
                    .max(32)
                    .required(),
                userId: Joi.string()
                    .pattern(/^\d{17,19}$/)
                    .required(),
                guildId: Joi.string()
                    .pattern(/^\d{17,19}$/)
                    .allow(null),
                options: Joi.object().pattern(
                    Joi.string(),
                    Joi.alternatives().try(
                        Joi.string().max(1000),
                        Joi.number(),
                        Joi.boolean()
                    )
                ).default({})
            }),

            // Validación para configuración del bot
            botConfig: Joi.object({
                prefix: Joi.string()
                    .min(1)
                    .max(5)
                    .pattern(/^[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?/`~]*$/)
                    .default('!'),
                responseRate: Joi.number()
                    .min(0)
                    .max(1)
                    .default(0.3),
                maxResponseLength: Joi.number()
                    .min(1)
                    .max(2000)
                    .default(1000),
                enablePatterns: Joi.boolean().default(true),
                enableCache: Joi.boolean().default(true),
                logLevel: Joi.string()
                    .valid('error', 'warn', 'info', 'debug')
                    .default('info')
            }),

            // Validación para datos de base de datos
            databaseEntry: Joi.object({
                id: Joi.string().required(),
                userId: Joi.string().pattern(/^\d{17,19}$/),
                guildId: Joi.string().pattern(/^\d{17,19}$/).allow(null),
                data: Joi.object().required(),
                timestamp: Joi.date().default(Date.now)
            }),

            // Validación para respuestas de personalidad
            personalityResponse: Joi.object({
                response: Joi.string()
                    .min(1)
                    .max(2000)
                    .required(),
                mood: Joi.string()
                    .valid('happy', 'sad', 'angry', 'excited', 'calm', 'chaotic')
                    .default('calm'),
                intensity: Joi.number()
                    .min(0)
                    .max(10)
                    .default(5)
            })
        };

        // Lista de palabras/patrones peligrosos
        this.dangerousPatterns = [
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /<script/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /on\w+\s*=/i, // event handlers
            /eval\s*\(/i,
            /function\s*\(/i,
            /\$\{.*\}/g, // template literals
            /`.*`/g // backticks
        ];

        // Límites de rate limiting
        this.rateLimits = new Map();
        this.maxRequestsPerMinute = 30;
        this.maxRequestsPerHour = 500;
    }

    /**
     * Valida un mensaje de usuario
     */
    validateUserMessage(messageData) {
        try {
            const { error, value } = this.schemas.userMessage.validate(messageData);
            
            if (error) {
                logger.warn('Validación de mensaje fallida', error.details, {
                    userId: messageData.userId,
                    content: messageData.content?.substring(0, 50)
                });
                return { isValid: false, error: error.details[0].message, sanitized: null };
            }

            // Sanitizar el contenido
            const sanitized = this.sanitizeContent(value.content);
            
            // Verificar patrones peligrosos
            if (this.containsDangerousPatterns(sanitized)) {
                logger.warn('Contenido peligroso detectado', null, {
                    userId: messageData.userId,
                    content: sanitized.substring(0, 50)
                });
                return { isValid: false, error: 'Contenido no permitido', sanitized: null };
            }

            return { 
                isValid: true, 
                error: null, 
                sanitized: { ...value, content: sanitized }
            };

        } catch (error) {
            logger.error('Error en validación de mensaje', error, { messageData });
            return { isValid: false, error: 'Error de validación', sanitized: null };
        }
    }

    /**
     * Valida un comando slash
     */
    validateSlashCommand(commandData) {
        try {
            const { error, value } = this.schemas.slashCommand.validate(commandData);
            
            if (error) {
                logger.warn('Validación de comando fallida', error.details, {
                    userId: commandData.userId,
                    command: commandData.commandName
                });
                return { isValid: false, error: error.details[0].message, sanitized: null };
            }

            // Sanitizar opciones si existen
            if (value.options) {
                const sanitizedOptions = {};
                for (const [key, val] of Object.entries(value.options)) {
                    if (typeof val === 'string') {
                        sanitizedOptions[key] = this.sanitizeContent(val);
                    } else {
                        sanitizedOptions[key] = val;
                    }
                }
                value.options = sanitizedOptions;
            }

            return { isValid: true, error: null, sanitized: value };

        } catch (error) {
            logger.error('Error en validación de comando', error, { commandData });
            return { isValid: false, error: 'Error de validación', sanitized: null };
        }
    }

    /**
     * Valida configuración del bot
     */
    validateBotConfig(configData) {
        try {
            const { error, value } = this.schemas.botConfig.validate(configData);
            
            if (error) {
                logger.warn('Validación de configuración fallida', error.details);
                return { isValid: false, error: error.details[0].message, sanitized: null };
            }

            return { isValid: true, error: null, sanitized: value };

        } catch (error) {
            logger.error('Error en validación de configuración', error, { configData });
            return { isValid: false, error: 'Error de validación', sanitized: null };
        }
    }

    /**
     * Sanitiza contenido de texto
     */
    sanitizeContent(content) {
        if (typeof content !== 'string') return content;

        return content
            // Remover caracteres de control
            .replace(/[\x00-\x1F\x7F]/g, '')
            // Escapar caracteres HTML básicos
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            // Remover múltiples espacios
            .replace(/\s+/g, ' ')
            // Trim
            .trim();
    }

    /**
     * Verifica si el contenido contiene patrones peligrosos
     */
    containsDangerousPatterns(content) {
        return this.dangerousPatterns.some(pattern => pattern.test(content));
    }

    /**
     * Implementa rate limiting por usuario
     */
    checkRateLimit(userId) {
        const now = Date.now();
        const userLimits = this.rateLimits.get(userId) || {
            requests: [],
            lastCleanup: now
        };

        // Limpiar requests antiguos (más de 1 hora)
        if (now - userLimits.lastCleanup > 3600000) {
            userLimits.requests = userLimits.requests.filter(
                timestamp => now - timestamp < 3600000
            );
            userLimits.lastCleanup = now;
        }

        // Contar requests en la última hora y minuto
        const requestsLastHour = userLimits.requests.length;
        const requestsLastMinute = userLimits.requests.filter(
            timestamp => now - timestamp < 60000
        ).length;

        // Verificar límites
        if (requestsLastMinute >= this.maxRequestsPerMinute) {
            logger.warn('Rate limit excedido (por minuto)', null, { 
                userId, 
                requests: requestsLastMinute 
            });
            return { allowed: false, reason: 'Demasiadas solicitudes por minuto' };
        }

        if (requestsLastHour >= this.maxRequestsPerHour) {
            logger.warn('Rate limit excedido (por hora)', null, { 
                userId, 
                requests: requestsLastHour 
            });
            return { allowed: false, reason: 'Demasiadas solicitudes por hora' };
        }

        // Agregar request actual
        userLimits.requests.push(now);
        this.rateLimits.set(userId, userLimits);

        return { allowed: true, reason: null };
    }

    /**
     * Valida entrada genérica usando un esquema específico
     */
    validateWithSchema(data, schemaName) {
        if (!this.schemas[schemaName]) {
            logger.error('Esquema de validación no encontrado', null, { schemaName });
            return { isValid: false, error: 'Esquema no válido', sanitized: null };
        }

        try {
            const { error, value } = this.schemas[schemaName].validate(data);
            
            if (error) {
                logger.warn(`Validación fallida para esquema ${schemaName}`, error.details);
                return { isValid: false, error: error.details[0].message, sanitized: null };
            }

            return { isValid: true, error: null, sanitized: value };

        } catch (error) {
            logger.error(`Error en validación con esquema ${schemaName}`, error, { data });
            return { isValid: false, error: 'Error de validación', sanitized: null };
        }
    }

    /**
     * Limpia el rate limiting periódicamente
     */
    cleanupRateLimits() {
        const now = Date.now();
        for (const [userId, limits] of this.rateLimits.entries()) {
            // Remover usuarios sin actividad reciente
            if (now - limits.lastCleanup > 7200000) { // 2 horas
                this.rateLimits.delete(userId);
            }
        }
        
        logger.system('Rate limits limpiados', { 
            activeUsers: this.rateLimits.size 
        });
    }

    /**
     * Obtiene estadísticas del sistema de validación
     */
    getValidationStats() {
        return {
            activeRateLimits: this.rateLimits.size,
            availableSchemas: Object.keys(this.schemas),
            dangerousPatternsCount: this.dangerousPatterns.length,
            maxRequestsPerMinute: this.maxRequestsPerMinute,
            maxRequestsPerHour: this.maxRequestsPerHour
        };
    }
}

module.exports = ValidationSystem;