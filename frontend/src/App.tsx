import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { UserProvider } from "@/context/UserContext";
import { Suspense, useState, useEffect, lazy } from "react";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Product from "./pages/Product";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <CartProvider>
    <WishlistProvider>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingAnimation />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/collection/:slug" element={<Collection />} />
                  <Route path="/product/:slug" element={<Product />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/search" element={<SearchProducts />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/blog" element={<Blog />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </UserProvider>
    </WishlistProvider>
  </CartProvider>
);

export default App;
