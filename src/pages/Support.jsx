import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Support = ({ navigateTo }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Sou o assistente virtual da NEXUS Store. Como posso ajudar?",
      sender: "ai",
      time: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [waitingForHuman, setWaitingForHuman] = useState(false);
  const [humanConnected, setHumanConnected] = useState(false);

  const getAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();

    if (
      lowerMsg.includes("pedido") ||
      lowerMsg.includes("entrega") ||
      lowerMsg.includes("frete")
    ) {
      return 'Para acompanhar seu pedido, acesse a aba "Meus Pedidos" no seu perfil. Lá você encontra todas as informações de rastreamento e status de entrega.';
    }
    if (lowerMsg.includes("troca") || lowerMsg.includes("devolução")) {
      return "Você tem até 7 dias após o recebimento para solicitar troca ou devolução. Entre em contato com nosso suporte pelo email suporte@nexus.com.br";
    }
    if (
      lowerMsg.includes("pagamento") ||
      lowerMsg.includes("cartão") ||
      lowerMsg.includes("pix")
    ) {
      return "Aceitamos PIX, cartões de crédito (Visa, Mastercard, Elo, American Express) e boleto bancário. Parcelamos em até 12x sem juros!";
    }
    if (lowerMsg.includes("cupom") || lowerMsg.includes("desconto")) {
      return "Temos vários cupons ativos! Use PRIMEIRA10 para 10% off na primeira compra, ou NEXUS20 para 20% off em compras acima de R$100.";
    }
    if (lowerMsg.includes("garantia")) {
      return "Todos os nossos produtos possuem garantia de 12 meses contra defeitos de fabricação. Guarde a nota fiscal para garantir o atendimento.";
    }
    if (
      lowerMsg.includes("atendente") ||
      lowerMsg.includes("humano") ||
      lowerMsg.includes("pessoa")
    ) {
      setWaitingForHuman(true);
      return 'Posso transferir você para um atendente humano. Deseja continuar? Responda "sim" para falar com um especialista.';
    }
    if (
      waitingForHuman &&
      (lowerMsg.includes("sim") || lowerMsg.includes("quero"))
    ) {
      setHumanConnected(true);
      setWaitingForHuman(false);
      return "✅ Transferindo para um atendente humano... Um especialista entrará em contato em breve. Por favor, aguarde.";
    }

    return 'Entendi sua dúvida. Posso ajudar com informações sobre pedidos, pagamentos, trocas, cupons ou produtos. Se precisar falar com um atendente, diga "quero falar com um atendente".';
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage.text);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiResponse,
          sender: humanConnected ? "human" : "ai",
          time: new Date(),
        },
      ]);
    }, 500);
  };

  return (
    <div className="page-support">
      <div className="page-header">
        <h1>💬 Suporte ao Cliente</h1>
        <p>Atendimento 24h - Tire suas dúvidas</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-status">
            <span
              className={`status-dot ${humanConnected ? "human" : "ai"}`}
            ></span>
            <span>
              {humanConnected
                ? "Atendente humano online"
                : "Assistente virtual online"}
            </span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-bubble">
                <div className="message-sender">
                  {msg.sender === "ai" && "🤖 Assistente"}
                  {msg.sender === "human" && "👨‍💼 Atendente"}
                  {msg.sender === "user" && "👤 Você"}
                </div>
                <p>{msg.text}</p>
                <span className="message-time">
                  {msg.time.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={humanConnected}
          />
          <button onClick={sendMessage} disabled={humanConnected}>
            Enviar
          </button>
        </div>

        {humanConnected && (
          <div className="human-warning">
            ⏳ Aguarde o atendente. Ele responderá em breve...
          </div>
        )}
      </div>

      <div className="support-options">
        <h3>Perguntas frequentes:</h3>
        <div className="faq-buttons">
          <button onClick={() => setNewMessage("Como acompanhar meu pedido?")}>
            📦 Acompanhar pedido
          </button>
          <button onClick={() => setNewMessage("Como funciona a troca?")}>
            🔄 Troca e devolução
          </button>
          <button onClick={() => setNewMessage("Quais formas de pagamento?")}>
            💳 Pagamento
          </button>
          <button onClick={() => setNewMessage("Tenho um cupom de desconto")}>
            🏷️ Cupons
          </button>
          <button onClick={() => setNewMessage("Quero falar com um atendente")}>
            👨‍💼 Falar com humano
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
