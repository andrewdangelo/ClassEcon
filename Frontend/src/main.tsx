import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Layout } from "./modules/layout/Layout";
import Dashboard from "./modules/dashboard/Dashboard";
import Classes from "./modules/classes/Classes";
import Students from "./modules/students/Students";
import Store from "./modules/store/Store";
import { ClassProvider } from "@/context/ClassContext";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/context/CartContext";
import ClassOverview from "./modules/classes/ClassOverview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "classes", element: <Classes /> },
      { path: "classes/:classId", element: <ClassOverview /> },
      { path: "students", element: <Students /> },
      { path: "store", element: <Store /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Change initialRole to "STUDENT" to see compact/student view by default */}
    <ClassProvider initialRole="TEACHER">
      <CartProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </CartProvider>
    </ClassProvider>
  </React.StrictMode>
);
