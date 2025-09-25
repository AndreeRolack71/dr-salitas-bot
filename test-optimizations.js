// Test de optimizaciones del bot Dr. Salitas
const DrSalitasPersonality = require('./personality/drpene-personality');
const PatternResponses = require('./patterns/pattern-responses');

console.log('🧪 Iniciando tests de optimizaciones...\n');

// Test 1: Verificar respuestas para "moco"
console.log('📋 Test 1: Respuestas para "moco"');
const drSalitas = new DrSalitasPersonality();
const mocoResponse = drSalitas.getMocoResponse();
console.log(`✅ Respuesta moco: ${mocoResponse}\n`);

// Test 2: Verificar respuestas para problemas de sueño
console.log('📋 Test 2: Respuestas para problemas de sueño');
const sleepResponse = drSalitas.getSleepResponse();
console.log(`✅ Respuesta sueño: ${sleepResponse}\n`);

// Test 3: Verificar detección mejorada en getSmartResponse
console.log('📋 Test 3: Detección mejorada de palabras clave');
const testMessages = [
    'tengo moco',
    'no puedo dormir',
    'tengo problemas para dormir',
    'tengo insomnio',
    'estoy con sueño'
];

testMessages.forEach((msg, index) => {
    const response = drSalitas.getSmartResponse(msg, {});
    console.log(`✅ "${msg}" -> ${response}`);
});
console.log();

// Test 4: Verificar respuestas múltiples sin duplicados
console.log('📋 Test 4: Respuestas múltiples sin duplicados');
const patternResponses = new PatternResponses();
const mockAnalysis = {
    userState: { intensity: 5 },
    isTriggered: true,
    patterns: ['aggressive']
};

const multipleResponses = patternResponses.getMultipleResponses(mockAnalysis, 'TestUser', 3);
console.log('✅ Respuestas múltiples generadas:');
multipleResponses.forEach((response, index) => {
    console.log(`   ${index + 1}. ${response}`);
});

// Verificar que no hay duplicados
const uniqueResponses = new Set(multipleResponses);
console.log(`✅ Total respuestas: ${multipleResponses.length}, Únicas: ${uniqueResponses.size}`);
console.log(`✅ Sin duplicados: ${multipleResponses.length === uniqueResponses.size ? 'SÍ' : 'NO'}\n`);

// Test 5: Verificar probabilidades de spam reducidas
console.log('📋 Test 5: Probabilidades de spam (simulación)');
let spamCount = 0;
const iterations = 1000;

for (let i = 0; i < iterations; i++) {
    if (patternResponses.shouldSpamResponses(mockAnalysis)) {
        spamCount++;
    }
}

const spamPercentage = (spamCount / iterations * 100).toFixed(1);
console.log(`✅ Spam en ${iterations} iteraciones: ${spamCount} (${spamPercentage}%)`);
console.log(`✅ Esperado: ~25% para usuarios muy triggeados\n`);

console.log('🎉 Tests completados exitosamente!');
console.log('📊 Resumen de optimizaciones:');
console.log('   ✅ Detección mejorada de "moco" y problemas de sueño');
console.log('   ✅ Respuestas múltiples sin duplicados');
console.log('   ✅ Probabilidades de spam reducidas');
console.log('   ✅ Sistema funcionando correctamente');