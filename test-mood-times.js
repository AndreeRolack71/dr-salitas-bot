// Script de prueba para verificar los rangos de tiempo del sistema de mood
const MoodSystem = require('./mood/mood-system.js');

const moodSystem = new MoodSystem();

// Función para simular diferentes horas
function testMoodAtTime(hour, minute = 0) {
    // Crear fecha simulada
    const testDate = new Date();
    testDate.setHours(hour, minute, 0, 0);
    
    // Simular la zona horaria de Chile
    const chileTime = new Date(testDate.toLocaleString("en-US", {timeZone: "America/Santiago"}));
    const chileHour = chileTime.getHours();
    
    // Determinar mood esperado
    let expectedMood;
    if (chileHour >= 6 && chileHour < 12) {
        expectedMood = 'matutino_grumpy';
    } else if (chileHour >= 12 && chileHour < 19) {
        expectedMood = 'tarde_cosmica';
    } else {
        expectedMood = 'noche_bizarra';
    }
    
    // Obtener mood actual del sistema
    const originalGetHours = Date.prototype.getHours;
    Date.prototype.getHours = function() {
        if (this === chileTime) return chileHour;
        return originalGetHours.call(this);
    };
    
    const actualMood = moodSystem.getCurrentMood();
    const moodInfo = moodSystem.getMoodInfo();
    
    // Restaurar función original
    Date.prototype.getHours = originalGetHours;
    
    console.log(`🕐 Hora: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    console.log(`   Hora Chile: ${chileHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    console.log(`   Mood esperado: ${expectedMood}`);
    console.log(`   Mood actual: ${actualMood}`);
    console.log(`   Nombre: ${moodInfo.name}`);
    console.log(`   Rango: ${moodInfo.timeRange}`);
    console.log(`   ✅ ${actualMood === expectedMood ? 'CORRECTO' : '❌ ERROR'}`);
    console.log('');
}

console.log('🧪 PRUEBA DE RANGOS DE TIEMPO DEL SISTEMA DE MOOD\n');

// Probar diferentes horas críticas
console.log('📅 Probando horas críticas:\n');

// Madrugada (noche_bizarra)
testMoodAtTime(3, 0);
testMoodAtTime(5, 59);

// Mañana (matutino_grumpy)
testMoodAtTime(6, 0);
testMoodAtTime(9, 30);
testMoodAtTime(11, 59);

// Tarde (tarde_cosmica)
testMoodAtTime(12, 0);
testMoodAtTime(16, 59); // Caso específico del usuario
testMoodAtTime(18, 59);

// Noche (noche_bizarra)
testMoodAtTime(19, 0);
testMoodAtTime(22, 30);
testMoodAtTime(23, 59);

console.log('🎯 Caso específico reportado por el usuario:');
testMoodAtTime(16, 59);

console.log('✅ Prueba completada');