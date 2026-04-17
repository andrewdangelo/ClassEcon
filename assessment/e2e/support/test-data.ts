import { E2E_ENV } from "./env";

const runId = process.env.E2E_RUN_ID ?? `${Date.now()}`;

export type Persona = string;

export function personaEmail(persona: Persona): string {
  return `${persona}.${runId}@e2e.classecon.local`;
}

export function personaName(persona: Persona): string {
  const labels: Record<string, string> = {
    teacherA: "Teacher Alpha",
    teacherB: "Teacher Beta",
    studentA: "Student Alpha",
    studentB: "Student Beta",
  };
  return `${labels[persona] ?? persona} ${runId}`;
}

export const testPassword = E2E_ENV.defaultPassword;
export const testRunId = runId;
