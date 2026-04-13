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

      const ids = data.map(i => i.product_id);
      const favProducts = PRODUCTS.filter(p => ids.includes(p.id));

      setFavorites(favProducts);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p>Carregando...</p>;
  if (!user) return null;

  return (
    <div>
      <h1>Favoritos</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : favorites.length === 0 ? (
        <p>Nenhum favorito</p>
      ) : (
        favorites.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onCardClick={(id) => navigateTo("detail", id)}
            onAddToCart={(p) => addToCart(p, 1, showToast)}
          />
        ))
      )}
    </div>
  );
};

export default Favorites;