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
import ClassCreate from "./modules/classes/ClassCreate";
import { ClassProvider } from "@/context/ClassContext";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/context/CartContext";

import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/graphql/client";
import GraphQLTest from "./modules/dev/GraphQLTest";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "classes", element: <Classes /> },
      { path: "classes/new", element: <ClassCreate /> },
      { path: "classes/:classId", element: <ClassOverview /> },
      { path: "students", element: <Students /> },
      { path: "store", element: <Store /> },
      { path: "dev/graphql-test", element: <GraphQLTest /> },

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ClassProvider initialRole="TEACHER">
        <CartProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartProvider>
      </ClassProvider>
    </ApolloProvider>
  </React.StrictMode>
);
