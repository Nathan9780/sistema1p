import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const { user, role } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>
        Bem-vindo(a), <strong>{user?.email}</strong>!
      </p>
      <p>
        Seu perfil de acesso é:{" "}
        <span className="uppercase font-bold text-blue-600">{role}</span>
      </p>

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sair do Sistema
      </button>
    </div>
  );
}
