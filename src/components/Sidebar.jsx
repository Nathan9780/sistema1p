import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; // Ajuste o caminho se a sua pasta se chamar diferente

export default function Sidebar() {
  const navigate = useNavigate();
  // Puxando a nossa função de logout lá do contexto!
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    // 1. Avisa o Supabase para encerrar a sessão
    await logout();
    // 2. Manda o usuário de volta para a tela de Login
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen shadow-lg">
      <div className="p-6 mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Meu Sistema</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link
          to="/dashboard"
          className="block px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition"
        >
          Início
        </Link>
        <Link
          to="/produtos"
          className="block px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"
        >
          Produtos
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-md transition"
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
