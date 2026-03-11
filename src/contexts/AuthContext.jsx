/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";

// Caminho ajustado para a pasta lib, conforme configurado no seu projeto
import { supabase } from "../lib/supabase";

// 1. Criamos o Contexto (o nosso "Gerente" global de informações)
export const AuthContext = createContext();

// 2. Criamos o Provider (o componente que vai abraçar o nosso App)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Controla a tela branca enquanto o Supabase pensa

  useEffect(() => {
    // Busca a sessão atual assim que o app abre
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Fica escutando qualquer mudança (se o usuário fez login ou logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Limpa a escuta quando o componente é desmontado (boa prática do React)
    return () => subscription.unsubscribe();
  }, []);

  // --- FUNÇÕES DE AUTENTICAÇÃO ---

  // Função para Entrar (Login)
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Função para Sair (Logout)
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao sair do sistema:", error.message);
    }
  };

  // 3. Retornamos o Provider entregando todas as variáveis e funções para o sistema
  return (
    <AuthContext.Provider value={{ session, user, loading, login, logout }}>
      {/* Só mostra o site quando terminar de carregar a verificação do Supabase */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 4. Atalho (Hook customizado) para facilitar o uso do Contexto em outras telas!
export function useAuth() {
  return useContext(AuthContext);
}
