require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const DrPenePersonality = require('./personality/drpene-personality');
const ContextualMemory = require('./memory/contextual-memory');
const MoodSystem = require('./mood/mood-system');
const PatternDetection = require('./patterns/pattern-detection');
const PatternResponses = require('./patterns/pattern-responses');
const { characterLore, cosmicPhrases, battleScenarios } = require('./data/character-lore');
const cron = require('node-cron');
const logger = require('./utils/logger');
const Database = require('./database/database');
const CacheManager = require('./utils/cache');
const ValidationSystem = require('./utils/validation');

// Crear instancia del bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Función para obtener la hora del día
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'night';
}

// Inicializar personalidad Dr.Salitas, memoria contextual, sistema de mood y detección de patrones
const drSalitas = new DrPenePersonality();
const contextualMemory = new ContextualMemory();
const moodSystem = new MoodSystem();
const patternDetection = new PatternDetection();
const patternResponses = new PatternResponses();
const database = new Database();
const cache = new CacheManager();
const validation = new ValidationSystem();

// Inyectar el sistema de mood en la personalidad
drSalitas.setMoodSystem(moodSystem);

// Sistema de reacciones automáticas
function addAutomaticReactions(message, messageContent) {
    // Mapeo de palabras clave con emojis específicos del universo Dr. Pene
    const reactionMap = {
        // Personajes principales
        'pene': ['🍆', '🔪', '💉'],
        'dr.pene': ['🍆', '🔪', '💉'],
        'dr pene': ['🍆', '🔪', '💉'],
        'ivan': ['🍆', '🔪', '💼', '🧮'],
        'choropc': ['💻', '🦟', '🌟'],
        'choro pc': ['💻', '🦟', '🌟'],
        'dani': ['💻', '🦟', '🌟'],
        'emanuel': ['✨', '👑', '💫'],
        'infinito': ['✨', '👑', '💫'],
        'toromasu': ['🌀', '🔥', '👹'],
        
        // Elementos cósmicos y épicos
        'cósmico': ['🌌', '⭐', '🌠'],
        'cosmico': ['🌌', '⭐', '🌠'],
        'estelar': ['⭐', '🌟', '✨'],
        'dimensional': ['🌀', '🔮', '🌌'],
        'portal': ['🌀', '🔮', '🌌'],
        'trono': ['👑', '🏰', '💎'],
        'dorado': ['👑', '✨', '💛'],
        'brillante': ['✨', '💎', '🌟'],
        
        // Elementos japoneses/anime
        'dokutā': ['🗾', '⚔️', '🔥'],
        'dokuta': ['🗾', '⚔️', '🔥'],
        'mugen': ['🗾', '⚔️', '🔥'],
        'psycho': ['😈', '⚔️', '🔥'],
        'jigoku': ['🔥', '👹', '⚔️'],
        'yami': ['🌑', '👹', '⚔️'],
        'kurayami': ['🌑', '👹', '⚔️'],
        'fukushū': ['⚔️', '🔥', '👹'],
        'fukushu': ['⚔️', '🔥', '👹'],
        
        // Elementos escatológicos épicos
        'moco': ['💚', '🤢', '🐕'],
        'diarrea': ['💩', '🌊', '👑'],
        'caca': ['💩', '👑', '✨'],
        'mierda': ['💩', '👑', '✨'],
        'sagrada': ['👑', '✨', '🙏'],
        
        // Slang chileno
        'culiao': ['🇨🇱', '😤', '🔥'],
        'wea': ['🇨🇱', '😅', '🤷'],
        'conchetumare': ['🇨🇱', '😡', '🔥'],
        'ctm': ['🇨🇱', '😡', '🔥'],
        'cachái': ['🇨🇱', '🤔', '👍'],
        'cachai': ['🇨🇱', '🤔', '👍'],
        'po': ['🇨🇱', '👍', '😊'],
        'ql': ['🇨🇱', '😤', '🔥'],
        
        // Trabajo y profesiones (para Ivan)
        'contador': ['🧮', '💼', '📊'],
        'sindicalista': ['✊', '🏭', '📢'],
        'banco': ['🏦', '💰', '📊'],
        'pega': ['💼', '😴', '💸'],
        'trabajo': ['💼', '😴', '💸'],
        
        // Dr. Salitas específicos
        'salitas': ['🐕', '🤵', '💚'],
        'doctor': ['🐕', '🤵', '💉'],
        'perro': ['🐕', '🐕‍🦺', '🦴'],
        'terno': ['🤵', '👔', '✨'],
        'elegante': ['🤵', '👔', '✨'],
        'bizarro': ['🤪', '👹', '🔥'],
        
        // Nuevas palabras clave específicas del universo
        'pegamento': ['🔧', '💦', '🏗️'],
        'semen': ['💦', '🍆', '🌊'],
        'piso flotante': ['🏗️', '🔨', '📐'],
        'flotante': ['🏗️', '🔨', '📐'],
        'fotolaminado': ['📸', '✨', '🏗️'],
        'cocos': ['🥥', '🌴', '💥'],
        'mancha': ['💦', '🎨', '🤢'],
        'ordinario': ['🐕', '🤵', '😤']
    };
    
    // Probabilidades de reacción según prioridad
    const highPriorityWords = ['pene', 'moco', 'culiao', 'conchetumare', 'ctm', 'ivan', 'dani', 'emanuel', 'pegamento', 'semen'];
    const mediumPriorityWords = ['cósmico', 'cosmico', 'estelar', 'dimensional', 'dokutā', 'dokuta', 'psycho', 'piso flotante', 'flotante', 'fotolaminado', 'cocos'];
    const lowPriorityWords = ['wea', 'cachái', 'cachai', 'po', 'trabajo', 'banco', 'bizarro', 'mancha', 'ordinario'];
    
    // Buscar palabras clave y agregar reacciones
    const foundKeywords = [];
    
    for (const [keyword, emojis] of Object.entries(reactionMap)) {
        if (messageContent.includes(keyword)) {
            foundKeywords.push({ keyword, emojis });
        }
    }
    
    // Si se encontraron palabras clave, seleccionar una para reaccionar
    if (foundKeywords.length > 0) {
        // Priorizar palabras de alta prioridad
        let selectedKeyword = foundKeywords.find(item => highPriorityWords.includes(item.keyword));
        
        if (!selectedKeyword) {
            // Si no hay palabras de alta prioridad, buscar de prioridad media
            selectedKeyword = foundKeywords.find(item => mediumPriorityWords.includes(item.keyword));
        }
        
        if (!selectedKeyword) {
            // Si no hay palabras de prioridad media, tomar cualquiera
            selectedKeyword = foundKeywords[Math.floor(Math.random() * foundKeywords.length)];
        }
        
        // Determinar probabilidad de reacción
        let probability = 0.1; // Probabilidad base
        
        if (highPriorityWords.includes(selectedKeyword.keyword)) {
            probability = 0.7; // 70% para palabras de alta prioridad
        } else if (mediumPriorityWords.includes(selectedKeyword.keyword)) {
            probability = 0.5; // 50% para palabras de prioridad media
        } else if (lowPriorityWords.includes(selectedKeyword.keyword)) {
            probability = 0.3; // 30% para palabras de baja prioridad
        }
        
        if (Math.random() < probability) {
            // Seleccionar emoji aleatorio del array
            const randomEmoji = selectedKeyword.emojis[Math.floor(Math.random() * selectedKeyword.emojis.length)];
            message.react(randomEmoji).catch(error => logger.error('Error adding reaction', error));
        }
    }
}

