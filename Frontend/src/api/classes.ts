import { ClassSummary } from "@/context/ClassContext";
import {
  addJobsToClass,
  addStoreItemsToClass,
  addStudentsToClass,
  type Job,
  type StoreItem,
} from "@/data/mock";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export type ClassCreateInput = {
  name: string;
  term?: string;
  room?: string;
  defaultCurrency?: string;
  policies?: {
    allowNegative?: boolean;
    requireFineReason?: boolean;
    perItemPurchaseLimit?: number | null;
  };
  seed?: {
    students?: { name: string }[];
    jobs?: {
      title: string;
      payPeriod: "WEEKLY" | "MONTHLY" | "SEMESTER";
      salary: number;
      slots: number;
    }[];
    storeItems?: { name: string; price: number; stock: number }[];
  };
};

export async function apiCreateClass(
  input: ClassCreateInput
): Promise<ClassSummary> {
  await delay(400);
  return {
    id: "", // finalized by context.addClass
    name: input.name,
    term: input.term,
    room: input.room,
    defaultCurrency: input.defaultCurrency || "CE$",
  };
}

export async function apiSeedClassEntities(
  classId: string,
  seed: NonNullable<ClassCreateInput["seed"]>
) {
  await delay(250);
  if (seed.students?.length)
    addStudentsToClass(
      classId,
      seed.students.map((s) => s.name)
    );
  if (seed.jobs?.length) addJobsToClass(classId, seed.jobs);
  if (seed.storeItems?.length) addStoreItemsToClass(classId, seed.storeItems);
  return true;
}
