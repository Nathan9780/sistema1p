import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useToast } from "../context/ToastContext";

const Coupons = ({ navigateTo }) => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% OFF`;
    }
    return `R$ ${coupon.discount_value.toFixed(2)} OFF`;
  };

  const formatMinPurchase = (value) => {
    return value ? `R$ ${value.toFixed(2)}` : "Sem valor mínimo";
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Cupom ${code} copiado!`);
  };

  const handleUseCoupon = (code) => {
    showToast(`Cupom ${code} aplicado! Volte ao carrinho.`);
    // Se quiser, pode armazenar no localStorage ou contexto
    localStorage.setItem("appliedCoupon", code);
    navigateTo("cart");
  };

  const availableCoupons = coupons.filter((c) => c.active);
  const expiredCoupons = coupons.filter((c) => !c.active);

  if (loading) {
    return (
      <div className="page-coupons">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando cupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-coupons">
      <div className="page-header">
        <h1>Cupons de desconto</h1>
        <p>Aproveite as ofertas exclusivas</p>
      </div>

      <div className="coupons-tabs">
        <button
          className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          Disponíveis ({availableCoupons.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "expired" ? "active" : ""}`}
          onClick={() => setActiveTab("expired")}
        >
          Expirados ({expiredCoupons.length})
        </button>
      </div>

      {activeTab === "available" && availableCoupons.length === 0 && (
        <div className="coupons-empty">
          <span>🏷️</span>
          <h3>Nenhum cupom disponível</h3>
          <p>Volte em breve para novas ofertas</p>
        </div>
      )}

      {activeTab === "expired" && expiredCoupons.length === 0 && (
        <div className="coupons-empty">
          <span>⏰</span>
          <h3>Nenhum cupom expirado</h3>
          <p>Que bom, todos seus cupons estão ativos!</p>
        </div>
      )}

      {(activeTab === "available" ? availableCoupons : expiredCoupons).length >
        0 && (
        <div className="coupons-grid">
          {(activeTab === "available" ? availableCoupons : expiredCoupons).map(
            (coupon) => (
              <div key={coupon.id} className="coupon-card">
                <div className="coupon-badge">{formatDiscount(coupon)}</div>
                <div className="coupon-content">
                  <div className="coupon-code">{coupon.code}</div>
                  <div className="coupon-description">
                    {coupon.description ||
                      "Use este cupom e garanta seu desconto!"}
                  </div>
                  <div className="coupon-rules">
                    <div className="rule-item">
                      <span>Validade:</span>
                      <strong>
                        {new Date(coupon.expires_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </strong>
                    </div>
                    <div className="rule-item">
                      <span>Mínimo:</span>
                      <strong>{formatMinPurchase(coupon.min_purchase)}</strong>
                    </div>
                    {coupon.max_discount && (
                      <div className="rule-item">
                        <span>Desconto máx.:</span>
                        <strong>R$ {coupon.max_discount.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                  {activeTab === "available" && (
                    <div className="coupon-actions">
                      <button
                        className="btn-copy"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        Copiar código
                      </button>
                      <button
                        className="btn-use"
                        onClick={() => handleUseCoupon(coupon.code)}
                      >
                        Usar agora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Coupons;
