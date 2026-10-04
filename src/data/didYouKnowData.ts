import { DateService } from '../utils/dateService';

/**
 * DID YOU KNOW? KNOWLEDGE REPOSITORY FOR REBERWET JUNIOR SECONDARY SCHOOL
 * Curated surprising, verified, non-obvious facts starting with "Did you know that..."
 * Covers: Human Body, Psychology, Animals, Plants, Food, Space, Nature, History, Language, Science.
 */

export type DidYouKnowCategory =
  | 'Human Body & Health'
  | 'Brain & Psychology'
  | 'Animals & Ocean Life'
  | 'Food & Plants'
  | 'Science & Space'
  | 'Nature & Geography'
  | 'History & Cultures'
  | 'Language & Words'
  | 'Curious Inventions';

export interface DidYouKnowItem {
  id: string;
  question: string;
  category: DidYouKnowCategory;
  verifiedFact: string;
}

export const DID_YOU_KNOW_FACTS: DidYouKnowItem[] = [
  // 1-15: Human Body & Health
  {
    id: 'dyk-001',
    category: 'Brain & Psychology',
    question:
      'Did you know that your brain can construct a vivid, convincing memory of an event that never actually occurred, simply because someone suggested it happened?',
    verifiedFact:
      'Psychological studies by Dr. Elizabeth Loftus proved that false memories can be planted through subtle questioning and suggestion, showing how reconstructive human memory is.',
  },
  {
    id: 'dyk-002',
    category: 'Human Body & Health',
    question:
      'Did you know that some people sneeze reflexively when suddenly stepping into bright sunlight, a genetic trait known as the photic sneeze reflex?',
    verifiedFact:
      'The photic sneeze reflex (ACHOO syndrome) affects about 18% to 35% of the human population and is caused by crossed signals between the optic and trigeminal nerves.',
  },
  {
    id: 'dyk-003',
    category: 'Human Body & Health',
    question:
      'Did you know that your stomach produces a brand-new layer of protective mucus every few days to prevent its own digestive acid from digesting the stomach itself?',
    verifiedFact:
      'Hydrochloric acid in the human stomach has a pH between 1.5 and 3.5—strong enough to dissolve metals—requiring specialized epithelial cells to constantly regenerate the mucus lining.',
  },
  {
    id: 'dyk-004',
    category: 'Human Body & Health',
    question:
      'Did you know that humans share roughly 60% of their DNA with bananas and over 98% with chimpanzees?',
    verifiedFact:
      'Because all living organisms on Earth share a common evolutionary ancestor, the fundamental cellular machinery for protein synthesis and metabolism uses remarkably similar genetic code.',
  },
  {
    id: 'dyk-005',
    category: 'Human Body & Health',
    question:
      'Did you know that you are approximately one centimetre taller in the morning when you wake up than in the evening when you go to bed?',
    verifiedFact:
      'During the day, gravitational pressure compresses the cartilage discs in your spinal column. While lying flat during sleep, these discs decompress and reabsorb fluid.',
  },
  {
    id: 'dyk-006',
    category: 'Human Body & Health',
    question:
      'Did you know that the cornea of the human eye is one of the only tissues in the human body that has no blood vessels, absorbing oxygen directly from the air?',
    verifiedFact:
      'To remain optically clear for light transmission, the cornea receives oxygen directly through atmospheric diffusion and nutrients from tears and aqueous humor.',
  },
  {
    id: 'dyk-007',
    category: 'Human Body & Health',
    question:
      'Did you know that every human has a completely unique tongue print in addition to their unique fingerprints?',
    verifiedFact:
      'Forensic scientists have found that the shape, texture, and papillae distribution of the human tongue differ distinctly between every individual, including identical twins.',
  },
  {
    id: 'dyk-008',
    category: 'Human Body & Health',
    question:
      'Did you know that your bones are constantly being broken down and rebuilt, meaning your entire skeletal system renews itself about every 10 years?',
    verifiedFact:
      'Specialized cells called osteoclasts break down old bone tissue while osteoblasts deposit new bone minerals, completely remodeling the adult skeleton roughly every decade.',
  },

  // 16-35: Animals & Ocean Life
  {
    id: 'dyk-009',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that an octopus has three hearts, nine brains, and blue blood because its oxygen carries copper instead of iron?',
    verifiedFact:
      'An octopus has one central systemic heart and two branchial hearts for its gills. Its blue blood uses hemocyanin, which transports oxygen more efficiently in cold, low-oxygen water.',
  },
  {
    id: 'dyk-010',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that cows have best friends and their measured heart rates are significantly lower and calmer when they are together?',
    verifiedFact:
      'Research by animal behaviorist Krista McLennan at the University of Northampton demonstrated that cows form strong individual friendships and experience reduced stress levels when paired with their preferred companions.',
  },
  {
    id: 'dyk-011',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that butterflies taste their food using special chemical receptors located on the soles of their feet?',
    verifiedFact:
      'When a butterfly lands on a leaf or flower, chemoreceptors on its tarsal segments detect whether the plant contains suitable sugars and safe nutrients to lay eggs on or drink.',
  },
  {
    id: 'dyk-012',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that flamingos are naturally born with grey feathers and only turn pink because of the carotenoid pigments in the algae and shrimp they consume?',
    verifiedFact:
      'Enzymes in a flamingo’s liver break down carotenoid pigments found in their diet of spirulina algae and brine shrimp, depositing reddish-pink pigments into their growing plumage.',
  },
  {
    id: 'dyk-013',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that sharks have been swimming in Earth’s oceans for over 400 million years, making them older than trees, insects, and Mount Everest?',
    verifiedFact:
      'Fossilized shark scales date back to the Late Silurian Period around 420 million years ago, whereas the earliest primitive tree species (like Archaeopteris) evolved roughly 350 million years ago.',
  },
  {
    id: 'dyk-014',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that wombats produce distinct cube-shaped droppings, making them the only known animals on Earth with naturally square-shaped waste?',
    verifiedFact:
      'Scientists discovered in 2018 that the elasticity of the last 8 percent of a wombat’s intestine varies in stiffness, pressing waste into uniform cubes to prevent it from rolling away from marked territory.',
  },
  {
    id: 'dyk-015',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that clownfish are all born male, and the largest, most dominant male in a group can naturally transform into a female when the group’s breeding female dies?',
    verifiedFact:
      'Clownfish are sequential hermaphrodites. Hormonal shifts cause the dominant male’s testes to reabsorb and ovaries to develop, preserving the group’s breeding hierarchy.',
  },
  {
    id: 'dyk-016',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that dolphins keep one half of their brain awake and one eye open while sleeping so they never forget to surface for air?',
    verifiedFact:
      'Unihemispheric slow-wave sleep allows cetaceans like dolphins and whales to rest one cerebral hemisphere while the other monitors breathing, swimming, and potential predators.',
  },
  {
    id: 'dyk-017',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that crows can remember human faces for years and can even teach their offspring which specific people are friendly or dangerous?',
    verifiedFact:
      'Field experiments at the University of Washington found crows wear memory maps of individual human faces and communicate warnings to other flock members across generations.',
  },

  // 36-50: Food, Plants & Agriculture
  {
    id: 'dyk-018',
    category: 'Food & Plants',
    question:
      'Did you know that according to botanical classification, bananas, tomatoes, and watermelons are true berries, while strawberries and raspberries are not?',
    verifiedFact:
      'In botany, a true berry develops from a flower with a single ovary and has an edible pericarp surrounding seeds inside. Strawberries are aggregate accessory fruits where the seeds reside on the outer receptacle.',
  },
  {
    id: 'dyk-019',
    category: 'Food & Plants',
    question:
      'Did you know that honey found inside ancient Egyptian pharaohs’ tombs that is more than 3,000 years old is still completely edible and unspoilable?',
    verifiedFact:
      'Honey has an extremely low moisture content (under 18%), high acidity (pH ~3.9), and natural hydrogen peroxide produced by bee enzymes, creating an inhospitable environment for bacteria and fungi.',
  },
  {
    id: 'dyk-020',
    category: 'Food & Plants',
    question:
      'Did you know that trees in a forest can communicate with each other, share carbon, and send warning signals through an underground network of fungi nicknamed the "Wood Wide Web"?',
    verifiedFact:
      'Mycorrhizal fungal networks connect tree roots beneath the soil. When an insect attacks one tree, it can send chemical and electrical warnings through the mycelium to alert neighboring trees to produce defensive tannins.',
  },
  {
    id: 'dyk-021',
    category: 'Food & Plants',
    question:
      'Did you know that pineapples take almost two to three years to grow a single fruit, and each pineapple is actually a cluster of dozens of fused individual berries?',
    verifiedFact:
      'An individual pineapple plant flowers once and produces up to 200 individual flowers that coalesce around a central core to form a single composite multiple fruit.',
  },
  {
    id: 'dyk-022',
    category: 'Food & Plants',
    question:
      'Did you know that apples float in water because roughly 25% of their total internal volume is made up of pockets of trapped air?',
    verifiedFact:
      'The loose cellular arrangement in apple flesh creates abundant intercellular air pockets, making apples less dense than water (specific gravity ~0.8) so they readily float.',
  },

  // 51-70: Science, Space & Geography
  {
    id: 'dyk-023',
    category: 'Science & Space',
    question:
      'Did you know that a day on Venus is longer than a year on Venus because the planet spins on its axis so slowly?',
    verifiedFact:
      'Venus takes about 243 Earth days to complete a single rotation on its axis, but only 225 Earth days to complete a full orbit around the Sun.',
  },
  {
    id: 'dyk-024',
    category: 'Science & Space',
    question:
      'Did you know that lightning strikes the surface of Planet Earth approximately 100 times every single second, creating air temperatures five times hotter than the surface of the Sun?',
    verifiedFact:
      'Satellite lightning detectors record roughly 8.6 million strikes per day globally. The plasma channel of a return lightning stroke reaches up to 30,000 Kelvin (about 53,500°F).',
  },
  {
    id: 'dyk-025',
    category: 'Science & Space',
    question:
      'Did you know that if you could fold a standard sheet of paper in half 42 times, its resulting thickness would reach all the way from the Earth to the Moon?',
    verifiedFact:
      'Exponential growth dictates that doubling a 0.1 mm sheet 42 times yields 0.1 mm × 2⁴² ≈ 439,804 kilometers, exceeding the average Earth-Moon distance of 384,400 km.',
  },
  {
    id: 'dyk-026',
    category: 'Science & Space',
    question:
      'Did you know that glass is an amorphous solid that cools so rapidly that its molecules are frozen in place before they can form a crystalline grid, allowing visible light to pass straight through?',
    verifiedFact:
      'Because the electrons in silica glass lack the periodic energy bands found in crystalline minerals, visible light photons pass through without being absorbed or reflected.',
  },
  {
    id: 'dyk-027',
    category: 'Nature & Geography',
    question:
      'Did you know that the continent of Africa is the only continent on Earth that extends into all four geographic hemispheres: North, South, East, and West?',
    verifiedFact:
      'Africa is bisected by both the Equator (separating Northern and Southern Hemispheres) and the Prime Meridian in Ghana and Algeria (separating Eastern and Western Hemispheres).',
  },
  {
    id: 'dyk-028',
    category: 'Nature & Geography',
    question:
      'Did you know that Mount Everest grows taller by approximately 4 millimetres every single year due to the relentless collision of the Indian and Eurasian tectonic plates?',
    verifiedFact:
      'The Indian tectonic plate drives northward into the Eurasian plate at roughly 5 cm per year, buckling the Himalayan mountain crust upward continuously.',
  },

  // 71-85: History, Culture & Language
  {
    id: 'dyk-029',
    category: 'History & Cultures',
    question:
      'Did you know that the University of Oxford in England was already holding classes before the Aztec Empire was even founded in the Americas?',
    verifiedFact:
      'Teaching began at Oxford in some form around 1096 AD, whereas the Aztec civilization formed the Triple Alliance in Mesoamerica around 1428 AD—over three centuries later.',
  },
  {
    id: 'dyk-030',
    category: 'History & Cultures',
    question:
      'Did you know that Cleopatra lived closer in historical time to the 1969 Apollo Moon landing than to the construction of the Great Pyramid of Giza?',
    verifiedFact:
      'The Great Pyramid was completed around 2560 BC. Cleopatra VII died in 30 BC—roughly 2,500 years after the pyramid was built, but only about 2,000 years before Neil Armstrong walked on the Moon.',
  },
  {
    id: 'dyk-031',
    category: 'Language & Words',
    question:
      'Did you know that the English sentence "The quick brown fox jumps over the lazy dog" is a pangram, containing every single letter of the English alphabet at least once?',
    verifiedFact:
      'Pangrams are used by typographers and computer programmers to test fonts, keyboards, and printing systems to ensure all 26 alphabet characters render properly.',
  },
  {
    id: 'dyk-032',
    category: 'Language & Words',
    question:
      'Did you know that the dot placed over the lowercase letters "i" and "j" has an official grammatical name: a "tittle"?',
    verifiedFact:
      'Originating from medieval Latin manuscripts, the tiny mark was called a titulus, which evolved into the English word "tittle"—also preserved in the idiom "jot and tittle".',
  },
  {
    id: 'dyk-033',
    category: 'Curious Inventions',
    question:
      'Did you know that the microwave oven was accidentally invented when an engineer noticed a chocolate candy bar in his pocket melted while he was testing radar equipment?',
    verifiedFact:
      'In 1945, engineer Percy Spencer at Raytheon Corporation was working with an active magnetron tube and realized the microwave radiation heated the chocolate, leading to the creation of the Radarange oven.',
  },
  {
    id: 'dyk-034',
    category: 'Brain & Psychology',
    question:
      'Did you know that yawning when you see someone else yawn is not a sign of tiredness, but an evolved form of social empathy and flock vigilance?',
    verifiedFact:
      'Contagious yawning activates mirror neuron systems in the frontal cortex, and evolutionary biologists believe it helped animal and human social groups coordinate alertness.',
  },
  {
    id: 'dyk-035',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that sea otters hold hands while sleeping in coastal kelp forests so that ocean currents do not drift them away from each other?',
    verifiedFact:
      'Southern and Northern sea otters often form floating groups called rafts, intertwining their paws or wrapping themselves in giant kelp fronds to anchor securely during sleep.',
  },
  {
    id: 'dyk-036',
    category: 'Science & Space',
    question:
      'Did you know that there is enough gold dissolved in Earth’s oceans that, if it were all extracted, every human on Earth could have roughly four kilograms of pure gold?',
    verifiedFact:
      'Ocean waters hold trace gold concentrations of roughly 13 parts per trillion. Across 1.3 billion cubic kilometers of seawater, this amounts to roughly 20 million tons of gold.',
  },
  {
    id: 'dyk-037',
    category: 'Human Body & Health',
    question:
      'Did you know that your nose and your sense of smell can distinguish between over one trillion distinct scent combinations?',
    verifiedFact:
      'A landmark 2014 study by Rockefeller University researchers published in Science challenged the old belief that humans can only detect 10,000 scents, demonstrating our olfactory system can differentiate upwards of 1 trillion odors.',
  },
  {
    id: 'dyk-038',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that a newborn blue whale gains about 90 kilograms of body weight every single day during its first few months of life?',
    verifiedFact:
      'Blue whale milk contains about 40% to 50% fat. A nursing calf drinks up to 200 liters of mother’s milk daily, gaining up to 4 kg per hour in early infancy.',
  },
  {
    id: 'dyk-039',
    category: 'Nature & Geography',
    question:
      'Did you know that Lake Victoria in East Africa is the largest tropical freshwater lake in the world, yet it has completely dried up at least three times in geological history?',
    verifiedFact:
      'Geological core sediment drillings show Lake Victoria experienced severe arid desiccation around 17,300, 14,900, and 12,400 years ago during extreme Pleistocene drought cycles.',
  },
  {
    id: 'dyk-040',
    category: 'Food & Plants',
    question:
      'Did you know that the world’s hottest chili peppers contain capsaicin, a chemical that causes no actual physical burn to your tongue, but tricks your brain into thinking it is on fire?',
    verifiedFact:
      'Capsaicin binds directly to the TRPV1 heat-sensing receptor on pain neurons, which normally registers real temperatures above 43°C, causing the brain to trigger sweating, red flushing, and endorphin release.',
  },
  {
    id: 'dyk-041',
    category: 'Brain & Psychology',
    question:
      'Did you know that reading paper books or printed posters has been shown to produce significantly better memory comprehension and recall than reading identical text on glowing digital screens?',
    verifiedFact:
      'Spatial navigation of physical pages activates cognitive mapping in the parietal lobe, helping readers anchor information topologically in memory far better than scrolling digital text.',
  },
  {
    id: 'dyk-042',
    category: 'History & Cultures',
    question:
      'Did you know that ancient Olympic athletes competed completely unclothed to promote fairness and honor the Greek ideals of natural human athleticism?',
    verifiedFact:
      'The ancient Greek word "gymnos" literally translates to "naked," giving rise to the modern word "gymnasium". Athletes also coated their skin in olive oil to protect against dust and sunburn.',
  },
  {
    id: 'dyk-043',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that pigeons can recognize all 26 letters of the human alphabet and can even tell the difference between paintings by Monet and Picasso?',
    verifiedFact:
      'Operant conditioning research led by Dr. Shigeru Watanabe at Keio University proved that pigeons categorize abstract visual stimuli, identifying impressionist versus cubist artistic styles with over 90% accuracy.',
  },
  {
    id: 'dyk-044',
    category: 'Curious Inventions',
    question:
      'Did you know that bubble wrap was originally invented in 1957 by two engineers who were trying to create a trendy textured plastic wallpaper for modern homes?',
    verifiedFact:
      'Inventors Al Fielding and Marc Chavannes sealed two shower curtains together with trapped air bubbles. When the wallpaper idea failed, it was repurposed as protective packing material for IBM mainframe computers.',
  },
  {
    id: 'dyk-045',
    category: 'Language & Words',
    question:
      'Did you know that the word "clue" originally referred to a ball of thread, deriving from the ancient myth of Theseus using a thread ball to escape the labyrinth?',
    verifiedFact:
      'In Old English, a "cleowen" was a ball of yarn. Because winding a thread guided people out of complex mazes, the word gradually shifted in meaning to anything that solves a mystery.',
  },
  {
    id: 'dyk-046',
    category: 'Nature & Geography',
    question:
      'Did you know that there are places in the Atacama Desert in Chile where rain has never been recorded in all of modern human history?',
    verifiedFact:
      'Sandwiched between the Andes mountains and the Chilean Coastal Range, parts of the hyper-arid Atacama have riverbeds that have been dry for an estimated 120,000 years.',
  },
  {
    id: 'dyk-047',
    category: 'Human Body & Health',
    question:
      'Did you know that your heart pumps approximately 7,500 litres of blood through your circulatory system every single day of your life?',
    verifiedFact:
      'In an average human lifetime, the heart beats more than 2.5 billion times, pumping enough blood to fill roughly three full-sized supertankers.',
  },
  {
    id: 'dyk-048',
    category: 'Science & Space',
    question:
      'Did you know that neutron stars are so incredibly dense that a single teaspoon of neutron star matter would weigh about six billion tons on Earth?',
    verifiedFact:
      'When massive stars undergo supernova collapse, gravitational pressure crushes protons and electrons together into tightly packed neutrons, creating densities of 10¹⁴ grams per cubic centimetre.',
  },
  {
    id: 'dyk-049',
    category: 'Animals & Ocean Life',
    question:
      'Did you know that giraffes have the same number of neck vertebrae as humans—exactly seven—even though a giraffe’s neck can be over two metres long?',
    verifiedFact:
      'Almost all mammals, from tiny mice to humans and giant giraffes, share exactly seven cervical vertebrae; the giraffe’s vertebrae are simply elongated, each measuring up to 28 cm.',
  },
  {
    id: 'dyk-050',
    category: 'Brain & Psychology',
    question:
      'Did you know that chewing gum while studying and then chewing the exact same flavor during an exam can stimulate memory recall through context-dependent memory?',
    verifiedFact:
      'Cognitive psychologists call this state-dependent memory: sensory cues like taste and smell recreate the neurochemical environment present during initial encoding.',
  },
  {
    id: 'dyk-051',
    category: 'Food & Plants',
    question:
      'Did you know that vanilla comes from the cured seed pods of an orchid, and each flower opens for only one day, historically pollinated by a single species of Mexican bee?',
    verifiedFact:
      'The Melipona bee is the only natural pollinator of vanilla orchids. Today, over 95% of the world’s natural vanilla is laboriously hand-pollinated using small wooden needles.',
  },
  {
    id: 'dyk-052',
    category: 'History & Cultures',
    question:
      'Did you know that the Great Wall of China is not a single continuous wall, but a sprawling collection of walls, earth ramparts, and natural moats built over 2,000 years?',
    verifiedFact:
      'Different imperial dynasties constructed disconnected fortifications spanning over 21,000 kilometres in total, using everything from rammed earth and reeds to kiln-baked bricks.',
  },
];