// Función para generar batallas épicas
function generateEpicBattle(fighter1, fighter2, scenario = null) {
    // Obtener el mood actual para afectar la batalla
    const currentMood = moodSystem.getCurrentMood();
    
    // Si no se proporciona escenario, generar uno aleatorio
    if (!scenario) {
        const scenarios = [
            "La Arena Interdimensional del Placer Cósmico",
            "El Coliseo de las Perversiones Cuánticas", 
            "La Dimensión del Éxtasis Prohibido",
            "El Ring de Combate Morboso Universal",
            "La Plataforma de Batalla Bizarra Suprema",
            "El Estadio del Caos Erótico Interdimensional",
            "La Arena de Gladiadores Degenerados",
            "El Dojo del Placer Cósmico Infinito"
        ];
        
        scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    }
    // Ataques específicos por personaje con armas y movimientos únicos
    const characterAttacks = {
        ivan: [
            "saca su calculadora cuántica y dispara números letales",
            "invoca una auditoría interdimensional que paraliza al enemigo",
            "lanza formularios de sindicato que explotan al contacto",
            "ejecuta un 'Golpe Contador' que calcula el daño exacto",
            "convoca a trabajadores fantasma para un ataque grupal",
            "usa su bisturí quirúrgico para hacer un corte preciso en la cabeza del enemigo, dejándola con forma de glande",
            "realiza una 'Circuncisión Cósmica' con su bisturí interdimensional",
            "ejecuta el 'Corte del Dr. Pene' que transforma la anatomía del rival"
        ],
        dani: [
            "aplica pegamento industrial en el suelo y hace resbalar al enemigo hacia su perdición",
            "instala piso flotante a velocidad sobrehumana creando una trampa mortal",
            "dispara chorros de semen cósmico que paralizan al oponente",
            "usa su pistola de pegamento como arma de destrucción masiva",
            "ejecuta el 'Combo Instalador' mezclando pegamento, semen y piso flotante en un ataque devastador",
            "invoca una lluvia de tablones de piso flotante que golpean con precisión quirúrgica",
            "crea un portal pegajoso interdimensional usando semen y pegamento industrial"
        ],
        emanuel: [
            "crea memes tan poderosos que alteran la realidad del enemigo",
            "envía un mensaje de WhatsApp que causa daño psíquico masivo",
            "invoca el poder de 'consideraciones importantes' paralizante",
            "ejecuta un ataque de humor tan bizarro que confunde al oponente",
            "manipula las dimensiones con su creatividad infinita"
        ],
        toromasu: [
            "ejecuta técnicas de placer ninja que llevan al enemigo al éxtasis paralizante",
            "invoca tentáculos interdimensionales que generan ondas de placer extremo",
            "realiza el 'Jutsu del Orgasmo Cósmico' que desarma al oponente con placer puro",
            "canaliza energía sexual ancestral que sobrecarga los sentidos del enemigo",
            "ejecuta el 'Ataque de los Mil Placeres' que confunde y seduce simultáneamente",
            "invoca el poder del 'Clímax Interdimensional' que trasciende lo físico",
            "realiza técnicas de estimulación cuántica que alteran la percepción del rival"
        ],
        "dr.salitas": [
            "escupe moco verde corrosivo que derrite la realidad",
            "ejecuta un 'Ladrido Elegante' que causa daño sónico",
            "usa su terno como armadura y arma simultáneamente",
            "realiza una 'Mordida Bizarra' que infecta con elegancia",
            "invoca una lluvia de mocos interdimensionales"
        ],
        "dr.pina": [
            "lanza espinas pineápicas envenenadas con morbosidad cósmica",
            "ejecuta un 'Ataque Frutal Perverso' que seduce y destruye",
            "invoca una tormenta de jugo ácido interdimensional",
            "realiza una 'Explosión Pineápica' que fragmenta la realidad",
            "usa su corona de hojas como cuchillas rotatorias mortales"
        ]
    };

    // Ataques puercos y morbosos generales
    const dirtyAttacks = [
        "ejecuta un movimiento tan sucio que hasta el cosmos se sonroja",
        "realiza un ataque morboso que desafía toda decencia universal",
        "lanza un golpe tan perverso que las dimensiones se avergüenzan",
        "invoca poderes tan cochinos que los dioses miran hacia otro lado",
        "ejecuta una técnica tan degenerada que rompe las leyes de la física y la moral"
    ];
    
    const battleOutcomes = [
        `${fighter1.name} domina con un ataque final devastadoramente sucio`,
        `${fighter2.name} triunfa usando técnicas prohibidas en 17 dimensiones`,
        `¡Empate morboso! Ambos guerreros quedan exhaustos pero excitados`,
        `La batalla es tan perversa que abre un portal a la dimensión del placer cósmico`,
        `${fighter1.name} y ${fighter2.name} se unen en una alianza bizarramente íntima`,
        `El combate trasciende lo físico y se vuelve una danza erótica interdimensional`,
        `Ambos luchadores colapsan por la intensidad morbosa de sus propios ataques`
    ];

    // Seleccionar ataques específicos del personaje o ataques sucios generales
    const getAttack = (characterKey) => {
        const specificAttacks = characterAttacks[characterKey] || [];
        const allAttacks = [...specificAttacks, ...dirtyAttacks];
        return allAttacks[Math.floor(Math.random() * allAttacks.length)];
    };
    
    // Encontrar las claves correctas de los personajes
    const fighter1Key = Object.keys(characterLore).find(key => characterLore[key].name === fighter1.name);
    const fighter2Key = Object.keys(characterLore).find(key => characterLore[key].name === fighter2.name);
    
    const action1 = getAttack(fighter1Key);
    const action2 = getAttack(fighter2Key);
    const outcome = battleOutcomes[Math.floor(Math.random() * battleOutcomes.length)];
    
    // Aplicar modificadores de mood a la batalla
    const moodModifier = currentMood.battleModifiers;
    let moodIntro = "";
    let moodOutro = "";
    
    if (moodModifier) {
        moodIntro = moodModifier.intro || "";
        moodOutro = moodModifier.outro || "";
    }
    
    return `${currentMood.emoji} **BATALLA ÉPICA INTERDIMENSIONAL** ${currentMood.emoji}
${moodIntro}

🌟 **ESCENARIO DE COMBATE:**
🏟️ ${scenario}

⚔️ **LUCHADORES:**
🥊 **${fighter1.name}** VS **${fighter2.name}** 🥊

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 **RONDA 1:**
💥 ${fighter1.name} ${action1}!
💬 *"${fighter1.quotes && fighter1.quotes.length > 0 ? fighter1.quotes[Math.floor(Math.random() * fighter1.quotes.length)] : '¡Prepárate para la batalla cósmica!'}"*

⚡ **RONDA 2:**
💥 ${fighter2.name} ${action2}!
💬 *"${fighter2.quotes && fighter2.quotes.length > 0 ? fighter2.quotes[Math.floor(Math.random() * fighter2.quotes.length)] : '¡El poder del universo está conmigo!'}"*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎊 **RESULTADO FINAL:**
🏆 ${outcome}

${moodOutro}
✨ *El cosmos tiembla ante esta batalla legendaria del universo Dr. Pene* ✨
🌌 *Las dimensiones se estremecen con la épica confrontación* 🌌
💫 *¡Una batalla que será recordada por toda la eternidad!* 💫`;
}

