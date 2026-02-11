import { ColorModeContext, useMode } from "./theme";
import "bootstrap/dist/css/bootstrap.min.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";

import { MyProSidebarProvider } from "./pages/global/sidebar/sidebarContext";
import Topbar from "./pages/global/Topbar";


import Dashboard from "./pages/dashboard";
import Calendar from "./pages/calendar";


import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";
import UserProfile from "./pages/profile/UserProfile";
import ActivityLog from "./pages/activity/ActivityLog";
import AccessRejected from "./pages/accessRequest/AccessRejected";
import ReqAccess from "./pages/accessRequest/ReqAccess";
import AccessPending from "./pages/accessRequest/AccessPending";


import Brands from "./pages/ams/brands/Brands";

import NotFound404 from "./pages/error/404NotFound";


const App = () => {
  const [theme, colorMode] = useMode();


  return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Toaster position="top-center" reverseOrder={false} />
               <AppRoutes />

        </ThemeProvider>
      </ColorModeContext.Provider>
  );
};
const AppRoutes = () => (
    <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
         {/* New route for Access Request */}
        <Route path="access-rejected" element={<AccessRejected />} />
        <Route path="request-access" element={<ReqAccess />} />
        <Route path="access-pending" element={<AccessPending />} />


        {/* Protected routes inside DashboardLayout */}
        <Route
            path="/"
            element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }
        >
            <Route index element={<Dashboard />} />

            <Route path="calendar" element={<Calendar />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="activity" element={<ActivityLog />} />
             <Route path="brands" element={<Brands />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound404 />} />
    </Routes>
);

export default App;
