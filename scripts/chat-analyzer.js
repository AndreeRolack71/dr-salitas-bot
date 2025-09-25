const fs = require('fs');
const path = require('path');

class ChatAnalyzer {
    constructor() {
        this.patterns = {
            jokes: [],
            reactions: {},
            phrases: [],
            keywords: new Set()
        };
        this.keywords = new Set(); // Inicializar keywords como propiedad de clase
    }

    // Analizar archivo de chat
    analyzeChat(filePath) {
        try {
            console.log('🔍 Analizando archivo de chat...');
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Dividir en líneas y limpiar
            const lines = content.split('\n').filter(line => line.trim());
            
            console.log(`📊 Total de líneas encontradas: ${lines.length}`);
            
            // Extraer patrones
            this.extractJokes(lines);
            this.extractReactions(lines);
            this.extractPhrases(lines);
            this.extractKeywords(lines);
            
            // Generar archivo de personalidad
            this.generatePersonalityFile();
            
            console.log('✅ Análisis completado!');
            this.showStats();
            
        } catch (error) {
            console.error('❌ Error analizando chat:', error.message);
        }
    }

    // Limpiar mensaje removiendo timestamp y nombre
    cleanMessage(message) {
        // Remover timestamp de WhatsApp (formato: DD/MM/YYYY, HH:MM p. m. - Nombre:)
        let cleaned = message.replace(/^\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}\s[ap]\.\sm\.\s-\s[^:]+:\s/, '');
        
        // Limpiar espacios extra
        cleaned = cleaned.trim();
        
        return cleaned;
    }

    // Extraer chistes y humor
    extractJokes(lines) {
        const jokeIndicators = ['jaja', 'jeje', 'xd', '😂', '🤣', 'lol', 'wea'];
        
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (jokeIndicators.some(indicator => lower.includes(indicator))) {
                const cleanedMessage = this.cleanMessage(line);
                if (cleanedMessage.length > 10 && cleanedMessage.length < 200) {
                    this.patterns.jokes.push(cleanedMessage);
                }
            }
        });
    }

    // Extraer reacciones a palabras clave
    extractReactions(lines) {
        // Palabras clave más flaites y ordinarias del chat
        const keywords = {
            'moco': [],
            'pene': [],
            'wea': [],
            'asco': [],
            'cochino': [],
            'culiao': [],
            'conchetumare': [],
            'ctm': [],
            'maricon': [],
            'aweonao': [],
            'ordinario': [],
            'pico': [],
            'raja': [],
            'ano': [],
            'culo': [],
            'pichula': [],
            'huevón': [],
            'weón': [],
            'gil': [],
            'flaite': [],
            'ted': [],
            'pajero': [],
            'bastardo': [],
            'estúpido': [],
            'sapo': [],
            'tonto': [],
            'reculiao': [],
            'remilculiao': []
        };

        lines.forEach(line => {
            const cleanedMessage = this.cleanMessage(line);
            if (cleanedMessage && cleanedMessage.length > 5) {
                const lowerMessage = cleanedMessage.toLowerCase();
                
                Object.keys(keywords).forEach(keyword => {
                    if (lowerMessage.includes(keyword)) {
                        keywords[keyword].push(cleanedMessage);
                    }
                });
            }
        });

        this.patterns.reactions = keywords;
    }

    // Extraer frases típicas
    extractPhrases(lines) {
        lines.forEach(line => {
            const cleanedLine = this.cleanMessage(line);
            if (cleanedLine.length > 15 && cleanedLine.length < 100) {
                // Filtrar frases que parecen típicas del personaje
                if (cleanedLine.includes('Dr') || cleanedLine.includes('pene') || cleanedLine.includes('wea')) {
                    this.patterns.phrases.push(cleanedLine);
                }
            }
        });
    }

    // Extraer palabras clave frecuentes
    extractKeywords(lines) {
        const text = lines.join(' ').toLowerCase();
        const words = text.match(/\b\w+\b/g) || [];
        const frequency = {};
        
        words.forEach(word => {
            if (word.length > 3) {
                frequency[word] = (frequency[word] || 0) + 1;
            }
        });
        
        // Obtener las más frecuentes
        Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 50)
            .forEach(([word]) => this.keywords.add(word));
    }

    // Generar archivo de personalidad
    generatePersonalityFile() {
        const personality = {
            metadata: {
                generated: new Date().toISOString(),
                source: 'chat-analyzer',
                version: '1.0'
            },
            jokes: this.patterns.jokes.slice(0, 50), // Top 50 chistes
            reactions: this.patterns.reactions,
            phrases: this.patterns.phrases.slice(0, 30), // Top 30 frases
            keywords: Array.from(this.keywords).slice(0, 100), // Top 100 keywords
            responses: {
                greetings: ['¡Ey qué tal!', '¡Hola wea!', '¿Cómo andai?'],
                farewells: ['¡Chao wea!', 'Nos vemos!', '¡Que te vaya bien!'],
                confusion: ['¿Qué wea?', 'No entendí', '¿Cómo?'],
                excitement: ['¡Wena!', '¡Bacán!', '¡Genial wea!']
            }
        };
        
        const outputPath = path.join(__dirname, '../data/personality.json');
        fs.writeFileSync(outputPath, JSON.stringify(personality, null, 2));
        console.log(`💾 Personalidad guardada en: ${outputPath}`);
    }

    // Mostrar estadísticas
    showStats() {
        console.log('\n📈 ESTADÍSTICAS DEL ANÁLISIS:');
        console.log(`🎭 Chistes encontrados: ${this.patterns.jokes.length}`);
        console.log(`⚡ Reacciones por palabra clave:`);
        Object.entries(this.patterns.reactions).forEach(([key, reactions]) => {
            console.log(`   - ${key}: ${reactions.length} reacciones`);
        });
        console.log(`💬 Frases típicas: ${this.patterns.phrases.length}`);
        console.log(`🔑 Palabras clave: ${this.keywords.size}`);
    }
}

// Función principal
function main() {
    const analyzer = new ChatAnalyzer();
    
    // Buscar archivo de chat en la carpeta data
    const dataDir = path.join(__dirname, '../data');
    const files = fs.readdirSync(dataDir).filter(file => 
        file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.log')
    );
    
    if (files.length === 0) {
        console.log('❌ No se encontró archivo de chat en la carpeta data/');
        console.log('📁 Copia tu archivo de chat a: data/');
        return;
    }
    
    console.log(`📁 Archivos encontrados: ${files.join(', ')}`);
    const chatFile = path.join(dataDir, files[0]);
    
    analyzer.analyzeChat(chatFile);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = ChatAnalyzer;