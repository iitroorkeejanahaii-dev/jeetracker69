// Default concept lists per chapter (mastery seeds).
// Fallback: empty array — user can add concepts manually.

export const CONCEPTS: Record<string, string[]> = {
  // Physics — Mechanics
  "phy-mechanics-units-dimensions": ["SI units", "Dimensional analysis", "Errors", "Significant figures"],
  "phy-mechanics-kinematics": ["1D motion", "Graphs", "Projectile", "Relative velocity", "Circular motion"],
  "phy-mechanics-newton-s-laws": ["Free body diagrams", "Friction", "Pseudo forces", "Constraint motion", "Pulleys"],
  "phy-mechanics-work-power-energy": ["Work-energy theorem", "Conservative forces", "Potential energy", "Power", "Collisions basics"],
  "phy-mechanics-center-of-mass": ["COM location", "Momentum conservation", "Collisions 1D/2D", "Variable mass", "Impulse"],
  "phy-mechanics-rotational-motion": ["Moment of inertia", "Torque", "Angular momentum", "Rolling", "Fixed axis rotation"],
  "phy-mechanics-gravitation": ["Kepler's laws", "Field & potential", "Escape velocity", "Satellites", "Binding energy"],
  // Electrodynamics
  "phy-electrodynamics-electrostatics": ["Coulomb law", "Electric field", "Potential", "Flux", "Gauss law", "Conductors", "Shielding"],
  "phy-electrodynamics-current-electricity": ["Ohm's law", "Kirchhoff", "Wheatstone", "Meters", "RC circuits"],
  "phy-electrodynamics-capacitance": ["Parallel plate", "Combinations", "Dielectrics", "Energy", "Charging RC"],
  "phy-electrodynamics-magnetism": ["Biot-Savart", "Ampere's law", "Force on charge", "Force on wire", "Torque on loop"],
  "phy-electrodynamics-emi": ["Faraday", "Lenz", "Self inductance", "Mutual inductance", "LR circuits"],
  "phy-electrodynamics-ac": ["RMS values", "Phasors", "LCR series", "Resonance", "Power factor"],
  // Chemistry — Organic
  "che-organic-goc": ["Hybridisation", "Inductive effect", "Resonance", "Hyperconjugation", "Acidity/Basicity"],
  "che-organic-isomerism": ["Structural", "Geometrical", "Optical", "Conformational", "Chirality"],
  "che-organic-hydrocarbons": ["Alkanes", "Alkenes", "Alkynes", "Aromaticity", "Electrophilic substitution"],
  "che-organic-alkyl-halides": ["SN1", "SN2", "E1", "E2", "Grignard"],
  "che-organic-alcohols-ethers": ["Prep", "Oxidation", "Dehydration", "Williamson", "Pinacol"],
  "che-organic-aldehydes-ketones": ["Nucleophilic addition", "Aldol", "Cannizzaro", "Reduction", "Haloform"],
  // Maths — Calculus
  "mat-calculus-functions": ["Domain-range", "Composite", "Inverse", "Even/Odd", "Periodic"],
  "mat-calculus-limits": ["Algebraic limits", "L'Hopital", "Trig limits", "Exponential limits", "Sandwich theorem"],
  "mat-calculus-continuity-differentiability": ["Continuity types", "Differentiability", "IVT", "MVT", "Rolle"],
  "mat-calculus-differentiation": ["Chain rule", "Implicit", "Parametric", "Log diff", "Higher order"],
  "mat-calculus-application-of-derivatives": ["Tangents", "Monotonicity", "Maxima-Minima", "Concavity", "Approximations"],
  "mat-calculus-indefinite-integration": ["Standard forms", "Substitution", "By parts", "Partial fractions", "Trig integrals"],
  "mat-calculus-definite-integration": ["Properties", "King's rule", "Reduction formulae", "Improper", "Leibniz rule"],
};

export function getConceptSeed(chapterId: string): string[] {
  return CONCEPTS[chapterId] ?? [];
}