const STORAGE_KEYS = {
  HISTORY: 'reberwet_did_you_know_history_v1',
  APPROVED_OVERRIDE: 'reberwet_did_you_know_overrides_v1',
  BLACKLIST: 'reberwet_did_you_know_blacklist_v1',
};

export interface DisplayedFactRecord {
  weekKey: string; // e.g. "2026-W40"
  weekNumber: number;
  year: number;
  factId: string;
  question: string;
  category: DidYouKnowCategory;
  displayedAt: string;
  isCustomApproved?: boolean;
}

/**
 * Returns the currently active Did You Know fact for a given week & year.
 * Automatically checks:
 * 1. Admin approved override for this specific week.
 * 2. History of previously shown facts to avoid immediate repeats.
 * 3. Blacklist of facts the administrator has hidden.
 */
export function getDidYouKnowFactForWeek(
  weekNumber: number,
  year: number = Number(DateService.getCurrentYear())
): {
  item: DidYouKnowItem;
  isCustomApproved: boolean;
  weekKey: string;
} {
  const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;

  // 1. Check for manual Admin approved override
  try {
    const overridesRaw = localStorage.getItem(STORAGE_KEYS.APPROVED_OVERRIDE);
    if (overridesRaw) {
      const overrides: Record<string, DidYouKnowItem> = JSON.parse(overridesRaw);
      if (overrides[weekKey]) {
        return {
          item: overrides[weekKey],
          isCustomApproved: true,
          weekKey,
        };
      }
    }
  } catch {
    // ignore
  }

  // 2. Read blacklist
  let blacklist: string[] = [];
  try {
    const bRaw = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
    if (bRaw) blacklist = JSON.parse(bRaw);
  } catch {
    // ignore
  }

  // Read history of facts shown in recent weeks to avoid immediate repetition
  let recentHistoryFactIds: string[] = [];
  try {
    const hRaw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (hRaw) {
      const parsed: DisplayedFactRecord[] = JSON.parse(hRaw);
      recentHistoryFactIds = parsed
        .filter((h) => h.weekKey !== weekKey)
        .slice(0, 12)
        .map((h) => h.factId);
    }
  } catch {
    // ignore
  }

  const nonBlacklisted = DID_YOU_KNOW_FACTS.filter((f) => !blacklist.includes(f.id));
  const availableFacts = nonBlacklisted.filter((f) => !recentHistoryFactIds.includes(f.id));
  const safeList =
    availableFacts.length > 0
      ? availableFacts
      : nonBlacklisted.length > 0
      ? nonBlacklisted
      : DID_YOU_KNOW_FACTS;

  // 3. Deterministic pseudo-random seed based on week and year
  // (Leaves the fact stable all week long, but rotates next week)
  const seed = Math.abs(year * 53 + weekNumber * 19 + 7) % safeList.length;
  const selectedFact = safeList[seed];

  return {
    item: selectedFact,
    isCustomApproved: false,
    weekKey,
  };
}

