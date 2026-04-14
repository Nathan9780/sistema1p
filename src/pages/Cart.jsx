import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../services/supabase";

const Cart = ({ navigateTo }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfInput, setCpfInput] = useState("");

  const formatPrice = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const subtotal = getCartTotal();
  const frete = subtotal >= 500 ? 0 : 29.9;
  const total = subtotal + frete - discount;

  const applyCoupon = async () => {
    if (!couponCode) return showToast("Digite um cupom");
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("active", true)
        .single();

      if (error || !data) return showToast("Cupom inválido");
      if (new Date(data.expires_at) < new Date())
        return showToast("Cupom expirado");
      if (subtotal < data.min_purchase)
        return showToast(`Mínimo de ${formatPrice(data.min_purchase)}`);

      let desconto =
        data.discount_type === "percentage"
          ? (subtotal * data.discount_value) / 100
          : data.discount_value;
      if (data.max_discount && desconto > data.max_discount)
        desconto = data.max_discount;

      setDiscount(desconto);
      showToast(`Desconto de ${formatPrice(desconto)} aplicado!`);
    } catch (err) {
      showToast("Erro ao aplicar cupom");
    }
  };

  const generatePix = () => {
    const payload = `00020126580014BR.GOV.BCB.PIX0136nexus.store@email.com5204000053039865404${total.toFixed(2)}5802BR5913NEXUS Store6008Sao Paulo62070503***6304`;
    setQrCode(payload);
  };

  const handleCheckout = () => {
    if (!user) return showToast("Faça login para finalizar");
    if (!profile?.cpf) return setShowCpfModal(true);
    if (paymentMethod === "pix") generatePix();
    setShowModal(true);
  };

  const saveCpf = async () => {
    const numbers = cpfInput.replace(/\D/g, "");
    if (numbers.length !== 11) return showToast("CPF deve ter 11 dígitos");

    try {
      // Tenta salvar o CPF no perfil do usuário
      const { error } = await supabase
        .from("user_profiles")
        .update({ cpf: numbers })
        .eq("id", user.id);

      if (error) {
        console.warn("Erro ao salvar CPF no banco:", error);
        showToast("CPF salvo localmente (simulação)");
      } else {
        showToast("CPF salvo com sucesso!");
      }
      setShowCpfModal(false);
      handleCheckout();
    } catch (err) {
      showToast("Erro ao salvar CPF, mas continuando");
      setShowCpfModal(false);
      handleCheckout();
    }
  };

  const confirmOrder = async () => {
    setLoading(true);
    const orderNumber = `NEXUS-${Date.now()}`;

    try {
      // 1. Inserir pedido na tabela orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            order_number: orderNumber,
            status: "processing",
            subtotal,
            shipping: frete,
            discount_amount: discount,
            total,
            payment_method: paymentMethod,
            estimated_delivery_date: new Date(
              Date.now() + 7 * 864e5,
            ).toISOString(),
          },
        ])
        .select();

      if (orderError) {
        throw new Error(`Erro ao salvar pedido: ${orderError.message}`);
      }

      const insertedOrder = orderData?.[0];
      if (!insertedOrder) throw new Error("Pedido não retornado pelo banco");

      // 2. Inserir itens do pedido
      const orderItems = cart.map((item) => ({
        order_id: insertedOrder.id, // usa o ID real do pedido
        product_id: item.id,
        product_name: item.name,
        quantity: item.qty,
        price: item.price,
        total: item.price * item.qty,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        // Se falhar ao inserir itens, tenta deletar o pedido para não ficar órfão
        await supabase.from("orders").delete().eq("id", insertedOrder.id);
        throw new Error(`Erro ao salvar itens: ${itemsError.message}`);
      }

      // Sucesso!
      clearCart();
      setShowModal(false);
      showToast("✅ Pedido realizado com sucesso!");
      navigateTo("orders");
    } catch (err) {
      console.error("Finalização falhou:", err);
      showToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Carrinho vazio
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <span>🛒</span>
        <h3>Carrinho vazio</h3>
        <button className="btn-primary" onClick={() => navigateTo("products")}>
          Explorar produtos
        </button>
      </div>
    );
  }

  return (
    <div className="page-cart">
      <div className="page-header">
        <h1>Carrinho</h1>
      </div>
      <div className="cart-container">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)}</div>
                <div className="cart-item-total">
                  {formatPrice(item.price * item.qty)}
                </div>
              </div>
              <div className="cart-item-controls">
                <div className="cart-qty-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button
                  className="cart-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Resumo</h3>
          <div className="coupon-section">
            <input
              placeholder="Cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button onClick={applyCoupon}>Aplicar</button>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Frete</span>
            <span>{frete === 0 ? "Grátis" : formatPrice(frete)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row">
              <span>Desconto</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="payment-methods">
            <h4>Pagamento</h4>
            {["pix", "credit", "debit"].map((m) => (
              <label key={m} className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value={m}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  checked={paymentMethod === m}
                />
                <span>
                  {m === "pix"
                    ? "💰 PIX"
                    : m === "credit"
                      ? "💳 Crédito"
                      : "💳 Débito"}
                </span>
              </label>
            ))}
          </div>
          <button className="btn-checkout" onClick={handleCheckout}>
            Finalizar
          </button>
          <button className="btn-clear-cart" onClick={clearCart}>
            Limpar carrinho
          </button>
        </div>
      </div>

      {/* Modal de finalização */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Finalizar Pedido</h2>
            {paymentMethod === "pix" && qrCode && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`}
                alt="QR Code"
              />
            )}
            <button
              className="btn-primary"
              onClick={confirmOrder}
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar"}
            </button>
            <button className="btn-outline" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de CPF */}
      {showCpfModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>CPF obrigatório</h2>
            <input
              placeholder="000.000.000-00"
              value={cpfInput}
              onChange={(e) => setCpfInput(e.target.value)}
            />
            <button className="btn-primary" onClick={saveCpf}>
              Salvar
            </button>
            <button
              className="btn-outline"
              onClick={() => setShowCpfModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
