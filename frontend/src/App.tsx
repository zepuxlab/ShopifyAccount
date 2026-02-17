import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AccountLayout from "@/components/account/AccountLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Orders from "@/pages/account/Orders";
import OrderDetails from "@/pages/account/OrderDetails";
import Profile from "@/pages/account/Profile";
import Addresses from "@/pages/account/Addresses";
import PaymentMethods from "@/pages/account/PaymentMethods";
import Reviews from "@/pages/account/Reviews";
import AccountSettings from "@/pages/account/Settings";
import Login from "@/pages/Login";
import Callback from "@/pages/Callback";
import AppUi from "@/pages/AppUi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MarketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/account" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/appui" element={<AppUi />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Orders />} />
                <Route path="orders/:orderId" element={<OrderDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="payment-methods" element={<PaymentMethods />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MarketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