/**
 * Approves a replacement fact for the current week (Admin only)
 */
export function saveDidYouKnowApproval(
  item: DidYouKnowItem,
  weekNumber: number,
  year: number = Number(DateService.getCurrentYear())
): void {
  try {
    const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
    const overridesRaw = localStorage.getItem(STORAGE_KEYS.APPROVED_OVERRIDE);
    const overrides: Record<string, DidYouKnowItem> = overridesRaw ? JSON.parse(overridesRaw) : {};
    overrides[weekKey] = item;
    localStorage.setItem(STORAGE_KEYS.APPROVED_OVERRIDE, JSON.stringify(overrides));

    // Also record in history
    recordFactInHistory(item, weekNumber, year, true);
  } catch {
    // ignore
  }
}

/**
 * Blacklists a fact so it will not appear again (Admin only)
 */
export function blacklistDidYouKnowFact(factId: string): void {
  try {
    const bRaw = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
    const blacklist: string[] = bRaw ? JSON.parse(bRaw) : [];
    if (!blacklist.includes(factId)) {
      blacklist.push(factId);
      localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(blacklist));
    }
  } catch {
    // ignore
  }
}

/**
 * Gets a fresh random candidate fact from a DIFFERENT category to replace the current one
 */
export function getFreshRandomFact(currentFactId: string): DidYouKnowItem {
  const currentItem = DID_YOU_KNOW_FACTS.find((f) => f.id === currentFactId);
  const currentCat = currentItem?.category;

  // Prioritize different category
  const differentCatList = DID_YOU_KNOW_FACTS.filter(
    (f) => f.id !== currentFactId && f.category !== currentCat
  );
  const candidates = differentCatList.length > 0 ? differentCatList : DID_YOU_KNOW_FACTS;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Records fact into permanent history log
 */
export function recordFactInHistory(
  item: DidYouKnowItem,
  weekNumber: number,
  year: number,
  isCustomApproved: boolean = false
): void {
  try {
    const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
    const hRaw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history: DisplayedFactRecord[] = hRaw ? JSON.parse(hRaw) : [];

    const existingIdx = history.findIndex((h) => h.weekKey === weekKey);
    const record: DisplayedFactRecord = {
      weekKey,
      weekNumber,
      year,
      factId: item.id,
      question: item.question,
      category: item.category,
      displayedAt: new Date().toISOString(),
      isCustomApproved,
    };

    if (existingIdx >= 0) {
      history[existingIdx] = record;
    } else {
      history.unshift(record);
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
  } catch {
    // ignore
  }
}

/**
 * Returns full history of previously shown facts
 */
export function getDidYouKnowHistory(): DisplayedFactRecord[] {
  try {
    const hRaw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (hRaw) return JSON.parse(hRaw);
  } catch {
    // ignore
  }
  return [];
}
