import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);

  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message);
      toast.error("Erro ao carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalNovo = () => {
    setClienteEditandoId(null);
    setNovoCliente({ nome: "", email: "", telefone: "" });
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (cliente) => {
    setClienteEditandoId(cliente.id);
    setNovoCliente({
      nome: cliente.nome,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
    });
    setIsModalOpen(true);
  };

  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const dadosParaSalvar = {
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
      };

      if (clienteEditandoId) {
        const { error } = await supabase
          .from("clientes")
          .update(dadosParaSalvar)
          .eq("id", clienteEditandoId);

        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("clientes")
          .insert([dadosParaSalvar]);

        if (error) throw error;
        toast.success("Novo cliente cadastrado!");
      }

      setIsModalOpen(false);
      buscarClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error.message);
      toast.error("Ocorreu um erro ao salvar o cliente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirCliente = (id) => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá desfazer essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from("clientes")
            .delete()
            .eq("id", id);

          if (error) throw error;

          toast.success("Cliente excluído com sucesso!");
          buscarClientes();
        } catch (error) {
          console.error("Erro ao excluir cliente:", error.message);
          toast.error("Erro ao tentar excluir o cliente.");
        }
      }
    });
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(termoBusca.toLowerCase()),
  );

  return (
    <div className="flex bg-gray-50 min-h-screen w-full relative">
      <Sidebar />
      <Toaster position="top-right" reverseOrder={false} />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Gerenciar Clientes
          </h1>
          <button
            onClick={handleAbrirModalNovo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-200"
          >
            + Novo Cliente
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6 flex">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar cliente pelo nome..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Carregando clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {termoBusca
                      ? "Nenhum cliente encontrado."
                      : "Nenhum cliente cadastrado no momento."}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cliente.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.telefone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAbrirModalEditar(cliente)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirCliente(cliente.id)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {clienteEditandoId ? "Editar Cliente" : "Cadastrar Cliente"}
            </h2>

            <form onSubmit={handleSalvarCliente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={novoCliente.nome}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={novoCliente.email}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={novoCliente.telefone}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, telefone: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition"
                >
                  {salvando
                    ? "Salvando..."
                    : clienteEditandoId
                      ? "Atualizar Cliente"
                      : "Salvar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
