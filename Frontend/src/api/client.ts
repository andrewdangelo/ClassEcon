// Fake async API wrapping the mock data with latency and occasional errors.
import { http } from "./http";
import { selectAccessToken } from "../redux/authSlice";
import { store } from "../redux/store/store";

// Toggle mock via env (default: real backend)
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "0") === "1";


// Mock imports only when needed to keep bundle lean
let getStudentsByClass: any, getStoreItemsByClass: any, getTotalBalanceForClass: any;

// Toggle mock via env (default: real backend)
if (USE_MOCK) {
  const m = await import("@/data/mock");
  ({ getStudentsByClass, getStoreItemsByClass, getTotalBalanceForClass } = m);
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
async function simulate<T>(
  fn: () => T,
  { min = 300, max = 900, failRate = 0.12 } = {}
): Promise<T> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(ms);
  if (Math.random() < failRate)
    throw new Error("Network hiccup — please try again.");
  return fn();
}

// GraphQL helper using the same auth/cookies as http()
const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";
async function gql<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const token = selectAccessToken(store.getState() as any);
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length)
    throw new Error(json.errors[0].message || "GraphQL error");
  return json.data as T;
}

// Types aligned to your component expectations
export type Student = { id: string; name: string; balance: number };
export type StoreItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  perStudentLimit?: number;
  active?: boolean;
};

export async function apiFetchStudentsByClass(
  classId: string
): Promise<Student[]> {
  if (USE_MOCK)
    return simulate(() =>
      getStudentsByClass(classId).map((s: any) => ({ ...s }))
    );
  const data = await gql<{
    studentsByClass: Array<{
      id: string;
      name: string;
      classId: string;
      balance: number;
    }>;
  }>(
    `query($classId: ID!) { studentsByClass(classId: $classId) { id name classId balance } }`,
    { classId }
  );
  return data.studentsByClass.map((s) => ({
    id: s.id,
    name: s.name,
    balance: s.balance,
  }));
}

export async function apiFetchStoreItemsByClass(
  classId: string
): Promise<StoreItem[]> {
  if (USE_MOCK)
    return simulate(() =>
      getStoreItemsByClass(classId).map((i: any) => ({ ...i }))
    );
  const data = await gql<{
    storeItemsByClass: Array<{
      id: string;
      title: string;
      price: number;
      stock: number | null;
      description?: string;
      imageUrl?: string;
      perStudentLimit?: number;
      active?: boolean;
    }>;
  }>(
    `query($classId: ID!) { 
      storeItemsByClass(classId: $classId) { 
        id 
        title 
        price 
        stock 
        description
        imageUrl
        perStudentLimit
        active
      } 
    }`,
    { classId }
  );
  return data.storeItemsByClass.map((it) => ({
    id: it.id,
    name: it.title,
    price: it.price,
    stock: it.stock ?? 0,
    description: it.description,
    imageUrl: it.imageUrl,
    perStudentLimit: it.perStudentLimit,
    active: it.active,
  }));
}

export async function apiFetchTotalBalanceForClass(
  classId: string
): Promise<number> {
  if (USE_MOCK) return simulate(() => getTotalBalanceForClass(classId));
  // Aggregate from studentsByClass to avoid creating a new backend query
  const students = await apiFetchStudentsByClass(classId);
  return students.reduce((sum, s) => sum + (s.balance || 0), 0);
}
