import type { Prompt, TierId } from '../game/types';

/** Every tier id, in order. */
export const TIER_IDS: TierId[] = [
  'plankton',
  'clever',
  'schooler',
  'rare',
  'deepcut',
  'krillion',
];

/**
 * The prompt bank.
 *
 * Each prompt lists every accepted answer bucketed by how uncommon that
 * answer is. The buckets map 1:1 onto the six rarity tiers, so the tier a
 * player lands in is decided purely by which bucket their answer is in.
 *
 * Tier guide:
 *   plankton  - what the whole room says
 *   clever    - the "clever" second answer everyone thinks of next
 *   schooler  - a genuine, slightly better answer
 *   rare      - most players would never have said this
 *   deepcut   - specialist territory
 *   krillion  - somebody had to know this to say it
 *
 * Within a prompt the buckets are disjoint — an answer appears exactly once.
 */
function p(
  id: string,
  text: string,
  category: string,
  hint: string,
  tiers: [string[], string[], string[], string[], string[], string[]],
  aliases: Record<string, string> = {},
): Prompt {
  return {
    id,
    text,
    category,
    hint,
    answers: {
      plankton: tiers[0],
      clever: tiers[1],
      schooler: tiers[2],
      rare: tiers[3],
      deepcut: tiers[4],
      krillion: tiers[5],
    },
    aliases,
  };
}