// Comandos slash mejorados
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Dr.Salitas responde con su estilo único!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('chiste')
        .setDescription('Dr.Salitas te cuenta un chiste bizarro!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('frase')
        .setDescription('Dr.Salitas dice una frase típica del universo!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('personalidad')
        .setDescription('Conoce más sobre Dr.Salitas, el perrito con terno!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('memoria')
        .setDescription('Ver estadísticas de memoria del Dr.Salitas!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Información detallada de los personajes del universo Dr. Pene!')
        .addStringOption(option =>
            option.setName('personaje')
                .setDescription('Elige un personaje')
                .setRequired(true)
                .addChoices(
                    { name: 'Ivan / Dr. Pene', value: 'ivan' },
                    { name: 'Dani / ChoroPC', value: 'dani' },
                    { name: 'Emanuel', value: 'emanuel' },
                    { name: 'Toromasu', value: 'toromasu' },
                    { name: 'Dr. Salitas', value: 'dr.salitas' },
                    { name: 'Dr. Piña', value: 'dr.pina' }
                ))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('batalla')
        .setDescription('¡Genera batallas épicas entre personajes del universo!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('cosmic')
        .setDescription('¡Frases cósmicas aleatorias del universo Dr. Pene!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('mood')
        .setDescription('¡Consulta el estado de ánimo actual del Dr. Salitas!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('patrones')
        .setDescription('¡Ver estadísticas del sistema de detección de patrones!')
        .toJSON()
];

// Registrar comandos slash
async function registerCommands() {
    try {
        logger.system('Registrando comandos slash...');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        logger.system('Comandos slash registrados exitosamente');
    } catch (error) {
        logger.error('Error registrando comandos', error);
    }
}

// Evento cuando el bot está listo
client.once('clientReady', async () => {
    try {
        // Inicializar base de datos
        await database.initialize();
        
        // Registrar comandos
        await registerCommands();
        
        logger.discord(`${client.user.tag} está conectado y listo`, { 
            guilds: client.guilds.cache.size,
            users: client.users.cache.size 
        });
        logger.system('Dr.Salitas: El perrito con terno más bizarro está online');
        
        // Registrar información del bot en la base de datos
        await database.runQuery(`
            INSERT OR REPLACE INTO bot_config (key, value, description)
            VALUES 
                ('bot_name', ?, 'Nombre del bot'),
                ('bot_id', ?, 'ID del bot'),
                ('startup_time', ?, 'Última vez que se inició el bot')
        `, [client.user.tag, client.user.id, new Date().toISOString()]);
        
    } catch (error) {
        logger.error('Error durante la inicialización del bot', error);
    }
});

// Manejar comandos slash con personalidad
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        // Manejar interacciones de botones para batallas
        if (interaction.customId.startsWith('battle_')) {
            const characterId = interaction.customId.replace('battle_', '');
            
            // Si no hay primer luchador seleccionado
            if (!interaction.message.embeds[0].description.includes('✅ Primer luchador:')) {
                // Actualizar embed para segundo luchador
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FF6B35')
                    .setTitle('⚔️ ARENA DE BATALLA ÉPICA ⚔️')
                    .setDescription(`✅ Primer luchador: ${getCharacterName(characterId)}\n\n🔥 **Ahora elige al segundo luchador:**`)
                    .setFooter({ text: 'Dr. Salitas presenta: Batallas del Universo Dr. Pene' })
                    .setTimestamp();

                // Crear botones excluyendo el ya seleccionado
                const availableButtons = createBattleButtons(characterId);
                
                await interaction.update({
                    embeds: [updatedEmbed],
                    components: availableButtons
                });
            } else {
                // Ya hay primer luchador, procesar batalla
                const firstFighter = extractFirstFighter(interaction.message.embeds[0].description);
                const secondFighter = getCharacterName(characterId);
                
                logger.debug('Procesando batalla', { 
                    firstFighter, 
                    secondFighter,
                    user: interaction.user.username 
                });
                
                // Buscar los objetos completos de los personajes en characterLore
                const fighter1Data = Object.values(characterLore).find(char => char.name === firstFighter);
                const fighter2Data = Object.values(characterLore).find(char => char.name === secondFighter);
                
                logger.debug('Datos de luchadores', { 
                    fighter1Found: !!fighter1Data, 
                    fighter2Found: !!fighter2Data 
                });
                
                // Verificar que ambos luchadores existan
                if (!fighter1Data || !fighter2Data) {
                    await interaction.update({
                        content: '❌ Error: No se pudieron encontrar los datos de los luchadores. Intenta de nuevo.',
                        embeds: [],
                        components: []
                    });
                    return;
                }
                
                // Mostrar animación de batalla
                await interaction.update({
                    content: '⚔️ **¡LUCHANDO...!** ⚔️\n\n🔥 Los guerreros se preparan para el combate épico...\n💥 Las energías cósmicas chocan en el aire...\n⚡ ¡El destino se decide ahora!',
                    embeds: [],
                    components: []
                });
                
                // Esperar 3 segundos para crear suspense
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Generar batalla épica con los objetos completos
                const battleResult = generateEpicBattle(fighter1Data, fighter2Data);
                
                await interaction.editReply({
                    content: battleResult,
                    embeds: [],
                    components: []
                });
            }
        }
        return;
    }
    
    if (interaction.isChatInputCommand()) {
        // Validar comando slash antes de procesarlo
        const commandData = {
            commandName: interaction.commandName,
            userId: interaction.user.id,
            guildId: interaction.guild?.id || null,
            options: {}
        };

        // Extraer opciones si existen
        if (interaction.options) {
            for (const option of interaction.options.data) {
                commandData.options[option.name] = option.value;
            }
        }

        // Validar el comando
        const validationResult = validation.validateSlashCommand(commandData);
        if (!validationResult.isValid) {
            logger.warn('Comando slash inválido rechazado', null, {
                userId: interaction.user.id,
                command: interaction.commandName,
                error: validationResult.error
            });
            await interaction.reply({
                content: '❌ **Error de validación:** El comando contiene datos no válidos.',
                flags: 64 // MessageFlags.Ephemeral
            });
            return;
        }

        // Verificar rate limiting
        const rateLimitResult = validation.checkRateLimit(interaction.user.id);
        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit excedido para comando', null, {
                userId: interaction.user.id,
                command: interaction.commandName,
                reason: rateLimitResult.reason
            });
            await interaction.reply({
                content: `⏰ **Límite de velocidad:** ${rateLimitResult.reason}. Intenta de nuevo más tarde.`,
                flags: 64 // MessageFlags.Ephemeral
            });
            return;
        }

        // Manejar comandos slash existentes
        const startTime = Date.now();
        let commandSuccess = true;
        let errorMessage = null;
        
        try {
            switch (interaction.commandName) {
                case 'ping':
                    // Verificar cache primero
                    const cachedPing = cache.getCommand('ping', interaction.user.id);
                    if (cachedPing) {
                        await interaction.reply(cachedPing);
                    } else {
                        const response = drSalitas.getPingResponse();
                        cache.setCommand('ping', interaction.user.id, response, 60); // Cache por 1 minuto
                        await interaction.reply(response);
                    }
                    break;
                    
                case 'chiste':
                    // Verificar cache primero
                    const cachedJoke = cache.getCommand('chiste', interaction.user.id);
                    if (cachedJoke) {
                        await interaction.reply(cachedJoke);
                    } else {
                        const joke = drSalitas.getRandomJoke();
                        cache.setCommand('chiste', interaction.user.id, joke, 300); // Cache por 5 minutos
                        await interaction.reply(joke);
                    }
                    break;
                    
                case 'frase':
                    // Verificar cache primero
                    const cachedPhrase = cache.getCommand('frase', interaction.user.id);
                    if (cachedPhrase) {
                        await interaction.reply(cachedPhrase);
                    } else {
                        const phrase = drSalitas.getRandomPhrase();
                        cache.setCommand('frase', interaction.user.id, phrase, 300); // Cache por 5 minutos
                        await interaction.reply(phrase);
                    }
                    break;
                    
                case 'personalidad':
                    const personalityInfo = `🐕‍🦺 **Dr.Salitas** 👔
                    
¡Ey wea! Soy Dr.Salitas, un perrito con terno bien vestido pero de lo más ordinario, bizarro y desubicado que hay! 🤵‍♂️

**Mis especialidades:**
• Chistes ordinarios pero elegantes 🎩
• Reacciones bizarras a todo 🤪  
• Frases desubicadas pero con clase 👔
• Ser el más culiao pero caballero 🐕‍🦺

¡Úsame con los comandos /ping, /chiste, /frase o simplemente menciona "moco" para ver mi reacción! 😏`;
                    
                    await interaction.reply(personalityInfo);
                    break;
                    
                case 'memoria':
                    // Verificar cache primero
                    const cachedMemory = cache.getStats('memory');
                    if (cachedMemory) {
                        await interaction.reply(cachedMemory);
                    } else {
                        const memoryStats = contextualMemory.getMemoryStats();
                        const memoryInfo = `🧠 **Memoria Dr.Salitas** 📊

**Estadísticas Generales:**
👥 Usuarios conocidos: ${memoryStats.totalUsers}
💬 Usuarios activos: ${memoryStats.activeUsers}
📝 Total mensajes recordados: ${memoryStats.totalMessages}

**Top Usuarios más Activos:**
${memoryStats.topUsers.map((user, index) => 
    `${index + 1}. **${user.username}** - ${user.messages} mensajes`
).join('\n')}

¡Dr.Salitas nunca olvida a sus amigos culiaos! 🐕🧠`;
                        
                        cache.setStats('memory', memoryInfo, 600); // Cache por 10 minutos
                        await interaction.reply(memoryInfo);
                    }
                    break;
                    
                case 'lore':
                    const personaje = interaction.options.getString('personaje');
                    
                    // Verificar cache primero
                    const cachedLore = cache.get(`lore:${personaje}`);
                    if (cachedLore) {
                        await interaction.reply(cachedLore);
                        break;
                    }
                    
                    const loreData = characterLore[personaje];
                    
                    if (!loreData) {
                        await interaction.reply('¡Ey wea! ¡Ese personaje no existe en mi universo bizarro! 🤔');
                        return;
                    }
                    
                    const loreEmbed = `🌌 **${loreData.name}** 🌌
**${loreData.title}**

📖 **Descripción:**
${loreData.description}

✨ **Características:**
${loreData.characteristics.join('\n')}

📚 **Historia:**
${loreData.backstory}

⚡ **Poderes:**
${loreData.powers.map(power => `• ${power}`).join('\n')}

💬 **Frases Icónicas:**
${loreData.quotes.map(quote => `"${quote}"`).join('\n')}

🤝 **Relaciones:**
${Object.entries(loreData.relationships).map(([char, rel]) => `• **${char}**: ${rel}`).join('\n')}

¡Así es el lore épico del universo Dr. Pene, culiao! 🍆✨`;
                    
                    // Cachear el lore por 1 hora
                    cache.set(`lore:${personaje}`, loreEmbed, 3600);
                    await interaction.reply(loreEmbed);
                    break;
                    
                case 'batalla':
                    logger.command('batalla', interaction.user, interaction.guild, true);
                    try {
                        // Embed optimizado
                        const battleEmbed = new EmbedBuilder()
                            .setTitle('⚔️ ARENA DE BATALLA ÉPICA')
                            .setDescription('🔥 **¡Selecciona tu primer luchador!**\n\nElige sabiamente, cada personaje tiene habilidades únicas...')
                            .setColor(0xFF6B35)
                            .setFooter({ text: 'Dr. Salitas Battle System v2.0' });

                        // Botones optimizados - Primera fila
                        const row1 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('battle_ivan')
                                    .setLabel('🍆 Dr. Pene')
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId('battle_dani')
                                    .setLabel('🎮 ChoroPC')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('battle_emanuel')
                                    .setLabel('♾️ Infinito Emanuel')
                                    .setStyle(ButtonStyle.Success)
                            );

                        // Botones optimizados - Segunda fila
                        const row2 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('battle_toromasu')
                                    .setLabel('🥷 Chaos Lord Toromasu')
                                    .setStyle(ButtonStyle.Danger),
                                new ButtonBuilder()
                                    .setCustomId('battle_dr.salitas')
                                    .setLabel('🤵 Dr. Salitas')
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId('battle_dr.pina')
                                    .setLabel('🍍 Dr. Piña')
                                    .setStyle(ButtonStyle.Secondary)
                            );

                        await interaction.reply({
                            embeds: [battleEmbed],
                            components: [row1, row2]
                        });
                        
                        logger.info('Comando batalla enviado correctamente', {
                            user: interaction.user.username,
                            guild: interaction.guild?.name
                        });
                    } catch (error) {
                        logger.error('Error en comando batalla', error, {
                            user: interaction.user.username,
                            guild: interaction.guild?.name
                        });
                        await interaction.reply({
                            content: '❌ Error al crear la batalla. Intenta de nuevo.',
                            flags: 64 // MessageFlags.Ephemeral
                        });
                    }
                    break;
                    
                case 'cosmic':
                    // Verificar cache primero
                    const cachedCosmic = cache.getCommand('cosmic', interaction.user.id);
                    if (cachedCosmic) {
                        await interaction.reply(cachedCosmic);
                    } else {
                        const randomPhrase = cosmicPhrases[Math.floor(Math.random() * cosmicPhrases.length)];
                        const cosmicResponse = `${randomPhrase}

*Dr.Salitas contempla el cosmos con su terno elegante mientras susurra sabiduría bizarra* 🐕👔✨`;
                        
                        cache.setCommand('cosmic', interaction.user.id, cosmicResponse, 180); // Cache por 3 minutos
                        await interaction.reply(cosmicResponse);
                    }
                    break;
                    
                case 'mood':
                    // Verificar cache primero
                    const cachedMood = cache.getStats('mood');
                    if (cachedMood) {
                        await interaction.reply(cachedMood);
                    } else {
                        const currentMood = moodSystem.getCurrentMood();
                        const moodReport = moodSystem.getMoodReport();
                        
                        const moodResponse = `${currentMood.emoji} **${currentMood.name}** ${currentMood.emoji}

${currentMood.description}

**🎭 Características actuales:**
${currentMood.characteristics.map(char => `• ${char}`).join('\n')}

**💬 Saludo típico:**
"${currentMood.greeting}"

**⏰ Horario:** ${moodReport.timeRange}
**🌡️ Intensidad:** ${moodReport.intensity}

*${moodReport.specialNote}* 🐕👔`;
                        
                        cache.setStats('mood', moodResponse, 300); // Cache por 5 minutos
                        await interaction.reply(moodResponse);
                    }
                    break;
                    
                case 'patrones':
                    // Verificar cache primero
                    const cachedPatterns = cache.getStats('patterns');
                    if (cachedPatterns) {
                        await interaction.reply(cachedPatterns);
                    } else {
                        const patternStats = patternDetection.getPatternStats();
                        
                        // Formatear distribución de emociones
                        const emotionList = Object.entries(patternStats.emotionDistribution)
                            .map(([emotion, count]) => `• ${emotion}: ${count} usuarios`)
                            .join('\n') || '• No hay datos aún';
                        
                        // Formatear tópicos populares
                        const topicList = Object.entries(patternStats.popularTopics)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([topic, count]) => `• ${topic}: ${count} menciones`)
                            .join('\n') || '• No hay datos aún';
                        
                        const patternResponse = `🧠 **SISTEMA DE DETECCIÓN DE PATRONES** 🧠

**📊 Estadísticas Generales:**
• Usuarios monitoreados: ${patternStats.totalUsers}
• Usuarios "triggeados": ${patternStats.triggeredUsers}
• Intensidad promedio: ${patternStats.averageIntensity.toFixed(1)}/10

**😤 Distribución Emocional:**
${emotionList}

**🔥 Tópicos Más Populares:**
${topicList}

**🤖 Estado del Sistema:**
• Análisis en tiempo real: ✅ Activo
• Respuestas adaptativas: ✅ Funcionando
• Detección de spam: ✅ Operativo

*¡El Dr. Salitas está siempre observando y analizando! 👁️🐕👔*`;
                        
                        cache.setStats('patterns', patternResponse, 300); // Cache por 5 minutos
                        await interaction.reply(patternResponse);
                    }
                    break;
            }
        } catch (error) {
            commandSuccess = false;
            errorMessage = error.message;
            
            logger.error('Error en comando slash', error, {
                command: interaction.commandName,
                user: interaction.user.username,
                userId: interaction.user.id,
                guild: interaction.guild?.name,
                guildId: interaction.guild?.id,
                errorMessage: error.message,
                errorStack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            // Intentar responder al usuario si la interacción no ha sido respondida
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '¡Ey wea! ¡Algo salió mal pero sigo siendo elegante! 🐕‍🦺👔\n*Error interno del sistema*',
                        flags: 64 // MessageFlags.Ephemeral
                    });
                } else if (interaction.deferred) {
                    await interaction.editReply({
                        content: '¡Ey wea! ¡Algo salió mal pero sigo siendo elegante! 🐕‍🦺👔\n*Error interno del sistema*'
                    });
                }
            } catch (replyError) {
                logger.error('Error del cliente Discord', replyError, {
                    originalError: error.message,
                    originalStack: error.stack,
                    replyErrorMessage: replyError.message,
                    replyErrorStack: replyError.stack,
                    command: interaction.commandName,
                    user: interaction.user.username
                });
            }
        } finally {
            // Registrar uso del comando en la base de datos
            const executionTime = Date.now() - startTime;
            
            try {
                await database.logCommand({
                    commandName: interaction.commandName,
                    userId: interaction.user.id,
                    guildId: interaction.guild?.id || null,
                    success: commandSuccess,
                    executionTime: executionTime,
                    errorMessage: errorMessage
                });
            } catch (dbError) {
                logger.error('Error registrando comando en base de datos', dbError);
            }
        }
    } else if (interaction.isButton()) {
        // Manejar interacciones de botones para la batalla
        if (interaction.customId.startsWith('battle_')) {
            const selectedCharacter = interaction.customId.replace('battle_', '');
            
            // Verificar si ya hay un primer luchador seleccionado
            if (!interaction.message.embeds[0].description.includes('segundo luchador')) {
                // Primer luchador seleccionado
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FF6B35')
                    .setTitle('⚔️ ARENA DE BATALLA ÉPICA ⚔️')
                    .setDescription(`¡Primer luchador seleccionado: **${characterLore[selectedCharacter].name}**!\n\n🔥 **Ahora elige al segundo luchador:**`)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1234567890/battle-arena.png')
                    .setFooter({ text: 'Dr. Salitas presenta: Batallas del Universo Dr. Pene' })
                    .setTimestamp();

                // Crear botones excluyendo el personaje ya seleccionado
                const availableButtons1 = new ActionRowBuilder();
                const availableButtons2 = new ActionRowBuilder();
                
                const characters = [
                     { id: 'ivan', label: 'Dr. Pene', emoji: '🧮', style: ButtonStyle.Primary },
                     { id: 'dani', label: 'ChoroPC', emoji: '💻', style: ButtonStyle.Primary },
                     { id: 'emanuel', label: 'Emanuel', emoji: '📱', style: ButtonStyle.Primary },
                     { id: 'toromasu', label: 'Toromasu', emoji: '⚔️', style: ButtonStyle.Secondary },
                     { id: 'dr.salitas', label: 'Dr. Salitas', emoji: '🐕', style: ButtonStyle.Secondary },
                     { id: 'dr.pina', label: 'Dr. Piña', emoji: '🍍', style: ButtonStyle.Secondary }
                 ];

                let buttonCount = 0;
                characters.forEach(char => {
                    if (char.id !== selectedCharacter) {
                        const button = new ButtonBuilder()
                            .setCustomId(`battle2_${selectedCharacter}_${char.id}`)
                            .setLabel(char.label)
                            .setEmoji(char.emoji)
                            .setStyle(char.style);
                        
                        if (buttonCount < 3) {
                            availableButtons1.addComponents(button);
                        } else {
                            availableButtons2.addComponents(button);
                        }
                        buttonCount++;
                    }
                });

                await interaction.update({
                    embeds: [updatedEmbed],
                    components: [availableButtons1, availableButtons2]
                });
            }
        } else if (interaction.customId.startsWith('battle2_')) {
            // Segundo luchador seleccionado - generar batalla
            const [, char1, char2] = interaction.customId.split('_');
            
            const fighter1 = characterLore[char1];
            const fighter2 = characterLore[char2];
            const scenario = battleScenarios[Math.floor(Math.random() * battleScenarios.length)];
            
            // Generar batalla épica
            const battleResult = generateEpicBattle(fighter1, fighter2, scenario);
            
            await interaction.update({
                content: battleResult,
                embeds: [],
                components: []
            });
        }
    }
});

