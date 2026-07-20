import type { Subject } from "./types";

const ch = (subjectId: string, unitId: string, name: string) => ({
  id: `${subjectId}-${unitId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  subjectId,
  unitId,
});

const unit = (subjectId: string, name: string, chapters: string[]) => {
  const unitId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id: unitId,
    name,
    chapters: chapters.map((c) => ch(subjectId, unitId, c)),
  };
};

export const SUBJECTS: Subject[] = [
  {
    id: "phy",
    name: "Physics",
    short: "PHY",
    colorVar: "--phy",
    units: [
      unit("phy", "Mechanics", [
        "Units & Dimensions",
        "Kinematics",
        "Newton's Laws",
        "Work Power Energy",
        "Center of Mass",
        "Rotational Motion",
        "Gravitation",
      ]),
      unit("phy", "Thermodynamics", ["Heat & Thermodynamics", "KTG", "Calorimetry"]),
      unit("phy", "Waves & Oscillations", ["SHM", "Waves", "Sound"]),
      unit("phy", "Electrodynamics", [
        "Electrostatics",
        "Current Electricity",
        "Capacitance",
        "Magnetism",
        "EMI",
        "AC",
      ]),
      unit("phy", "Optics", ["Ray Optics", "Wave Optics"]),
      unit("phy", "Modern Physics", ["Dual Nature", "Atoms & Nuclei", "Semiconductors"]),
    ],
  },
  {
    id: "che",
    name: "Chemistry",
    short: "CHE",
    colorVar: "--che",
    units: [
      unit("che", "Physical", [
        "Mole Concept",
        "Atomic Structure",
        "Thermodynamics",
        "Equilibrium",
        "Ionic Equilibrium",
        "Electrochemistry",
        "Chemical Kinetics",
        "Solutions",
      ]),
      unit("che", "Organic", [
        "GOC",
        "Isomerism",
        "Hydrocarbons",
        "Alkyl Halides",
        "Alcohols Ethers",
        "Aldehydes Ketones",
        "Amines",
        "Biomolecules",
      ]),
      unit("che", "Inorganic", [
        "Periodic Table",
        "Chemical Bonding",
        "p-Block",
        "d & f Block",
        "Coordination",
        "Metallurgy",
      ]),
    ],
  },
  {
    id: "mat",
    name: "Mathematics",
    short: "MAT",
    colorVar: "--mat",
    units: [
      unit("mat", "Algebra", [
        "Sets & Relations",
        "Complex Numbers",
        "Quadratic Equations",
        "Sequences & Series",
        "Permutation Combination",
        "Binomial Theorem",
        "Matrices & Determinants",
        "Probability",
      ]),
      unit("mat", "Calculus", [
        "Functions",
        "Limits",
        "Continuity & Differentiability",
        "Differentiation",
        "Application of Derivatives",
        "Indefinite Integration",
        "Definite Integration",
        "Area Under Curves",
        "Differential Equations",
      ]),
      unit("mat", "Coordinate Geometry", [
        "Straight Lines",
        "Circles",
        "Parabola",
        "Ellipse",
        "Hyperbola",
      ]),
      unit("mat", "Vectors & 3D", ["Vectors", "3D Geometry"]),
      unit("mat", "Trigonometry", ["Trigonometric Ratios", "Trigonometric Equations", "Inverse Trig"]),
    ],
  },
];

export const ALL_CHAPTERS = SUBJECTS.flatMap((s) =>
  s.units.flatMap((u) => u.chapters.map((c) => ({ ...c, unitName: u.name, subject: s }))),
);

export const getChapter = (id: string) => ALL_CHAPTERS.find((c) => c.id === id);
export const getSubject = (id: string) => SUBJECTS.find((s) => s.id === id);

export const PYQ_MAIN_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
export const PYQ_ADV_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const ALLEN_SHEETS = [
  { key: "ex1", label: "Exercise 1" },
  { key: "ex2", label: "Exercise 2" },
  { key: "ex3", label: "Exercise 3" },
  { key: "ex4", label: "Exercise 4" },
  { key: "adv", label: "Advanced Ex" },
  { key: "arc", label: "Archive" },
  { key: "ch", label: "Challenge" },
];