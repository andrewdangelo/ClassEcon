/**
 * Route / role matrix for ClassEcon (see Frontend/src/main.tsx and layouts).
 * Used as documentation for E2E coverage; Sidebar duplicates a subset for mobile.
 *
 * Teacher-only (RequireTeacher): classes/:id/fines, students/:id, redemptions,
 *   store/manage, settings/subscription, subscription/* (some), admin/beta-codes
 * Shared teacher+student: /, /classes, /store, /cart, /requests, /jobs (router differs)
 * Student-only nav item: /backpack (Sidebar)
 */

export const ROUTE_ROLES = {
  "/": ["TEACHER", "STUDENT"],
  "/classes": ["TEACHER", "STUDENT"],
  "/classes/new": ["TEACHER"],
  "/classes/:classId": ["TEACHER", "STUDENT"],
  "/classes/:classId/manage": ["TEACHER"],
  "/classes/:classId/fines": ["TEACHER"],
  "/classes/:classId/activity": ["TEACHER", "STUDENT"],
  "/students": ["TEACHER"],
  "/students/:studentId": ["TEACHER"],
  "/backpack": ["STUDENT", "PARENT"],
  "/jobs": ["TEACHER", "STUDENT"],
  "/requests": ["TEACHER", "STUDENT"],
  "/redemptions": ["TEACHER"],
  "/store": ["TEACHER", "STUDENT"],
  "/cart": ["TEACHER", "STUDENT"],
  "/store/manage": ["TEACHER"],
  "/settings": ["TEACHER", "STUDENT"],
  "/pricing": ["TEACHER", "STUDENT"],
  "/admin/beta-codes": ["TEACHER"],
  "/dev/tier-testing": ["TEACHER", "STUDENT"],
} as const;