export const PROMPTS: Prompt[] = [
  p(
    'bird',
    'Name a bird',
    'Nature',
    'A feathered animal with a beak, two legs and wings',
    [
      ['sparrow', 'pigeon', 'eagle', 'crow', 'owl', 'robin', 'seagull', 'parrot', 'ostrich', 'penguin', 'chicken', 'duck', 'swan', 'starling'],
      ['hawk', 'falcon', 'woodpecker', 'heron', 'kingfisher', 'hummingbird', 'toucan', 'macaw', 'peacock', 'flamingo', 'stork', 'magpie', 'albatross', 'puffin'],
      ['osprey', 'kestrel', 'cockatoo', 'roadrunner', 'canary', 'condor', 'vulture', 'ibis', 'cormorant', 'pelican', 'nightingale', 'waxwing', 'bulbul', 'lorikeet'],
      ['kakapo', 'hoatzin', 'quetzal', 'shoebill', 'secretary bird', 'lyrebird', 'bird of paradise', 'hoopoe', 'bee-eater', 'turaco', 'hornbill', 'tropicbird', 'sparrowhawk', 'goshawk'],
      ['nightjar', 'potoo', 'caracara', 'jacamar', 'pratincole', 'lapwing', 'ruff', 'redshank', 'curlew', 'godwit', 'oystercatcher', 'penduline tit', 'wallcreeper'],
      ['kagu', 'sunbittern', 'umbrellabird', 'oilbird', 'seriema', 'mesite', 'guacharo', 'takahe', 'moustached starling', 'short-tailed pygmy tyrant', 'boat-billed heron'],
    ],
    {
      gull: 'seagull',
      'sea gull': 'seagull',
      'sparrowhawk': 'sparrowhawk',
    },
  ),
  p(
    'fruit',
    'Name a fruit',
    'Food',
    'The fleshy or juicy part of a plant that usually carries a seed',
    [
      ['apple', 'banana', 'orange', 'strawberry', 'grape', 'lemon', 'watermelon', 'pineapple', 'mango', 'pear', 'peach', 'cherry', 'plum', 'apricot'],
      ['blueberry', 'raspberry', 'blackberry', 'kiwi', 'coconut', 'lime', 'pomegranate', 'grapefruit', 'fig', 'avocado', 'melon', 'papaya', 'nectarine', 'mulberry'],
      ['durian', 'jackfruit', 'lychee', 'longan', 'guava', 'persimmon', 'dragonfruit', 'passionfruit', 'starfruit', 'kumquat', 'rambutan', 'cranberry', 'gooseberry', 'olive'],
      ['yuzu', 'pawpaw', 'salak', 'cupuacu', 'jabuticaba', 'langsat', 'mangosteen', 'tamarind', 'acai', 'noni', 'cherimoya', 'santol', 'feijoa', 'jujube'],
      ['miracle fruit', 'kiwano', 'soursop', 'marang', 'ackee', 'bael', 'breadfruit', 'amla', 'horned melon', 'kaffir lime', 'white sapote', 'ambarella', 'atis', 'ciricoya'],
      ['jocote', 'rose apple', 'buddhas hand', 'kadzu', 'cudrania', 'kantutan', 'mombin', 'wampee', 'sapodilla', 'acerola', 'pondicherry palm'],
    ],
  ),
  p(
    'metal',
    'Name a metal',
    'Science',
    'One of the shiny, conductive, malleable elements',
    [
      ['iron', 'copper', 'gold', 'silver', 'aluminium', 'zinc', 'lead', 'tin', 'nickel', 'steel', 'mercury', 'bronze'],
      ['titanium', 'chromium', 'cobalt', 'platinum', 'tungsten', 'magnesium', 'zirconium', 'vanadium', 'molybdenum', 'bismuth', 'palladium', 'silicon', 'tellurium'],
      ['rhodium', 'iridium', 'ruthenium', 'osmium', 'tantalum', 'niobium', 'hafnium', 'indium', 'thallium', 'gallium', 'germanium', 'sulphur', 'cesium'],
      ['rhenium', 'rubidium', 'thorium', 'uranium', 'barium', 'strontium', 'yttrium', 'scandium', 'lithium', 'beryllium', 'polonium', 'cadmium'],
      ['francium', 'protactinium', 'neptunium', 'americium', 'curium', 'einsteinium', 'fermium', 'mendelevium', 'rutherfordium', 'darmstadtium', 'roentgenium', 'copernicium'],
      ['nihonium', 'moscovium', 'tennessine', 'oganesson', 'flerovium', 'livermorium', 'bohrium', 'hassium', 'meitnerium', 'seaborgium', 'lawrencium'],
    ],
    {
      caesium: 'cesium',
      al: 'aluminium',
      aluminum: 'aluminium',
    },
  ),
  p(
    'africa-country',
    'Name a country in Africa',
    'Geography',
    'A sovereign state on the African continent',
    [
      ['nigeria', 'egypt', 'south africa', 'kenya', 'ethiopia', 'morocco', 'algeria', 'ghana', 'tanzania', 'uganda', 'sudan', 'somalia', 'zambia', 'zimbabwe', 'senegal', 'tunisia', 'angola', 'mozambique', 'cameroon', 'ivory coast'],
      ['botswana', 'namibia', 'mali', 'niger', 'chad', 'rwanda', 'guinea', 'madagascar', 'burkina faso', 'liberia', 'sierra leone', 'benin', 'togo', 'djibouti', 'eritrea', 'gambia', 'mauritania', 'congo', 'gabon', 'guinea bissau'],
      ['lesotho', 'eswatini', 'malawi', 'burundi', 'central african republic', 'democratic republic of the congo', 'equatorial guinea', 'comoros', 'seychelles', 'mauritius', 'cabo verde', 'sao tome and principe'],
      ['south sudan', 'mayotte', 'reunion', 'saint helena', 'canary islands', 'western sahara', 'somaliland', 'zanzibar', 'bioko', 'pemba', 'chagos archipelago', 'tromelin'],
      ['elobey', 'rodrigues', 'ascension island', 'djerba', 'bouvet island', 'aldabra', 'basse terre', 'juan de nova', 'annobon', 'bassas da india', 'french indian ocean territories', 'saint helena ascension and tristan da cunha'],
      ['corisco', 'principe', 'nossi be', 'agalega', 'europa island', 'british indian ocean territory', 'glorioso islands', 'crozet islands', 'kerguelen islands', 'amsterdam island', ],
    ],
    {
      swaziland: 'eswatini',
      'cape verde': 'cabo verde',
      'cote divoire': 'ivory coast',
      'congo kinshasa': 'democratic republic of the congo',
      'congo brazzaville': 'congo',
      zanzibar: 'zanzibar',
      gabon: 'gabon',
    },
  ),
  p(
    'us-state-capital',
    'Name a capital city of the United States',
    'Geography',
    'The seat of government of a US state, a US territory, or a former seat of the US government',
    [
      ['sacramento', 'austin', 'denver', 'boston', 'atlanta', 'phoenix', 'columbus', 'oklahoma city', 'salt lake city', 'honolulu', 'jackson', 'albany', 'raleigh', 'nashville', 'charleston', 'topeka'],
      ['little rock', 'baton rouge', 'springfield', 'indianapolis', 'des moines', 'jefferson city', 'lincoln', 'boise', 'tallahassee', 'lansing', 'santa fe', 'carson city', 'saint paul', 'montgomery'],
      ['juneau', 'frankfort', 'bismarck', 'harrisburg', 'columbia', 'pierre', 'hartford', 'dover', 'trenton', 'providence', 'concord', 'augusta'],
      ['annapolis', 'montpelier', 'cheyenne', 'helena', 'salem', 'olympia', 'richmond', 'madison'],
      ['hagatna', 'san juan', 'saipan', 'tamuning', 'garapan', 'palikir', 'pago pago', 'charlotte amalie'],
      ['philadelphia', 'new york city', 'baltimore', 'lancaster', 'york', 'princeton', 'newport', 'new bern'],
    ],
    {
      nyc: 'new york city',
      'new york': 'new york city',
      'st paul': 'saint paul',
      philly: 'philadelphia',
      'salt lake': 'salt lake city',
      oklahoma: 'oklahoma city',
      'little rock': 'little rock',
    },
  ),
  p(
    'cheese',
    'Name a cheese',
    'Food',
    'A food made from curdled or fermented milk',
    [
      ['cheddar', 'mozzarella', 'parmesan', 'gouda', 'feta', 'brie', 'camembert', 'roquefort', 'blue cheese', 'manchego', 'halloumi', 'ricotta', 'gruyere', 'swiss cheese', 'edam'],
      ['stilton', 'provolone', 'asiago', 'jarlsberg', 'tomme', 'raclette', 'mascarpone', 'fontina', 'chevre', 'morbier', 'taleggio', 'colby', 'muenster', 'gorgonzola', 'reblochon'],
      ['paneer', 'queso fresco', 'pecorino', 'comte', 'queso manchego', 'poutine', 'queso de cabra', 'requeijao', 'caciotta', 'monterey jack', 'maroilles', 'wensleydale', 'double gloucester', 'kefalotyri'],
      ['beaufort', 'vacherin', 'mimolette', 'nosiola', 'saint marcellin', 'banon', 'picodon', 'latteria', 'castelmarchio', 'tomme de savoie', 'queijo de serra', 'kashkaval', 'balkh', 'queso de cabrales'],
      ['pule', 'vermicello', 'cabrales', 'bettared', 'caso', 'bandel', 'messina', 'm weis', 'murrays', 'caciocavallo', ],
      ['nantua', 'saint albray', 'rocamadour', 'valencay', 'livarot', 'chaource', 'boursin', 'igny', 'bleu de bresse', 'bleu des python', 'maigrelle', ],
    ],
    {
      'comte': 'comte',
      'chevre': 'chevre',
      'reblochon': 'reblochon',
      camembert: 'camembert',
    },
  ),
  p(
    'cloud',
    'Name a type of cloud',
    'Science',
    'A visible mass of water droplets or ice crystals in the sky',
    [
      ['cumulus', 'stratus', 'cirrus', 'nimbostratus', 'altostratus', 'altocumulus', 'cirrostratus', 'cirrocumulus', 'cumulonimbus', 'fog'],
      ['stratocumulus', 'lenticular', 'virga', 'scud', 'mammatus', 'pyrocumulus', 'castellanus', 'turbulent', 'cumulus humilis', 'cumulus mediocris', 'altocumulus lenticularis', 'cumulonimbus incus'],
      ['cumulus congestus', 'cirrus fibratus', 'cumulonimbus capillatus', 'stratus fractus', 'cirrus uncinus', 'cumulus fractus', 'altocumulus undulatus', 'cirrocumulus lenticularis', 'stratocumulus undulatus', 'altocumulus duplicatus', 'cirrus radiatus', 'altostratus lenticularis'],
      ['cumulonimbus calvus', 'pilus', 'altocumulus stratiformis', 'spissatus', 'nimbostratus praecipitatio', 'cirrostratus fibratus', 'pyrocumulonimbus', 'altocumulus stratocumulus', 'cumulus castellatus', 'cirrus verrucosus', 'stratus nebulosus', 'altocumulus castellanus'],
      ['nimbostratus velum', 'altostratus praecipitatio', 'cirrus intortus', 'cirrus duplicatus', 'wall cloud', 'shelf cloud', 'roll cloud', 'arcus', ],
      ['cirrus incus', 'flumen', 'pannus', 'velum', 'mamma', 'homogonicus', 'cirrus cavum', 'cauda', ],
    ],
  ),
  p(
    'greek-god',
    'Name a Greek god',
    'Mythology',
    'A deity of the religion of ancient Greece',
    [
      ['zeus', 'poseidon', 'hades', 'athena', 'apollo', 'hera', 'ares', 'aphrodite', 'hermes', 'demeter', 'hestia', 'artemis'],
      ['dionysus', 'hephaestus', 'themis', 'euterpe', 'erato', 'polyhymnia', 'melpomene', 'terpsichore', 'thalia', 'clio', 'hygieia', ],
      ['persephone', 'asclepius', 'pan', 'echo', 'nemesis', 'selene', 'helios', 'hypnos', 'morpheus', 'eros', 'psyche', 'prometheus', 'pandora', 'tyche'],
      ['heracles', 'achilles', 'odysseus', 'bellerophon', 'orpheus', 'euryale', 'cupid', 'nike', 'iris', 'ganymede', ],
      ['kronos', 'titan', 'gaia', 'eos', 'nyx', 'chaos', 'aether', 'hecate', 'charites', 'thanatos', 'morphy', 'mormo', 'aion'],
      ['ercina', 'erebus', 'eidolon', 'amphitrite', 'thetis', 'rhea', 'mnemosyne', 'lachesis', 'atreus', 'khalkes', 'kharybdis', 'phobos', 'deimos'],
    ],
    {
      hercules: 'heracles',
      venus: 'aphrodite',
      mars: 'ares',
      mercury: 'hermes',
      minerva: 'athena',
      juno: 'hera',
      pluto: 'hades',
      neptune: 'poseidon',
      cupid: 'cupid',
      apollo: 'apollo',
    },
  ),
  p(
    'shakespeare',
    'Name a Shakespeare play',
    'Theatre',
    'A work written for the Elizabethan stage',
    [
      ['hamlet', 'macbeth', 'othello', 'romeo and juliet', 'king lear', 'julius caesar', 'richard iii', 'henry v', 'richard ii', 'henry iv', 'a midsummer night dream', 'the tempest', 'merchant of venice', 'as you like it'],
      ['twelfth night', 'much ado about nothing', 'measure for measure', 'the winter tale', 'cymbeline', 'titus andronicus', 'pericles', 'king john', 'henry vi', 'henry viii', 'all is lost', 'life of timon of athens', 'the comedy of errors', 'the two gentlemen of verona'],
      ['the merry wives of windsor', 'troilus and cressida', 'antony and cleopatra', 'coriolanus', 'timon of athens', 'the two noble kinsmen', 'the taming of the shrew', 'the spanish tragedy', 'the history of henry the fourth', 'king richard ii', 'love labour s lost', ],
      ['the history of cardenio', 'edward iii', 'sir thomas more', 'sir john oldcastle', 'a yorkshire tragedy', 'the noblewoman', 'cardenio', 'the double falsehood', ],
      ['the school for scandal', 'the suspicious mother', 'all for love', 'the white devil', 'the best wife in worcester', 'the hottest day', 'the humble petitioner', 'the loyal subject', ],
      ['the tragical history of cardinal wolsey', 'the nobleman', 'the maidens tragedy', 'the antiquary', 'the enthusiastick', 'the false countess', 'the hottest day in the country', 'the huntsman'],
    ],
    {
      'the tempest': 'the tempest',
      'midsummer': 'a midsummer night dream',
      'zadig': 'the tempest',
    },
  ),
  p(
    'constellation',
    'Name a constellation',
    'Space',
    'A group of stars that the ancients gave a name',
    [
      ['orion', 'ursa major', 'ursa minor', 'cassiopeia', 'cygnus', 'leo', 'scorpius', 'sagittarius', 'gemini', 'taurus', 'canis major', 'canis minor', 'aries', 'virgo', 'libra'],
      ['perseus', 'andromeda', 'pegasus', 'aquila', 'draco', 'pavo', 'grus', 'phoenix', 'hydrus', 'auriga', 'corona borealis', 'cetus', 'puppis', 'lyra', 'aquarius'],
      ['bootes', 'hercules', 'ophiuchus', 'cepheus', 'lacerta', 'serpens', 'centaurus', 'crux', 'cancer', 'pisces', 'camelopardalis', 'monoceros', 'sextans', 'pyxis', 'fornax'],
      ['sculptor', 'pictor', 'antlia', 'carina', 'vela', 'lupus', 'mensa', 'norma', 'circinus', 'triangulum australe', 'chamaeleon', 'octans', 'telescopium', 'volans', ],
      ['indus', 'columba', 'musca', 'crater', 'lepus', 'dorado', 'caelum', 'piscis austrinus', 'sagitta', 'triangulum', 'canes venatici', 'microscopium', ],
      ['tucana', 'eridanus', 'lemniske', 'chara', 'quadratans', 'reticulum', 'horologium', 'lynx', ],
    ],
    {
      'big dipper': 'ursa major',
      plough: 'ursa major',
      'little dipper': 'ursa minor',
      'south cross': 'crux',
    },
  ),
  p(
    'volcano',
    'Name a volcano',
    'Geography',
    'A mountain or vent that can erupt with molten rock',
    [
      ['vesuvius', 'etna', 'fuji', 'kilauea', 'popocatepetl', 'mauna loa', 'mount st helens', 'krakatoa', 'kilimanjaro', 'mount tambora', 'mount rainier', 'vulcano', 'mount shasta'],
      ['tarawera', 'sakurajima', 'mount erebus', 'mount ruapehu', 'taupo', 'mount tongariro', 'mayon', 'taal', 'mount ngauruhoe', 'cotopaxi', 'galapagos', 'mount pelee', 'chimborazo'],
      ['baruj', 'merapi', 'cavite', 'mount banahaw', 'mount iriga', 'bulusan', 'canlaon', 'mt makiling', 'mandalagan', 'galunggung', 'sangeang api', 'paluweh', 'mount agung'],
      ['cerro pachon', 'mount hood', 'mount baker', 'mount olympus', 'mount adams', 'mount edison', 'mount moore', 'mount bachelor', ],
      ['karthala', 'piton de la fournaise', 'mohale', 'mount nyiragongo', 'mount nyamuragira', 'ol do nyo lengai', 'mount edgecumbe', 'mount spurr', 'mount augustine', 'mount redoubt', 'mount nkomo', 'mount silali', 'mount bamus'],
      ['manam', 'tangkuban perahu', 'ibukiyama', 'asama', 'mount langila', 'mt lamington', 'mount monowai', 'mt icarus', ],
    ],
  ),
  p(
    'river',
    'Name a river',
    'Geography',
    'A natural stream of flowing water',
    [
      ['nile', 'amazon', 'yangtze', 'mississippi', 'danube', 'ganges', 'volga', 'ob', 'indus', 'mekong', 'thames', 'seine', 'rhine', 'niger'],
      ['rhone', 'elbe', 'don', 'po', 'tiber', 'loire', 'ebro', 'scheldt', 'vltava', 'dnieper', 'vistula', 'oder', 'severn', 'humber', 'mersey'],
      ['shannon', 'adige', 'ticino', 'mur', 'inn', 'main', 'salween', 'brahmaputra', 'godavari', 'krishna', 'kaveri', 'narmada', 'tapti', 'mahanadi', 'son'],
      ['orinoco', 'parana', 'rio grande', 'colorado', 'missouri', 'mackenzie', 'coppermine', 'churchill', 'athabasca', 'peace', 'hay', 'back', 'zambezi', 'limpopo'],
      ['damodar', 'hooghly', 'mandovi', 'tumen', 'yalu', 'songhua', 'lena', 'yenisei', 'amur', ],
      ['vanuatu', 'oyapock', 'koyukuk', 'nowitna', 'kobuk', 'selenga', 'ruronga', 'pengo', 'rifle', 'taz', 'prickle', 'cooper', 'gairdner', 'murchison'],
    ],
    {
      'amazon river': 'amazon',
      orinoco: 'orinoco',
      elbe: 'elbe',
      'rhone': 'rhone',
    },
  ),
  p(
    'bone',
    'Name a bone',
    'Science',
    'A single skeletal element, whether it comes from a human, an animal or a bird',
    [
      ['femur', 'tibia', 'fibula', 'humerus', 'radius', 'ulna', 'skull', 'mandible', 'rib', 'pelvis', 'vertebra', 'scapula', 'sternum', 'clavicle'],
      ['patella', 'carpal', 'metacarpal', 'tarsal', 'metatarsal', 'phalanx', 'sacrum', 'coccyx', 'hyoid', 'sphenoid', 'ethmoid', 'temporal', 'occipital', 'parietal'],
      ['frontal', 'nasal', 'maxilla', 'zygomatic', 'palatine', 'vomer', 'lacrimal', 'ischium', 'ilium', 'pubis', 'atlas', 'axis', 'malleus', 'incus'],
      ['stapes', 'nasal concha', 'superior turbinate', 'inferior turbinate', 'tympanic', 'epiglottis', 'cuneiform', 'cuboid', 'navicular', 'talus', 'calcaneus', 'trapezium', 'trapezoid', 'scaphoid'],
      ['lunate', 'triquetrum', 'pisiform', 'capitate', 'hamate', 'uncinate', 'concha', 'supramaxilla', 'intermaxilla', 'pterygoid', 'supraorbital', 'styloid process'],
      ['fabella', 'os trigonum', 'quadrate', 'articular', 'surangular', 'prearticular', 'parasphenoid', 'dentary', 'jugal', 'quadratojugal', 'quadrate process'],
    ],
  ),
  p(
    'pasta',
    'Name a pasta shape',
    'Food',
    'A shape of Italian noodle or dough',
    [
      ['spaghetti', 'penne', 'macaroni', 'lasagna', 'ravioli', 'fettuccine', 'rigatoni', 'linguine', 'conchiglie', 'fusilli', 'tortellini', 'gnocchi', 'orzo', 'cappelletti'],
      ['farfalle', 'bucatini', 'rotelle', 'ziti', 'elbows', 'rotini', 'cavatappi', 'ditalini', 'quadrelli', 'scaloppine', 'partridge', 'casarecce', 'trofie', 'vermicelli'],
      ['mafaldine', 'pappardelle', 'perciatelli', 'lagane', 'pizzoccheri', 'chitarra', 'strozzapreti', 'sagne', 'gnocchetti', 'gnocchi di malga', 'cavatelli', 'lumache', 'ragatelle', 'orecchiette'],
      ['malfatti', 'canestrelli', 'sacchetti', 'tortelloni', 'tortelli', 'pelmeni', 'kolduny', 'kreplach', 'wonton', 'tortiglioni', 'pici', 'orecchie', 'pasta alla gricia'],
      ['candele', 'cappuncelli', 'fiocchi', 'mischiglio', 'pasta mista', 'ladle', 'trumpet', 'bigoncini', 'tria', 'tatare', 'tagliolini', 'nastro'],
      ['filindeu', 'quadrifoglio', 'marzapane', 'spaghettoni', 'saccottini', 'malloreddu', 'trenette', 'mandorlina'],
    ],
    {
      'bow tie': 'farfalle',
      butterflies: 'farfalle',
      shells: 'conchiglie',
    },
  ),
  p(
    'gemstone',
    'Name a gemstone',
    'Nature',
    'A mineral that has been cut and polished for decoration',
    [
      ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'opal', 'amber', 'jade', 'topaz', 'garnet', 'turquoise', 'amethyst', 'beryl', 'quartz'],
      ['agate', 'aquamarine', 'citrine', 'onyx', 'jasper', 'malachite', 'lapis lazuli', 'moonstone', 'tanzanite', 'tourmaline', 'peridot', 'zircon', 'spinel', 'obsidian'],
      ['chrysoprase', 'chrysocolla', 'carnelian', 'coral', 'labradorite', 'morganite', 'alexandrite', 'kunzite', 'iolite', 'petalite', 'larimar', 'chrysoberyl', 'demantoid', 'rhodonite'],
      ['azurite', 'benitoite', 'ixiolite', 'taaffeite', 'zirconite', 'willemite', 'pumpellyite', 'apophyllite', 'fluorite', 'lepidolite', 'sunstone', 'amazonite', 'sugilite'],
      ['mimetite', 'pyromorphite', 'wulfenite', 'vanadinite', 'descloizite', 'cerussite', 'anglesite', 'leadhillite', 'witherite', 'hauchecornite', 'zincite', 'sphalerite', 'pink topaz', 'jeremejevite'],
      ['pajamalite', 'tugtupite', 'moissanite', 'andradite', 'grossular', 'bixbite', 'apatite', 'phenakite', 'danburite', 'scapolite', 'mellite'],
    ],
    {
      'lapis': 'lapis lazuli',
      alexandrite: 'alexandrite',
      emerald: 'emerald',
      'pink topaz': 'pink topaz',
    },
  ),
  p(
    'superhero',
    'Name a comic book superhero',
    'Pop culture',
    'A costumed hero who appears in comic books',
    [
      ['spider-man', 'batman', 'superman', 'iron man', 'wolverine', 'thor', 'hulk', 'captain america', 'flash', 'wonder woman', 'green lantern', 'doctor strange', 'black widow', 'daredevil'],
      ['venom', 'deadpool', 'ant man', 'green arrow', 'hawkeye', 'black panther', 'storm', 'cyclops', 'rogue', 'gambit', 'mystique', 'silver surfer', 'human torch', 'invisible woman', 'captain marvel'],
      ['catwoman', 'joker', 'lex luthor', 'magneto', 'loki', 'thanos', 'ultron', 'red skull', 'green goblin', 'doctor octopus', 'kingpin', 'hela', 'grandmaster', 'luke cage', 'iron fist'],
      ['galactus', 'kang', 'the watcher', 'celestial', 'bishop', 'havok', 'cerebro', 'oni', 'the maker', 'darkseid', 'brainiac', 'trigon', 'starman', 'shazam'],
      ['static', 'hardware', 'icon', 'malcolm cole', 'cannonball', 'steel', 'vigilante', 'magnet', 'barrier', 'rocket red', 'nightwing', 'red hood', 'batgirl', 'huntress', 'oracle'],
      ['squirrel girl', 'cable', 'nick fury', 'taskmaster', 'punisher', 'ghost rider', 'moon knight', 'sentry', 'world war hulk', 'thunderbolt', 'deadboy', 'pogo', 'nemesis', ],
    ],
    {
      spiderman: 'spider-man',
      'spider man': 'spider-man',
      ironman: 'iron man',
      'cap america': 'captain america',
      hulk: 'hulk',
      wolverine: 'wolverine',
    },
  ),
  p(
    'bond-actor',
    'Name someone who has appeared in a James Bond film',
    'Films',
    'A face from the films, from the first one to the latest',
    [
      ['sean connery', 'roger moore', 'pierce brosnan', 'daniel craig', 'timothy dalton', 'george lazenby', 'david niven', 'peter sellers'],
      ['gert frobe', 'michael lonsdale', 'claudi auger', 'james mason', 'john gavin', 'patrick mcgoohan', 'woody allen', 'judi dench', 'naomie harris', 'chris todd'],
      ['jonathan pryce', 'colin salmon', 'michael gough', 'christopher lee', 'john gielgud', 'anthony perkins', 'john hurt', 'simon ward', 'robert brown', 'walter gotell'],
      ['talisa soto', 'james remar', 'david schofield', 'gabrielle anstruther', 'tom so', 'jill st john', 'lois maxwell', 'bernard lee', 'desmond llewelyn', 'lois childe'],
      ['philip voss', 'michael wincott', 'patrick mowbray', 'jimmy nallon', 'pat roach', 'sean callery', 'howard rose', 'gordon jack', 'peter wys', 'hans zigger'],
      ['tracy reed', 'norman richardson', 'donald gray', 'donald pickering', 'burt jaymes', 'craig warner', 'sean lawrie', 'george nash'],
    ],
    {
      connery: 'sean connery',
      moore: 'roger moore',
      brosnan: 'pierce brosnan',
      craig: 'daniel craig',
      dalton: 'timothy dalton',
      lazenby: 'george lazenby',
      '007': 'sean connery',
    },
  ),
  p(
    'currency',
    'Name a world currency',
    'Geography',
    'The official unit of money of a country',
    [
      ['dollar', 'euro', 'pound', 'yen', 'yuan', 'won', 'rupee', 'peso', 'real', 'franc', 'krone', 'rand', 'baht', 'ringgit', 'zloty'],
      ['lira', 'dirham', 'riyal', 'rupiah', 'forint', 'koruna', 'lev', 'lei', 'kuna', 'taka', 'kyat', 'riel', 'dong', 'afghani', 'som'],
      ['manat', 'tenge', 'hryvnia', 'denar', 'dram', 'somoni', 'lari', 'cedi', 'naira', 'kwanza', 'birr', 'nakfa', 'gourde', 'lilangeni', 'loti'],
      ['pula', 'kwacha', 'maloti', 'ngultrum', 'dagum', 'kina', 'vatu', 'tala', 'pa anga', 'cfp franc', 'drachma', 'peseta', 'boliviano', 'guarani', 'sol'],
      ['quetzal', 'balboa', 'cordoba', 'colon', 'escudo', 'dobras', 'austral', 'pataca', 'kroon', 'rial'],
      ['florin', 'shilling', 'farthing', 'thaler', 'ducat', 'mohur', 'livre', 'piastra', 'sequin', 'bezant', 'tical', 'marco', 'denier', 'scudo', 'picci', 'kurus'],
    ],
    {
      won: 'won',
      'rupees': 'rupee',
      'pounds': 'pound',
      dollars: 'dollar',
      euros: 'euro',
    },
  ),
  p(
    'programming-language',
    'Name a programming language',
    'Tech',
    'A language that a compiler or interpreter understands',
    [
      ['javascript', 'python', 'java', 'c', 'c plus plus', 'csharp', 'ruby', 'php', 'swift', 'go', 'rust', 'typescript', 'kotlin', 'scala', 'perl'],
      ['r', 'matlab', 'objective c', 'haskell', 'lua', 'clojure', 'elixir', 'erlang', 'f sharp', 'julia', 'dart', 'zig', 'crystal', 'nim', 'groovy'],
      ['assembly', 'fortran', 'cobol', 'ada', 'pascal', 'prolog', 'scheme', 'common lisp', 'standard ml', 'ocaml', 'visual basic', 'delphi', 'smalltalk', 'tcl', 'awk'],
      ['vhdl', 'verilog', 'systemverilog', 'solidity', 'move', 'cairo', 'idris', 'agda', 'lean', 'coq', 'f star', 'ats', 'koka', 'effekt', 'flix'],
      ['apl', 'forth', 'vala', 'sather', 'pico', 'whitespace', 'intercal', 'befunge', 'malbolge', 'frink', 'joy', 'bc', 'sed', ],
      ['eternity', 'fringe', 'lambda', 'raku', 'zsh', 'fish', 'pony', 'flan', 'bird', 'nimrod', 'aheui', ],
    ],
    {
      js: 'javascript',
      ts: 'typescript',
      'c#': 'csharp',
      golang: 'go',
      py: 'python',
      rb: 'ruby',
      cpp: 'c plus plus',
      'c++': 'c plus plus',
      'objective-c': 'objective c',
    },
  ),
  p(
    'jupiter-moon',
    'Name a moon of Jupiter',
    'Space',
    'A natural satellite orbiting the giant planet Jupiter',
    [
      ['io', 'europa', 'ganymede', 'callisto', 'amalthea', 'himalia', 'elara', 'pasiphae', 'sinope', 'carme', 'ananke'],
      ['leda', 'thebe', 'metis', 'adrastea', 'themisto', 'carpo', 'callirrhoe', 'kore', 'eukelade', 'mneme', 'arche'],
      ['aoede', 'thelxinoe', 'herse', 'hermippe', 'thoe', 'praxithea', 'pandia', 'philophrosyne', 'valetudo', 'euporie', 'orthosie'],
      ['sponde', 'kale', 'taygete', 'chaldene', 'harpalyke', 'isonoe', 'erinome', 'kalyke', 'aitne', 'lysithea', 'hippocamp'],
      ['eanthe', 'eupheme', 'euanthe', 'cori', 'helike', 'kallichore', 'cimon', 'megaclite', 'autonoe', 'caliban', 'mounisto'],
      ['cyllene', 'dia', 'aegaeon', 'eurydome', 'steropes', 'evadne', 'karpos', 'pasithee', 'ersa', 'hexlethe', 'euphrosyne'],
    ],
  ),
  p(
    'dinosaur',
    'Name a dinosaur',
    'Prehistory',
    'An extinct reptile that lived in the Mesozoic',
    [
      ['tyrannosaurus', 'velociraptor', 'stegosaurus', 'brachiosaurus', 'triceratops', 'spinosaurus', 'raptor', 'trex', 'brontosaurus', 'allosaurus', 'diplodocus', 'parasaurolophus', 'pterodactyl'],
      ['ankylosaurus', 'iguanodon', 'pteranodon', 'carnotaurus', 'compsognathus', 'gallimimus', 'coelophysis', 'baryonyx', 'oviraptor', 'protoceratops', 'styracosaurus', 'archaeopteryx', 'confuciusornis'],
      ['giganotosaurus', 'quetzalcoatlus', 'ambopteryx', 'plateosaurus', 'sinraptor', 'dromaeosaurus', 'troodon', 'carcharodontosaurus', 'deinocheirus', 'therizinosaurus', 'pachycephalosaurus', 'psittacosaurus', 'seismosaurus'],
      ['mamenchisaurus', 'utahraptor', 'camptosaurus', 'nodosaurus', 'talarurus', 'sauropelta', 'euoplocephalus', 'gorgosaurus', 'cryolophosaurus', 'acanthosaurus', 'edmontonia', 'maiasaura'],
      ['proceratops', 'syntarsus', 'staurikosaurus', 'pisanosaurus', 'elaphrosaurus', 'saltasaurus', 'zhenyuanlong', 'aardonyx', 'nyasasaurus', 'mambawukwe', 'kryptobaatar', 'shuvuuu'],
      ['megaraptor', 'nqixing', 'diplotator', 'ceratosaurus', 'saltopus', 'huanansaurus', 'heterodontosaurus', 'guanlong', 'jangaraptor', 'masiakasaurus', 'nanshiungosaurus', 'tuojiangosaurus'],
    ],
  ),
  p(
    'cocktail',
    'Name a cocktail',
    'Drinks',
    'A mixed drink of spirits, mixers and garnishes',
    [
      ['margarita', 'mojito', 'cosmopolitan', 'espresso martini', 'negroni', 'old fashioned', 'manhattan', 'martini', 'daiquiri', 'bloody mary', 'pina colada', 'caipirinha', 'long island iced tea', 'whiskey sour'],
      ['aperol spritz', 'sangria', 'paloma', 'moscow mule', 'french 75', 'sidecar', 'boulevardier', 'corpse revive no 2', 'mai tai', 'between the sheets', 'sex on the beach', 'godfather', 'plantain', 'amaretto sour', 'gin and tonic'],
      ['paper plane', 'last word', 'naked and famous', 'gold rush', 'improved whiskey', 'bramble', 'penicillin', 'velvet hour', 'division bell', 'remember the me', 'pisco sour', 'sazerac', 'vieux carre', 'brown derby'],
      ['hemingway', 'jungle bird', 'transplant', 'garibaldi', 'bichon', 'scofflaw', 'planter punch', 'swizzle', 'danbury', 'tommys margarita', ],
      ['zombie', 'hurricane', 'rum old fashioned', 'hanky panky', 'billionaire', 'stinger', 'french connection', 'cognac flip', 'vesuvio', 'oaxaca old fashioned', ],
      ['three wise men', 'bible belt', 'bachelor party', 'black angel', 'cliffhanger', 'corkscrew', 'dutchman', 'giro', 'mamie taylor', 'monkey gland', 'shoe shine', ],
    ],
    {
      'old fashioned': 'old fashioned',
      'g and t': 'gin and tonic',
    },
  ),
  p(
    'grape',
    'Name a wine grape',
    'Wine',
    'A grape variety used to make wine',
    [
      ['chardonnay', 'merlot', 'cabernet sauvignon', 'pinot noir', 'syrah', 'sauvignon blanc', 'riesling', 'zinfandel', 'pinot grigio', 'tempranillo', 'shiraz', 'grenache'],
      ['nebbiolo', 'barolo', 'barbaresco', 'sangiovese', 'chianti', 'rioja', 'gamay', 'beaujolais', 'carmenere', 'malbec', 'tannat', 'petit verdot', 'mourvedre', 'brunello'],
      ['malvasia', 'vermentino', 'viognier', 'gewurztraminer', 'pinot gris', 'moscatel', 'trebbiano', 'cannonau', 'garganego', 'falanghina', 'picolit', 'gavi', 'glera', 'timorasso'],
      ['schiava', 'refosco', 'bobal', 'prieto', 'trepat', 'mencia', 'garnacha', 'graciano', 'matarromera', 'monastrell', 'blaufrankisch', 'ribolla gialla', 'frappato', 'nasco'],
      ['ximenez', 'pedro ximenez', 'lacrima di rovere', 'verdicchio', 'greco di tufo', 'corvina', 'lagrein', 'molinara', ],
      ['ranantina', 'grignolino', 'freisa', 'vespolina', 'gropello', 'maceration', 'ribolla', 'hfort', 'tribid', 'bobone', ],
    ],
    {
      'cabernet': 'cabernet sauvignon',
      pinot: 'pinot noir',
      sauvignon: 'sauvignon blanc',
      gamay: 'gamay',
    },
  ),
  p(
    'car-maker',
    'Name a car manufacturer',
    'Transport',
    'A company that builds cars',
    [
      ['toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'hyundai', 'kia', 'volkswagen', 'bmw', 'mercedes-benz', 'audi', 'subaru', 'mazda', 'renault', 'peugeot', 'fiat'],
      ['tesla', 'volvo', 'citroen', 'skoda', 'seat', 'mitsubishi', 'suzuki', 'dacia', 'chrysler', 'jeep', 'dodge', 'cadillac', 'jaguar', 'land rover', 'lexus', 'mini'],
      ['acura', 'infiniti', 'genesis', 'smart', 'alfa romeo', 'aston martin', 'bentley', 'rolls royce', 'porsche', 'ferrari', 'lamborghini', 'maserati', 'bugatti', 'mclaren', 'pagani'],
      ['lotus', 'koenigsegg', 'rimac', 'byd', 'nio', 'xpeng', 'lucid', 'rivian', 'polestar', 'vinfast', 'gac', 'chery', 'geely', 'great wall motors', 'maruti'],
      ['morgan', 'ariel', 'bristol', 'ginetta', 'tvr', 'caterham', 'humber', 'riley', 'triumph', 'rover', 'vauxhall', 'austin', 'lancia', 'de lorean'],
      ['tatra', 'singer', 'lanchester', 'daimler', 'hudson', 'packard', 'plymouth', 'nash', 'studebaker', 'exley', 'intermeccanica', 'wiesmann'],
    ],
    {
      mercedes: 'mercedes-benz',
      vw: 'volkswagen',
      'mercedes benz': 'mercedes-benz',
      'land rover': 'land rover',
      chev: 'chevrolet',
      chevy: 'chevrolet',
    },
  ),
  p(
    'chess-opening',
    'Name a chess opening',
    'Games',
    'A named sequence of moves from the start of a chess game',
    [
      ['sicilian defense', 'queen pawn game', 'ruy lopez', 'italian game', 'french defense', 'carlsbad', 'kings indian defense', 'slav defense', 'queens gambit', 'petrov', 'evans gambit', 'sicilian', 'vienna game'],
      ['scotch game', 'king s gambit', 'four knights', 'bird s opening', 'larsen', 'scandinavian defense', 'najdorf', 'sicilian scheveningen', 'kan', 'sicilian dragon', 'bishop s opening', 'english opening', 'reti'],
      ['nimzo indian', 'queen s indian', 'benoni', 'grunfeld', 'nimzowitsch', 'torre attack', 'sokolsky', 'grob', 'colle', 'philidor', 'tarrasch', 'classical', 'dunst'],
      ['berlin defense', 'mieses', 'krishchak', 'robatsch', 'maccutcheon', 'bernstein', 'handicap', 'van geijn', 'smith morra', 'center game', 'chigorin gambit', 'zukertort gambit', 'anderssen gambit'],
      ['goring gambit', 'nadash gambit', 'isard gambit', 'hamppe gambit', 'chartres gambit', 'carpenter gambit', 'hamilton gambit', 'ponziani gambit', 'suffrage gambit', 'cambridge springs gambit', 'burn gambit', 'nunn gambit'],
      ['mason gambit', 'blackmar gambit', 'savon gambit', 'miles gambit', 'durkin', 'bongcloud', 'sheffield gambit', 'guy gambit', 'malaniuk gambit', 'nimzowitsch gambit'],
    ],
    {
      sicilian: 'sicilian defense',
      'queen gambit': 'queens gambit',
      'kings indian': 'kings indian defense',
      french: 'french defense',
      'ruy lopez': 'ruy lopez',
      'italian game': 'italian game',
      'queen pawns': 'queen pawn game',
    },
  ),
  p(
    'orchestra',
    'Name a symphony orchestra',
    'Music',
    'A large ensemble of classical instrumentalists',
    [
      ['london symphony orchestra', 'berlin philharmonic', 'new york philharmonic', 'royal philharmonic orchestra', 'vienna philharmonic', 'boston symphony orchestra', 'chicago symphony orchestra', 'philadelphia orchestra', 'cleveland orchestra', 'los angeles philharmonic', 'gewandhausorchester', 'concertgebouw orchestra'],
      ['bavarian radio symphony orchestra', 'royal swedish philharmonic', 'berlin symphony', 'paris orchestra', 'orchestre national de france', 'residents of los angeles', 'san francisco symphony', 'montreal symphony', 'toronto symphony', 'sydney symphony', 'melbourne symphony', 'hamburg philharmonic'],
      ['wiener philharmoniker', 'philharmonia orchestra', 'lithuanian national philharmonic', 'russian national orchestra', 'moscow philharmonic', 'st petersburg philharmonic', 'hungarian state symphony', 'czech philharmonic', 'japan phil', 'westdeutsche rundfunk', 'nederlands philharmonisch', 'dresdner philharmonie'],
      ['zurich tonhalle', 'oslo philharmonic', 'helsinki philharmonic', 'copenhagen royal philharmonic', 'brussels philharmonic', 'zurich philharmonic', 'stuttgart chamber orchestra', 'academy of st martin in the fields', 'munchener philharmoniker', 'dusseldorf symphony', 'baltic sea festival', 'nordic chamber'],
      ['orchestra of the age of enlightenment', 'concerto koln', 'concerto vienna', 'niagara falls', 'yomiuri nhk symphony orchestra', 'kbs symphony orchestra', 'singapore symphony orchestra', 'detroit symphony orchestra', ],
      ['la petite bande', 'the knights', 'il giardino armonico', 'les arts florissants', 'academy of ancient music', 'the english concert', 'chamber orchestra of europe', 'violins of the west', ],
    ],
    {
      lso: 'london symphony orchestra',
      rpo: 'royal philharmonic orchestra',
      bso: 'boston symphony orchestra',
      'ny philharmonic': 'new york philharmonic',
      'wiener phil': 'wiener philharmoniker',
    },
  ),
  p(
    'city-germany',
    'Name a city in Germany',
    'Geography',
    'A city in the Federal Republic of Germany',
    [
      ['berlin', 'hamburg', 'munich', 'cologne', 'frankfurt', 'stuttgart', 'dusseldorf', 'dortmund', 'essen', 'leipzig', 'bremen', 'dresden', 'hannover', 'nuremberg', 'heidelberg', 'bonn'],
      ['wurzburg', 'mainz', 'kassel', 'karlsruhe', 'mannheim', 'augsburg', 'wiesbaden', 'regensburg', 'ulm', 'heilbronn', 'potsdam', 'lubeck', 'osnabruck', 'solingen', 'paderborn', 'gera'],
      ['jena', 'halle', 'magdeburg', 'kiel', 'chemnitz', 'aachen', 'erlangen', 'ingolstadt', 'cottbus', 'goettingen', 'marburg', 'trier', 'koblenz', 'bamberg', 'aschaffenburg', 'weimar'],
      ['schwerin', 'flensburg', 'konstanz', 'celle', 'goslar', 'quedlinburg', 'wismar', 'molln', 'luneburg', 'bautzen', 'guben', 'hoyerswerda', 'zittau'],
      ['berchtesgaden', 'rendsburg', 'garmisch', 'oberammergau', 'buxtehude', 'ramstein', 'bischofsheim', 'kaiserslautern', 'landshut', 'coburg', 'passau', 'rosenheim', 'erding', 'bad reichenhall', 'zell am see'],
      ['gorlitz', 'triberg', 'murnau', 'borkum', 'spiekeroog', 'tangermunde', 'saarburg', 'lindau', 'wernigerode', 'kronach', 'mittenwald', 'partenkirchen'],
    ],
    {
      munchen: 'munich',
      koln: 'cologne',
      nurnberg: 'nuremberg',
      'frankfurt am main': 'frankfurt',
      'mainz am rhein': 'mainz',
      'bad reichenhall': 'bad reichenhall',
      stuttgart: 'stuttgart',
    },
  ),
  p(
    'japanese-dish',
    'Name a Japanese dish',
    'Food',
    'A food or drink of Japanese origin',
    [
      ['sushi', 'ramen', 'tempura', 'teriyaki', 'miso soup', 'sashimi', 'udon', 'soba', 'yakitori', 'katsu curry', 'okonomiyaki', 'takoyaki', 'mochi', 'onigiri'],
      ['karaage', 'katsudon', 'tonkotsu', 'gyoza', 'oyakodon', 'unagi', 'bento', 'shabu shabu', 'sukiyaki', 'edamame', 'katsu', ],
      ['nikuman', 'anpan', 'taiyaki', 'dorayaki', 'matcha', 'hojicha', 'genmaicha', 'honey toast', 'tamago', 'daifuku', 'monaka', 'konnyaku', 'yuba', 'chawanmushi', 'sansho'],
      ['hiyashi chuka', 'monjayaki', 'hashiraki', 'shojin ryori', 'yakiniku', 'kushiyaki', 'toro', 'hokkaido uni', ],
      ['nabe', 'aburaage', 'kaiseki', 'oshiruko', 'suiren', 'kamaboko', 'tamagoyaki', 'menchi katsu', ],
      ['funazushi', 'hira zushi', 'narezushi', 'konbu sushi', 'osaka style sushi', 'chirashi zushi', 'neta sushi', 'takenoko gohan', ],
    ],
    {
      sushi: 'sushi',
      ramen: 'ramen',
      miso: 'miso soup',
      udon: 'udon',
    },
  ),
  p(
    'unit',
    'Name a unit of measurement',
    'Science',
    'A named quantity used to measure something',
    [
      ['metre', 'second', 'gram', 'kilogram', 'litre', 'newton', 'joule', 'watt', 'pascal', 'hertz', 'kelvin', 'celsius', 'ampere', 'ohm', 'volt', 'mile', 'foot', 'inch'],
      ['acre', 'hectare', 'gallon', 'pint', 'ounce', 'tonne', 'minute', 'hour', 'day', 'year', 'decade', 'century', 'millennium', 'millisecond', 'microsecond', 'nanosecond'],
      ['furlong', 'nautical mile', 'knot', 'barrel', 'bushel', 'hundredweight', 'stone', 'dram', 'grain', 'carat', 'rood', 'perch', 'chain', 'league', 'cubit'],
      ['radian', 'steradian', 'dyne', 'erg', 'gauss', 'maxwell', 'oersted', 'torr', 'bar', 'poise', 'stokes', 'katal', 'becquerel', 'gray', 'sievert', 'curie'],
      ['rem', 'rad', 'lumen', 'lux', 'candela', 'nit', 'phot', 'diopter', 'stilb', 'jansky', 'smoot', 'pica', 'point', 'fathom', 'cable'],
      ['tog', 'penny', 'napkin', 'kip', 'pood', 'obolos', 'shekel', 'talent', 'mina', 'stater', ],
    ],
    {
      meters: 'metre',
      metres: 'metre',
      grams: 'gram',
      seconds: 'second',
      kg: 'kilogram',
      ml: 'litre',
      celsius: 'celsius',
      degrees: 'celsius',
    },
  ),
  p(
    'greek-letter',
    'Name a letter of the Greek alphabet',
    'Language',
    'One of the letters of the ancient Greek alphabet, including the archaic ones',
    [
      ['alpha', 'beta', 'gamma', 'delta', 'omega', 'pi', 'lambda', 'theta', 'sigma', 'mu'],
      ['epsilon', 'zeta', 'eta', 'iota', 'kappa', 'nu', 'xi', 'omicron', 'rho', 'tau'],
      ['upsilon', 'phi', 'chi', 'psi', 'digamma', 'stigma', 'koppa', 'san', 'sampi', 'yot'],
      ['heta', 'ai', 'phei', 'tsan', 'khoi', 'pai', 'archaic koppa', 'archaic digamma', 'archaic sampi', 'double gamma'],
      ['old heta', 'old san', 'attic koppa', 'discordant digamma', 'reticulate digamma', 'archaic stigma', 'attic stigma', 'archaic heta', ],
      ['aleph', 'beth', 'gimel', 'daleth', 'final kaph', 'ho', 'cretan digamma', 'messenian digamma'],
    ],
    {
      a: 'alpha',
      b: 'beta',
      g: 'gamma',
      d: 'delta',
      e: 'epsilon',
      z: 'zeta',
      h: 'eta',
      th: 'theta',
      i: 'iota',
      k: 'kappa',
      l: 'lambda',
      m: 'mu',
      n: 'nu',
      x: 'xi',
      o: 'omicron',
      p: 'pi',
      r: 'rho',
      s: 'sigma',
      t: 'tau',
      u: 'upsilon',
      f: 'phi',
      ch: 'chi',
      ps: 'psi',
      w: 'omega',
    },
  ),
  p(
    'bridge',
    'Name a famous bridge',
    'Geography',
    'A well-known man-made crossing over water or a valley',
    [
      ['golden gate bridge', 'brooklyn bridge', 'tower bridge', 'london bridge', 'sydney harbour bridge', 'storstrom bridge', 'millau viaduct', 'forth road bridge', 'bosphorus bridge'],
      ['akashi kaikyo bridge', 'izmit bay bridge', 'anzac bridge', 'tsing ma bridge', 'yangtze river bridge', 'zhangjiajie bridge', 'great western bridge', 'confederation bridge', 'humber bridge'],
      ['sf bay bridge', 'florida keys bridge', 'key west bridge', 'seven mile bridge', 'lake pontchartrain causeway', 'richmond san rafael bridge', 'san rafael bridge', 'delaware memorial bridge', 'mackinac bridge', 'oakland bay bridge', 'ponte vecchio', 'rialto bridge'],
      ['charles bridge', 'claudius bridge', 'prague bridge', 'suspension bridge', 'madison memorial bridge', 'otis bridge', 'stanley tucci bridge', 'pony express bridge', 'pons aelius'],
      ['queensboro bridge', 'manhattan bridge', 'williamsburg bridge', 'george washington bridge', 'tilikum crossing', 'sunshine bridge', 'gateshead millennium bridge', 'eads bridge', 'high level bridge'],
      ['aztec bridge', 'shek mun bridge', 'clyde arc', 'madison bridge', 'steel bridge', 'poughkeepsie bridge', 'warrington bridge', 'ponte di sant angelo', 'silver jubilee bridge', 'barmouth bridge'],
    ],
  ),
  p(
    'sidekick',
    'Name a superhero sidekick',
    'Pop culture',
    'The junior partner of a comic book hero',
    [
      ['robin', 'batgirl', 'kid flash', 'aqualad', 'jimmy olsen', 'krypto', 'punchy', 'ace', 'shadow', 'toto', 'nibble', 'snotlout', 'tuffnut', 'heath', 'tank'],
      ['nightwing', 'red robin', 'huntress', 'wonder girl', 'iris west', 'bette', 'kay', 'bart allen', 'little wally', 'superboy', 'miss martian', 'dr light', 'robotman', 'carmine'],
      ['strongbad', 'beast boy', 'flo', 'edgar', 'gordon', 'tracy', 'beano', 'dork', 'doug', 'stinkoman', 'coach z', 'the cheetah', 'sweetie', 'ed', 'crazy mac'],
      ['sir robin', 'kipling', 'bandersnatch', 'lassie', 'sugar', 'goofy', 'bugs bunny', 'olive oyl', ],
      ['tootie', 'mickey', 'rocky', 'bullwinkle', 'daffy', 'little helper', 'the forgetful knight', 'little orphan annie', 'the young ward', 'the boy wonder', 'the girl wonder', 'the imp', 'the sprite', 'the mascot', 'the ward'],
      ['sparky', 'the mummy', 'captain america junior', 'little lotta', 'brian', 'sarge', 'barney', 'timmy', ],
    ],
  ),
  p(
    'board-game',
    'Name a board game',
    'Games',
    'A game played on a board',
    [
      ['chess', 'checkers', 'monopoly', 'scrabble', 'backgammon', 'catan', 'risk', 'go', 'dominoes', 'candy land', 'snakes and ladders', 'connect four', 'tic tac toe', 'draughts'],
      ['pictionary', 'twister', 'uno', 'jenga', 'cluedo', 'clue', 'mahjong', 'reversi', 'othello', 'battleship', 'sorry', 'parchisi', 'pachisi', 'avalon', 'dune'],
      ['carcassonne', 'ticket to ride', 'pandemic', 'sushi go', 'power grid', 'terraforming mars', 'splendor', '7 wonders', 'wing commander', 'brass', 'ark nova', 'root', 'viticulture', 'great western trail', 'food chain magnate'],
      ['sagrada', 'istanbul', 'euphoria', 'the castles of burgundy', 'concord', 'azul', 'wingspan', 'clank'],
      ['dune imperium', 'void', 'underwater cities', 'the lord of the rings', 'seaside', 'bora bora', 'gangbusters', 'puerto rico', 'el grande', 'ra', 'pirate games', 'nine nine ninth', 'glory to rome', 'nomic'],
      ['werewolf', 'one night ultimate werewolf', 'code names', 'just one', 'the resistance', 'coup', 'skull king', 'the mind', ],
    ],
    {
      cluedo: 'cluedo',
      clue: 'cluedo',
      monopoly: 'monopoly',
      'game of the goose': 'sorry',
    },
  ),
  p(
    'mountain-range',
    'Name a mountain range',
    'Geography',
    'A line or chain of connected mountains',
    [
      ['alps', 'himalayas', 'andes', 'rockies', 'pyrenees', 'appalachians', 'carpathians', 'caucasus', 'ural mountains', 'scandinavian mountains', 'atlas mountains', 'zagros mountains', 'sierra nevada', 'jura'],
      ['kunlun', 'tian shan', 'altai', 'sayan', 'qinling', 'daba mountains', 'wuyi mountains', 'makran', 'ghats', 'aravalli', 'nilgiri', 'khasi hills', 'kunlun mountains', 'altai mountains'],
      ['pindus', 'dinaric alps', 'rhodope mountains', 'balkan mountains', 'apennines', 'sierra de gredos', 'cantabrian mountains', 'sierra morena', 'betic mountains', 'sudetes', 'tuscan', 'velebit', 'dinara'],
      ['sulaiman range', 'sierra madre', 'cascades', 'brooks range', 'alaska range', 'sierra madre occidental', 'cordillera central', 'sierra madre oriental', ],
      ['bieszczady', 'hunsrucks', 'rhodopes', 'rila', 'pirin', 'vitosha', 'highlands of scotland', 'mount leinster', 'sierra de la ventilla', ],
      ['shiretoko', 'verkhoyansk range', 'chersky range', 'dzhugdzhur range', 'koryak range', 'anticordillera', 'apatlan mountains', 'sinai mountains', ],
    ],
    {
      'the alps': 'alps',
      'the andes': 'andes',
      'the himalayas': 'himalayas',
      'the rockies': 'rockies',
    },
  ),
  p(
    'sea-creature',
    'Name a sea creature',
    'Nature',
    'An animal that lives in the ocean',
    [
      ['whale', 'shark', 'octopus', 'jellyfish', 'seal', 'dolphin', 'squid', 'crab', 'starfish', 'lobster', 'sea turtle', 'penguin', 'manatee', 'urchin', 'coral'],
      ['cuttlefish', 'nautilus', 'krill', 'anchovy', 'herring', 'tuna', 'sardine', 'mackerel', 'moray eel', 'sea urchin', 'sea anemone', 'barnacle', 'mantis shrimp', 'hagfish', 'lamprey', 'brittle star'],
      ['vampire squid', 'giant squid', 'colossal squid', 'dumbo octopus', 'blue ring octopus', 'glass squid', 'flying squid', 'magnapinna', 'pharaoh squid', 'sea pig', 'gulper eel', 'basket star', 'leafy seadragon', 'scaly foot gastropod'],
      ['dugong', 'narwhal', 'beluga', 'leopard seal', 'elephant seal', 'walrus', 'sea otter', 'pelican', 'orca', 'humpback', 'right whale', 'bottlenose dolphin', 'stingray', 'manta ray'],
      ['anglerfish', 'bolas spider', 'giant isopod', 'hatchetfish', 'tripod fish', 'flying gurnard', 'stonefish', 'blue dragon', 'deep sea jelly', 'sea cucumber', 'chiton', 'abalone', 'snailfish', ],
      ['pyrosome', 'salp', 'comb jelly', 'siphonophore', 'antarctic krill', 'helmet shell', 'sea butterfly', 'sea spider', 'tusk shell', 'conch', ],
    ],
    {
      'sea star': 'starfish',
      starfish: 'starfish',
      jellyfish: 'jellyfish',
      squid: 'squid',
    },
  ),
  p(
    'shark',
    'Name a species of shark',
    'Nature',
    'A cartilaginous fish of the ocean',
    [
      ['great white shark', 'hammerhead', 'tiger shark', 'bull shark', 'whale shark', 'mako shark', 'blue shark', 'nurse shark', 'dogfish', 'angel shark', 'lemon shark', 'thresher shark', 'great hammerhead'],
      ['blacktip shark', 'sandbar shark', 'spinner shark', 'silky shark', 'bronze whaler', 'tope', 'bonnethead', 'sawfish', 'basking shark', 'megamouth shark', 'zebra shark', 'wobbegong', 'porbeagle', 'galapagos shark'],
      ['bullhead shark', 'lantern shark', 'viper shark', 'frilled shark', 'greenland shark', 'leopard shark', 'catshark', 'sleeper shark', 'whitetip reef shark', 'goblin shark'],
      ['sand tiger shark', 'epaulette shark', 'speartooth shark', 'broadnose sevengill', 'sharpnose sevengill', 'narrownose sawshark', 'draughtsboard shark', 'harlequin shark', 'blind shark', 'shark ray', 'whitespotted bamboo shark', 'pangolin shark'],
      ['tawny nurse shark', 'slender lantern shark', 'spotted dogfish', 'trombone shark', 'banded dogfish', 'crested bullhead shark', 'pygmy catshark', 'chain catshark', 'leopard catshark', 'speckled catshark', 'brownbanded bamboo shark', 'greeneye spurdog'],
      ['pocket shark', 'dwarf shark', 'slender shark', 'roughnose dogfish', 'american dogfish', 'narrow sawshark', 'elf shark', 'roughskin shark', 'sixgill shark', 'hooded lantern shark', 'spiny dogfish', 'sicklefin dogfish'],
    ],
  ),
  p(
    'olympic-sport',
    'Name an Olympic sport',
    'Sport',
    'A sport contested at the Summer or Winter Olympic Games',
    [
      ['football', 'basketball', 'tennis', 'swimming', 'gymnastics', 'athletics', 'volleyball', 'baseball', 'cycling', 'rowing', 'wrestling', 'judo', 'fencing', 'weightlifting', 'table tennis', 'badminton'],
      ['rugby', 'handball', 'sailing', 'canoeing', 'diving', 'archery', 'shooting', 'triathlon', 'water polo', 'beach volleyball', 'boxing', 'taekwondo', 'karate', 'skiing', 'biathlon', 'luge', 'bobsleigh', 'curling'],
      ['field hockey', 'golf', 'rugby sevens', 'modern pentathlon', 'figure skating', 'speed skating', 'ice hockey', 'snowboard', 'cross country skiing', 'alpine skiing', 'freestyle skiing', 'skeleton', 'short track', 'nordic combined', 'ski jumping', 'team pursuit'],
      ['mountain biking', 'bmx', 'artistic swimming', 'roller hockey', 'kite surfing', 'surfing', 'sport climbing', 'wheelchair basketball', 'para athletics', 'flag football', 'wushu', 'muaythai', 'boules', 'padel', 'squash', 'pigeon racing', 'breakdancing'],
      ['orienteering', 'skateboarding', 'roller freestyle', 'kite flying', 'horse racing', 'chess boxing', 'extreme iron', 'aerial', 'halfpipe', 'big air', 'slopestyle', 'ski mountaineering', 'capoeira', 'esports'],
      ['tug of war', 'polo', 'cricket', 'croquet', 'softball', 'dressage', 'eventing', 'show jumping', 'equestrian', 'marathon swimming', 'open water swimming', 'military patrol', 'winter pentathlon', 'ice climbing'],
    ],
  ),
  p(
    'font',
    'Name a typeface',
    'Design',
    'A family of typefaces designed for print or screen',
    [
      ['arial', 'times new roman', 'helvetica', 'courier', 'comic sans', 'impact', 'tahoma', 'verdana', 'georgia', 'calibri', 'cambria', 'garamond', 'futura', 'baskerville', 'gill sans'],
      ['optima', 'avenir', 'frutiger', 'palatino', 'didot', 'rockwell', 'copperplate', 'century gothic', 'trajan', 'jost', 'inter', 'roboto', 'open sans', 'lato', 'montserrat', 'poppins'],
      ['gotham', 'helvetica neue', 'din', 'univers', 'akzidenz', 'rotis', 'ff meta', 'neue haas', 'myriad', 'source sans', 'raleway', 'nunito', 'work sans', 'manrope', 'outfit', 'sora', 'space grotesk', 'jetbrains mono'],
      ['pacifico', 'caveat', 'great vibes', 'sacramento', 'amatic sc', 'shadows into light', 'indie flower', 'permanent marker', 'satisfy', 'dancing script', 'righteous', 'bangers', 'fredoka', 'baloo', ],
      ['cormorant', 'playfair display', 'libre baskerville', 'eb garamond', 'lora', 'spectral', 'crimson text', 'domine', 'alegreya', 'vollkorn', 'cabin', 'karla', 'public sans', 'figtree', ],
      ['stencil', 'shadowed', 'papyrus', 'wingdings', 'webdings', 'jokerman', 'chiller', 'franklin gothic medium', 'copperplate gothic light', 'snell roundhand', 'blackadder itc', ],
    ],
    {
      'times': 'times new roman',
      helvetica: 'helvetica',
      arial: 'arial',
    },
  ),
  p(
    'coin',
    'Name a coin',
    'Geography',
    'A round metal token used as money',
    [
      ['penny', 'nickel', 'dime', 'quarter', 'cent', 'euro', 'pound', 'yen', 'krone', 'rupee', 'peso', 'real', 'franc', 'zloty', 'shilling', 'florin', 'guilder'],
      ['drachma', 'peseta', 'lira', 'tolar', 'forint', 'leva', 'lei', 'kuna', 'krona', 'markka', 'escudo', 'rand', 'naira', 'cedi', 'quetzal', 'balboa', 'sol', 'colon'],
      ['ducat', 'thaler', 'gulden', 'solino', 'crown', 'sixpence', 'threepence', 'farthing', 'half farthing', 'cartwheel', 'groschen', 'denier', 'obole'],
      ['bust', 'annulet', 'milling', 'bracteate', 'sceat', 'siliqua', 'aes grave', 'solidus', 'follis', 'denarius', 'tetradrachm', 'obol', 'aureus', 'stater', ],
      ['dobras', 'hard cash', 'mohur', 'louis d or', 'napoleon', 'ducaton', 'mil', 'reales', 'billon', 'bactrian', ],
      ['brockage', 'sil-ver', 'cistophoric', 'prutah', 'as', 'semis', 'dupondius', 'victoriatus', 'sestertius', ],
    ],
    {
      cents: 'cent',
      pennies: 'penny',
      dollars: 'penny',
    },
  ),
  p(
    'instrument',
    'Name a musical instrument',
    'Music',
    'A device that makes a sound when played',
    [
      ['piano', 'guitar', 'violin', 'flute', 'drum', 'trumpet', 'clarinet', 'cello', 'saxophone', 'banjo', 'accordion', 'trombone', 'harp', 'tuba', 'oboe', 'bassoon'],
      ['viola', 'mandolin', 'ukulele', 'harmonica', 'organ', 'electric guitar', 'bass guitar', 'xylophone', 'marimba', 'vibraphone', 'bagpipes', 'lute', 'sitar', 'kora', 'oud', 'bouzouki'],
      ['didgeridoo', 'shakuhachi', 'erhu', 'pipa', 'guzheng', 'koto', 'shamisen', 'gamelan', 'veena', 'sarod', 'tanpura', 'steelpan', 'hang', 'charango', 'cimbalom', 'nyckelharpa'],
      ['hurdy-gurdy', 'theremin', 'glass harmonica', 'musique concrete', 'ondes martenot', 'morin khuur', 'komuz', 'zither', 'bandura', 'gusli', 'kantele', 'kamancheh', 'rebab', 'gadulka', 'fujara', 'lur'],
      ['duduk', 'piva', 'lijerica', 'sarban', 'cobza', 'frula', 'tulum', 'gajda', 'zurna', 'kaval', 'zhaleika', 'sheng', 'kontra', 'tongso', 'hichiriki', 'suona'],
      ['archlute', 'viola da gamba', 'violone', 'baryton', 'serpent', 'ophicleide', 'sarrusophone', 'saxhorn', 'musical saw', 'pedal steel guitar', 'bandoneon', 'harmonium', 'melodica', 'carillon'],
    ],
    {
      drums: 'drum',
      'guitar': 'guitar',
      'violin': 'violin',
    },
  ),
];



