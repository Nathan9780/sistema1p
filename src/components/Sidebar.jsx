import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  // Função simples de logout para testarmos
  const handleLogout = () => {
    // Aqui depois colocaremos a função de sair do Supabase
    console.log("Saindo do sistema...");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen shadow-lg">
      {/* Cabeçalho da Sidebar */}
      <div className="p-6 mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Meu Sistema</h2>
      </div>

      {/* Links de Navegação */}
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

      {/* Rodapé da Sidebar (Botão de Sair) */}
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
