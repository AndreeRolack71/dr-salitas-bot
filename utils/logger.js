const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');

// Configuración de formato personalizado
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, stack, ...meta } = info;
        let logMessage = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
        
        // Agregar metadatos si existen (excluyendo propiedades internas de winston)
        const filteredMeta = Object.keys(meta).reduce((acc, key) => {
            if (!['Symbol(level)', 'Symbol(message)', 'Symbol(splat)'].includes(key)) {
                acc[key] = meta[key];
            }
            return acc;
        }, {});
        
        if (Object.keys(filteredMeta).length > 0) {
            logMessage += ` ${JSON.stringify(filteredMeta)}`;
        }
        
        return logMessage;
    })
);

// Configuración de rotación diaria para archivos
const dailyRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'dr-salitas-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d', // Mantener logs por 14 días
    format: customFormat
});

// Configuración de rotación para errores
const errorRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d', // Mantener errores por 30 días
    level: 'error',
    format: customFormat
});

// Crear logger principal
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // Archivo de logs generales con rotación
        dailyRotateFileTransport,
        
        // Archivo específico para errores
        errorRotateFileTransport,
        
        // Consola con colores para desarrollo
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf((info) => {
                    const { timestamp, level, message, stack, ...meta } = info;
                    let logMessage = `${timestamp} [${level}]: ${stack || message}`;
                    
                    // Agregar metadatos si existen (excluyendo propiedades internas de winston)
                    const filteredMeta = Object.keys(meta).reduce((acc, key) => {
                        if (!['Symbol(level)', 'Symbol(message)', 'Symbol(splat)'].includes(key)) {
                            acc[key] = meta[key];
                        }
                        return acc;
                    }, {});
                    
                    if (Object.keys(filteredMeta).length > 0) {
                        logMessage += ` ${JSON.stringify(filteredMeta)}`;
                    }
                    
                    return logMessage;
                })
            )
        })
    ],
    
    // Manejar excepciones no capturadas
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'exceptions.log'),
            format: customFormat
        })
    ],
    
    // Manejar rechazos de promesas no capturadas
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'rejections.log'),
            format: customFormat
        })
    ]
});

// Funciones de utilidad para diferentes tipos de logs
const botLogger = {
    // Logs generales del bot
    info: (message, meta = {}) => {
        logger.info(message, meta);
    },
    
    // Logs de debug (solo en desarrollo)
    debug: (message, meta = {}) => {
        logger.debug(message, meta);
    },
    
    // Warnings
    warn: (message, meta = {}) => {
        logger.warn(message, meta);
    },
    
    // Errores
    error: (message, metaOrError = {}) => {
        // Si el segundo parámetro es un Error object, tratarlo como error
        if (metaOrError instanceof Error) {
            logger.error(message, { 
                error: metaOrError.message,
                stack: metaOrError.stack,
                name: metaOrError.name
            });
        } else {
            // Si no es un Error, tratarlo como metadatos
            logger.error(message, metaOrError);
        }
    },
    
    // Logs específicos de Discord
    discord: (action, details = {}) => {
        logger.info(`[DISCORD] ${action}`, details);
    },
    
    // Logs de comandos
    command: (command, user, guild, success = true) => {
        const level = success ? 'info' : 'warn';
        logger[level](`[COMMAND] ${command}`, {
            user: user.username,
            userId: user.id,
            guild: guild?.name || 'DM',
            guildId: guild?.id || 'DM',
            success
        });
    },
    
    // Logs de patrones de IA
    pattern: (type, details = {}) => {
        logger.info(`[PATTERN] ${type}`, details);
    },
    
    // Logs de memoria
    memory: (action, details = {}) => {
        logger.debug(`[MEMORY] ${action}`, details);
    },
    
    // Logs de rendimiento
    performance: (action, duration, details = {}) => {
        logger.info(`[PERFORMANCE] ${action} took ${duration}ms`, details);
    },
    
    // Logs de sistema
    system: (message, details = {}) => {
        logger.info(`[SYSTEM] ${message}`, details);
    }
};

// Middleware para medir tiempo de ejecución
botLogger.timeStart = (label) => {
    return Date.now();
};

botLogger.timeEnd = (label, startTime, details = {}) => {
    const duration = Date.now() - startTime;
    botLogger.performance(label, duration, details);
    return duration;
};

module.exports = botLogger;