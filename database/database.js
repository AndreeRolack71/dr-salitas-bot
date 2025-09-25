const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../data/dr-salitas.db');
        this.db = null;
        this.isConnected = false;
    }

    // Inicializar la base de datos
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    logger.error('Error conectando a la base de datos', err);
                    reject(err);
                } else {
                    logger.system('Base de datos SQLite conectada exitosamente');
                    this.isConnected = true;
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    // Crear las tablas necesarias
    async createTables() {
        const tables = [
            // Tabla de usuarios
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                display_name TEXT,
                first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0,
                mood_score REAL DEFAULT 0.0,
                personality_traits TEXT, -- JSON string
                preferences TEXT, -- JSON string
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla de servidores/guilds
            `CREATE TABLE IF NOT EXISTS guilds (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                owner_id TEXT,
                member_count INTEGER DEFAULT 0,
                bot_joined DATETIME DEFAULT CURRENT_TIMESTAMP,
                settings TEXT, -- JSON string con configuraciones
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla de mensajes (para análisis y estadísticas)
            `CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                channel_id TEXT,
                content TEXT,
                message_type TEXT, -- 'user', 'bot_response', 'command'
                sentiment_score REAL,
                pattern_detected TEXT, -- JSON array de patrones detectados
                response_generated BOOLEAN DEFAULT FALSE,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (guild_id) REFERENCES guilds (id)
            )`,

            // Tabla de comandos ejecutados
            `CREATE TABLE IF NOT EXISTS command_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command_name TEXT NOT NULL,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                success BOOLEAN DEFAULT TRUE,
                execution_time REAL, -- en milisegundos
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (guild_id) REFERENCES guilds (id)
            )`,

            // Tabla de patrones detectados
            `CREATE TABLE IF NOT EXISTS patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_type TEXT NOT NULL,
                pattern_data TEXT, -- JSON con datos del patrón
                user_id TEXT,
                guild_id TEXT,
                confidence_score REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (guild_id) REFERENCES guilds (id)
            )`,

            // Tabla de configuraciones del bot
            `CREATE TABLE IF NOT EXISTS bot_config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                description TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla de métricas del sistema
            `CREATE TABLE IF NOT EXISTS system_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                metric_unit TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const tableSQL of tables) {
            await this.runQuery(tableSQL);
        }

        // Crear índices para mejor rendimiento
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_guild_id ON messages(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_command_usage_user_id ON command_usage(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_command_usage_command_name ON command_usage(command_name)',
            'CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type)',
            'CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name)'
        ];

        for (const indexSQL of indexes) {
            await this.runQuery(indexSQL);
        }

        logger.system('Tablas e índices de la base de datos creados exitosamente');
    }

    // Ejecutar una consulta SQL
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Base de datos no conectada'));
                return;
            }

            this.db.run(sql, params, function(err) {
                if (err) {
                    logger.error('Error ejecutando consulta SQL', err, { sql, params });
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Obtener múltiples filas
    getAll(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Base de datos no conectada'));
                return;
            }

            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('Error obteniendo datos', err, { sql, params });
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Obtener una sola fila
    getOne(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Base de datos no conectada'));
                return;
            }

            this.db.get(sql, params, (err, row) => {
                if (err) {
                    logger.error('Error obteniendo fila', err, { sql, params });
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Métodos específicos para usuarios
    async createOrUpdateUser(userData) {
        const { id, username, displayName } = userData;
        
        const existingUser = await this.getOne(
            'SELECT id FROM users WHERE id = ?', 
            [id]
        );

        if (existingUser) {
            // Actualizar usuario existente
            await this.runQuery(`
                UPDATE users 
                SET username = ?, display_name = ?, last_seen = CURRENT_TIMESTAMP, 
                    message_count = message_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [username, displayName, id]);
        } else {
            // Crear nuevo usuario
            await this.runQuery(`
                INSERT INTO users (id, username, display_name, message_count)
                VALUES (?, ?, ?, 1)
            `, [id, username, displayName]);
        }
    }

    // Métodos específicos para guilds
    async createOrUpdateGuild(guildData) {
        const { id, name, ownerId, memberCount } = guildData;
        
        const existingGuild = await this.getOne(
            'SELECT id FROM guilds WHERE id = ?', 
            [id]
        );

        if (existingGuild) {
            await this.runQuery(`
                UPDATE guilds 
                SET name = ?, owner_id = ?, member_count = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [name, ownerId, memberCount, id]);
        } else {
            await this.runQuery(`
                INSERT INTO guilds (id, name, owner_id, member_count)
                VALUES (?, ?, ?, ?)
            `, [id, name, ownerId, memberCount]);
        }
    }

    // Registrar mensaje
    async logMessage(messageData) {
        const { 
            id, userId, guildId, channelId, content, 
            messageType, sentimentScore, patternDetected, responseGenerated 
        } = messageData;

        await this.runQuery(`
            INSERT INTO messages 
            (id, user_id, guild_id, channel_id, content, message_type, 
             sentiment_score, pattern_detected, response_generated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, userId, guildId, channelId, content, messageType,
            sentimentScore, JSON.stringify(patternDetected), responseGenerated
        ]);
    }

    // Registrar uso de comando
    async logCommand(commandData) {
        const { 
            commandName, userId, guildId, success, 
            executionTime, errorMessage 
        } = commandData;

        await this.runQuery(`
            INSERT INTO command_usage 
            (command_name, user_id, guild_id, success, execution_time, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [commandName, userId, guildId, success, executionTime, errorMessage]);
    }

    // Obtener estadísticas de usuario
    async getUserStats(userId) {
        return await this.getOne(`
            SELECT 
                u.*,
                COUNT(m.id) as total_messages,
                COUNT(c.id) as total_commands,
                AVG(m.sentiment_score) as avg_sentiment
            FROM users u
            LEFT JOIN messages m ON u.id = m.user_id
            LEFT JOIN command_usage c ON u.id = c.user_id
            WHERE u.id = ?
            GROUP BY u.id
        `, [userId]);
    }

    // Obtener estadísticas del bot
    async getBotStats() {
        const stats = {};
        
        // Usuarios totales
        const userCount = await this.getOne('SELECT COUNT(*) as count FROM users');
        stats.totalUsers = userCount.count;

        // Guilds totales
        const guildCount = await this.getOne('SELECT COUNT(*) as count FROM guilds');
        stats.totalGuilds = guildCount.count;

        // Mensajes totales
        const messageCount = await this.getOne('SELECT COUNT(*) as count FROM messages');
        stats.totalMessages = messageCount.count;

        // Comandos más usados
        const topCommands = await this.getAll(`
            SELECT command_name, COUNT(*) as usage_count
            FROM command_usage
            GROUP BY command_name
            ORDER BY usage_count DESC
            LIMIT 10
        `);
        stats.topCommands = topCommands;

        return stats;
    }

    // Cerrar conexión
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    logger.error('Error cerrando base de datos', err);
                } else {
                    logger.system('Base de datos cerrada correctamente');
                    this.isConnected = false;
                }
            });
        }
    }
}

module.exports = Database;