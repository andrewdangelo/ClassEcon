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
export type TransactionType = "PAY" | "FINE" | "PURCHASE" | "ADJUST" | "REFUND";
export type Transaction = {
  id: string;
  classId: string;
  studentId: string;
  type: TransactionType;
  amount: number; // positive for income (PAY/REFUND/ADJUST+), negative for spending/fines
  date: string; // ISO date
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

// ----- Mock Transactions (last ~6 weeks) -----
export const transactions: Transaction[] = [
  // Algebra I (s1, s2)
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
  {
    id: "t3",
    classId: "algebra-i",
    studentId: "s1",
    type: "FINE",
    amount: -5,
    date: "2025-08-04",
    desc: "Late to class",
  },
  {
    id: "t4",
    classId: "algebra-i",
    studentId: "s1",
    type: "PAY",
    amount: 40,
    date: "2025-08-11",
    desc: "Weekly salary",
  },
  {
    id: "t5",
    classId: "algebra-i",
    studentId: "s1",
    type: "PURCHASE",
    amount: -50,
    date: "2025-08-15",
    desc: "Homework Pass",
  },
  {
    id: "t6",
    classId: "algebra-i",
    studentId: "s2",
    type: "PAY",
    amount: 40,
    date: "2025-08-11",
    desc: "Weekly salary",
  },
  {
    id: "t7",
    classId: "algebra-i",
    studentId: "s2",
    type: "PURCHASE",
    amount: -10,
    date: "2025-08-12",
    desc: "Sticker Pack",
  },

  // History 7 (s3, s4)
  {
    id: "t8",
    classId: "history-7",
    studentId: "s3",
    type: "PAY",
    amount: 40,
    date: "2025-07-30",
    desc: "Weekly salary",
  },
  {
    id: "t9",
    classId: "history-7",
    studentId: "s3",
    type: "FINE",
    amount: -10,
    date: "2025-08-03",
    desc: "Talking in class",
  },
  {
    id: "t10",
    classId: "history-7",
    studentId: "s4",
    type: "PAY",
    amount: 40,
    date: "2025-08-06",
    desc: "Weekly salary",
  },
  {
    id: "t11",
    classId: "history-7",
    studentId: "s4",
    type: "PURCHASE",
    amount: -30,
    date: "2025-08-10",
    desc: "Extra Recess",
  },

  // Science 6 (s5)
  {
    id: "t12",
    classId: "science-6",
    studentId: "s5",
    type: "PAY",
    amount: 60,
    date: "2025-08-05",
    desc: "Lab assistant",
  },
  {
    id: "t13",
    classId: "science-6",
    studentId: "s5",
    type: "PURCHASE",
    amount: -15,
    date: "2025-08-09",
    desc: "Pencil Pack",
  },
  {
    id: "t14",
    classId: "science-6",
    studentId: "s5",
    type: "PAY",
    amount: 60,
    date: "2025-08-19",
    desc: "Lab assistant",
  },
];

// ----- Helpers -----
export const getStudentsByClass = (classId: string) =>
  students.filter((s) => s.classId === classId);

export const getStoreItemsByClass = (classId: string) =>
  storeItems.filter((i) => i.classId === classId);

export const getTransactionsByStudentClass = (
  studentId: string,
  classId: string
) =>
  transactions
    .filter((t) => t.classId === classId && t.studentId === studentId)
    .sort((a, b) => a.date.localeCompare(b.date));

export const getClassTransactions = (classId: string) =>
  transactions
    .filter((t) => t.classId === classId)
    .sort((a, b) => a.date.localeCompare(b.date));

export const getTotalBalanceForClass = (classId: string) =>
  getStudentsByClass(classId).reduce((sum, s) => sum + s.balance, 0);

export const getStudentById = (id: string) =>
  students.find((s) => s.id === id) || null;

export const getClassStudentBalances = (classId: string) =>
  getStudentsByClass(classId).map((s) => ({
    studentId: s.id,
    name: s.name,
    balance: s.balance,
  }));
