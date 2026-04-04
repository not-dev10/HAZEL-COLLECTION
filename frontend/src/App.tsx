import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { UserProvider } from "@/context/UserContext";
import { AdminProvider } from "@/admin/context/AdminContext";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { CookieConsent } from "@/components/common/CookieConsent";
import { Suspense, lazy } from "react";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Product from "./pages/Product";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";

// Lazy load pages for loading animation to trigger
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Account = lazy(() => import("./pages/Account"));
const SearchProducts = lazy(() => import("./pages/SearchProducts"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const Blog = lazy(() => import("./pages/Blog"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load admin pages
const AdminPanel = lazy(() => import("./admin/pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

const queryClient = new QueryClient();

const App = () => (
  <CartProvider>
    <WishlistProvider>
      <UserProvider>
        <AdminProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <CookieConsent />
              <BrowserRouter>
                <Suspense fallback={<LoadingAnimation />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/collection/:slug" element={<Collection />} />
                    <Route path="/product/:id/:slug?" element={<Product />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/search" element={<SearchProducts />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/size-guide" element={<SizeGuide />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    
                    {/* Admin Panel Routes */}
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedAdminRoute>
                          <AdminPanel />
                        </ProtectedAdminRoute>
                      }
                    />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </AdminProvider>
      </UserProvider>
    </WishlistProvider>
  </CartProvider>
);

export default App;
