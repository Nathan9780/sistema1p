import React from 'react';
import Carousel from '../components/Carousel';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Home = ({ navigateTo }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const featured = PRODUCTS.filter(p => p.badge).slice(0, 4);

  const handleCategory = (cat) => {
    sessionStorage.setItem('preSelectedCategory', cat);
    navigateTo('products');
  };

  return (
    <div className="page-home">
      <Carousel onProductClick={(id) => navigateTo('detail', id)} />
      <section className="section-categories">
        <h2 className="section-title">Explore por categoria</h2>
        <div className="categories-grid">
          {['smartphone','notebook','fone','tablet','acessorio'].map(cat => (
            <div key={cat} className="category-card" onClick={() => handleCategory(cat)}>
              <div className="cat-icon">{cat === 'smartphone' ? '📱' : cat === 'notebook' ? '💻' : cat === 'fone' ? '🎧' : cat === 'tablet' ? '📟' : '⌚'}</div>
              <span>{cat === 'smartphone' ? 'Smartphones' : cat === 'notebook' ? 'Notebooks' : cat === 'fone' ? 'Fones' : cat === 'tablet' ? 'Tablets' : 'Acessórios'}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section-featured">
        <h2 className="section-title">Destaques da semana</h2>
        <div className="products-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} onCardClick={(id) => navigateTo('detail', id)} onAddToCart={(p) => addToCart(p, 1, showToast)} />)}
        </div>
        <div className="center-btn"><button className="btn-primary" onClick={() => navigateTo('products')}>Ver todos os produtos</button></div>
      </section>
      <div className="cta-banner"><div className="cta-content"><h2>Tecnologia que transforma.</h2><p>Frete grátis em compras acima de R$ 500</p><button className="btn-outline" onClick={() => navigateTo('products')}>Comprar agora</button></div></div>
    </div>
  );
};

export default Home;