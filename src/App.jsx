import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Telas (Vamos criá-las no próximo passo)
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";

// Componente para proteger as rotas internas
const RotaProtegida = ({ children }) => {
  const { user } = useAuth();
  // Se não tem usuário logado, manda pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas */}
      <Route
        path="/"
        element={<RotaProtegida>{<Dashboard />}</RotaProtegida>}
      />

      <Route
        path="/produtos"
        element={
          <RotaProtegida>
            <Produtos />
          </RotaProtegida>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
