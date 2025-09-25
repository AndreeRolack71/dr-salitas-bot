require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const DrPenePersonality = require('./personality/drpene-personality');
const ContextualMemory = require('./memory/contextual-memory');
const MoodSystem = require('./mood/mood-system');
const PatternDetection = require('./patterns/pattern-detection');
const PatternResponses = require('./patterns/pattern-responses');
const { characterLore, cosmicPhrases, battleScenarios } = require('./data/character-lore');
const cron = require('node-cron');

// Crear instancia del bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Inicializar personalidad Dr.Salitas, memoria contextual, sistema de mood y detección de patrones
const drSalitas = new DrPenePersonality();
const contextualMemory = new ContextualMemory();
const moodSystem = new MoodSystem();
const patternDetection = new PatternDetection();
const patternResponses = new PatternResponses();

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
            message.react(randomEmoji).catch(console.error);
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
💬 *"${fighter1.quotes[Math.floor(Math.random() * fighter1.quotes.length)]}"*

⚡ **RONDA 2:**
💥 ${fighter2.name} ${action2}!
💬 *"${fighter2.quotes[Math.floor(Math.random() * fighter2.quotes.length)]}"*

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
        console.log('Registrando comandos slash...');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log('Comandos slash registrados exitosamente y wea!');
    } catch (error) {
        console.error('Error registrando comandos:', error);
    }
}

