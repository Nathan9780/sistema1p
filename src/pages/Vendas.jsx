import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Estados do formulário de venda
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // Carrega clientes e produtos ao abrir a tela
  useEffect(() => {
    buscarDadosGerais();
  }, []);

  const buscarDadosGerais = async () => {
    try {
      // Busca clientes
      const { data: dadosClientes, error: erroClientes } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });
      if (erroClientes) throw erroClientes;
      setClientes(dadosClientes);

      // Busca produtos
      const { data: dadosProdutos, error: erroProdutos } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });
      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos);
    } catch (error) {
      console.error("Erro ao buscar dados:", error.message);
      toast.error("Erro ao carregar clientes e produtos.");
    }
  };

  // Função para adicionar item ao carrinho
  const handleAdicionarAoCarrinho = (e) => {
    e.preventDefault();

    if (!produtoSelecionado || quantidade <= 0) {
      toast.error("Selecione um produto e uma quantidade válida.");
      return;
    }

    // Acha os detalhes do produto selecionado
    const produtoInfo = produtos.find(
      (p) => p.id.toString() === produtoSelecionado,
    );
    if (!produtoInfo) return;

    const precoNumber = parseFloat(produtoInfo.preco);
    const qtdNumber = parseInt(quantidade);
    const subtotal = precoNumber * qtdNumber;

    const novoItem = {
      produto_id: produtoInfo.id,
      nome: produtoInfo.nome,
      quantidade: qtdNumber,
      preco_unitario: precoNumber,
      subtotal: subtotal,
      idTemporario: Date.now(), // Apenas para controle na tela
    };

    setCarrinho([...carrinho, novoItem]);

    // Limpa os campos para o próximo item
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  // Remove um item do carrinho
  const handleRemoverDoCarrinho = (idTemp) => {
    setCarrinho(carrinho.filter((item) => item.idTemporario !== idTemp));
  };

  // Calcula o valor total do carrinho
  const valorTotalVenda = carrinho.reduce(
    (total, item) => total + item.subtotal,
    0,
  );

  // Função principal: Salvar a venda no banco de dados
  const handleFinalizarVenda = async () => {
    if (!clienteSelecionado) {
      toast.error("Por favor, selecione um cliente.");
      return;
    }
    if (carrinho.length === 0) {
      toast.error("Adicione pelo menos um produto ao carrinho.");
      return;
    }

    setSalvando(true);

    try {
      // 1. Grava o "Cabeçalho" da Venda na tabela 'vendas'
      const { data: vendaCadastrada, error: erroVenda } = await supabase
        .from("vendas")
        .insert([
          {
            cliente_id: clienteSelecionado,
            valor_total: valorTotalVenda,
          },
        ])
        .select() // Pede para o Supabase devolver os dados salvos (precisamos do ID da venda)
        .single();

      if (erroVenda) throw erroVenda;

      const vendaId = vendaCadastrada.id;

      // 2. Prepara a lista de itens para a tabela 'itens_venda'
      const itensParaSalvar = carrinho.map((item) => ({
        venda_id: vendaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      }));

      // 3. Grava todos os itens de uma vez só!
      const { error: erroItens } = await supabase
        .from("itens_venda")
        .insert(itensParaSalvar);

      if (erroItens) throw erroItens;

      // 4. Sucesso! Limpa a tela e avisa o usuário
      Swal.fire(
        "Venda Finalizada!",
        `A venda no valor de R$ ${valorTotalVenda.toFixed(2)} foi salva com sucesso.`,
        "success",
      );

      setClienteSelecionado("");
      setCarrinho([]);
    } catch (error) {
      console.error("Erro ao finalizar venda:", error.message);
      toast.error("Ocorreu um erro ao salvar a venda.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen w-full relative">
      <Sidebar />
      <Toaster position="top-right" reverseOrder={false} />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Frente de Caixa (PDV)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lado Esquerdo: Formulário de Adição */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bloco do Cliente */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                1. Selecione o Cliente
              </h2>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
              >
                <option value="">-- Escolha um cliente --</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Bloco do Produto */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                2. Adicionar Produtos
              </h2>
              <form
                onSubmit={handleAdicionarAoCarrinho}
                className="flex items-end gap-4"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Produto
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                  >
                    <option value="">-- Escolha --</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - R${" "}
                        {parseFloat(produto.preco).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Qtd.
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* Lado Direito: Carrinho e Fechamento */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Carrinho de Compras
            </h2>

            <div className="flex-1 overflow-y-auto mb-4 min-h-w">
              {carrinho.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">
                  O carrinho está vazio.
                </p>
              ) : (
                <ul className="space-y-3">
                  {carrinho.map((item) => (
                    <li
                      key={item.idTemporario}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">
                          {item.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoverDoCarrinho(item.idTemporario)
                          }
                          className="text-red-500 hover:text-red-700"
                          title="Remover"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-600 font-medium">
                  Total da Venda:
                </span>
                <span className="text-3xl font-black text-green-600">
                  R$ {valorTotalVenda.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleFinalizarVenda}
                disabled={salvando || carrinho.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition duration-200 transform hover:-translate-y-1"
              >
                {salvando ? "Salvando Venda..." : "Finalizar Venda"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
