import type { TierId } from '../game/types.ts';

/**
 * Reviewed Wikidata tier calibration.
 *
 * Only verified answers whose proposed tier differs from their current tier
 * are listed here. Unverified answers are deliberately absent and keep their
 * existing tier. The table is applied after extras are merged, because extras
 * are append-only and cannot otherwise move an answer that already exists in
 * an earlier tier.
 *
 * Source: data/generated/proposals/*.json (see data/generated/reports/ for
 * the VERIFIED / UNVERIFIED audit trail).
 */
export const CALIBRATED_ANSWER_TIERS: Record<string, Partial<Record<TierId, readonly string[]>>> = {
  'greek-god': {
    'plankton': [
      'prometheus', 'heracles', 'kronos', 'cupid', 'eros', 'persephone', 'asclepius', 'gaia', 'rhea',
      'oceanus', 'selene', 'helios', 'nyx', 'eos', 'nike', 'hecate', 'mnemosyne', 'pan', 'leto',
      'chaos', 'hebe', 'styx', 'tethys', 'amphitrite', 'theia', 'triton', 'eris', 'hyperion',
      'phoebe', 'iapetus',
    ],
    'reef-rookie': [
      'epimetheus', 'iris', 'thanatos', 'aether', 'coeus', 'erebus', 'crius', 'kharybdis', 'phobos',
      'hygieia', 'boreas',
    ],
    'jawsome': [
      'eileithyia', 'deimos', 'echo', 'zephyrus', 'dike', 'plutus', 'hymen', 'eirene',
    ],
    'fin-omenal': [
      'eurynome', 'thalia', 'glaucus', 'lachesis', 'eurus', 'notus',
    ],
    'fintastic': [
      'apheliotes', 'erato', 'skiron', 'pandora', 'titan', 'clio',
    ],
  },
  'jupiter-moon': {
    'plankton': [
      'lysithea', 'euporie', 'megaclite', 'dia', 'harpalyke', 'praxidike', 'euanthe', 'helike',
      'thelxinoe', 'thyone', 'chaldene', 'eupheme', 'kale', 'aitne', 'autonoe', 'eurydome',
      'hermippe',
    ],
    'reef-rookie': [
      'isonoe', 'kallichore', 'kore', 'mneme', 'pasithee', 'sponde', 'callirrhoe', 'cyllene',
      'erinome', 'taygete',
    ],
    'jawsome': [
      'aoede', 'arche', 'jupiter lxxiii', 'hegemone', 'herse',
    ],
    'fin-omenal': [
      'eirene', 'philophrosyne', 'ersa',
    ],
    'fintastic': [
      'pandia', 'valetudo', 'jupiter lxx',
    ],
  },
  'chemical-element': {
    'plankton': [
      'aluminium', 'lithium', 'beryllium', 'silicon', 'chlorine', 'fluorine', 'phosphorus', 'boron',
      'titanium', 'chromium', 'arsenic', 'cobalt', 'iodine', 'manganese', 'krypton', 'barium',
      'gallium', 'vanadium', 'bromine', 'selenium', 'cadmium', 'strontium', 'antimony', 'cesium',
      'germanium', 'rubidium',
    ],
    'reef-rookie': [
      'bismuth', 'tungsten', 'niobium', 'palladium', 'molybdenum', 'hafnium', 'tellurium', 'yttrium',
      'indium', 'rhodium', 'ruthenium', 'zirconium', 'lanthanum', 'rhenium', 'hassium',
      'rutherfordium', 'seaborgium',
    ],
    'jawsome': [
      'californium', 'dubnium', 'protactinium', 'americium', 'bohrium', 'gadolinium', 'meitnerium',
      'oganesson', 'neodymium',
    ],
    'fin-omenal': [
      'darmstadtium', 'roentgenium', 'copernicium', 'nihonium', 'moscovium',
    ],
  },
  'moon': {
    'plankton': [
      'oberon', 'titania', 'rhea', 'dione', 'umbriel', 'ariel', 'iapetus', 'miranda', 'tethys',
      'proteus', 'nereid', 'hyperion',
    ],
    'reef-rookie': [
      'phoebe', 'themisto', 'atlas', 'pandora', 'prometheus', 'ananke', 'epimetheus', 'helene',
    ],
    'jawsome': [
      'carme', 'puck',
    ],
    'fin-omenal': [
      'calypso', 'telesto', 'callirrhoe',
    ],
  },
  'us-state': {
    'plankton': [
      'hawaii', 'alaska', 'alabama', 'new jersey', 'maryland', 'kansas', 'wisconsin', 'iowa',
      'louisiana', 'arkansas', 'minnesota',
    ],
    'reef-rookie': [
      'new mexico', 'washington', 'connecticut', 'idaho', 'oklahoma', 'nebraska', 'delaware',
      'mississippi',
    ],
    'jawsome': [
      'vermont', 'south carolina', 'wyoming', 'maine', 'montana',
    ],
    'fin-omenal': [
      'north carolina', 'west virginia',
    ],
  },
  'country-europe': {
    'plankton': [
      'turkey', 'ukraine', 'albania', 'bulgaria', 'belarus', 'croatia', 'iceland', 'estonia',
      'lithuania', 'serbia',
    ],
    'reef-rookie': [
      'kazakhstan', 'georgia', 'romania', 'vatican city', 'bosnia and herzegovina', 'ireland',
      'andorra',
    ],
    'jawsome': [
      'slovenia',
    ],
    'fin-omenal': [
      'montenegro',
    ],
    'fintastic': [
      'kosovo', 'northern cyprus',
    ],
  },
};
