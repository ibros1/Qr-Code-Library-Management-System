import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";

import { store } from "./store/store";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { router } from "./routes";

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
