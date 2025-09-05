export type Role = "TEACHER" | "STUDENT" | "PARENT";
export type UserStatus = "ACTIVE" | "INVITED" | "DISABLED";

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "PURCHASE"
  | "REFUND"
  | "PAYROLL"
  | "FINE";

export type PayPeriod = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "SEMESTER";
export type JobSalaryUnit = "FIXED" | "HOURLY"; // (v1 use FIXED)

export type JobApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";
export type EmploymentStatus = "ACTIVE" | "ENDED";

export type PayRequestStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "PAID"
  | "REBUKED"
  | "DENIED";
