import { createBrowserRouter } from "react-router";

import MainPage from "./pages/MainPage";
import DashboardPage from "./pages/DashboardPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import BooksPage from "./pages/Books/BooksPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import MembersPage from "./pages/Members/MembersPage";
import BorrowPage from "./pages/Borrow/BorrowPage";
import FinesPage from "./pages/Fines/FinesPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import ProtectedRoute from "./components/shared/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/register",
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainPage />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "books", element: <BooksPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "members", element: <MembersPage /> },
          { path: "borrow", element: <BorrowPage /> },
          { path: "fines", element: <FinesPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
