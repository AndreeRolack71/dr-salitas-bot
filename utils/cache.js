const NodeCache = require('node-cache');
const logger = require('./logger');

class CacheManager {
    constructor() {
        // Cache principal con TTL de 10 minutos por defecto
        this.mainCache = new NodeCache({
            stdTTL: 600, // 10 minutos
            checkperiod: 120, // Verificar cada 2 minutos
            useClones: false
        });

        // Cache de usuarios con TTL de 30 minutos
        this.userCache = new NodeCache({
            stdTTL: 1800, // 30 minutos
            checkperiod: 300, // Verificar cada 5 minutos
            useClones: false
        });

        // Cache de comandos con TTL de 5 minutos
        this.commandCache = new NodeCache({
            stdTTL: 300, // 5 minutos
            checkperiod: 60, // Verificar cada minuto
            useClones: false
        });

        // Cache de patrones con TTL de 1 hora
        this.patternCache = new NodeCache({
            stdTTL: 3600, // 1 hora
            checkperiod: 600, // Verificar cada 10 minutos
            useClones: false
        });

        // Cache de estadísticas con TTL de 15 minutos
        this.statsCache = new NodeCache({
            stdTTL: 900, // 15 minutos
            checkperiod: 180, // Verificar cada 3 minutos
            useClones: false
        });

        this.setupEventListeners();
        logger.system('Sistema de cache inicializado correctamente');
    }

    setupEventListeners() {
        // Eventos para logging
        this.mainCache.on('set', (key, value) => {
            logger.debug('Cache SET', { cache: 'main', key, size: this.getSize(value) });
        });

        this.mainCache.on('del', (key, value) => {
            logger.debug('Cache DEL', { cache: 'main', key });
        });

        this.mainCache.on('expired', (key, value) => {
            logger.debug('Cache EXPIRED', { cache: 'main', key });
        });

        // Eventos similares para otros caches
        ['userCache', 'commandCache', 'patternCache', 'statsCache'].forEach(cacheName => {
            this[cacheName].on('set', (key, value) => {
                logger.debug('Cache SET', { cache: cacheName, key, size: this.getSize(value) });
            });
        });
    }

    // Utilidades generales
    getSize(value) {
        try {
            return JSON.stringify(value).length;
        } catch {
            return 'unknown';
        }
    }

    // Métodos para cache principal
    set(key, value, ttl = null) {
        try {
            if (ttl) {
                return this.mainCache.set(key, value, ttl);
            }
            return this.mainCache.set(key, value);
        } catch (error) {
            logger.error('Error setting main cache', error, { key });
            return false;
        }
    }

    get(key) {
        try {
            return this.mainCache.get(key);
        } catch (error) {
            logger.error('Error getting from main cache', error, { key });
            return undefined;
        }
    }

    del(key) {
        try {
            return this.mainCache.del(key);
        } catch (error) {
            logger.error('Error deleting from main cache', error, { key });
            return 0;
        }
    }

    // Métodos para cache de usuarios
    setUser(userId, userData, ttl = null) {
        const key = `user:${userId}`;
        try {
            if (ttl) {
                return this.userCache.set(key, userData, ttl);
            }
            return this.userCache.set(key, userData);
        } catch (error) {
            logger.error('Error setting user cache', error, { userId });
            return false;
        }
    }

    getUser(userId) {
        const key = `user:${userId}`;
        try {
            return this.userCache.get(key);
        } catch (error) {
            logger.error('Error getting user from cache', error, { userId });
            return undefined;
        }
    }

    delUser(userId) {
        const key = `user:${userId}`;
        try {
            return this.userCache.del(key);
        } catch (error) {
            logger.error('Error deleting user from cache', error, { userId });
            return 0;
        }
    }

    // Métodos para cache de comandos
    setCommand(commandName, userId, result, ttl = null) {
        const key = `cmd:${commandName}:${userId}`;
        try {
            if (ttl) {
                return this.commandCache.set(key, result, ttl);
            }
            return this.commandCache.set(key, result);
        } catch (error) {
            logger.error('Error setting command cache', error, { commandName, userId });
            return false;
        }
    }

    getCommand(commandName, userId) {
        const key = `cmd:${commandName}:${userId}`;
        try {
            return this.commandCache.get(key);
        } catch (error) {
            logger.error('Error getting command from cache', error, { commandName, userId });
            return undefined;
        }
    }

