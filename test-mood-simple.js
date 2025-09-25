// Script de prueba simple para el sistema de mood
const MoodSystem = require('./mood/mood-system.js');

const moodSystem = new MoodSystem();

console.log('🧪 PRUEBA SIMPLE DEL SISTEMA DE MOOD\n');

// Obtener mood actual
const currentMood = moodSystem.getCurrentMood();
const moodInfo = moodSystem.getMoodInfo();
const systemStatus = moodSystem.getSystemStatus();

console.log('📊 Estado actual del sistema:');
console.log(`   Hora actual: ${systemStatus.currentTime}`);
console.log(`   Mood ID: ${currentMood}`);
console.log(`   Mood nombre: ${moodInfo.name}`);
console.log(`   Rango horario: ${moodInfo.timeRange}`);
console.log(`   Descripción: ${moodInfo.description}`);
console.log('');

// Verificar hora actual manualmente
const now = new Date();
const chileTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santiago"}));
const hour = chileTime.getHours();

console.log('🕐 Verificación manual de hora:');
console.log(`   Hora local: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
console.log(`   Hora Chile: ${hour}:${chileTime.getMinutes().toString().padStart(2, '0')}`);
console.log('');

// Determinar mood esperado
let expectedMood;
if (hour >= 6 && hour < 12) {
    expectedMood = 'matutino_grumpy';
} else if (hour >= 12 && hour < 19) {
    expectedMood = 'tarde_cosmica';
} else {
    expectedMood = 'noche_bizarra';
}

console.log('🎯 Análisis:');
console.log(`   Mood esperado: ${expectedMood}`);
console.log(`   Mood actual: ${currentMood}`);
console.log(`   ✅ ${currentMood === expectedMood ? 'CORRECTO' : '❌ ERROR'}`);

if (currentMood !== expectedMood) {
    console.log('\n⚠️  PROBLEMA DETECTADO:');
    console.log('   El sistema no está devolviendo el mood correcto para la hora actual');
}

console.log('\n✅ Prueba completada');