// Manejar mensajes con personalidad inteligente y detección de patrones
client.on('messageCreate', async (message) => {
    // Ignorar mensajes del bot
    if (message.author.bot) return;

    // Validar mensaje antes de procesarlo
    const messageData = {
        content: message.content,
        userId: message.author.id,
        guildId: message.guild?.id || null,
        channelId: message.channel.id
    };

    const validationResult = validation.validateUserMessage(messageData);
    if (!validationResult.isValid) {
        logger.warn('Mensaje inválido rechazado', null, {
            userId: message.author.id,
            guildId: message.guild?.id,
            error: validationResult.error,
            content: message.content.substring(0, 50)
        });
        
        // Solo responder si es contenido peligroso, no por límites de longitud
        if (validationResult.error === 'Contenido no permitido') {
            try {
                await message.reply('⚠️ **Contenido no permitido detectado.** Por favor, evita usar contenido potencialmente peligroso.');
            } catch (error) {
                logger.error('Error enviando mensaje de validación', error);
            }
        }
        return;
    }

    // Verificar rate limiting para mensajes
    const rateLimitResult = validation.checkRateLimit(message.author.id);
    if (!rateLimitResult.allowed) {
        logger.debug('Rate limit aplicado a mensaje', {
            userId: message.author.id,
            reason: rateLimitResult.reason
        });
        // No responder por rate limit en mensajes normales, solo registrar
        return;
    }

    const messageContent = validationResult.sanitized.content.toLowerCase();
    
    try {
        // Registrar usuario y guild en la base de datos
        await database.createOrUpdateUser({
            id: message.author.id,
            username: message.author.username,
            displayName: message.author.displayName || message.author.username
        });

        if (message.guild) {
            await database.createOrUpdateGuild({
                id: message.guild.id,
                name: message.guild.name,
                ownerId: message.guild.ownerId,
                memberCount: message.guild.memberCount
            });
        }

        // Recordar mensaje en memoria contextual
        contextualMemory.rememberMessage(
            message.author.id, 
            message.author.username, 
            message, 
            message.channel.id
        );
        
        // Registrar mensaje en la base de datos
        await database.logMessage({
            id: message.id,
            userId: message.author.id,
            guildId: message.guild?.id || null,
            channelId: message.channel.id,
            content: validationResult.sanitized.content, // Usar contenido sanitizado
            messageType: 'user',
            sentimentScore: null, // Se puede agregar análisis de sentimiento después
            patternDetected: [],
            responseGenerated: false
        });
        
    } catch (error) {
        logger.error('Error registrando mensaje en base de datos', error, {
            messageId: message.id,
            userId: message.author.id,
            guildId: message.guild?.id
        });
    }
    
    // Sistema de reacciones automáticas
    addAutomaticReactions(message, messageContent);
    
    // Respuesta especial para "moco" - siempre responde (prioridad máxima)
    if (messageContent.includes('moco')) {
        // Verificar cache para respuesta de moco
        const cacheKey = `moco_response_${message.author.id}`;
        const cachedMocoResponse = cache.getPersonalityResponse(cacheKey);
        
        if (cachedMocoResponse) {
            message.reply(cachedMocoResponse);
        } else {
            const mocoResponse = drSalitas.getMocoResponse();
            cache.setPersonalityResponse(cacheKey, mocoResponse, 60); // Cache por 1 minuto
            message.reply(mocoResponse);
        }
        return;
    }
    
    // Responder a menciones directas del bot - siempre responde (prioridad máxima)
    if (message.mentions.has(client.user)) {
        // Verificar cache para respuesta inteligente
        const cacheKey = `smart_response_${message.author.id}_${message.content.slice(0, 50)}`;
        const cachedSmartResponse = cache.getPersonalityResponse(cacheKey);
        
        if (cachedSmartResponse) {
            message.reply(cachedSmartResponse);
        } else {
            const smartResponse = drSalitas.getSmartResponse(message.content);
            cache.setPersonalityResponse(cacheKey, smartResponse, 300); // Cache por 5 minutos
            message.reply(smartResponse);
        }
        return;
    }
    
    // Analizar patrones en el mensaje
    const patternAnalysis = patternDetection.analyzeMessage(
        message.author.id,
        message.author.username,
        message.content,
        message.createdTimestamp
    );
    
    // Verificar si el sistema de patrones recomienda responder
    if (patternAnalysis.recommendedResponse.shouldRespond) {
        const patternResponse = patternResponses.getResponse(patternAnalysis, message.author.username);
        
        // Verificar si la respuesta es muy similar a la anterior
        if (patternDetection.isResponseTooSimilar(message.author.id, patternResponse)) {
            // Intentar obtener una respuesta diferente
            const alternativeResponse = patternResponses.getResponse(
                {...patternAnalysis, recommendedResponse: {...patternAnalysis.recommendedResponse, responseType: 'chaotic'}}, 
                message.author.username
            );
            
            if (!patternDetection.isResponseTooSimilar(message.author.id, alternativeResponse)) {
                patternDetection.markResponseSent(message.author.id, alternativeResponse);
                message.reply(alternativeResponse);
                return;
            }
            // Si ambas respuestas son similares, no responder esta vez
            return;
        }
        
        // Marcar respuesta enviada para cooldowns
        patternDetection.markResponseSent(message.author.id, patternResponse);
        
        // Si el usuario está muy triggeado, posible spam de respuestas
        if (patternResponses.shouldSpamResponses(patternAnalysis)) {
            const multipleResponses = patternResponses.getMultipleResponses(patternAnalysis, message.author.username, 2);
            
            // Enviar primera respuesta inmediatamente
            message.reply(multipleResponses[0]);
            
            // Enviar segunda respuesta con delay solo si es diferente
            if (!patternDetection.isResponseTooSimilar(message.author.id, multipleResponses[1])) {
                setTimeout(() => {
                    message.channel.send(multipleResponses[1]);
                }, 2000 + Math.random() * 3000); // 2-5 segundos de delay
            }
            
            return;
        }
        
        // Respuesta normal basada en patrones
        message.reply(patternResponse);
        return;
    }
    
    // Intentar generar respuesta contextual personalizada (solo si patrones no respondió)
    const contextualResponse = contextualMemory.generateContextualResponse(message.author.id, message);
    if (contextualResponse && Math.random() < 0.2) { // Reducido a 20% para dar prioridad a patrones
        // Verificar cache para respuesta contextual
        const cacheKey = `contextual_${message.author.id}_${message.content.slice(0, 30)}`;
        const cachedContextualResponse = cache.getPersonalityResponse(cacheKey);
        
        if (cachedContextualResponse) {
            message.reply(cachedContextualResponse);
        } else {
            cache.setPersonalityResponse(cacheKey, contextualResponse, 180); // Cache por 3 minutos
            message.reply(contextualResponse);
        }
        return;
    }

    // Respuestas inteligentes para palabras clave con probabilidades variables (reducidas)
    const highPriorityKeywords = ['pene', 'wea', 'culiao', 'conchetumare', 'ctm', 'moco']; // 25% probabilidad
    const mediumPriorityKeywords = ['asco', 'cochino', 'bizarro', 'ordinario', 'pico', 'raja', 'maricon', 'aweonao', 'bastardo', 'gil', 'sapo', 'tonto', 'dormir', 'sueño', 'insomnio', 'problemas']; // 15% probabilidad
    const lowPriorityKeywords = ['elegante', 'terno', 'perro', 'doctor', 'ano', 'culo', 'pichula', 'flaite', 'ted', 'pajero', 'estúpido', 'reculiao', 'cansado', 'aburrido']; // 10% probabilidad
    
    // Palabras clave especiales que siempre responden
    const alwaysRespondKeywords = ['moco', 'dr salitas', 'dr.salitas', 'salitas'];
    
    // Verificar palabras clave que siempre responden
    if (alwaysRespondKeywords.some(keyword => messageContent.includes(keyword))) {
        // Crear contexto para respuestas más inteligentes
        const context = {
            timeOfDay: getTimeOfDay(),
            isKnownUser: contextualMemory.hasUserHistory(message.author.id),
            excitement: messageContent.includes('!') || messageContent.includes('genial') || messageContent.includes('bacán'),
            confusion: messageContent.includes('?') || messageContent.includes('qué') || messageContent.includes('como')
        };
        
        // Verificar cache para respuesta especial
        const cacheKey = `always_respond_${message.author.id}_${message.content.slice(0, 40)}`;
        const cachedSpecialResponse = cache.getPersonalityResponse(cacheKey);
        
        if (cachedSpecialResponse) {
            message.reply(cachedSpecialResponse);
        } else {
            const smartResponse = drSalitas.getSmartResponse(message.content, context);
            cache.setPersonalityResponse(cacheKey, smartResponse, 120); // Cache por 2 minutos
            message.reply(smartResponse);
        }
        return;
    }
    
    // Verificar palabras clave de alta prioridad
    if (highPriorityKeywords.some(keyword => messageContent.includes(keyword))) {
        if (Math.random() < 0.15) { // Reducido de 20% a 15%
            // Crear contexto para respuestas más inteligentes
            const context = {
                timeOfDay: getTimeOfDay(),
                isKnownUser: contextualMemory.hasUserHistory(message.author.id),
                excitement: messageContent.includes('!') || messageContent.includes('genial') || messageContent.includes('bacán'),
                confusion: messageContent.includes('?') || messageContent.includes('qué') || messageContent.includes('como')
            };
            
            // Verificar cache para respuesta de alta prioridad
            const cacheKey = `high_priority_${message.author.id}_${message.content.slice(0, 40)}`;
            const cachedHighResponse = cache.getPersonalityResponse(cacheKey);
            
            if (cachedHighResponse) {
                message.reply(cachedHighResponse);
            } else {
                const smartResponse = drSalitas.getSmartResponse(message.content, context);
                cache.setPersonalityResponse(cacheKey, smartResponse, 240); // Cache por 4 minutos
                message.reply(smartResponse);
            }
            return;
        }
    }
    
    // Verificar palabras clave de prioridad media
    if (mediumPriorityKeywords.some(keyword => messageContent.includes(keyword))) {
        if (Math.random() < 0.08) { // Reducido de 12% a 8%
            // Crear contexto para respuestas más inteligentes
            const context = {
                timeOfDay: getTimeOfDay(),
                isKnownUser: contextualMemory.hasUserHistory(message.author.id),
                excitement: messageContent.includes('!') || messageContent.includes('genial') || messageContent.includes('bacán'),
                confusion: messageContent.includes('?') || messageContent.includes('qué') || messageContent.includes('como')
            };
            
            // Verificar cache para respuesta de prioridad media
            const cacheKey = `medium_priority_${message.author.id}_${message.content.slice(0, 40)}`;
            const cachedMediumResponse = cache.getPersonalityResponse(cacheKey);
            
            if (cachedMediumResponse) {
                message.reply(cachedMediumResponse);
            } else {
                const smartResponse = drSalitas.getSmartResponse(message.content, context);
                cache.setPersonalityResponse(cacheKey, smartResponse, 300); // Cache por 5 minutos
                message.reply(smartResponse);
            }
            return;
        }
    }
    
    // Verificar palabras clave de baja prioridad
    if (lowPriorityKeywords.some(keyword => messageContent.includes(keyword))) {
        if (Math.random() < 0.05) { // Reducido de 8% a 5%
            // Crear contexto para respuestas más inteligentes
            const context = {
                timeOfDay: getTimeOfDay(),
                isKnownUser: contextualMemory.hasUserHistory(message.author.id),
                excitement: messageContent.includes('!') || messageContent.includes('genial') || messageContent.includes('bacán'),
                confusion: messageContent.includes('?') || messageContent.includes('qué') || messageContent.includes('como')
            };
            
            // Verificar cache para respuesta de baja prioridad
            const cacheKey = `low_priority_${message.author.id}_${message.content.slice(0, 40)}`;
            const cachedLowResponse = cache.getPersonalityResponse(cacheKey);
            
            if (cachedLowResponse) {
                message.reply(cachedLowResponse);
            } else {
                const smartResponse = drSalitas.getSmartResponse(message.content, context);
                cache.setPersonalityResponse(cacheKey, smartResponse, 360); // Cache por 6 minutos
                message.reply(smartResponse);
            }
            return;
        }
    }

    // Sistema de saludos y despedidas espontáneos (nueva funcionalidad)
    if (drSalitas.isGreeting(messageContent) || drSalitas.isFarewell(messageContent)) {
        // Probabilidad más alta para saludos y despedidas directos
        if (Math.random() < 0.25) { // Reducido de 35% a 25%
            const context = {
                timeOfDay: getTimeOfDay(),
                isKnownUser: contextualMemory.hasUserHistory(message.author.id),
                excitement: messageContent.includes('!'),
                confusion: false
            };
            
            const greetingResponse = drSalitas.getSmartResponse(message.content, context);
            if (greetingResponse) {
                message.reply(greetingResponse);
                return;
            }
        }
    }

    // Sistema de saludos espontáneos sin ser mencionado (probabilidad baja pero presente)
    if (!message.mentions.has(client.user) && Math.random() < 0.03) { // Reducido de 5% a 3%
        const context = {
            timeOfDay: getTimeOfDay(),
            isKnownUser: contextualMemory.hasUserHistory(message.author.id),
            excitement: messageContent.includes('!') || messageContent.includes('genial') || messageContent.includes('bacán'),
            confusion: messageContent.includes('?') || messageContent.includes('qué') || messageContent.includes('como')
        };

        // Saludos espontáneos basados en patrones de conversación
        const spontaneousGreetings = [
            "¡Ey culiao! Dr.Salitas se mete en la conversa 🎩",
            "¡Wena hermano! ¿Puedo meterme en esta wea? 👔😄",
            "¡Hola bastardos! Dr.Salitas aparece de la nada como siempre",
            "¡Eyyy! El perrito más hijo de puta se suma a la charla",
            "¡Wena wn! Dr.Salitas detecta movimiento sospechoso 🐕‍🦺",
            "¡Hola culiaos! ¿Qué están tramando sin mí?",
            "¡Ey! Dr.Salitas anda weando por aquí también"
        ];

        // Despedidas espontáneas cuando detecta que alguien se va
        const spontaneousFarewells = [
            "¡Chao culiao! Dr.Salitas también se despide 👋",
            "¡Nos vemos hermano! El perrito elegante dice adiós",
            "¡Hasta luego bastardos! Dr.Salitas se retira con clase 🎩",
            "¡Chao wn! Que no te pase nada malo",
            "¡Adiós! Dr.Salitas vigila desde las sombras 🌙",
            "¡Nos vidimo culiao! Cuídate el hoyo",
            "¡Chao hijo de puta! Anda piola"
        ];

        // Decidir tipo de intervención espontánea
        let spontaneousResponse = null;
        
        if (drSalitas.isGreeting(messageContent)) {
            spontaneousResponse = spontaneousGreetings[Math.floor(Math.random() * spontaneousGreetings.length)];
        } else if (drSalitas.isFarewell(messageContent)) {
            spontaneousResponse = spontaneousFarewells[Math.floor(Math.random() * spontaneousFarewells.length)];
        } else if (context.excitement) {
            // Intervención por emoción alta
            const excitementResponses = [
                "¡Wena hermano! Dr.Salitas siente la energía culiá 🌟",
                "¡Ey! ¿Qué chucha está pasando aquí? ¡Me gusta! 🎉",
                "¡Bacán! Dr.Salitas se suma a la wea 🚀",
                "¡La cagó! ¿Qué onda la emoción?",
                "¡Pulento! Dr.Salitas también se prende"
            ];
            spontaneousResponse = excitementResponses[Math.floor(Math.random() * excitementResponses.length)];
        }

        if (spontaneousResponse) {
            // Delay aleatorio para hacer más natural la intervención
            setTimeout(() => {
                message.channel.send(spontaneousResponse);
            }, 1000 + Math.random() * 3000); // 1-4 segundos de delay
            return;
        }
    }
});

