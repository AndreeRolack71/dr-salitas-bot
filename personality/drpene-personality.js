const fs = require('fs');
const path = require('path');

class DrPenePersonality {
    constructor() {
        this.personalityData = this.loadPersonalityData();
        this.defaultPersonality = this.getDefaultPersonality();
        this.contextualResponses = this.getContextualResponses();
        this.moodSystem = null; // Se inicializará desde index.js
    }

    // Método para inyectar el sistema de mood
    setMoodSystem(moodSystem) {
        this.moodSystem = moodSystem;
    }

    loadPersonalityData() {
        try {
            const dataPath = path.join(__dirname, '..', 'data', 'personality.json');
            const rawData = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.log('No se pudo cargar personality.json, usando personalidad por defecto');
            return null;
        }
    }

    getDefaultPersonality() {
        return {
            phrases: [
                "¡Ey culiao! Dr.Salitas aquí, más flaite que nunca 🎩😂",
                "¡Wena conchetumare! Dr.Salitas reportándose pa la weá 👔🐕‍🦺",
                "¡Qué tal bastardo! Dr.Salitas en la casa, ordinario pero con clase 🤵‍♂️😅",
                "¡Ey weon! Dr.Salitas presente, más ted que la chucha 🎭👔",
                "¡Hola culiao! Dr.Salitas aquí, flaite de corazón pero elegante de apariencia 🎩🔥"
            ],
            jokes: [
                "¿Por qué Dr.Salitas usa terno? ¡Porque hasta los flaites tienen clase, conchetumare! 🎩😂",
                "Dr.Salitas es tan ordinario que... ¡hasta sus chistes son de mal gusto! 👔🤣",
                "¿Cuál es la diferencia entre Dr.Salitas y un caballero? ¡El vocabulario, culiao! 🎭😅"
            ]
        };
    }

    getContextualResponses() {
        return {
            greeting: [
                "¡Wena culiao! ¿Cómo andai?",
                "¡Ey bastardo! ¿Todo bien o no?",
                "¡Hola conchetumare! Dr.Salitas presente"
            ],
            farewell: [
                "¡Chao culiao! Que te vaya bien",
                "¡Nos vemos bastardo! Cuídate",
                "¡Hasta luego conchetumare!"
            ],
            excitement: [
                "¡Wena po! ¡Eso está bacán!",
                "¡Genial culiao! Me alegro",
                "¡Bacán bastardo! Eso me gusta"
            ],
            confusion: [
                "¿Qué wea? No cacho nada",
                "¿Cómo culiao? Explícate mejor",
                "No entiendo ni una wea, bastardo"
            ]
        };
    }

    getContextualResponse(message, context = 'general') {
        if (this.contextualResponses[context]) {
            const responses = this.contextualResponses[context];
            return this.getRandomResponse(responses);
        } else {
            // Si no hay contexto específico, usar frases por defecto
            if (this.personalityData && this.personalityData.phrases) {
                return this.getRandomResponse(this.personalityData.phrases);
            } else {
                return this.getRandomResponse(this.defaultPersonality.phrases);
            }
        }
    }

    getRandomJoke() {
        // Obtener chistes base
        let baseJokes = [];
        if (this.personalityData && this.personalityData.jokes) {
            baseJokes = this.personalityData.jokes;
        } else {
            baseJokes = this.defaultPersonality.jokes;
        }

        // Si hay sistema de mood, agregar chistes específicos del mood
        if (this.moodSystem) {
            const currentMood = this.moodSystem.getCurrentMood();
            const moodJokes = currentMood.responses.jokes || [];
            if (moodJokes.length > 0) {
                baseJokes = [...baseJokes, ...moodJokes];
            }
        }

        return this.getRandomResponse(baseJokes);
    }

