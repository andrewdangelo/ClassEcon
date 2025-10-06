// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
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

import { LoginSignupCard } from "@/components/auth/LoginSignupCard";
import TeacherOnboarding from "./modules/onboarding/TeacherOnboarding";
import { RequireClassGuard } from "@/components/auth/RequireClassGuard";
import { RequireTeacher } from "@/components/auth/RequireTeacher";
import RequestsPage from "./modules/requests/RequestsPage";

const client = createApolloClient();

const router = createBrowserRouter([
  // Public auth page
  { path: "/auth", element: <LoginSignupCard /> },

  // Onboarding is a standalone page (not in Layout), but protected
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <RequireClassGuard>
          <TeacherOnboarding />
        </RequireClassGuard>
      </ProtectedRoute>
    ),
  },

  // App shell — protected and gated by RequireClassGuard
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RequireClassGuard>
          <RoleBasedLayout />
        </RequireClassGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "classes", element: <Classes /> },
      { path: "classes/new", element: <ClassCreate /> },
      { path: "classes/:classId", element: <ClassOverview /> },
      { path: "classes/:classId/manage", element: <ClassManage /> },
      { path: "students", element: <Students /> },
      { path: "requests", element: <RequestsPage /> },
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
      { path: "dev/graphql-test", element: <GraphQLTest /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <ClassProvider>
          <CartProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </CartProvider>
        </ClassProvider>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);
