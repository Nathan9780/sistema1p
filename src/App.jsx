import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Support from "./pages/Support";
import Coupons from "./pages/Coupons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando NEXUS Store...</p>
    </div>
  );
}

function AppRoutes() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentProductId, setCurrentProductId] = useState(null);
  const [timeout, setTimeoutState] = useState(false);
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimeoutState(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Redireciona para login se tentar acessar página protegida sem estar logado
  useEffect(() => {
    const protectedPages = ["profile", "cart", "orders", "favorites"];
    if (!loading && !user && protectedPages.includes(currentPage)) {
      setCurrentPage("login");
      if (showToast) showToast("🔒 Faça login para acessar esta página", 3000);
    }
  }, [user, loading, currentPage, showToast]);

  const navigateTo = (page, productId = null) => {
    setCurrentPage(page);
    if (productId) setCurrentProductId(productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home navigateTo={navigateTo} />;
      case "products":
        return <Products navigateTo={navigateTo} />;
      case "detail":
        return (
          <ProductDetail productId={currentProductId} navigateTo={navigateTo} />
        );
      case "cart":
        return <Cart navigateTo={navigateTo} />;
      case "about":
        return <About />;
      case "login":
        return <Login navigateTo={navigateTo} />;
      case "profile":
        return <Profile navigateTo={navigateTo} />;
      case "orders":
        return <Orders navigateTo={navigateTo} />;
      case "favorites":
        return <Favorites navigateTo={navigateTo} />;
      case "support":
        return <Support navigateTo={navigateTo} />;
      case "coupons":
        return <Coupons navigateTo={navigateTo} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  if (loading && !timeout) return <LoadingScreen />;

  return (
    <>
      {currentPage !== "login" && (
        <Header navigateTo={navigateTo} currentPage={currentPage} />
      )}
      <main className="app-main">{renderPage()}</main>
      {currentPage !== "login" && <Footer navigateTo={navigateTo} />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
