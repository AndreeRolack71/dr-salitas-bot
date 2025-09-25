// Script de prueba para verificar las funcionalidades del bot
const { Client, GatewayIntentBits } = require('discord.js');
const Database = require('./database/database');
const CacheManager = require('./utils/cache');
const ValidationSystem = require('./utils/validation');

// Crear instancias de prueba
const database = new Database();
const cache = new CacheManager();
const validation = new ValidationSystem();

async function runTests() {
    console.log('🧪 Iniciando pruebas del sistema...\n');

    // Test 1: Base de datos
    console.log('📊 Probando base de datos...');
    try {
        await database.initialize();
        console.log('✅ Base de datos inicializada correctamente');
        
        // Probar inserción de mensaje
        const testMessage = {
            id: 'test-123',
            userId: 'user-123',
            guildId: 'guild-123',
            channelId: 'channel-123',
            content: 'Mensaje de prueba',
            messageType: 'user',
            sentimentScore: 0.5,
            patternDetected: ['test'],
            responseGenerated: true
        };
        
        await database.logMessage(testMessage);
        console.log('✅ Mensaje de prueba guardado en la base de datos');
        
    } catch (error) {
        console.error('❌ Error en prueba de base de datos:', error.message);
    }

    // Test 2: Sistema de cache
    console.log('\n💾 Probando sistema de cache...');
    try {
        // Probar cache principal
        cache.set('test-key', 'test-value', 60);
        const cachedValue = cache.get('test-key');
        
        if (cachedValue === 'test-value') {
            console.log('✅ Cache principal funcionando correctamente');
        } else {
            console.log('❌ Error en cache principal');
        }
        
        // Probar cache de usuarios
        cache.cacheUserResponse('user-123', 'Pong de prueba!', 300);
        const userResponse = cache.getCachedUserResponse('user-123');
        
        if (userResponse === 'Pong de prueba!') {
            console.log('✅ Cache de usuarios funcionando correctamente');
        } else {
            console.log('❌ Error en cache de usuarios');
        }
        
        // Mostrar estadísticas
        const stats = cache.getStats();
        console.log('📈 Estadísticas de cache:', {
            mainCache: stats.mainCache.keys,
            userCache: stats.userCache.keys,
            commandCache: stats.commandCache.keys
        });
        
    } catch (error) {
        console.error('❌ Error en prueba de cache:', error.message);
    }

    // Test 3: Sistema de validación
    console.log('\n🛡️ Probando sistema de validación...');
    try {
        // Probar validación de mensaje válido
        const validMessage = {
            content: 'Hola Dr. Salitas!',
            userId: '123456789012345678',
            guildId: '123456789012345678',
            channelId: '123456789012345678'
        };
        
        const validationResult = validation.validateUserMessage(validMessage);
        
        if (validationResult.isValid) {
            console.log('✅ Validación de mensaje válido correcta');
            console.log('🧹 Contenido sanitizado:', validationResult.sanitized.content);
        } else {
            console.log('❌ Error en validación de mensaje válido:', validationResult.errors);
        }
        
        // Probar detección de contenido peligroso
        const dangerousContent = 'Este es un mensaje con <script>alert("hack")</script>';
        const hasDangerous = validation.containsDangerousPatterns(dangerousContent);
        
        if (hasDangerous) {
            console.log('✅ Detección de contenido peligroso funcionando');
        } else {
            console.log('❌ Error en detección de contenido peligroso');
        }
        
        // Probar rate limiting
        const isRateLimited = validation.checkRateLimit('user-123');
        console.log('⏱️ Rate limiting activo:', isRateLimited);
        
    } catch (error) {
        console.error('❌ Error en prueba de validación:', error.message);
    }

    // Test 4: Comandos slash
    console.log('\n⚡ Probando validación de comandos slash...');
    try {
        const testCommand = {
            commandName: 'ping',
            userId: '123456789012345678',
            guildId: '123456789012345678',
            options: {}
        };
        
        const commandValidation = validation.validateSlashCommand(testCommand);
        
        if (commandValidation.isValid) {
            console.log('✅ Validación de comando slash correcta');
        } else {
            console.log('❌ Error en validación de comando slash:', commandValidation.errors);
        }
        
    } catch (error) {
        console.error('❌ Error en prueba de comandos slash:', error.message);
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('📝 Revisa los logs para más detalles sobre el funcionamiento del sistema.');
    
    // Cerrar conexiones
    database.close();
    process.exit(0);
}

// Ejecutar pruebas
runTests().catch(console.error);