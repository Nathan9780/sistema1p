import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

export default function Produtos() {
  // Estados da Tabela
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados do Modal de Novo Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error.message);
      setErro("Não foi possível carregar a lista de produtos.");
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar o produto no banco de dados
  const handleSalvarProduto = async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário
    setSalvando(true);

    try {
      // Mandando os dados para o Supabase
      const { error } = await supabase.from("produtos").insert([
        {
          nome: novoProduto.nome,
          categoria: novoProduto.categoria,
          preco: parseFloat(novoProduto.preco), // Garante que preço é número com vírgula (decimal)
          estoque: parseInt(novoProduto.estoque, 10), // Garante que estoque é número inteiro
        },
      ]);

      if (error) throw error;

      // Se deu certo: fecha o modal, limpa o formulário e recarrega a tabela!
      setIsModalOpen(false);
      setNovoProduto({ nome: "", categoria: "", preco: "", estoque: "" });
      buscarProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error.message);
      alert("Erro ao salvar o produto. Verifique o console.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen w-full relative">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Gerenciar Produtos
          </h1>
          {/* Agora o botão abre o Modal! */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-200"
          >
            + Novo Produto
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Estoque
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
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Carregando produtos...
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nenhum produto cadastrado no momento.
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr
                    key={produto.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      {Number(produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${produto.estoque > 10 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {produto.estoque} un
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4 transition">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition">
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

      {/* ========================================================= */}
      {/* MODAL DE NOVO PRODUTO (Só aparece se isModalOpen for true)*/}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Cadastrar Produto
            </h2>

            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={novoProduto.nome}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, nome: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={novoProduto.categoria}
                  onChange={(e) =>
                    setNovoProduto({
                      ...novoProduto,
                      categoria: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={novoProduto.preco}
                    onChange={(e) =>
                      setNovoProduto({ ...novoProduto, preco: e.target.value })
                    }
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={novoProduto.estoque}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        estoque: e.target.value,
                      })
                    }
                  />
                </div>
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
                  {salvando ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
