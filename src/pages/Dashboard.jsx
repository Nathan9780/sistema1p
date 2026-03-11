import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Nosso Menu Lateral fica aqui na esquerda */}
      <Sidebar />

      {/* A área principal onde o conteúdo da página vai aparecer */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bem-vindo ao Painel!
        </h1>
        <p className="mt-4 text-gray-600">
          Você está autenticado com sucesso e pronto para navegar.
        </p>

        {/* Aqui depois podemos colocar cards de resumo, tabelas, etc. */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">
            Resumo do Sistema
          </h3>
          <p className="text-gray-500 mt-2">
            Esta é uma área de conteúdo de exemplo.
          </p>
        </div>
      </main>
    </div>
  );
}