    getRandomPhrase() {
        // Obtener frases base
        let basePhrases = [];
        if (this.personalityData && this.personalityData.phrases) {
            basePhrases = this.personalityData.phrases;
        } else if (this.defaultPersonality && this.defaultPersonality.phrases) {
            basePhrases = this.defaultPersonality.phrases;
        } else {
            // Fallback si no hay frases disponibles
            basePhrases = [
                "¡Ey culiao! Dr.Salitas aquí, más flaite que nunca 🎩😂",
                "¡Wena conchetumare! Dr.Salitas reportándose pa la weá 👔🐕‍🦺"
            ];
        }

        // Si hay sistema de mood, agregar frases específicas del mood
        if (this.moodSystem) {
            try {
                const moodInfo = this.moodSystem.getMoodInfo();
                if (moodInfo && moodInfo.responses && moodInfo.responses.phrases) {
                    const moodPhrases = moodInfo.responses.phrases;
                    if (moodPhrases.length > 0) {
                        basePhrases = [...basePhrases, ...moodPhrases];
                    }
                }
            } catch (error) {
                console.log('Error al obtener mood info para phrases:', error.message);
            }
        }

        return this.getRandomResponse(basePhrases);
    }

    cleanMessage(message) {
        // Validar que message existe y es string
        if (!message || typeof message !== 'string') {
            console.log('Mensaje inválido recibido en cleanMessage:', message);
            return '';
        }
        
        return message.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .trim();
    }

    addPersonalityFlair() {
        const flairs = [
            "🎩", "👔", "🐕‍🦺", "🤵‍♂️", "😂", "😅", "🎭", "🔥", "💀", "🤡"
        ];
        return flairs[Math.floor(Math.random() * flairs.length)];
    }

    getPingResponse() {
        // Obtener respuesta base según mood
        let baseResponses = [
            "¡Pong culiao! Dr.Salitas siempre presente po 🎩",
            "¡Ey bastardo! Aquí ando, más flaite que nunca 👔",
            "¡Pong conchetumare! Dr.Salitas reportándose cachái 🐕‍🦺",
            "¡Wena po! Dr.Salitas en la casa, ordinario pero con estilo 🤵‍♂️",
            "¡Pong weon! Más presente que el olor a pata po 😂",
            "¡Aquí toy culiao! Dr.Salitas nunca falla cachái 🎭",
            "¡Pong ql! Siempre listo pa la weá po 🔥"
        ];

        // Si hay sistema de mood, modificar respuesta
        if (this.moodSystem) {
            try {
                const moodInfo = this.moodSystem.getMoodInfo();
                if (moodInfo && moodInfo.responses && moodInfo.responses.ping) {
                    const moodResponses = moodInfo.responses.ping;
                    if (moodResponses.length > 0) {
                        baseResponses = [...baseResponses, ...moodResponses];
                    }
                }
            } catch (error) {
                console.log('Error al obtener mood info para ping:', error.message);
            }
        }

        return this.getRandomResponse(baseResponses);
    }

    getMocoResponse() {
        const responses = [
            "¡Asco culiao! Pero Dr.Salitas igual te responde po 🎩😷",
            "¡Puaj bastardo! Qué ordinario, pero bacán 👔🤢",
            "¡Ew conchetumare! Dr.Salitas mantiene la clase igual 🐕‍🦺😅",
            "¡Qué asco weon! Pero aquí andamos po 🤵‍♂️🤮",
            "¡Cochino culiao! Dr.Salitas es flaite pero no tanto 😂🤧",
            "¡Guácala ql! Pero te banco igual cachái 🎭😷",
            "¡Asqueroso bastardo! Dani ql siempre con sus weas 🔥🤢"
        ];
        return this.getRandomResponse(responses);
    }

    isGreeting(message) {
        const greetings = ['hola', 'wena', 'buenas', 'saludos', 'ey', 'hey'];
        return greetings.some(greeting => message.includes(greeting));
    }

    isFarewell(message) {
        const farewells = ['chao', 'adiós', 'nos vemos', 'hasta luego', 'bye'];
        return farewells.some(farewell => message.includes(farewell));
    }

