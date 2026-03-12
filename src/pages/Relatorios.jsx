import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import { Toaster, toast } from "react-hot-toast";

export default function Relatorios() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarRelatorioVendas();
  }, []);

  const buscarRelatorioVendas = async () => {
    try {
      setLoading(true);
      // Busca vendas cruzando dados com a tabela de clientes
      const { data, error } = await supabase
        .from("vendas")
        .select(
          `
          id,
          valor_total,
          created_at,
          clientes ( nome )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVendas(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error.message);
      toast.error("Erro ao carregar dados do relatório.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen w-full">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-gray-500">
              Histórico detalhado de vendas realizadas
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              ></path>
            </svg>
            Imprimir Relatório
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Data e Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Valor da Venda
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Carregando dados...
                  </td>
                </tr>
              ) : vendas.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Nenhuma venda encontrada no período.
                  </td>
                </tr>
              ) : (
                vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(venda.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {venda.clientes?.nome || "Cliente não identificado"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                      R$ {parseFloat(venda.valor_total).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé do relatório (aparece na soma total) */}
        {!loading && vendas.length > 0 && (
          <div className="mt-4 text-right pr-6">
            <p className="text-gray-500 text-sm">
              Total acumulado neste relatório:
            </p>
            <p className="text-2xl font-bold text-gray-800">
              R${" "}
              {vendas
                .reduce((acc, v) => acc + parseFloat(v.valor_total), 0)
                .toFixed(2)}
            </p>
          </div>
        )}
      </main>

      {/* Estilo para ocultar o Sidebar na hora da impressão */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print, aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .bg-gray-50 { background: white !important; }
        }
      `,
        }}
      />
    </div>
  );
}
