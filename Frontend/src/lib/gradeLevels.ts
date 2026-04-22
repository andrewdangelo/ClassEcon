/**
 * Class.gradeLevel (GraphQL Int / Mongo Number): 0 = Kindergarten, 1–12 = grade.
 * Matches Backend Class schema min/max 0–12.
 */
export const GRADE_LEVEL_SELECT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "0", label: "Kindergarten" },
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((g) => ({
    value: String(g),
    label: `Grade ${g}`,
  })),
];