/**
 * Data hygiene pass, run once at module load.
 *
 * 1. De-duplicates answers so that an answer can only live in one tier. When
 *    an answer appears in several buckets the *commonest* bucket wins, because
 *    that is the honest description of the answer.
 * 2. Drops aliases whose target no longer exists.
 * 3. Normalises every answer to lowercase so lookups are predictable.
 */
function sanitise(prompt: Prompt): Prompt {
  const seen = new Set<string>();
  const answers = {} as Prompt['answers'];

  for (const tier of TIER_IDS) {
    const bucket: string[] = [];
    for (const answer of prompt.answers[tier] ?? []) {
      const key = answer.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      bucket.push(key);
    }
    answers[tier] = bucket;
  }

  const aliases: Record<string, string> = {};
  for (const [alias, target] of Object.entries(prompt.aliases ?? {})) {
    const targetKey = target.trim().toLowerCase();
    if (seen.has(targetKey)) {
      aliases[alias.trim().toLowerCase()] = targetKey;
    }
  }

  return { ...prompt, answers, aliases };
}

export const PROMPTS_SANITISED: Prompt[] = PROMPTS.map(sanitise);

/**
 * Lookup by id. Built from the sanitised bank so a restored run always sees
 * the same answers the scorer will grade against.
 */
export const PROMPT_BY_ID = new Map(PROMPTS_SANITISED.map((prompt) => [prompt.id, prompt]));

/** All answers for a prompt, flattened. */
export function allAnswers(prompt: Prompt): string[] {
  return Object.values(prompt.answers).flat();
}

export const TOTAL_ANSWERS = PROMPTS_SANITISED.reduce(
  (sum, prompt) => sum + allAnswers(prompt).length,
  0,
);
