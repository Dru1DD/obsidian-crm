import { createBrowserRouter, RouterProvider } from "react-router";

import LandingPage from "@/pages/landing";
import ExplorerPage from "@/pages/explorer";
import ErrorPage from "@/pages/error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vault/*",
    element: <ExplorerPage />,
    errorElement: <ErrorPage />,
  },
]);

const Routing = () => <RouterProvider router={router} />;

export default Routing;
