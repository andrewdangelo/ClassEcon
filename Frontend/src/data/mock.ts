// ----- Types -----
export type Student = {
  id: string;
  name: string;
  classId: string;
  balance: number;
};
export type StoreItem = {
  id: string;
  classId: string;
  name: string;
  price: number;
  stock: number;
};
export type Job = {
  id: string;
  classId: string;
  title: string;
  payPeriod: "WEEKLY" | "MONTHLY" | "SEMESTER";
  salary: number;
  slots: number;
};
export type TransactionType = "PAY" | "FINE" | "PURCHASE" | "ADJUST" | "REFUND";
export type Transaction = {
  id: string;
  classId: string;
  studentId: string;
  type: TransactionType;
  amount: number;
  date: string;
  desc: string;
};

// ----- Mock Students -----
export const students: Student[] = [
  { id: "s1", name: "Ava M.", classId: "algebra-i", balance: 120 },
  { id: "s2", name: "Liam K.", classId: "algebra-i", balance: 80 },
  { id: "s3", name: "Noah S.", classId: "history-7", balance: 140 },
  { id: "s4", name: "Emma R.", classId: "history-7", balance: 60 },
  { id: "s5", name: "Olivia C.", classId: "science-6", balance: 200 },
];

// ----- Mock Store Items -----
export const storeItems: StoreItem[] = [
  {
    id: "i1",
    classId: "algebra-i",
    name: "Homework Pass",
    price: 50,
    stock: 5,
  },
  {
    id: "i2",
    classId: "algebra-i",
    name: "Sticker Pack",
    price: 10,
    stock: 20,
  },
  {
    id: "i3",
    classId: "history-7",
    name: "Extra Recess (10m)",
    price: 30,
    stock: 8,
  },
  { id: "i4", classId: "science-6", name: "Seat Swap", price: 25, stock: 3 },
  { id: "i5", classId: "science-6", name: "Pencil Pack", price: 15, stock: 12 },
];

// ----- Mock Jobs -----
export const jobs: Job[] = [
  {
    id: "j1",
    classId: "algebra-i",
    title: "Board Cleaner",
    payPeriod: "WEEKLY",
    salary: 20,
    slots: 1,
  },
  {
    id: "j2",
    classId: "history-7",
    title: "Line Leader",
    payPeriod: "WEEKLY",
    salary: 15,
    slots: 2,
  },
];

// ----- Mock Transactions (sample) -----
export const transactions: Transaction[] = [
  {
    id: "t1",
    classId: "algebra-i",
    studentId: "s1",
    type: "PAY",
    amount: 40,
    date: "2025-07-28",
    desc: "Weekly salary",
  },
  {
    id: "t2",
    classId: "algebra-i",
    studentId: "s1",
    type: "PURCHASE",
    amount: -10,
    date: "2025-08-02",
    desc: "Sticker Pack",
  },
  // ... (rest unchanged)
];

// ----- Queries -----
export const getStudentsByClass = (classId: string) =>
  students.filter((s) => s.classId === classId);
export const getStoreItemsByClass = (classId: string) =>
  storeItems.filter((i) => i.classId === classId);
export const getClassTransactions = (classId: string) =>
  transactions
    .filter((t) => t.classId === classId)
    .sort((a, b) => a.date.localeCompare(b.date));
export const getTransactionsByStudentClass = (
  studentId: string,
  classId: string
) =>
  transactions
    .filter((t) => t.classId === classId && t.studentId === studentId)
    .sort((a, b) => a.date.localeCompare(b.date));
export const getStudentById = (id: string) =>
  students.find((s) => s.id === id) || null;
export const getClassStudentBalances = (classId: string) =>
  getStudentsByClass(classId).map((s) => ({
    studentId: s.id,
    name: s.name,
    balance: s.balance,
  }));
export const getTotalBalanceForClass = (classId: string) =>
  getStudentsByClass(classId).reduce((sum, s) => sum + s.balance, 0);

// ----- Mutations (used by Create Class flow) -----
export function addStudentsToClass(classId: string, names: string[]) {
  const created: Student[] = [];
  for (const name of names.map((n) => n.trim()).filter(Boolean)) {
    const id = `s_${classId}_${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}_${Math.random().toString(36).slice(2, 6)}`;
    const obj: Student = { id, name, classId, balance: 0 };
    students.push(obj);
    created.push(obj);
  }
  return created;
}

export function addJobsToClass(
  classId: string,
  items: Omit<Job, "id" | "classId">[]
) {
  const created: Job[] = [];
  for (const j of items) {
    const id = `j_${classId}_${Math.random().toString(36).slice(2, 8)}`;
    const obj: Job = { id, classId, ...j };
    jobs.push(obj);
    created.push(obj);
  }
  return created;
}

export function addStoreItemsToClass(
  classId: string,
  items: Omit<StoreItem, "id" | "classId">[]
) {
  const created: StoreItem[] = [];
  for (const it of items) {
    const id = `i_${classId}_${Math.random().toString(36).slice(2, 8)}`;
    const obj: StoreItem = { id, classId, ...it };
    storeItems.push(obj);
    created.push(obj);
  }
  return created;
}
