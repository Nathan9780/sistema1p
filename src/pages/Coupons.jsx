import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from '../context/ToastContext';

const Coupons = ({ navigateTo }) => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('coupons')
        .select('*');

      console.log("COUPONS DATA:", data);
      console.log("COUPONS ERROR:", error);

      if (error) {
        showToast('Erro ao carregar cupons', 3000);
        setCoupons([]);
        return;
      }

      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      showToast('Erro inesperado', 3000);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const availableCoupons = coupons.filter(c => c.active);
  const expiredCoupons = coupons.filter(c => !c.active);

  return (
    <div className="page-coupons">
      <div className="page-header">
        <h1>Cupons</h1>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          {(activeTab === 'available' ? availableCoupons : expiredCoupons).map(c => (
            <div key={c.id}>
              <h3>{c.code}</h3>
              <p>{c.discount_value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;