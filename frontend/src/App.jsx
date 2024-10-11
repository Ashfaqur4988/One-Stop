import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { lazy, Suspense, useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";
// import CategoryPage from "./pages/CategoryPage";
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage ";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  // console.log(cart);
  if (checkingAuth) return <LoadingSpinner />;
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15)_0%,rgba(29,78,216,0.1)_45%,rgba(0,0,0,0.05)_100%)]" />
        </div>
      </div>

      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <HomePage />}
          />
          <Route path="/login" element={!user ? <LoginPage /> : <HomePage />} />
          <Route
            path="/cart"
            element={
              !user ? (
                <LoginPage />
              ) : (
                <Suspense fallback={<LoadingSpinner />}>
                  <CartPage />
                </Suspense>
              )
            }
          />
          <Route
            path="/category/:category"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CategoryPage />
              </Suspense>
            }
          />
          <Route
            path="/admin-dashboard"
            element={user?.role === "admin" ? <AdminPage /> : <LoginPage />}
          />
          <Route
            path={`/purchase-success`}
            element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
          />
          <Route
            path={`/purchase-cancel`}
            element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
