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
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
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
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
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
    error: (message, error = null, meta = {}) => {
        if (error) {
            logger.error(message, { error: error.stack || error, ...meta });
        } else {
            logger.error(message, meta);
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