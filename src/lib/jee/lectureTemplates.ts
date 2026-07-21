// Standard resource → typical lecture count (auto-populates lectures 1..N).
export const LECTURE_TEMPLATES: Record<string, number> = {
  "Allen Kota": 18,
  "Physics Wallah": 20,
  "Vedantu": 15,
  "Unacademy": 16,
};

export function templateFor(name: string): number | undefined {
  return LECTURE_TEMPLATES[name];
}