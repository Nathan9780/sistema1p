import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const ProductDetail = ({ productId, navigateTo }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const product = PRODUCTS.find(p => p.id === productId);

  useEffect(() => { if (user) checkFavorite(); }, [user, productId]);
  const checkFavorite = async () => {
    if (!user) return;
    const { data } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('product_id', productId).maybeSingle();
    setIsFavorite(!!data);
  };
  const toggleFavorite = async () => {
    if (!user) { showToast('🔒 Faça login', 3000); navigateTo('login'); return; }
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
      setIsFavorite(false);
      showToast('❤️ Removido dos favoritos');
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, product_id: productId }]);
      setIsFavorite(true);
      showToast('❤️ Adicionado aos favoritos');
    }
  };

  if (!product) return <div>Produto não encontrado</div>;

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
  const installment = Math.ceil(product.price / 12);
  const formatPrice = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="page-detail">
      <button className="btn-back" onClick={() => navigateTo('products')}>&#8592; Voltar</button>
      <div className="product-detail">
        <div className="detail-gallery">
          <div className="gallery-main"><img src={product.images?.[selectedImg] || product.image} alt={product.name} /></div>
          <div className="gallery-thumbs">
            {(product.images || [product.image]).map((img, i) => (
              <button key={i} className={`gallery-thumb ${i===selectedImg ? 'selected' : ''}`} onClick={() => setSelectedImg(i)}><img src={img} alt="" /></button>
            ))}
          </div>
        </div>
        <div className="detail-info">
          <div className="detail-category">{product.category}</div>
          <div className="detail-header"><h1 className="detail-name">{product.name}</h1><button className={`favorite-btn ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite}>{isFavorite ? '❤️' : '🤍'}</button></div>
          <div className="detail-rating"><span className="stars">{stars}</span> {product.rating} — {product.reviews} avaliações</div>
          <div className="detail-price">{formatPrice(product.price)}</div>
          <div className="detail-installment">ou 12x de {formatPrice(installment)} sem juros</div>
          <p className="detail-desc">{product.desc}</p>
          <div className="store-section"><div className="store-card"><div className="store-avatar">🏪</div><div className="store-info"><p className="store-label">Vendido por</p><h4 className="store-name">NEXUS Store Oficial</h4><div className="store-rating">⭐ 4.8 • 15.234 vendas</div></div><button className="chat-store-btn" onClick={() => navigateTo('support')}>💬 Falar com a loja</button></div></div>
          <div className="qty-selector"><label>Quantidade</label><div className="qty-controls"><button className="qty-btn" onClick={() => setQty(Math.max(1,qty-1))}>−</button><span className="qty-value">{qty}</span><button className="qty-btn" onClick={() => setQty(qty+1)}>+</button></div></div>
          <button className="btn-add-cart" onClick={() => addToCart(product, qty, showToast)}>🛒 Adicionar ao carrinho</button>
          <div className="detail-specs"><h4>Especificações técnicas</h4>{Object.entries(product.specs || {}).map(([k,v]) => <div key={k} className="spec-row"><span className="spec-label">{k}</span><span className="spec-value">{v}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;