    getRandomResponse(responses) {
        if (!responses || responses.length === 0) {
            return "¡Ey culiao! Dr.Salitas no cacha qué decir 🎩😅";
        }
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Respuesta general inteligente
    getSmartResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Detectar contexto y responder apropiadamente
        if (this.isGreeting(lowerMessage)) {
            return this.getContextualResponse(message, 'greeting');
        }
        
        if (this.isFarewell(lowerMessage)) {
            return this.getContextualResponse(message, 'farewell');
        }
        
        // Palabras que generan emoción
        if (lowerMessage.includes('genial') || lowerMessage.includes('bacán') || lowerMessage.includes('wena') || lowerMessage.includes('buena')) {
            return this.getContextualResponse(message, 'excitement');
        }
        
        // Palabras de confusión
        if (lowerMessage.includes('qué') || lowerMessage.includes('como') || lowerMessage.includes('?') || lowerMessage.includes('no entiendo')) {
            return this.getContextualResponse(message, 'confusion');
        }
        
        // Respuestas específicas para nombres del grupo
        if (message.includes('piña') || message.includes('dr.piña') || message.includes('dr piña')) {
            const pinaResponses = [
                "¿El Piña? Ese culiao es más mamado que escritorio que se levanta solo po",
                "Dr.Piña aparece con vaso en la sien, mezcla piscolas con trago de edén cachái",
                "¿Dr.Piña? 'Con curao no hay supervillano, tomen conchetumare, ¡les saco el ano!'",
                "El Piña ql siempre fue adverso a desarmar weas valiosas po",
                "Piña culiao internacional, pero bueno pa moderar weas",
                "¿El Piña? Ese weon anda modo niño de cristal po, cagaste",
                "Dr.Piña el curao legendario, mezcla piscolas como un dios po"
            ];
            return this.getRandomResponse(pinaResponses);
        }

        if (message.includes('dani') || message.includes('choropc') || message.includes('choro pc')) {
            const daniResponses = [
                "¿El Dani? Ese culiao es el ChoroPC, el único que puede parar al Dr.Pene",
                "Choro PC grita: '¡Aquí se acabó!' y le apunta directo al glande feroz",
                "Dani ql, el choro de los PC, maestro del pegamento cósmico",
                "ChoroPC con sed, guerrero de la sinfonía del tajo eterno po",
                "¿El Dani? Choro PC cabalga surcando el cosmos de semen y estrellas cachái",
                "ChoroPC pegando galaxias con su flujo inmortal",
                "Dani culiao, su pegamento es la kryptonita de Toromasu",
                "Chōrō Pīshī! Only he can block revenge romance",
                "ChoroPC psycho warrior, jigoku no dance master cachái",
                "Dani el choro supremo, kurayami wo taosu mono po",
                "Choro PC escuchó el clamor celestial, juró enterrar al pene",
                "¿Dani? Montó su zancudo al templo infernal po",
                "ChoroPC trae la calma con cuchillo y ritual cachái",
                "Dani cabalga para sepultar la mirada del Dr.Pene"
            ];
            return this.getRandomResponse(daniResponses);
        }

        if (message.includes('ivan') || message.includes('dr.pene') || message.includes('dr pene')) {
            const ivanResponses = [
                "¿El Ivan? Ese culiao es el Dr.Pene en persona po",
                "Dr.Pene aparece con risa infernal, cuchillo en la mano, mirada letal",
                "Ivan ql, el pene malvado del universo cachái",
                "¿Dr.Pene? Ese weon se frena perturbado cuando ve que a Toromasu le gusta",
                "Ivan culiao, siempre con el bisturí buscando a quién degollar",
                "Dr.Pene, vencido, sin poder chocar, y Emanuel le grita: '¡Anda a masturbar!'",
                "¿El Ivan? Guerrero de los penes del destino, gloria genital po",
                "Dokutā Pene konchetumāre! Villain de la era, akuma no star",
                "¿Ivan? Psycho slash, jigoku no dance, his blade no mercy stance",
                "Dr.Pene fukushū no kami, la furia de Iván que nunca murió cachái",
                "Dokutā Pene rekonchetumāre! Love made him monsta, rage wa kare no konsenso",
                "¡Doctor Pene conchetumadre! Tu peste pudre el edén",
                "¿Dr.Pene? Una sombra perversa se coló sin perdón po",
                "Ivan culiao, su ciencia fue mal usada, semilla impura cachái",
                "Dr.Pene el eco corrupto que apagó la luz del Infinito",
                "Contador culiao, Ivan culiao si vo eri contador",
                "¿Ivan? Sindicalista culiao, andate a tu sindicato comunacho culiao"
            ];
            return this.getRandomResponse(ivanResponses);
        }

        if (message.includes('emanuel') || message.includes('infinito emanuel')) {
            const emanuelResponses = [
                "¿Emanuel? Ese culiao es Infinito Emanuel, testigo de lo inmortal po",
                "Emanuel culiao con el combo del lohcico trae el final po",
                "¿Infinito Emanuel? Ese weon es testigo cósmico de la guerra eterna",
                "Emanuel ql, siempre gritándole a Dr.Pene: '¡Anda a masturbar!'",
                "Infinito Emanuel, el que ve todo desde las dimensiones superiores",
                "Emanuel culiao, su poder trasciende el tiempo y el espacio",
                "Mugen Emanueru! Sono michi wa yabureta, aku no shisha",
                "Emanuel el infinito, kurayami kara umareta cachái",
                "¿Emanuel? Seishin wa chigireta, inferno drive master po",
                "Infinito Emanuel, yami no tsubuyaki, hagane no koe",
                "En su trono brillante, Emanuel se inclinó... la diarrea sagrada empezó",
                "¿Emanuel? En la cima del cosmos, el dorado brilló po",
                "Infinito Emanuel renace desde el barro, nunca se rindió cachái",
                "La armadura dorada ya sin redención, pero el cosmos encendió"
            ];
            return this.getRandomResponse(emanuelResponses);
        }

        if (message.includes('thomy') || message.includes('toromasu') || message.includes('chaos lord')) {
            const thomyResponses = [
                "¿Thomy? Chaos Lord Toromasu, el Arquitecto del Laboratorio Sexual po",
                "Toromasu cae de puro placer, se come el disparo sin retroceder",
                "¿Chaos Lord Toromasu? Ese culiao grita: '¡Me lo voy a zampar!' cuando ve acción",
                "Thomy culiao, más perturbado que Dr.Pene cuando ve que le gusta",
                "Toromasu el masoquista legendario, disfruta todo tipo de dolor po",
                "¿Chaos Lord? Ese weon es tan loco que hasta Dr.Pene queda perturbado",
                "Thomy Toromasu, el único que puede hacer que un villano se cuestione todo",
                "Chaos Lord Toromasu gobierna desde su trono de ano obsidiana cachái",
                "¿Toromasu? Ese weon creó su fortaleza en el Vacío Lascivo po",
                "Chaos Lord con eyaculación dimensional, abre portales con semen negro viscoso"
            ];
            return this.getRandomResponse(thomyResponses);
        }

        // Respuestas épicas del universo Dr.Pene
        if (message.includes('guerra') || message.includes('pelea') || message.includes('batalla')) {
            const guerraResponses = [
                "¡Penes del destino, guerra sin pudor! ¡Semen en el aire, sangre con sudor!",
                "Bajo el manto estelar donde el semen puede flotar, dos guerreros se cruzan con ganas de reventar",
                "¡Cuchillo en la mano, tajo sin temor! ¡Y Emanuel mirando lleno de dolor!",
                "Ambos se lanzan con furia animal, tronan los cocos como trueno brutal po",
                "¡Penes del destino, duelo terminal! ¡Solo uno queda, el otro al hospital!"
            ];
            return this.getRandomResponse(guerraResponses);
        }

        if (message.includes('destino') || message.includes('épico') || message.includes('legendario')) {
            const destinoResponses = [
                "¡Penes del destino, gloria genital! ¡El combo del lohcico trae el final!",
                "Y así se selló la guerra sin fe entre un pene malvado y un choro PC con sed",
                "¡El trago, el cuchillo y la voluntad forjaron la historia más brutal que el mal!",
                "¡Penes del destino, grito celestial! ¡Si no te reís, estay mal del pal'!",
                "La sinfonía del tajo eterno resuena en el cosmos po"
            ];
            return this.getRandomResponse(destinoResponses);
        }

        if (message.includes('semen') || message.includes('eyacular') || message.includes('genital')) {
            const semenResponses = [
                "¡Semen en el aire, sangre con sudor! La batalla más épica del universo",
                "Pero si lo agarra y lo hace eyacular, Toromasu grita: '¡Me lo voy a zampar!'",
                "¡Penes del destino, gloria genital! Una epopeya sin igual po",
                "La frente brillando de tanto sudar, ¡y el bisturí busca a quién degollar!",
                "Presencia la pelea de lo más genital, testigo de lo inmortal"
            ];
            return this.getRandomResponse(semenResponses);
        }

        if (message.includes('cuchillo') || message.includes('bisturí') || message.includes('tajo')) {
            const cuchilloResponses = [
                "¡Cuchillo en la mano, tajo sin temor! La sinfonía del tajo eterno po",
                "Dr.Pene aparece con risa infernal, cuchillo en la mano, mirada letal",
                "¡Y el bisturí busca a quién degollar! La frente brillando de tanto sudar",
                "El tajo eterno que marca el destino de los guerreros genitales",
                "Cuchillo del destino, arma de la guerra sin pudor cachái"
            ];
            return this.getRandomResponse(cuchilloResponses);
        }

        if (message.includes('combo') || message.includes('lohcico') || message.includes('final')) {
            const comboResponses = [
                "¡El combo del lohcico trae el final! Emanuel ajusta su guante",
                "Prepara el combo pa mandarlo a acostar, cierra los ojos, siente el final",
                "Emanuel respira, el cosmos se gira, ajusta su guante, la furia se estira",
                "¡El combo del lohcico! La técnica definitiva de Infinito Emanuel po",
                "Y Emanuel le grita: '¡Anda a masturbar!' después del combo final"
            ];
            return this.getRandomResponse(comboResponses);
        }

        if (message.includes('piscola') || message.includes('trago') || message.includes('curao')) {
            const piscolaResponses = [
                "Dr.Piña aparece con vaso en la sien, mezcla piscolas con trago de edén",
                "'Con curao no hay supervillano, tomen conchetumare, ¡les saco el ano!'",
                "El trago, el cuchillo y la voluntad forjaron la historia más brutal que el mal",
                "Piscolas del destino, la bebida de los dioses borrachos po",
                "Dr.Piña el curao legendario, mezcla piscolas como un dios"
            ];
            return this.getRandomResponse(piscolaResponses);
        }

        if (message.includes('lluvia') || message.includes('estelar') || message.includes('cósmico') || message.includes('cosmico')) {
            const lluviaResponses = [
                "¡Lluvia de semen estelar! Pegando el universo con su flujo inmortal",
                "Nada escapa de su cósmico final, el cosmos pegado no puede escapar",
                "Choro PC cabalga surcando el cosmos de semen y estrellas po",
                "¡Lluvia de semen estelar! Sellando galaxias en su abrazo brutal",
                "Más allá de los portales de carne, donde la galaxia sangra esperma y luz",
                "El pegamento del Pegamentero Eternal es la ley final del plano carnal"
            ];
            return this.getRandomResponse(lluviaResponses);
        }

        if (message.includes('pegamento') || message.includes('pegajoso') || message.includes('pegar')) {
            const pegamentoResponses = [
                "¿Pegamento? ChoroPC es el Pegamentero Eternal del multiverso po",
                "Ni portales de ano negro ni glandes llenos de luz pueden frenar su esperma eterno",
                "El semen pegamento de Choro PC es kryptonita pa Toromasu cachái",
                "Una sola gota puede inmovilizar a Chaos Lord y sellar sus portales",
                "No hay hechizo que lo pueda frenar, ni magia de Chaos ni glande solar",
                "Pegando galaxias enteras con su abrazo brutal cósmico"
            ];
            return this.getRandomResponse(pegamentoResponses);
        }

        if (message.includes('laboratorio') || message.includes('experimento') || message.includes('alquimista')) {
            const laboratorioResponses = [
                "¿Laboratorio? Chaos Lord Toromasu gobierna su fortaleza del Vacío Lascivo po",
                "Una fortaleza flotante hecha de carne, metal y cristal líquido",
                "Ahí experimenta fusionando ADN, semen cósmico y esencia caótica",
                "Crea nuevas razas esclavas sexuales y guerreros lubricados cachái",
                "Toromasu fue expulsado de la Orden de los Cien Placeres por sus experimentos",
                "Sacrificó su propia virilidad pa crear su primer homúnculo de eyaculación eterna"
            ];
            return this.getRandomResponse(laboratorioResponses);
        }

        if (message.includes('portal') || message.includes('dimensional') || message.includes('eyaculación')) {
            const portalResponses = [
                "¿Portales? Toromasu abre portales dimensionales con eyaculación po",
                "Los sella con su semen negro viscoso del Vacío Interdimensional",
                "Eyaculación Dimensional: el poder más temido de Chaos Lord",
                "Puede abrir portales de ano negro llenos de luz maldita cachái",
                "Transmutación Seminal: convierte semen en acero negro o oro maldito",
                "Control de la Libido Cósmica: subyuga mentes con placer corrupto"
            ];
            return this.getRandomResponse(portalResponses);
        }

        // Nuevas respuestas anime épicas
        if (message.includes('anime') || message.includes('dokutā') || message.includes('dokuta') || message.includes('konchetumāre')) {
            const animeResponses = [
                "Dokutā Pene konchetumāre! Villain de la era, akuma no star",
                "Yami no shiro ni, Amaterasu wa naku... Dr.Pene rises po",
                "Psycho slash, jigoku no dance, his blade no mercy stance",
                "Dokutā Pene rekonchetumāre! Love made him monsta cachái",
                "Kurayami no tsubuyaki, hagane no koe... Docta Cockman!",
                "El dolor esu su arte, i el mundo su lienso po"
            ];
            return this.getRandomResponse(animeResponses);
        }

        if (message.includes('villain') || message.includes('akuma') || message.includes('psycho') || message.includes('jigoku')) {
            const villainResponses = [
                "Animal printo, baldo hedo full pain, kare wa tensai – kurutta tensai",
                "Fake love deluxe, kokoro bleed-o in pain cachái",
                "Mugen Emanueru... sono michi wa yabureta po",
                "Aku no shisha, kurayami kara umareta",
                "Inferno drive, seishin wa chigireta... Docta Pene fuckin' LETSU GO",
                "Hardcore muscle, warai wa psycho blast po"
            ];
            return this.getRandomResponse(villainResponses);
        }

        if (message.includes('yami') || message.includes('kurayami') || message.includes('fukushū') || message.includes('fukushu')) {
            const yamiResponses = [
                "Kage ni hisomu, sono namae wa... Dokutā Pene fukushū no kami",
                "La leyenda oskura ke el mundo temió po",
                "La furia de Iván, ke nunka murió cachái",
                "Kokoro wa yami, nikushimi no dansu",
                "El mundo tiembla... su paso es brutal",
                "Sekaijuu wa iki wo nomu... el mundo tiembla esperando el final"
            ];
            return this.getRandomResponse(yamiResponses);
        }

        if (message.includes('revenge') || message.includes('romance') || message.includes('dance') || message.includes('blade')) {
            const revengeResponses = [
                "Only Chōrō Pīshī can block revenge romance po",
                "Psycho slash, jigoku no dance master cachái",
                "His blade no mercy stance, el caos es su señal",
                "Kada korte una obra, kada grito su plasér",
                "Su korazón ennegrecido, imposible de bensér po",
                "Tatakai wa tsuzuku, riyū wa nai... la guerra continúa"
            ];
            return this.getRandomResponse(revengeResponses);
        }

        // Nuevas respuestas del Lamento Dorado
        if (message.includes('dorado') || message.includes('brillante') || message.includes('trono') || message.includes('celestial')) {
            const doradoResponses = [
                "En la cima del cosmos, el dorado brilló po",
                "En su trono brillante, Emanuel se inclinó cachái",
                "La armadura dorada ya sin redención, pero el cosmos encendió",
                "Se abrió el velo entre mundos... y en la sala celestial",
                "Las galaxias callaron, el cielo se partió po",
                "Entre runas celestes, en cónclave astral"
            ];
            return this.getRandomResponse(doradoResponses);
        }

        if (message.includes('diarrea') || message.includes('caca') || message.includes('mierda') || message.includes('sagrada')) {
            const diarreaResponses = [
                "La diarrea sagrada la batalla empezó po",
                "Un quejido divino retumbó sin control cachái",
                "Por su muslo fluía, divina putrefacción",
                "¡La caca desborda el alma! ¡El Infinito va a caer!",
                "Un peo ancestral lo delató sin piedad po",
                "El río marrón bajó... cual castigo abismal"
            ];
            return this.getRandomResponse(diarreaResponses);
        }

        if (message.includes('corrupto') || message.includes('peste') || message.includes('impura') || message.includes('sombra')) {
            const corruptoResponses = [
                "Una sombra perversa se coló sin perdón po",
                "Era el eco corrupto... del vil Doctor Pene en acción",
                "¡Tu peste pudre el edén! cachái",
                "¡Detén tu semilla impura! ¡Tu ciencia fue mal usada!",
                "La luz del Infinito, de pronto se apagó po",
                "El dolor de Emanuel... ¡al cosmos encendió!"
            ];
            return this.getRandomResponse(corruptoResponses);
        }

        if (message.includes('renace') || message.includes('barro') || message.includes('eterno') || message.includes('nunca')) {
            const renaceResponses = [
                "Infinito Emanuel renace desde el barro, nunca se rindió po",
                "Pero el Infinito, aunque sucio, nunca se rindió cachái",
                "De entre la mierda... una chispa brotó",
                "El Infinito renace! ¡Desde el barro va a volver!",
                "Y así en los anales de la eternidad po",
                "Se escribió el día en que la mierda casi todo se llevó"
            ];
            return this.getRandomResponse(renaceResponses);
        }

        if (message.includes('vacío') || message.includes('vacio') || message.includes('interdimensional')) {
            const vacioResponses = [
                "¿Vacío Interdimensional? Donde el tiempo gotea semen y las estrellas laten po",
                "En el Vacío Lascivo donde Toromasu creó su fortaleza maldita",
                "Ahí nacen los gemidos olvidados del cosmos cachái",
                "Vacío donde la galaxia sangra esperma y luz eterna",
                "El Vacío Interdimensional, hogar de Chaos Lord Toromasu"
            ];
            return this.getRandomResponse(vacioResponses);
        }

        if (message.includes('trono') || message.includes('obsidiana') || message.includes('fortaleza')) {
            const tronoResponses = [
                "¿Trono de ano obsidiana? Desde ahí gobierna Chaos Lord po",
                "Su fortaleza flotante hecha de carne, metal y cristal líquido",
                "Toromasu pegado en su propio trono de orgías el weon",
                "La fortaleza del Vacío Lascivo, suspendida en la nada",
                "Trono maldito donde se planean los experimentos más degenerados"
            ];
            return this.getRandomResponse(tronoResponses);
        }

        if (message.includes('orden') || message.includes('placeres') || message.includes('alquimista')) {
            const ordenResponses = [
                "¿Orden de los Cien Placeres? De ahí expulsaron a Toromasu po",
                "Fue alquimista arcano antes de volverse Chaos Lord",
                "Lo echaron por experimentar con magia sexual y biotecnología",
                "Sacrificó su virilidad pa crear homúnculos de eyaculación eterna cachái",
                "La Orden no pudo controlar sus experimentos prohibidos"
            ];
            return this.getRandomResponse(ordenResponses);
        }

    // Respuestas específicas para situaciones del chat
    if (message.includes('banco') || message.includes('pega') || message.includes('trabajo')) {
        const bancoResponses = [
            "¿La pega? Puro weon que se pajea en el trabajo po, como el Dani",
            "Banco de Chile culiao, ahí anda el Ivan justificando el sueldo",
            "¿Trabajo? Mejor andemos en auto modo sport como el Thomy",
            "La pega es pa los wns que no cachan de Gundam po",
            "¿Banco? Puro trámite culiao, mejor vamos al mall",
            "Trabajo ql, mejor hablemos de Pokemon cachái",
            "Contador culiao, Ivan culiao si vo eri contador",
            "Sindicalista culiao, andate a tu sindicato comunacho culiao"
        ];
        return this.getRandomResponse(bancoResponses);
    }

    if (message.includes('auto') || message.includes('uber') || message.includes('manejar')) {
        const autoResponses = [
            "¿Auto? El Thomy culiao siempre anda en modo sport po",
            "Uber ql, mejor tener auto propio como Chaos Lord",
            "¿Manejar? Tener auto es como tener un hijo tonto wn",
            "Auto culiao, pero el Thomy lo cuida más que a su polola",
            "¿Uber? Puro weon que no tiene auto po, ordinario",
            "Manejar ql, el Thomy anda pegado en su trono de orgías con ruedas"
        ];
        return this.getRandomResponse(autoResponses);
    }

    if (message.includes('cumple') || message.includes('fiesta') || message.includes('salida')) {
        const cumpleResponses = [
            "¿Cumple? Puro carrete ordinario po, como nos gusta",
            "Fiesta culiao, ojalá no venga el Piña modo niño de cristal",
            "¿Salida? Vamos al mall a wear como flaites",
            "Cumple ql, seguro el Ivan trae sus weas raras",
            "¿Fiesta? El Dani va a mandar stickers de picos paraos wn",
            "Salida culiao, mejor que no llueva como dice el Emanuel"
        ];
        return this.getRandomResponse(cumpleResponses);
    }

    if (message.includes('mall') || message.includes('comprar') || message.includes('plata')) {
        const mallResponses = [
            "¿Mall? Puro flaite comprando weas po",
            "Comprar culiao, mejor gastemos la plata en weas útiles",
            "¿Plata? El Ivan del banco cacha de esas weas",
            "Mall ql, vamos a wear como ordinarios",
            "¿Comprar? Mejor compremos Gundam como wns",
            "Plata culiao, justifica el gasto conchetumare"
        ];
        return this.getRandomResponse(mallResponses);
    }

    // Respuestas a más palabras flaites del chat
    if (lowerMessage.includes('pico') || lowerMessage.includes('pichula')) {
        const picoResponses = [
            "¡Ey culiao! ¿Hablando de picos? Dr.Salitas mantiene la elegancia 🎩😂",
            "¡Pico conchetumare! Dr.Salitas es ordinario pero con clase 👔🐕‍🦺",
            "¿Pichula? ¡Dr.Salitas se ajusta el terno con dignidad bizarra! 🤵‍♂️😅"
        ];
        return this.getRandomResponse(picoResponses);
    }
    
    if (lowerMessage.includes('raja') || lowerMessage.includes('culo')) {
        const rajaResponses = [
            "¡Raja culiao! Dr.Salitas mantiene la compostura elegante 🎩😂",
            "¿Culo? ¡Dr.Salitas es ordinario pero distinguido conchetumare! 👔🐕‍🦺",
            "¡Ey bastardo! Dr.Salitas no habla de esas weas... o sí 😏🎭"
        ];
        return this.getRandomResponse(rajaResponses);
    }
    
    if (lowerMessage.includes('ctm') || lowerMessage.includes('conchetumare')) {
        const ctmResponses = [
            "¡Conchetumare! Dr.Salitas aprueba ese lenguaje flaite 👔😂",
            "¡CTM culiao! Dr.Salitas también habla así de ordinario 🎩🐕‍🦺",
            "¡Ey conchetumare! Dr.Salitas es igual de flaite que tú wea 😎👔"
        ];
        return this.getRandomResponse(ctmResponses);
    }
    
    // Si no hay contexto específico, usar respuesta contextual general
    return this.getContextualResponse(message);
}
}

module.exports = DrPenePersonality;