import React from 'react';

const ProductCard = ({ product, onCardClick, onAddToCart }) => {
  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
  const formatPrice = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="product-card" onClick={() => onCardClick(product.id)}>
      <div className="card-image">
        {product.badge && <div className="card-badge">{product.badge}</div>}
        <img src={product.image} alt={product.name} className="product-img" loading="lazy"
          onError={(e) => e.target.src = 'https://placehold.co/400x400/1a1a1a/e8ff00?text=' + product.emoji} />
      </div>
      <div className="card-body">
        <div className="card-category">{product.category}</div>
        <div className="card-name">{product.name}</div>
        <div className="card-rating"><span className="stars">{stars}</span> {product.rating} ({product.reviews})</div>
        <div className="card-price">{formatPrice(product.price)}</div>
        <button className="card-add" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>🛒 Adicionar</button>
      </div>
    </div>
  );
};

export default ProductCard;