    // Métodos para cache de patrones
    setPattern(patternType, userId, data, ttl = null) {
        const key = `pattern:${patternType}:${userId}`;
        try {
            if (ttl) {
                return this.patternCache.set(key, data, ttl);
            }
            return this.patternCache.set(key, data);
        } catch (error) {
            logger.error('Error setting pattern cache', error, { patternType, userId });
            return false;
        }
    }

    getPattern(patternType, userId) {
        const key = `pattern:${patternType}:${userId}`;
        try {
            return this.patternCache.get(key);
        } catch (error) {
            logger.error('Error getting pattern from cache', error, { patternType, userId });
            return undefined;
        }
    }

    // Métodos para cache de estadísticas
    setStats(statsType, data, ttl = null) {
        const key = `stats:${statsType}`;
        try {
            if (ttl) {
                return this.statsCache.set(key, data, ttl);
            }
            return this.statsCache.set(key, data);
        } catch (error) {
            logger.error('Error setting stats cache', error, { statsType });
            return false;
        }
    }

    getStats(statsType) {
        const key = `stats:${statsType}`;
        try {
            return this.statsCache.get(key);
        } catch (error) {
            logger.error('Error getting stats from cache', error, { statsType });
            return undefined;
        }
    }

    // Métodos de utilidad
    flush() {
        try {
            this.mainCache.flushAll();
            this.userCache.flushAll();
            this.commandCache.flushAll();
            this.patternCache.flushAll();
            this.statsCache.flushAll();
            logger.system('Todos los caches han sido limpiados');
            return true;
        } catch (error) {
            logger.error('Error flushing caches', error);
            return false;
        }
    }

    getStats() {
        try {
            return {
                main: {
                    keys: this.mainCache.keys().length,
                    hits: this.mainCache.getStats().hits,
                    misses: this.mainCache.getStats().misses
                },
                user: {
                    keys: this.userCache.keys().length,
                    hits: this.userCache.getStats().hits,
                    misses: this.userCache.getStats().misses
                },
                command: {
                    keys: this.commandCache.keys().length,
                    hits: this.commandCache.getStats().hits,
                    misses: this.commandCache.getStats().misses
                },
                pattern: {
                    keys: this.patternCache.keys().length,
                    hits: this.patternCache.getStats().hits,
                    misses: this.patternCache.getStats().misses
                },
                stats: {
                    keys: this.statsCache.keys().length,
                    hits: this.statsCache.getStats().hits,
                    misses: this.statsCache.getStats().misses
                }
            };
        } catch (error) {
            logger.error('Error getting cache stats', error);
            return null;
        }
    }

    // Métodos específicos para el bot
    cacheUserResponse(userId, response, ttl = 300) {
        return this.set(`user_response:${userId}`, response, ttl);
    }

    getCachedUserResponse(userId) {
        return this.get(`user_response:${userId}`);
    }

    cacheGuildSettings(guildId, settings, ttl = 1800) {
        return this.set(`guild_settings:${guildId}`, settings, ttl);
    }

    getCachedGuildSettings(guildId) {
        return this.get(`guild_settings:${guildId}`);
    }

    cachePersonalityResponse(context, response, ttl = 600) {
        const key = `personality:${Buffer.from(context).toString('base64').slice(0, 50)}`;
        return this.set(key, response, ttl);
    }

    getCachedPersonalityResponse(context) {
        const key = `personality:${Buffer.from(context).toString('base64').slice(0, 50)}`;
        return this.get(key);
    }

    // Limpieza específica
    clearUserCache(userId) {
        const patterns = [
            `user:${userId}`,
            `user_response:${userId}`,
            `pattern:*:${userId}`,
            `cmd:*:${userId}`
        ];

        let cleared = 0;
        patterns.forEach(pattern => {
            if (pattern.includes('*')) {
                // Para patrones con wildcard, buscar todas las claves
                const allKeys = [
                    ...this.mainCache.keys(),
                    ...this.userCache.keys(),
                    ...this.commandCache.keys(),
                    ...this.patternCache.keys()
                ];
                
                const matchingKeys = allKeys.filter(key => {
                    const regex = new RegExp(pattern.replace('*', '.*'));
                    return regex.test(key);
                });

                matchingKeys.forEach(key => {
                    this.del(key);
                    cleared++;
                });
            } else {
                if (this.del(pattern) > 0) cleared++;
            }
        });

        logger.debug('Cache de usuario limpiado', { userId, keysCleared: cleared });
        return cleared;
    }
}

module.exports = CacheManager;