// Manejo de errores
client.on('error', (error) => {
    logger.error('Error del cliente Discord', error, {
        errorType: 'client_error',
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        timestamp: new Date().toISOString(),
        stack: error.stack
    });
});

process.on('unhandledRejection', (error) => {
    logger.error('Error no manejado', error);
});

// Funciones auxiliares para el sistema de batalla
function getCharacterName(characterId) {
    const characterMap = {
        'ivan': 'Dr. Pene',
        'dani': 'ChoroPC', 
        'emanuel': 'Infinito Emanuel',
        'toromasu': 'Chaos Lord Toromasu',
        'dr.salitas': 'Dr. Salitas',
        'dr.pina': 'Dr. Piña'
    };
    return characterMap[characterId] || characterId;
}

function extractFirstFighter(description) {
    // Buscar el patrón con emoji y formato actual
    const match = description.match(/✅ Primer luchador: (.+)/);
    return match ? match[1].trim() : '';
}

function createBattleButtons(excludeId) {
    const allCharacters = [
        { id: 'ivan', label: 'Dr. Pene', emoji: '🧮', style: ButtonStyle.Primary },
        { id: 'dani', label: 'ChoroPC', emoji: '💻', style: ButtonStyle.Primary },
        { id: 'emanuel', label: 'Infinito Emanuel', emoji: '♾️', style: ButtonStyle.Primary },
        { id: 'toromasu', label: 'Chaos Lord Toromasu', emoji: '⚔️', style: ButtonStyle.Secondary },
        { id: 'dr.salitas', label: 'Dr. Salitas', emoji: '🐕', style: ButtonStyle.Secondary },
        { id: 'dr.pina', label: 'Dr. Piña', emoji: '🍍', style: ButtonStyle.Secondary }
    ];
    
    const availableCharacters = allCharacters.filter(char => char.id !== excludeId);
    
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();
    
    availableCharacters.slice(0, 3).forEach(char => {
        row1.addComponents(
            new ButtonBuilder()
                .setCustomId(`battle_${char.id}`)
                .setLabel(char.label)
                .setEmoji(char.emoji)
                .setStyle(char.style)
        );
    });
    
    availableCharacters.slice(3).forEach(char => {
        row2.addComponents(
            new ButtonBuilder()
                .setCustomId(`battle_${char.id}`)
                .setLabel(char.label)
                .setEmoji(char.emoji)
                .setStyle(char.style)
        );
    });
    
    return row2.components.length > 0 ? [row1, row2] : [row1];
}

