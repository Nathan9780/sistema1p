import React, { useState, useEffect } from "react";
import { PRODUCTS } from "../data/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

const ProductDetail = ({ productId, navigateTo }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    if (user) checkFavorite();
    fetchReviews();
  }, [user, productId]);

  const checkFavorite = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    setIsFavorite(!!data);
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      // Busca avaliações do produto, ordena pelas mais recentes
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      setTotalReviews(data?.length || 0);

      // Calcula média das avaliações
      if (data && data.length > 0) {
        const avg =
          data.reduce((acc, rev) => acc + rev.rating, 0) / data.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
      showToast("Erro ao carregar avaliações", 3000);
    } finally {
      setLoadingReviews(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showToast("🔒 Faça login", 3000);
      navigateTo("login");
      return;
    }
    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      setIsFavorite(false);
      showToast("❤️ Removido dos favoritos");
    } else {
      await supabase
        .from("favorites")
        .insert([{ user_id: user.id, product_id: productId }]);
      setIsFavorite(true);
      showToast("❤️ Adicionado aos favoritos");
    }
  };

  if (!product) return <div>Produto não encontrado</div>;

  // Estrelas baseadas na média real das avaliações (se houver, senão usa a do produto estático)
  const displayRating = averageRating > 0 ? averageRating : product.rating || 0;
  const stars =
    "★".repeat(Math.round(displayRating)) +
    "☆".repeat(5 - Math.round(displayRating));
  const installment = Math.ceil(product.price / 12);
  const formatPrice = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Formatar data
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="page-detail">
      <button className="btn-back" onClick={() => navigateTo("products")}>
        &#8592; Voltar
      </button>
      <div className="product-detail">
        <div className="detail-gallery">
          <div className="gallery-main">
            <img
              src={product.images?.[selectedImg] || product.image}
              alt={product.name}
            />
          </div>
          <div className="gallery-thumbs">
            {(product.images || [product.image]).map((img, i) => (
              <button
                key={i}
                className={`gallery-thumb ${i === selectedImg ? "selected" : ""}`}
                onClick={() => setSelectedImg(i)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-info">
          <div className="detail-category">{product.category}</div>
          <div className="detail-header">
            <h1 className="detail-name">{product.name}</h1>
            <button
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>
          <div className="detail-rating">
            <span className="stars">{stars}</span> {displayRating.toFixed(1)} —{" "}
            {totalReviews > 0 ? totalReviews : product.reviews || 0} avaliações
          </div>
          <div className="detail-price">{formatPrice(product.price)}</div>
          <div className="detail-installment">
            ou 12x de {formatPrice(installment)} sem juros
          </div>
          <p className="detail-desc">{product.desc}</p>
          <div className="store-section">
            <div className="store-card">
              <div className="store-avatar">🏪</div>
              <div className="store-info">
                <p className="store-label">Vendido por</p>
                <h4 className="store-name">NEXUS Store Oficial</h4>
                <div className="store-rating">⭐ 4.8 • 15.234 vendas</div>
              </div>
              <button
                className="chat-store-btn"
                onClick={() => navigateTo("support")}
              >
                💬 Falar com a loja
              </button>
            </div>
          </div>
          <div className="qty-selector">
            <label>Quantidade</label>
            <div className="qty-controls">
              <button
                className="qty-btn"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(qty + 1)}>
                +
              </button>
            </div>
          </div>
          <button
            className="btn-add-cart"
            onClick={() => addToCart(product, qty, showToast)}
          >
            🛒 Adicionar ao carrinho
          </button>
          <div className="detail-specs">
            <h4>Especificações técnicas</h4>
            {Object.entries(product.specs || {}).map(([k, v]) => (
              <div key={k} className="spec-row">
                <span className="spec-label">{k}</span>
                <span className="spec-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEÇÃO DE AVALIAÇÕES DOS USUÁRIOS */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Avaliações dos clientes</h3>
          {totalReviews > 0 && (
            <div className="reviews-summary">
              <div className="average-rating">
                <span className="big-rating">{displayRating.toFixed(1)}</span>
                <div>
                  <div className="stars">{stars}</div>
                  <span className="total-reviews">
                    {totalReviews} avaliações
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {loadingReviews ? (
          <div className="loading-reviews">Carregando avaliações...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>
              ✨ Ainda não há avaliações para este produto. Seja o primeiro a
              avaliar!
            </p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">👤</div>
                    <div>
                      <div className="reviewer-name">
                        {review.user_id === user?.id ? "Você" : "Cliente Nexus"}
                        {review.user_id === user?.id && (
                          <span className="you-badge"> (seu comentário)</span>
                        )}
                      </div>
                      <div className="review-date">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                </div>
                {review.comment && (
                  <div className="review-comment">
                    <p>{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