// Evento cuando el bot está listo
client.once('ready', async () => {
    console.log(`¡${client.user.tag} está conectado y listo pa moquear!`);
    console.log('🐕‍🦺 Dr.Salitas: ¡El perrito con terno más bizarro está online!');
    await registerCommands();
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
                
                console.log('🔍 Debug - Primer luchador:', firstFighter);
                console.log('🔍 Debug - Segundo luchador:', secondFighter);
                
                // Buscar los objetos completos de los personajes en characterLore
                const fighter1Data = Object.values(characterLore).find(char => char.name === firstFighter);
                const fighter2Data = Object.values(characterLore).find(char => char.name === secondFighter);
                
                console.log('🔍 Debug - Fighter1Data:', fighter1Data ? 'Encontrado' : 'NO ENCONTRADO');
                console.log('🔍 Debug - Fighter2Data:', fighter2Data ? 'Encontrado' : 'NO ENCONTRADO');
                
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
        // Manejar comandos slash existentes
        try {
            switch (interaction.commandName) {
                case 'ping':
                    await interaction.reply(drSalitas.getPingResponse());
                    break;
                    
                case 'chiste':
                    await interaction.reply(drSalitas.getRandomJoke());
                    break;
                    
                case 'frase':
                    await interaction.reply(drSalitas.getRandomPhrase());
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
                    
                    await interaction.reply(memoryInfo);
                    break;
                    
                case 'lore':
                    const personaje = interaction.options.getString('personaje');
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
                    
                    await interaction.reply(loreEmbed);
                    break;
                    
                case 'batalla':
                    console.log('🎮 Comando /batalla ejecutado por:', interaction.user.username);
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
                        
                        console.log('✅ Comando /batalla con botones enviado correctamente');
                    } catch (error) {
                        console.error('❌ Error en comando /batalla:', error);
                        await interaction.reply({
                            content: '❌ Error al crear la batalla. Intenta de nuevo.',
                            ephemeral: true
                        });
                    }
                    break;
                    
                case 'cosmic':
                    const randomPhrase = cosmicPhrases[Math.floor(Math.random() * cosmicPhrases.length)];
                    const cosmicResponse = `${randomPhrase}

*Dr.Salitas contempla el cosmos con su terno elegante mientras susurra sabiduría bizarra* 🐕👔✨`;
                    
                    await interaction.reply(cosmicResponse);
                    break;
                    
                case 'mood':
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
                    
                    await interaction.reply(moodResponse);
                    break;
                    
                case 'patrones':
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
                    
                    await interaction.reply(patternResponse);
                    break;
            }
        } catch (error) {
            console.error('Error en comando slash:', error);
            await interaction.reply('¡Ey wea! ¡Algo salió mal pero sigo siendo elegante! 🐕‍🦺👔');
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
client.on('messageCreate', (message) => {
    // Ignorar mensajes del bot
    if (message.author.bot) return;

    const messageContent = message.content.toLowerCase();
    
    // Recordar mensaje en memoria contextual
    contextualMemory.rememberMessage(
        message.author.id, 
        message.author.username, 
        message, 
        message.channel.id
    );
    
    // Sistema de reacciones automáticas
    addAutomaticReactions(message, messageContent);
    
    // Respuesta especial para "moco" - siempre responde (prioridad máxima)
    if (messageContent.includes('moco')) {
        message.reply(drSalitas.getMocoResponse());
        return;
    }
    
    // Responder a menciones directas del bot - siempre responde (prioridad máxima)
    if (message.mentions.has(client.user)) {
        message.reply(drSalitas.getSmartResponse(message.content));
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
        message.reply(contextualResponse);
        return;
    }

    // Respuestas inteligentes para palabras clave con probabilidades variables (reducidas)
    const highPriorityKeywords = ['pene', 'wea', 'culiao', 'conchetumare', 'ctm']; // 25% probabilidad
    const mediumPriorityKeywords = ['asco', 'cochino', 'bizarro', 'ordinario', 'pico', 'raja', 'maricon', 'aweonao', 'bastardo', 'gil', 'sapo', 'tonto']; // 15% probabilidad
    const lowPriorityKeywords = ['elegante', 'terno', 'perro', 'doctor', 'ano', 'culo', 'pichula', 'flaite', 'ted', 'pajero', 'estúpido', 'reculiao']; // 10% probabilidad
    
    // Verificar palabras clave de alta prioridad
    if (highPriorityKeywords.some(keyword => messageContent.includes(keyword))) {
        if (Math.random() < 0.2) { // 20% probabilidad
            message.reply(drSalitas.getSmartResponse(message.content));
            return;
        }
    }
    
    // Verificar palabras clave de prioridad media
    if (mediumPriorityKeywords.some(keyword => messageContent.includes(keyword))) {
        if (Math.random() < 0.12) { // 12% probabilidad
            message.reply(drSalitas.getSmartResponse(message.content));
            return;
        }
    }
    
    // Verificar palabras clave de baja prioridad
    if (lowPriorityKeywords.some(keyword => messageContent.includes(keyword))) {
        if (Math.random() < 0.08) { // 8% probabilidad
            message.reply(drSalitas.getSmartResponse(message.content));
            return;
        }
    }
});

// Manejo de errores
client.on('error', (error) => {
    console.error('Error del cliente Discord:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
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
    client.once('ready', () => {
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
                console.log(`🕐 Sistema de horarios configurado para el canal: ${generalChannel.name}`);
            } else {
                console.log('⚠️ No se encontró un canal apropiado para mensajes automáticos');
            }
        }
    });
    
    // Buenos días culiaos - 8:00 AM (Chile timezone)
    cron.schedule('0 8 * * *', () => {
        if (generalChannel) {
            const morningMessages = [
                "¡Buenos días culiaos! 🌅 Dr.Salitas ya está despierto y listo pa moquear",
                "¡Arriba perros! 🐕 Son las 8 AM y el Dr.Salitas ya anda con el terno puesto",
                "¡Buenos días wns! ☀️ Hora de levantarse que el universo Dr.Pene no se gobierna solo",
                "¡Despierten culiaos! 🌄 Dr.Salitas dice que es hora de empezar el día con estilo",
                "¡Buenos días bizarros! 🤵 El perrito elegante ya está listo para otro día épico"
            ];
            
            const randomMessage = morningMessages[Math.floor(Math.random() * morningMessages.length)];
            generalChannel.send(randomMessage);
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Hora del almuerzo - 1:00 PM (13:00 hrs Chile)
    cron.schedule('0 13 * * *', () => {
        if (generalChannel) {
            const lunchMessages = [
                "¡Hora del almuerzo culiaos! 🍽️ A comer weas que el Dr.Salitas tiene hambre",
                "¡Mediodía perros! 🕛 Hora de alimentar al perrito elegante",
                "¡A almorzar wns! 🥘 Dr.Salitas recomienda algo bizarro y nutritivo",
                "¡Lunch time culiaos! 🍕 El universo Dr.Pene necesita combustible",
                "¡Hora de la comida! 🍖 Dr.Salitas dice que coman algo digno de un perro con terno"
            ];
            
            const randomMessage = lunchMessages[Math.floor(Math.random() * lunchMessages.length)];
            generalChannel.send(randomMessage);
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Mensajes de fin de semana épicos - Viernes 6 PM
    cron.schedule('0 18 * * 5', () => {
        if (generalChannel) {
            const fridayMessages = [
                "¡VIERNES CULIAOS! 🎉 Dr.Salitas declara oficialmente abierto el fin de semana épico",
                "¡Weekend mode activated! 🚀 El perrito con terno está listo para el relajo",
                "¡Viernes de Dr.Pene! 🍆🎊 Que comience la fiesta cósmica del fin de semana",
                "¡TGIF wns! 🥳 Dr.Salitas dice que es hora de celebrar como se debe",
                "¡Fin de semana bizarro incoming! 🌟 El universo Dr.Pene está de fiesta"
            ];
            
            const randomMessage = fridayMessages[Math.floor(Math.random() * fridayMessages.length)];
            generalChannel.send(randomMessage);
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Domingo por la noche - Preparación para la semana
    cron.schedule('0 20 * * 0', () => {
        if (generalChannel) {
            const sundayMessages = [
                "¡Domingo night culiaos! 🌙 Dr.Salitas se prepara para otra semana épica",
                "¡Sunday blues! 😔 Pero el Dr.Salitas nunca se rinde, mañana más aventuras",
                "¡Fin del weekend! 📅 El perrito elegante ya planea las travesuras de la semana",
                "¡Domingo de reflexión! 🤔 Dr.Salitas medita sobre los misterios del universo",
                "¡Ready for Monday! 💪 El Dr.Salitas nunca deja de ser bizarro y elegante"
            ];
            
            const randomMessage = sundayMessages[Math.floor(Math.random() * sundayMessages.length)];
            generalChannel.send(randomMessage);
        }
    }, {
        timezone: "America/Santiago"
    });
    
    // Mensaje de medianoche épico - Solo fines de semana
    cron.schedule('0 0 * * 6,0', () => {
        if (generalChannel) {
            const midnightMessages = [
                "¡Medianoche cósmica! 🌌 Dr.Salitas vigila el universo mientras duermen culiaos",
                "¡Midnight hour! 🕛 El perrito nocturno patrulla las dimensiones del Dr.Pene",
                "¡Hora bruja! 🧙‍♂️ Dr.Salitas conecta con las fuerzas místicas del cosmos",
                "¡Medianoche bizarra! 🌙 Solo los verdaderos fans del Dr.Pene están despiertos",
                "¡Cosmic midnight! ✨ El universo Dr.Salitas nunca duerme completamente"
            ];
            
            const randomMessage = midnightMessages[Math.floor(Math.random() * midnightMessages.length)];
            generalChannel.send(randomMessage);
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
        console.log('🧹 Ejecutando limpieza del sistema de patrones...');
        patternDetection.cleanup();
        console.log('✅ Limpieza de patrones completada');
    }, {
        timezone: "America/Santiago"
    });
    
    console.log('🔧 Sistema de limpieza de patrones configurado');
}

// Inicializar limpieza de patrones
setupPatternCleanup();