// Iniciar sesión
client.login(process.env.DISCORD_TOKEN);

// Sistema de Horarios y Eventos Automáticos
function setupScheduledMessages() {
    // Variable para almacenar el canal general (se configurará cuando el bot esté listo)
    let generalChannel = null;
    
    // Buscar canal general cuando el bot esté listo
    client.once('clientReady', () => {
        // Buscar un canal de texto general (puedes ajustar el nombre según tu servidor)
        const guild = client.guilds.cache.first(); // Toma el primer servidor
        if (guild) {
            generalChannel = guild.channels.cache.find(channel => 
                channel.type === 0 && // Canal de texto
                (channel.name.includes('general') || 
                 channel.name.includes('chat') || 
                 channel.name.includes('principal') ||
                 channel.permissionsFor(guild.members.me).has('SendMessages'))
            );
            
            if (generalChannel) {
                logger.system(`Sistema de horarios configurado para el canal: ${generalChannel.name}`);
            } else {
                logger.warn('No se encontró un canal apropiado para mensajes automáticos');
            }
        }
    });
    
    // Buenos días culiaos - 8:00 AM (Chile timezone)
    cron.schedule('0 8 * * *', () => {
        logger.system('Ejecutando job: Buenos días - 8:00 AM Chile');
        if (generalChannel) {
            const morningMessages = [
                "¡Buenos días culiaos! 🌅 Dr.Salitas ya está despierto y listo pa moquear",
                "¡Arriba perros! 🐕 Son las 8 AM y el Dr.Salitas ya anda con el terno puesto",
                "¡Buenos días wns! ☀️ Hora de levantarse que el universo Dr.Pene no se gobierna solo",
                "¡Despierten culiaos! 🌄 Dr.Salitas dice que es hora de empezar el día con estilo",
                "¡Buenos días bizarros! 🤵 El perrito elegante ya está listo para otro día épico"
            ];
            
            const randomMessage = morningMessages[Math.floor(Math.random() * morningMessages.length)];
            generalChannel.send(randomMessage)
                .then(() => logger.system('Mensaje de buenos días enviado exitosamente'))
                .catch(error => logger.error('Error enviando mensaje de buenos días:', error));
        } else {
            logger.warn('Canal general no disponible para mensaje de buenos días');
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Hora del almuerzo - 1:00 PM (13:00 hrs Chile)
    cron.schedule('0 13 * * *', () => {
        logger.system('Ejecutando job: Almuerzo - 1:00 PM Chile');
        if (generalChannel) {
            const lunchMessages = [
                "¡Hora del almuerzo culiaos! 🍽️ A comer weas que el Dr.Salitas tiene hambre",
                "¡Mediodía perros! 🕛 Hora de alimentar al perrito elegante",
                "¡A almorzar wns! 🥘 Dr.Salitas recomienda algo bizarro y nutritivo",
                "¡Lunch time culiaos! 🍕 El universo Dr.Pene necesita combustible",
                "¡Hora de la comida! 🍖 Dr.Salitas dice que coman algo digno de un perro con terno"
            ];
            
            const randomMessage = lunchMessages[Math.floor(Math.random() * lunchMessages.length)];
            generalChannel.send(randomMessage)
                .then(() => logger.system('Mensaje de almuerzo enviado exitosamente'))
                .catch(error => logger.error('Error enviando mensaje de almuerzo:', error));
        } else {
            logger.warn('Canal general no disponible para mensaje de almuerzo');
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Mensajes de fin de semana épicos - Viernes 6 PM
    cron.schedule('0 18 * * 5', () => {
        logger.system('Ejecutando job: Viernes épico - 6:00 PM Chile');
        if (generalChannel) {
            const fridayMessages = [
                "¡VIERNES CULIAOS! 🎉 Dr.Salitas declara oficialmente abierto el fin de semana épico",
                "¡Weekend mode activated! 🚀 El perrito con terno está listo para el relajo",
                "¡Viernes de Dr.Pene! 🍆🎊 Que comience la fiesta cósmica del fin de semana",
                "¡TGIF wns! 🥳 Dr.Salitas dice que es hora de celebrar como se debe",
                "¡Fin de semana bizarro incoming! 🌟 El universo Dr.Pene está de fiesta"
            ];
            
            const randomMessage = fridayMessages[Math.floor(Math.random() * fridayMessages.length)];
            generalChannel.send(randomMessage)
                .then(() => logger.system('Mensaje de viernes enviado exitosamente'))
                .catch(error => logger.error('Error enviando mensaje de viernes:', error));
        } else {
            logger.warn('Canal general no disponible para mensaje de viernes');
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Domingo por la noche - Preparación para la semana
    cron.schedule('0 20 * * 0', () => {
        logger.system('Ejecutando job: Domingo preparación - 8:00 PM Chile');
        if (generalChannel) {
            const sundayMessages = [
                "¡Domingo night culiaos! 🌙 Dr.Salitas se prepara para otra semana épica",
                "¡Sunday blues! 😔 Pero el Dr.Salitas nunca se rinde, mañana más aventuras",
                "¡Fin del weekend! 📅 El perrito elegante ya planea las travesuras de la semana",
                "¡Domingo de reflexión! 🤔 Dr.Salitas medita sobre los misterios del universo",
                "¡Ready for Monday! 💪 El Dr.Salitas nunca deja de ser bizarro y elegante"
            ];
            
            const randomMessage = sundayMessages[Math.floor(Math.random() * sundayMessages.length)];
            generalChannel.send(randomMessage)
                .then(() => logger.system('Mensaje de domingo enviado exitosamente'))
                .catch(error => logger.error('Error enviando mensaje de domingo:', error));
        } else {
            logger.warn('Canal general no disponible para mensaje de domingo');
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Mensaje de medianoche épico - Solo fines de semana
    cron.schedule('0 0 * * 6,0', () => {
        logger.system('Ejecutando job: Medianoche épica - 12:00 AM Weekend Chile');
        if (generalChannel) {
            const midnightMessages = [
                "¡Medianoche cósmica! 🌌 Dr.Salitas vigila el universo mientras duermen culiaos",
                "¡Midnight hour! 🕛 El perrito nocturno patrulla las dimensiones del Dr.Pene",
                "¡Hora bruja! 🧙‍♂️ Dr.Salitas conecta con las fuerzas místicas del cosmos",
                "¡Medianoche bizarra! 🌙 Solo los verdaderos fans del Dr.Pene están despiertos",
                "¡Cosmic midnight! ✨ El universo Dr.Salitas nunca duerme completamente"
            ];
            
            const randomMessage = midnightMessages[Math.floor(Math.random() * midnightMessages.length)];
            generalChannel.send(randomMessage)
                .then(() => logger.system('Mensaje de medianoche enviado exitosamente'))
                .catch(error => logger.error('Error enviando mensaje de medianoche:', error));
        } else {
            logger.warn('Canal general no disponible para mensaje de medianoche');
        }
    }, {
        timezone: "America/Santiago"
    });
}

// Inicializar sistema de horarios
setupScheduledMessages();

// Configurar limpieza periódica del sistema de patrones
function setupPatternCleanup() {
    // Limpiar datos antiguos cada 6 horas
    cron.schedule('0 */6 * * *', () => {
        logger.system('Ejecutando job: Limpieza de patrones - cada 6 horas');
        try {
            patternDetection.cleanup();
            logger.system('Limpieza de patrones completada exitosamente');
        } catch (error) {
            logger.error('Error en limpieza de patrones:', error);
        }
    }, {
        timezone: "America/Santiago"
    });
    
    logger.system('Sistema de limpieza de patrones configurado');
}

// Inicializar limpieza de patrones
setupPatternCleanup();

// Configurar limpieza periódica del sistema de validación
function setupValidationCleanup() {
    // Limpiar rate limits cada 2 horas
    cron.schedule('0 */2 * * *', () => {
        logger.system('Ejecutando job: Limpieza de validación - cada 2 horas');
        try {
            validation.cleanupRateLimits();
            logger.system('Limpieza de validación completada exitosamente');
        } catch (error) {
            logger.error('Error en limpieza de validación:', error);
        }
    }, {
        timezone: "America/Santiago"
    });
    
    logger.system('Sistema de limpieza de validación configurado');
}

// Inicializar limpieza de validación
setupValidationCleanup();

// Sistema Keep-Alive para Render
function setupKeepAlive() {
    // Crear servidor HTTP simple para keep-alive
    const http = require('http');
    const port = process.env.PORT || 3000;
    
    const server = http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'alive',
                bot: client.user ? client.user.tag : 'connecting',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                timezone: 'America/Santiago',
                nextJobs: {
                    morning: '08:00 AM Chile',
                    lunch: '01:00 PM Chile',
                    friday: '06:00 PM Friday Chile',
                    sunday: '08:00 PM Sunday Chile',
                    midnight: '12:00 AM Weekend Chile'
                }
            }));
        } else if (req.url === '/ping') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('pong');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Dr.Salitas Bot - Keep Alive Service');
        }
    });
    
    server.listen(port, () => {
        logger.system(`Keep-alive server iniciado en puerto ${port}`);
    });
    
    // Auto-ping cada 10 minutos para mantener vivo
    setInterval(() => {
        const now = new Date();
        logger.system(`Keep-alive ping - ${now.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`);
        
        // Verificar que los jobs estén programados
        const activeJobs = cron.getTasks();
        logger.system(`Jobs activos: ${activeJobs.size}`);
        
    }, 10 * 60 * 1000); // Cada 10 minutos
    
    logger.system('Sistema Keep-Alive configurado para Render');
}

// Solo inicializar keep-alive en producción (Render)
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    setupKeepAlive();
}