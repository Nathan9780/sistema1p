import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Products = ({ navigateTo }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [filters, setFilters] = useState({ search: '', priceMin: '', priceMax: '', category: '', sort: 'default' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const cat = sessionStorage.getItem('preSelectedCategory');
    if (cat) { setFilters(prev => ({ ...prev, category: cat })); sessionStorage.removeItem('preSelectedCategory'); }
  }, []);

  const getFiltered = () => {
    let res = [...PRODUCTS];
    if (filters.search.trim()) res = res.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.desc.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.priceMin) res = res.filter(p => p.price >= parseFloat(filters.priceMin));
    if (filters.priceMax) res = res.filter(p => p.price <= parseFloat(filters.priceMax));
    if (filters.category) res = res.filter(p => p.category === filters.category);
    if (filters.sort === 'price-asc') res.sort((a,b) => a.price - b.price);
    if (filters.sort === 'price-desc') res.sort((a,b) => b.price - a.price);
    if (filters.sort === 'name-asc') res.sort((a,b) => a.name.localeCompare(b.name));
    return res;
  };

  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage-1)*itemsPerPage;
  const current = filtered.slice(start, start+itemsPerPage);

  return (
    <div className="page-products">
      <div className="page-header"><h1>Catálogo de Produtos</h1><p>Encontre o seu próximo dispositivo favorito</p></div>
      <div className="filters-bar">
        <div className="filter-group"><label>Buscar</label><input type="text" placeholder="Ex: iPhone" value={filters.search} onChange={e => setFilters({...filters, search:e.target.value})} /></div>
        <div className="filter-group"><label>Preço mín.</label><input type="number" placeholder="0" value={filters.priceMin} onChange={e => setFilters({...filters, priceMin:e.target.value})} /></div>
        <div className="filter-group"><label>Preço máx.</label><input type="number" placeholder="99999" value={filters.priceMax} onChange={e => setFilters({...filters, priceMax:e.target.value})} /></div>
        <div className="filter-group"><label>Categoria</label><select value={filters.category} onChange={e => setFilters({...filters, category:e.target.value})}><option value="">Todas</option><option value="smartphone">Smartphones</option><option value="notebook">Notebooks</option><option value="fone">Fones</option><option value="tablet">Tablets</option><option value="acessorio">Acessórios</option></select></div>
        <div className="filter-group"><label>Ordenar</label><select value={filters.sort} onChange={e => setFilters({...filters, sort:e.target.value})}><option value="default">Padrão</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name-asc">A → Z</option></select></div>
        <button className="btn-clear" onClick={() => setFilters({ search: '', priceMin: '', priceMax: '', category: '', sort: 'default' })}>Limpar</button>
      </div>
      <div className="results-info">Exibindo {current.length} de {filtered.length} produto{filtered.length !== 1 ? 's' : ''}</div>
      <div className="products-grid">
        {current.length === 0 ? <div className="no-results"><span>🔍</span><p>Nenhum produto encontrado.</p><button className="btn-outline" onClick={() => setFilters({ search: '', priceMin: '', priceMax: '', category: '', sort: 'default' })}>Limpar filtros</button></div>
        : current.map(p => <ProductCard key={p.id} product={p} onCardClick={(id) => navigateTo('detail', id)} onAddToCart={(p) => addToCart(p, 1, showToast)} />)}
      </div>
      {totalPages > 1 && <div className="pagination">
        <button className="page-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>&#8592;</button>
        {[...Array(totalPages)].map((_,i) => <button key={i} className={`page-btn ${currentPage===i+1?'active':''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>)}
        <button className="page-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>&#8594;</button>
      </div>}
    </div>
  );
};

export default Products;