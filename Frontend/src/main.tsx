import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Layout } from "./modules/layout/Layout";
import Dashboard from "./modules/dashboard/Dashboard";
import Classes from "./modules/classes/Classes";
import Students from "./modules/students/Students";
import Store from "./modules/store/Store";
import ClassOverview from "./modules/classes/ClassOverview";
import ClassCreate from "./modules/classes/ClassCreate"; // <-- new
import { ClassProvider } from "@/context/ClassContext";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/context/CartContext";
import StudentRequestPayment from "./modules/requests/StudentRequestPayment"
import TeacherRequests from "./modules/requests/TeacherRequests"
import TeacherRequestsAll from "./modules/requests/TeacherRequestsAll"


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "classes", element: <Classes /> },
      { path: "classes/new", element: <ClassCreate /> }, // <-- new route
      { path: "classes/:classId", element: <ClassOverview /> },
      { path: "students", element: <Students /> },
      { path: "store", element: <Store /> },
      { path: "requests", element: <TeacherRequestsAll /> },
      {
        path: "classes/:classId/request-payment",
        element: <StudentRequestPayment />,
      },
      { path: "classes/:classId/requests", element: <TeacherRequests /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClassProvider initialRole="TEACHER">
      <CartProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </CartProvider>
    </ClassProvider>
  </React.StrictMode>
);
