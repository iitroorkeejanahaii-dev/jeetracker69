export interface NamedReaction {
  id: string;
  name: string;
  category: string;
  summary: string;
}

export interface Reagent {
  id: string;
  name: string;
  formula: string;
  uses: string[];
  exceptions: string[];
  conversions: string[];
}

export const NAMED_REACTIONS: NamedReaction[] = [
  { id: "aldol", name: "Aldol Condensation", category: "Carbonyl", summary: "α-H containing aldehydes/ketones + base → β-hydroxy carbonyl → α,β-unsaturated." },
  { id: "cannizzaro", name: "Cannizzaro", category: "Carbonyl", summary: "Aldehydes without α-H + conc. NaOH → alcohol + carboxylate (disproportionation)." },
  { id: "sandmeyer", name: "Sandmeyer", category: "Diazonium", summary: "ArN2+ + CuX → ArX (Cl, Br, CN)." },
  { id: "hoffmann-bromamide", name: "Hoffmann Bromamide", category: "Amines", summary: "RCONH2 + Br2/NaOH → RNH2 (one C less)." },
  { id: "wurtz", name: "Wurtz", category: "Alkanes", summary: "2 R–X + 2 Na → R–R + 2 NaX." },
  { id: "reimer-tiemann", name: "Reimer–Tiemann", category: "Phenols", summary: "Phenol + CHCl3 + NaOH → o-hydroxybenzaldehyde." },
  { id: "friedel-crafts-alkylation", name: "Friedel–Crafts Alkylation", category: "Aromatic", summary: "Arene + R–X + AlCl3 → alkyl arene." },
  { id: "friedel-crafts-acylation", name: "Friedel–Crafts Acylation", category: "Aromatic", summary: "Arene + RCOCl + AlCl3 → aryl ketone." },
  { id: "kolbe", name: "Kolbe Electrolysis", category: "Alkanes", summary: "2 RCOO– → R–R + 2 CO2 (electrolysis)." },
  { id: "gattermann-koch", name: "Gattermann–Koch", category: "Aromatic", summary: "Arene + CO + HCl / AlCl3 → benzaldehyde." },
  { id: "clemmensen", name: "Clemmensen Reduction", category: "Reduction", summary: "C=O → CH2 (Zn-Hg / HCl)." },
  { id: "wolff-kishner", name: "Wolff–Kishner Reduction", category: "Reduction", summary: "C=O → CH2 (NH2NH2 / KOH, glycol, Δ)." },
  { id: "rosenmund", name: "Rosenmund Reduction", category: "Reduction", summary: "RCOCl + H2 / Pd-BaSO4 → RCHO." },
  { id: "stephen", name: "Stephen Reduction", category: "Reduction", summary: "RCN + SnCl2/HCl → RCHO." },
  { id: "etard", name: "Etard Reaction", category: "Aromatic", summary: "Toluene + CrO2Cl2 → benzaldehyde." },
  { id: "hell-volhard-zelinsky", name: "Hell–Volhard–Zelinsky", category: "Carboxylic", summary: "RCH2COOH + X2/red P → α-halo acid." },
  { id: "gabriel", name: "Gabriel Synthesis", category: "Amines", summary: "Primary amines from phthalimide." },
  { id: "carbylamine", name: "Carbylamine Test", category: "Amines", summary: "1° amine + CHCl3 + KOH → foul-smelling isocyanide." },
  { id: "perkin", name: "Perkin Condensation", category: "Carbonyl", summary: "ArCHO + (RCO)2O / RCOO– → cinnamic acid derivative." },
  { id: "diels-alder", name: "Diels–Alder", category: "Cycloaddition", summary: "Diene + dienophile → cyclohexene." },
];

export const REAGENTS: Reagent[] = [
  { id: "lialh4", name: "LiAlH4", formula: "LiAlH4", uses: ["Reduces –COOH, –COOR, –COCl, –CONH2 to alcohols/amines", "Reduces –CN to –CH2NH2", "Reduces –NO2 to –NH2 (aromatic)"], exceptions: ["Does NOT reduce C=C, C=C not conjugated"], conversions: ["RCOOH → RCH2OH", "RCN → RCH2NH2"] },
  { id: "nabh4", name: "NaBH4", formula: "NaBH4", uses: ["Mild reducer: aldehydes/ketones → alcohols"], exceptions: ["Does not reduce –COOH, –COOR, –CN"], conversions: ["RCHO → RCH2OH", "R2CO → R2CHOH"] },
  { id: "kmno4", name: "KMnO4", formula: "KMnO4", uses: ["Strong oxidiser", "Cleaves C=C to acids/ketones (hot conc.)", "1° alcohol → acid, 2° → ketone", "Baeyer's test (cold dilute) — diol"], exceptions: ["Alkaline cold KMnO4 → syn diol without cleavage"], conversions: ["Toluene → Benzoic acid"] },
  { id: "pcc", name: "PCC", formula: "C5H5NH·CrO3Cl", uses: ["Mild, selective oxidiser", "1° alcohol → aldehyde (stops there)", "2° alcohol → ketone"], exceptions: ["Does not over-oxidise to acid"], conversions: ["RCH2OH → RCHO"] },
  { id: "socl2", name: "SOCl2", formula: "SOCl2", uses: ["ROH → RCl (Darzen)", "RCOOH → RCOCl"], exceptions: ["Byproducts SO2 + HCl are gaseous → clean reactions"], conversions: ["RCOOH → RCOCl"] },
  { id: "dibal", name: "DIBAL-H", formula: "(iBu)2AlH", uses: ["Ester → aldehyde (1 equiv, low T)", "Nitrile → aldehyde"], exceptions: ["Stops at aldehyde if 1 equiv, –78 °C"], conversions: ["RCOOR' → RCHO"] },
  { id: "o3", name: "O3 (Ozonolysis)", formula: "O3", uses: ["Cleaves C=C", "Reductive workup (Zn/H2O): aldehydes/ketones", "Oxidative workup (H2O2): acids/ketones"], exceptions: ["Tri-sub C=C fragment → ketone"], conversions: ["R2C=CR2 → 2 R2C=O"] },
  { id: "mcpba", name: "mCPBA", formula: "C7H5ClO3", uses: ["Alkene → epoxide", "Baeyer–Villiger oxidation (ketone → ester)"], exceptions: ["Migratory aptitude: t > s > p > Me"], conversions: ["R2C=CR2 → epoxide"] },
  { id: "bh3", name: "BH3 / 9-BBN", formula: "BH3", uses: ["Hydroboration-oxidation → anti-Markovnikov alcohol"], exceptions: ["syn addition"], conversions: ["RCH=CH2 → RCH2CH2OH"] },
  { id: "hg-oac2", name: "Hg(OAc)2 / H2O", formula: "Hg(OAc)2", uses: ["Oxymercuration → Markovnikov alcohol, no rearrangement"], exceptions: [], conversions: ["RCH=CH2 → RCH(OH)CH3"] },
];