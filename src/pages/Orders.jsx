import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../services/supabase";

const Orders = ({ navigateTo }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const statusFlow = ["pending", "processing", "shipped", "delivered"];

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);
          return { ...order, items: itemsData || [] };
        }),
      );
      setOrders(ordersWithItems);
    } catch (error) {
      console.error(error);
      showToast("❌ Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const advanceOrderStatus = async (order) => {
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      showToast("⚠️ Pedido já está no último estágio");
      return;
    }
    const nextStatus = statusFlow[currentIndex + 1];
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", order.id);
      if (error) throw error;
      showToast(`✅ Pedido avançou para: ${nextStatus.toUpperCase()}`);
      fetchOrders();
    } catch (error) {
      showToast("❌ Erro ao avançar etapa");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "#ff9800",
        text: "Aguardando Pagamento",
        icon: "⏳",
        bg: "rgba(255,152,0,0.1)",
      },
      processing: {
        color: "#2196f3",
        text: "Processando",
        icon: "⚙️",
        bg: "rgba(33,150,243,0.1)",
      },
      shipped: {
        color: "#00bcd4",
        text: "Enviado",
        icon: "🚚",
        bg: "rgba(0,188,212,0.1)",
      },
      delivered: {
        color: "#4caf50",
        text: "Entregue",
        icon: "✅",
        bg: "rgba(76,175,80,0.1)",
      },
      cancelled: {
        color: "#f44336",
        text: "Cancelado",
        icon: "❌",
        bg: "rgba(244,67,54,0.1)",
      },
    };
    return (
      configs[status] || {
        color: "#888",
        text: status,
        icon: "📦",
        bg: "rgba(136,136,136,0.1)",
      }
    );
  };

  const formatPrice = (value) =>
    value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ||
    "R$ 0,00";
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("pt-BR") : "Data não informada";

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancelar pedido?")) return;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);
      if (error) throw error;
      showToast("✅ Pedido cancelado");
      fetchOrders();
    } catch (error) {
      showToast("❌ Erro ao cancelar");
    }
  };

  // ========== FUNÇÃO DE AVALIAÇÃO CORRIGIDA (sem duplicatas) ==========
  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    setSavingReview(true);
    try {
      // Obter o product_id real (se não existir, tenta buscar pelo nome)
      let productId = selectedProduct.product_id;
      if (!productId && selectedProduct.product_name) {
        const { data: productData } = await supabase
          .from("products")
          .select("id")
          .eq("name", selectedProduct.product_name)
          .maybeSingle();
        if (productData) productId = productData.id;
      }
      if (!productId) productId = selectedProduct.id; // fallback

      // Verificar se já existe avaliação para este produto e pedido
      const { data: existingReview, error: checkError } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("order_id", selectedOrder?.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingReview) {
        showToast("⚠️ Você já avaliou este produto para este pedido!");
        setShowReviewModal(false);
        setSavingReview(false);
        return;
      }

      // Montar objeto com os nomes EXATOS da sua tabela (created_at, não timestamp)
      const reviewData = {
        user_id: user.id,
        product_id: Number(productId),
        order_id: selectedOrder?.id ? Number(selectedOrder.id) : null,
        rating: Number(reviewRating),
        comment: reviewComment.trim() || null,
        created_at: new Date().toISOString(),
      };

      console.log("📤 Enviando avaliação:", reviewData);

      const { error: reviewError } = await supabase
        .from("reviews")
        .insert(reviewData);

      if (reviewError) throw reviewError;

      // Tentar marcar item como avaliado (se a coluna 'reviewed' existir)
      try {
        const { error: updateError } = await supabase
          .from("order_items")
          .update({ reviewed: true })
          .eq("id", selectedProduct.id);
        if (updateError)
          console.warn(
            "⚠️ Coluna 'reviewed' não existe em order_items, ignorado.",
          );
      } catch (err) {
        console.warn("Erro ao marcar como avaliado:", err);
      }

      showToast("✅ Avaliação enviada! Obrigado!");
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment("");
      setSelectedProduct(null);
      fetchOrders(); // recarrega para atualizar o botão "Avaliado"
    } catch (error) {
      console.error("❌ Erro ao enviar avaliação:", error);
      let msg = "❌ Erro ao enviar avaliação";
      if (error.message?.includes("policy")) msg = "❌ Permissão negada (RLS).";
      else if (error.message?.includes("duplicate"))
        msg = "❌ Avaliação duplicada.";
      showToast(msg);
    } finally {
      setSavingReview(false);
    }
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  if (!user) {
    navigateTo("login");
    return null;
  }

  return (
    <div className="page-orders">
      <div className="page-header">
        <h1>📦 Meus Pedidos</h1>
        <p>Acompanhe seus pedidos e avalie produtos</p>
      </div>

      <div className="orders-filters">
        {["all", "pending", "processing", "shipped", "delivered"].map(
          (status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === "all"
                ? "Todos"
                : status === "pending"
                  ? "⏳ Pendentes"
                  : status === "processing"
                    ? "⚙️ Processando"
                    : status === "shipped"
                      ? "🚚 Enviados"
                      : "✅ Entregues"}
            </button>
          ),
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <span>📦</span>
          <h3>Nenhum pedido</h3>
          <button
            className="btn-primary"
            onClick={() => navigateTo("products")}
          >
            Comprar agora
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const isAdvanceDisabled =
              order.status === "delivered" || order.status === "cancelled";
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-number">
                      Pedido #{order.order_number || order.id}
                    </span>
                    <span className="order-date">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div
                    className="order-status"
                    style={{
                      color: statusConfig.color,
                      background: statusConfig.bg,
                    }}
                  >
                    <span>{statusConfig.icon}</span>
                    <span>{statusConfig.text}</span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-img">
                        <img
                          src={
                            item.product_image ||
                            "https://placehold.co/80x80/1a1a1a/e8ff00?text=📦"
                          }
                          alt={item.product_name}
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/80x80/1a1a1a/e8ff00?text=📦")
                          }
                        />
                      </div>
                      <div className="order-item-info">
                        <h4>{item.product_name}</h4>
                        <div className="order-item-meta">
                          <span>Qtd: {item.quantity}</span>
                          <span>Preço: {formatPrice(item.price)}</span>
                          <span>Total: {formatPrice(item.total)}</span>
                        </div>
                      </div>
                      <div className="order-item-actions">
                        {order.status === "delivered" && !item.reviewed && (
                          <button
                            className="btn-review"
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedProduct(item);
                              setShowReviewModal(true);
                            }}
                          >
                            ⭐ Avaliar
                          </button>
                        )}
                        {order.status === "delivered" && item.reviewed && (
                          <span className="reviewed-badge">✓ Avaliado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>{formatPrice(order.total)}</strong>
                  </div>
                  <div className="order-actions">
                    {order.status === "pending" && (
                      <button
                        className="btn-cancel-order"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      className="btn-details"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id,
                        )
                      }
                    >
                      {expandedOrder === order.id ? "▲ Menos" : "▼ Mais"}
                    </button>
                    <button
                      className="btn-advance"
                      onClick={() => advanceOrderStatus(order)}
                      disabled={isAdvanceDisabled}
                      style={{
                        background: isAdvanceDisabled
                          ? "#555"
                          : "var(--accent)",
                        color: isAdvanceDisabled ? "#aaa" : "#000",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.4rem 0.8rem",
                        fontWeight: "bold",
                        cursor: isAdvanceDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      ▶ Avançar
                    </button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="order-details">
                    <div className="details-section">
                      <h4>📍 Endereço</h4>
                      <p>{order.shipping_address?.street || "Não informado"}</p>
                    </div>
                    <div className="details-section">
                      <h4>💳 Pagamento</h4>
                      <p>
                        {order.payment_method === "credit"
                          ? "Cartão Crédito"
                          : order.payment_method === "debit"
                            ? "Débito"
                            : order.payment_method === "pix"
                              ? "PIX"
                              : "Boleto"}
                      </p>
                      <p>Subtotal: {formatPrice(order.subtotal)}</p>
                      <p>
                        Frete:{" "}
                        {order.shipping === 0
                          ? "Grátis"
                          : formatPrice(order.shipping)}
                      </p>
                      {order.discount_amount > 0 && (
                        <p>Desconto: -{formatPrice(order.discount_amount)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Avaliação ESTILIZADO */}
      {showReviewModal && selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ Avaliar Produto</h2>
              <button
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="review-product">
                <img
                  src={
                    selectedProduct.product_image ||
                    "https://placehold.co/60x60/1a1a1a/e8ff00?text=📦"
                  }
                  alt={selectedProduct.product_name}
                />
                <h4>{selectedProduct.product_name}</h4>
              </div>
              <div className="review-rating">
                <label>Sua nota:</label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewRating ? "active" : ""}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="review-comment">
                <label>Comentário (opcional):</label>
                <textarea
                  rows="4"
                  placeholder="Conte sua experiência com o produto..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-outline"
                onClick={() => setShowReviewModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmitReview}
                disabled={savingReview}
              >
                {savingReview ? "Enviando..." : "Enviar avaliação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
