// Chapter dependency graph — what to study before, what unlocks next.

export const DEPENDENCIES: Record<string, string[]> = {
  // Physics
  "phy-mechanics-kinematics": ["phy-mechanics-units-dimensions"],
  "phy-mechanics-newton-s-laws": ["phy-mechanics-kinematics"],
  "phy-mechanics-work-power-energy": ["phy-mechanics-newton-s-laws"],
  "phy-mechanics-center-of-mass": ["phy-mechanics-work-power-energy"],
  "phy-mechanics-rotational-motion": ["phy-mechanics-center-of-mass"],
  "phy-mechanics-gravitation": ["phy-mechanics-newton-s-laws"],
  "phy-electrodynamics-current-electricity": ["phy-electrodynamics-electrostatics"],
  "phy-electrodynamics-capacitance": ["phy-electrodynamics-electrostatics"],
  "phy-electrodynamics-magnetism": ["phy-electrodynamics-current-electricity"],
  "phy-electrodynamics-emi": ["phy-electrodynamics-magnetism"],
  "phy-electrodynamics-ac": ["phy-electrodynamics-emi"],
  // Chemistry Organic
  "che-organic-isomerism": ["che-organic-goc"],
  "che-organic-hydrocarbons": ["che-organic-goc"],
  "che-organic-alkyl-halides": ["che-organic-hydrocarbons"],
  "che-organic-alcohols-ethers": ["che-organic-alkyl-halides"],
  "che-organic-aldehydes-ketones": ["che-organic-alcohols-ethers"],
  "che-organic-amines": ["che-organic-aldehydes-ketones"],
  // Maths Calculus
  "mat-calculus-limits": ["mat-calculus-functions"],
  "mat-calculus-continuity-differentiability": ["mat-calculus-limits"],
  "mat-calculus-differentiation": ["mat-calculus-continuity-differentiability"],
  "mat-calculus-application-of-derivatives": ["mat-calculus-differentiation"],
  "mat-calculus-indefinite-integration": ["mat-calculus-differentiation"],
  "mat-calculus-definite-integration": ["mat-calculus-indefinite-integration"],
  "mat-calculus-area-under-curves": ["mat-calculus-definite-integration"],
  "mat-calculus-differential-equations": ["mat-calculus-indefinite-integration"],
};

export function getPrereqs(id: string): string[] {
  return DEPENDENCIES[id] ?? [];
}

export function getNext(id: string): string[] {
  return Object.entries(DEPENDENCIES)
    .filter(([, prereqs]) => prereqs.includes(id))
    .map(([k]) => k);
}