// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./i18n/config"; // Initialize i18n
import { Layout } from "./modules/layout/Layout";
import { RoleBasedLayout } from "./modules/layout/RoleBasedLayout";
import Dashboard from "./modules/dashboard/Dashboard";
import Classes from "./modules/classes/Classes";
import Students from "./modules/students/Students";
import Store from "./modules/store/Store";
import StoreManage from "./modules/store/StoreManage";
import Cart from "./modules/store/Cart";
import ClassOverview from "./modules/classes/ClassOverview";
import ClassCreate from "./modules/classes/ClassCreate";
import ClassManage from "./modules/classes/ClassManage";
import { ClassProvider } from "@/context/ClassContext";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/context/CartContext";

import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@/lib/apollo";
import { Provider } from "react-redux";
import { store } from "@/redux/store/store";
import GraphQLTest from "./modules/dev/GraphQLTest";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BetaAccessGuard } from "@/components/auth/BetaAccessGuard";
import { ThemeProvider } from "@/context/ThemeContext";

import { ModernAuth } from "@/components/auth/ModernAuth";
import { OAuthCallback } from "@/components/auth/OAuthCallback";
import TeacherOnboarding from "./modules/onboarding/TeacherOnboarding";
import { RequireClassGuard } from "@/components/auth/RequireClassGuard";
import { RequireTeacher } from "@/components/auth/RequireTeacher";
import RequestsPage from "./modules/requests/RequestsPage";
import { RedemptionRequestsPage } from "./modules/requests/RedemptionRequestsPage";
import StudentDetail from "./modules/students/StudentDetail";
import BackpackPage from "./modules/students/BackpackPage";
import { JobsRouter } from "./modules/jobs/JobsRouter";
import { FinesManagementPage } from "./modules/fines/FinesManagementPage";
import MyActivityPage from "./modules/activity/MyActivityPage";
import { LanguageProvider } from "@/i18n/LanguageContext";
import SettingsPage from "./modules/settings/SettingsPage";
import BetaCodesManagement from "./modules/admin/BetaCodesManagement";
import { SubscriptionSettingsPage } from "./pages/SubscriptionSettings";

const client = createApolloClient();

const router = createBrowserRouter([
  // Public auth page - wrapped in BetaAccessGuard
  { 
    path: "/auth", 
    element: (
      <BetaAccessGuard>
        <ModernAuth />
      </BetaAccessGuard>
    )
  },
  
  // OAuth callback routes - wrapped in BetaAccessGuard
  { 
    path: "/auth/callback/google", 
    element: (
      <BetaAccessGuard>
        <OAuthCallback provider="google" />
      </BetaAccessGuard>
    )
  },
  { 
    path: "/auth/callback/microsoft", 
    element: (
      <BetaAccessGuard>
        <OAuthCallback provider="microsoft" />
      </BetaAccessGuard>
    )
  },

  // Onboarding is a standalone page (not in Layout), but protected
  {
    path: "/onboarding",
    element: (
      <BetaAccessGuard>
        <ProtectedRoute>
          <RequireClassGuard>
            <TeacherOnboarding />
          </RequireClassGuard>
        </ProtectedRoute>
      </BetaAccessGuard>
    ),
  },

  // App shell — protected and gated by RequireClassGuard
  {
    path: "/",
    element: (
      <BetaAccessGuard>
        <ProtectedRoute>
          <RequireClassGuard>
            <RoleBasedLayout />
          </RequireClassGuard>
        </ProtectedRoute>
      </BetaAccessGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "classes", element: <Classes /> },
      { path: "classes/new", element: <ClassCreate /> },
      { path: "classes/:classId", element: <ClassOverview /> },
      { path: "classes/:classId/manage", element: <ClassManage /> },
      { 
        path: "classes/:classId/fines", 
        element: (
          <RequireTeacher>
            <FinesManagementPage />
          </RequireTeacher>
        ) 
      },
      { path: "students", element: <Students /> },
      { 
        path: "students/:studentId", 
        element: (
          <RequireTeacher>
            <StudentDetail />
          </RequireTeacher>
        ) 
      },
      { path: "backpack", element: <BackpackPage /> },
      { path: "classes/:classId/activity", element: <MyActivityPage /> },
      { path: "jobs", element: <JobsRouter /> }, // Routes to management for teachers, board for students
      { path: "requests", element: <RequestsPage /> },
      { 
        path: "redemptions", 
        element: (
          <RequireTeacher>
            <RedemptionRequestsPage />
          </RequireTeacher>
        ) 
      },
      { path: "store", element: <Store /> },
      { path: "cart", element: <Cart /> },
      { 
        path: "store/manage", 
        element: (
          <RequireTeacher>
            <StoreManage />
          </RequireTeacher>
        ) 
      },
      { path: "settings", element: <SettingsPage /> },
      { 
        path: "settings/subscription", 
        element: (
          <RequireTeacher>
            <SubscriptionSettingsPage />
          </RequireTeacher>
        ) 
      },
      { 
        path: "admin/beta-codes", 
        element: (
          <RequireTeacher>
            <BetaCodesManagement />
          </RequireTeacher>
        ) 
      },
      { path: "dev/graphql-test", element: <GraphQLTest /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <LanguageProvider>
          <ThemeProvider>
            <ClassProvider>
              <CartProvider>
                <ToastProvider>
                  <RouterProvider router={router} />
                </ToastProvider>
              </CartProvider>
            </ClassProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);
