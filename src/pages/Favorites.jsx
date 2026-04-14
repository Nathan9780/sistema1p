import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabase";
import { PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";

const Favorites = ({ navigateTo }) => {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigateTo("login");
      return;
    }

    fetchFavorites();
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const ids = data.map((i) => i.product_id);
      const favProducts = PRODUCTS.filter((p) => ids.includes(p.id));

      setFavorites(favProducts);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return (
      <div className="favorites-page">
        <p>Carregando...</p>
      </div>
    );
  if (!user) return null;

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>Favoritos</h1>
        <p>Seus produtos preferidos estão aqui ❤️</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando seus favoritos...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="favorites-empty">
          <span>❤️</span>
          <h3>Nenhum favorito ainda</h3>
          <p>
            Volte à loja e adicione seus produtos preferidos clicando no
            coração!
          </p>
          <button
            className="btn-primary"
            onClick={() => navigateTo("products")}
          >
            Explorar produtos
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onCardClick={(id) => navigateTo("detail", id)}
              onAddToCart={(p) => addToCart(p, 1, showToast)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
