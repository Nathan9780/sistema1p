import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSair = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Erro ao tentar sair:", error.message);
      alert("Erro ao sair do sistema.");
    }
  };

  const menuItems = [
    { label: "Início", path: "/" },
    { label: "Produtos", path: "/produtos" },
    { label: "Clientes", path: "/clientes" },
    { label: "Vendas", path: "/vendas" },
    { label: "Relatórios", path: "/relatorios" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-400">Meu Sistema</h2>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-slate-800 text-blue-400 font-semibold"
                    : "text-gray-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 mb-4">
        <button
          onClick={handleSair}
          className="w-full text-left px-4 py-2 text-red-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
