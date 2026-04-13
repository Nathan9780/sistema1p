import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import { Toaster, toast } from "react-hot-toast";

export default function Dashboard() {
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    qtdVendas: 0,
    qtdClientes: 0,
    qtdProdutos: 0,
    valorEstoque: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosResumo();
  }, []);

  const carregarDadosResumo = async () => {
    try {
      setLoading(true);

      // 1. Buscar Vendas
      const { data: vendas, error: erroVendas } = await supabase
        .from("vendas")
        .select("valor_total");
      if (erroVendas) throw erroVendas;

      const totalFinanceiro = vendas.reduce(
        (acc, curr) => acc + parseFloat(curr.valor_total),
        0,
      );

      // 2. Buscar Clientes
      const { count: contagemClientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      // 3. Buscar Produtos e calcular Valor em Estoque
      const { data: produtos, error: erroProdutos } = await supabase
        .from("produtos")
        .select("preco"); // Supondo que você queira o valor potencial de venda do estoque

      if (erroProdutos) throw erroProdutos;

      const totalEstoque = produtos.reduce(
        (acc, curr) => acc + parseFloat(curr.preco || 0),
        0,
      );

      setResumo({
        totalVendas: totalFinanceiro,
        qtdVendas: vendas.length,
        qtdClientes: contagemClientes || 0,
        qtdProdutos: produtos.length,
        valorEstoque: totalEstoque,
      });
    } catch (error) {
      console.error("Erro ao carregar resumo:", error.message);
      toast.error("Erro ao atualizar indicadores.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen w-full">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          é o meu papai, GOHAN.
        </h1>

        {loading ? (
          <p className="text-gray-500">Atualizando indicadores...</p>
        ) : (
          <div className="space-y-8">
            {/* PRIMEIRA LINHA: ESTOQUE E CADASTROS */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Gestão de Inventário e Base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Itens no Catálogo
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {resumo.qtdProdutos} produtos
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Valor Total em Estoque
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    R$ {resumo.valorEstoque.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Clientes Cadastrados
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {resumo.qtdClientes} pessoas
                  </p>
                </div>
              </div>
            </div>

            {/* SEGUNDA LINHA: FINANCEIRO E VENDAS */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Desempenho de Vendas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Faturamento Total
                    </p>
                    <p className="text-3xl font-black text-green-600">
                      R$ {resumo.totalVendas.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Volume de Vendas
                    </p>
                    <p className="text-3xl font-black text-blue-600">
                      {resumo.qtdVendas}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
