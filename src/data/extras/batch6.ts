import type { ExtraAnswers } from './types.ts';

/**
 * Third wave of accepted answers for the original prompts.
 *
 * These sit alongside batches 1-5. Answers already accepted by an earlier
 * batch (or by the prompt bank itself) have been removed so every entry here
 * adds a genuinely new answer.
 */
export const BATCH_6_EXTRAS: Record<string, ExtraAnswers> = {
  bird: {
    plankton: ['finch', 'blue jay'],
    'reef-rookie': ['myna', 'warbler'],
    jawsome: ['sunbird', 'cotinga'],
    'fin-omenal': ['weka', 'boobook'],
    fintastic: ['riflebird', 'parotia'],
  },
  fruit: {
    plankton: ['cantaloupe', 'honeydew'],
    'reef-rookie': ['damson', 'greengage'],
    jawsome: ['black sapote', 'mamey'],
    'fin-omenal': ['goji berry', 'barberry'],
    fintastic: ['marula', 'hala fruit'],
  },
  metal: {
    plankton: ['cast iron', 'wrought iron'],
    'reef-rookie': ['promethium', 'actinium'],
    jawsome: ['technetium'],
    fintastic: ['dubnium', 'nobelium'],
  },
  'africa-country': {
    plankton: ['congo republic'],
    'reef-rookie': ['azawad'],
    jawsome: ['puntland', 'jubaland'],
    'fin-omenal': ['ilha do fogo', 'sao vicente'],
  },
  'us-state-capital': {
    'reef-rookie': ['iowa city', 'belmont'],
    jawsome: ['marietta', 'williamsburg'],
    'fin-omenal': ['bowling green', 'alexandria'],
  },
  cheese: {
    plankton: ['american cheese', 'pepper jack'],
    'reef-rookie': ['ossau iraty', 'tetilla'],
    jawsome: ['roncal', 'zamorano'],
    'fin-omenal': ['afuega l pitu', 'casin'],
    fintastic: ['grimbister', 'colston bassett'],
  },
  cloud: {
    plankton: ['mist', 'haze'],
    'reef-rookie': ['stratocumulus radiatus'],
    jawsome: ['cavum', 'muris'],
    'fin-omenal': ['altocumulus opacus', 'altostratus opacus'],
    fintastic: ['cataractagenitus', 'flammagenitus'],
  },
  'greek-god': {
    plankton: ['hymen', 'eileithyia'],
    'reef-rookie': ['metis', 'eurynome'],
    jawsome: ['eurybia', 'pallas'],
    'fin-omenal': ['apheliotes', 'skiron'],
    fintastic: ['alastor', 'horme'],
  },
  constellation: {
    fintastic: ['cerberus', 'tarandus'],
  },
  volcano: {
    plankton: ['mauna kea', 'mount ararat'],
    'reef-rookie': ['mount elbrus', 'grimsvotn'],
    jawsome: ['askja', 'tungurahua'],
    'fin-omenal': ['mount yasur', 'mount ambrym'],
    fintastic: ['mount bagana', 'mount ulawun'],
  },
  river: {
    plankton: ['yellow river'],
    'reef-rookie': ['douro'],
    jawsome: ['sava', 'tisa'],
    'fin-omenal': ['ubangi', 'kasai'],
    fintastic: ['sepik', 'fly'],
  },
  bone: {
    plankton: ['heel bone', 'ankle bone'],
    'reef-rookie': ['cervical vertebra', 'thoracic vertebra'],
    jawsome: ['frontal bone', 'parietal bone'],
    'fin-omenal': ['sesamoid', 'wormian bone'],
    fintastic: ['os coxae', 'os calcis'],
  },
  pasta: {
    plankton: ['angel hair'],
    'reef-rookie': ['penne rigate'],
    jawsome: ['radiatori'],
    'fin-omenal': ['gramigna'],
    fintastic: ['ciciones', 'pisarei'],
  },
  gemstone: {
    plankton: ['hematite'],
    'reef-rookie': ['unakite'],
    jawsome: ['sphene'],
    'fin-omenal': ['clinohumite'],
  },
  superhero: {
    plankton: ['she hulk', 'war machine'],
    jawsome: ['nova', 'adam warlock'],
    'fin-omenal': ['blue marvel', 'starbrand'],
    fintastic: ['forbush man', 'matter eater lad'],
  },
  'bond-actor': {
    'reef-rookie': ['ana de armas', 'daniel waltz'],
    jawsome: ['barbara bouchet', 'britt ekland'],
    'fin-omenal': ['curd jurgens', 'joseph wiseman'],
    fintastic: ['michael kitt', 'anthony zerbe'],
  },
  currency: {
    plankton: ['shekel'],
    'reef-rookie': ['metical'],
    'fin-omenal': ['ariary', 'ouguiya'],
    fintastic: ['guilder'],
  },
  'programming-language': {
    'reef-rookie': ['purescript'],
    jawsome: ['bqn'],
    'fin-omenal': ['hack', 'chapel'],
    fintastic: ['brainfuck', 'lolcode'],
  },
  dinosaur: {
    plankton: ['ichthyosaurus', 'plesiosaurus'],
    'reef-rookie': ['dilophosaurus'],
    jawsome: ['daspletosaurus'],
    'fin-omenal': ['yi qi'],
    fintastic: ['scansoriopteryx', 'aurornis'],
  },
  cocktail: {
    'reef-rookie': ['gimlet'],
    'fin-omenal': ['army and navy'],
    fintastic: ['greenpoint', 'red hook'],
  },
  grape: {
    plankton: ['petit sirah'],
    'reef-rookie': ['xinomavro'],
    'fin-omenal': ['jacquere'],
    fintastic: ['pelaverga', 'nascetta'],
  },
  'car-maker': {
    'reef-rookie': ['abarth', 'cupra'],
    jawsome: ['hennessey'],
    'fin-omenal': ['noble', 'radical'],
    fintastic: ['davrian', 'marcos'],
  },
  'chess-opening': {
    'reef-rookie': ['pirc defense'],
    jawsome: ['trompowsky attack'],
    'fin-omenal': ['fried liver attack', 'halloween gambit'],
    fintastic: ['nakhmanson gambit', 'englund gambit'],
  },
  orchestra: {
    'reef-rookie': ['bamberg symphony', 'frankfurt radio symphony'],
    jawsome: ['swedish radio symphony', 'finnish radio symphony'],
    'fin-omenal': ['tapiola sinfonietta', 'avanti chamber orchestra'],
    fintastic: ['anima eterna', 'il pomo d oro'],
  },
  'city-germany': {
    plankton: ['bielefeld'],
    'reef-rookie': ['hagen'],
    jawsome: ['baden baden', 'cochem'],
    'fin-omenal': ['monchengladbach', 'neuss'],
    fintastic: ['bad homburg', 'bad nauheim'],
  },
  'japanese-dish': {
    plankton: ['chicken katsu'],
    jawsome: ['chanko nabe'],
    'fin-omenal': ['kakinoha zushi', 'sasazushi'],
    fintastic: ['hoba miso', 'karashi renkon'],
  },
  unit: {
    plankton: ['kilometre', 'centimetre', 'millilitre'],
    jawsome: ['micron'],
    fintastic: ['poundal'],
  },
  'dog-breed': {
    plankton: ['staffordshire bull terrier', 'american pit bull terrier'],
  },
  'greek-letter': {
    plankton: ['stau'],
    'reef-rookie': ['arkadian sampi'],
    jawsome: ['old koppa', 'old sampi'],
    'fin-omenal': ['cretan heta', 'messenian heta'],
    fintastic: ['pamphylian heta', 'epidaurian digamma'],
  },
  bridge: {
    'reef-rookie': ['severn bridge'],
    jawsome: ['britannia bridge'],
    'fin-omenal': ['pont alexandre iii', 'pont neuf'],
    fintastic: ['khaju bridge', 'stari most'],
  },
  sidekick: {
    plankton: ['kaldur'],
    'reef-rookie': ['red arrow', 'tempest'],
    jawsome: ['pixie', 'dust'],
    'fin-omenal': ['ravager'],
    fintastic: ['beppo'],
  },
  'board-game': {
    plankton: ['axis and allies', 'forbidden island'],
    jawsome: ['brass birmingham'],
    'fin-omenal': ['through the ages'],
    fintastic: ['advanced squad leader', 'junta'],
  },
  'mountain-range': {
    'reef-rookie': ['nyenchen tanglha'],
    jawsome: ['star planina', 'osogovo'],
    'fin-omenal': ['sierra de guadarrama', 'sierra de cazorla'],
    fintastic: ['kolyma mountains', 'stanovoy range'],
  },
  'sea-creature': {
    'reef-rookie': ['wrasse'],
    jawsome: ['sunfish'],
    'fin-omenal': ['pelican eel', 'viperfish'],
    fintastic: ['xenophyophore', 'lancelet'],
  },
  shark: {
    plankton: ['reef shark'],
    'reef-rookie': ['blacktip reef shark'],
    jawsome: ['bamboo shark'],
    fintastic: ['megalodon', 'helicoprion'],
  },
  'olympic-sport': {
    plankton: ['lacrosse', 'netball'],
    'reef-rookie': ['pickleball', 'kabaddi'],
    jawsome: ['floorball', 'fistball'],
    'fin-omenal': ['bandy', 'rink bandy'],
    fintastic: ['yukigassen', 'bossaball'],
  },
  font: {
    plankton: ['courier new', 'ms sans serif'],
    'reef-rookie': ['ff din', 'neuzeit grotesk'],
    jawsome: ['adobe garamond', 'minion pro'],
    'fin-omenal': ['gill sans nova', 'neue montreal'],
    fintastic: ['comic neue', 'interstate mono'],
  },
  coin: {
    plankton: ['dollar', 'two pound coin'],
    'reef-rookie': ['half crown', 'double florin'],
    jawsome: ['testoon', 'portrait groat'],
    'fin-omenal': ['roschen', 'maille'],
    fintastic: ['whitehead', 'golden bull'],
  },
  instrument: {
    plankton: ['bugle', 'cornet'],
    'reef-rookie': ['bass clarinet', 'alto flute'],
    jawsome: ['contrabass clarinet', 'subcontrabass flute'],
    'fin-omenal': ['octobass', 'double contrabass saxophone'],
    fintastic: ['pyrophone', 'hydraulophone'],
  },
  tree: {
    fintastic: ['dragon blood tree'],
  },
  'cat-breed': {
    'fin-omenal': ['savannah cat'],
  },
  insect: {
    fintastic: ['mantophasmatodea', 'zygentoma'],
  },
  'city-usa': {
    plankton: ['washington dc'],
    fintastic: ['chula vista', 'fremont'],
  },
  landmark: {
    fintastic: ['moai'],
  },
  desert: {
    fintastic: ['dasht e lut'],
  },
  island: {
    plankton: ['hawaii'],
  },
  scientist: {
    fintastic: ['chandrasekhar'],
  },
  painter: {
    jawsome: ['cezanne'],
  },
  museum: {
    fintastic: ['rupestrian monastery', 'guggenheim bilbao'],
  },
  'ancient-civilization': {
    fintastic: ['norte chico', 'caral'],
  },
  'historical-figure': {
    jawsome: ['napoleon bonaparte'],
  },
  'mythical-creature': {
    fintastic: ['tatzelwurm'],
  },
  novel: {
    fintastic: ['j r'],
  },
  author: {
    fintastic: ['w g sebald'],
  },
  film: {
    'fin-omenal': ['bicycle thieves'],
    fintastic: ['ashes and diamonds'],
  },
  'film-director': {
    fintastic: ['carl theodor dreyer'],
  },
  'fictional-character': {
    'reef-rookie': ['frodo baggins'],
  },
  'video-game': {
    jawsome: ['final fantasy vii'],
  },
  villain: {
    fintastic: ['fantomas', 'dr fu manchu'],
  },
  band: {
    'fin-omenal': ['can', 'neu'],
    fintastic: ['sun city girls'],
  },
  spice: {
    plankton: ['salt', 'pepper'],
  },
  dessert: {
    fintastic: ['ras malai'],
  },
  vegetable: {
    fintastic: ['fiddlehead fern'],
  },
  'breakfast-food': {
    fintastic: ['natto'],
  },
  'pizza-topping': {
    fintastic: ['smoked reindeer'],
  },
  cuisine: {
    fintastic: ['uzbek'],
  },
  'tennis-player': {
    fintastic: ['bill tilden'],
  },
  toy: {
    fintastic: ['tin soldier', 'automaton'],
  },
  'clothing-item': {
    fintastic: ['dolman'],
  },
  fabric: {
    fintastic: ['qiviut', 'shahtoosh'],
  },
  colour: {
    fintastic: ['fulvous', 'glaucous'],
  },
  language: {
    'fin-omenal': ['tamil'],
  },
  'web-browser': {
    'fin-omenal': ['netscape navigator'],
  },
  'mobile-app': {
    'fin-omenal': ['obsidian'],
    fintastic: ['beeline', 'k9 mail'],
  },
  'natural-disaster': {
    jawsome: ['volcanic eruption'],
  },
  'african-river': {},
  'african-mountain': {
    fintastic: ['mount nlonako'],
  },
  lake: {
    'fin-omenal': ['lake toba'],
    fintastic: ['lake vostok', 'lake nyos'],
  },
  'accidental-invention': {
    'reef-rookie': ['velcro'],
    fintastic: ['cisplatin'],
  },
  particle: {
    'fin-omenal': ['tau'],
  },
  'scientific-law': {
    plankton: ['evolution'],
    jawsome: ['relativity', 'quantum mechanics'],
    'fin-omenal': ['conservation of momentum'],
    fintastic: ['bell theorem'],
  },
  'space-mission': {
    'fin-omenal': ['pioneer 10'],
    fintastic: ['deep space 1'],
  },
  'ancient-wonder': {},
  'historical-event-fictional': {
    'fin-omenal': ['south sea bubble'],
    fintastic: ['dreadnought hoax', 'bermuda triangle'],
  },
  'maize-food': {},
  'hot-drink': {
    'fin-omenal': ['mate'],
    fintastic: ['kvass', 'sbiten'],
  },
  'sport-ball': {
    fintastic: ['jorkyball'],
  },
  'sport-water': {
    fintastic: ['apnea'],
  },
  'cricket-term': {
    'reef-rookie': ['fielder'],
    fintastic: ['chinaman'],
  },
  'film-space': {
    jawsome: ['blade runner'],
  },
  'film-best-picture': {
    'fin-omenal': ['sunrise'],
  },
  'film-franchise': {
    plankton: ['marvel cinematic universe'],
    fintastic: ['the thin man', 'ma and pa kettle'],
  },
  'tv-school': {
    plankton: ['the simpsons'],
    'fin-omenal': ['the prisoner', 'our friends in the north'],
    fintastic: ['the singing detective', 'edge of darkness'],
  },
  'string-instrument': {
    fintastic: ['viola da gamba', 'theorbo'],
  },
  'video-game-before-2000': {
    jawsome: ['final fantasy vii'],
    'fin-omenal': ['system shock 2'],
    fintastic: ['moon remix rpg adventure'],
  },
  'video-game-character': {
    fintastic: ['the nameless one'],
  },
  'architecture-style': {
    'reef-rookie': ['modernist'],
  },
  'language-nonlatin': {
    fintastic: ['geez'],
  },
  'book-adapted-film': {
    'fin-omenal': ['there will be blood'],
  },
};
