import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = ({ navigateTo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          showToast(
            "📧 Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
            6000,
          );
        } else {
          showToast("❌ Erro no login: " + error.message, 4000);
        }
      } else {
        showToast("✅ Login realizado!");
        navigateTo("home");
      }
    } else {
      // Cadastro
      const { error, needsEmailConfirmation } = await signUp(
        email,
        password,
        name,
      );
      if (error) {
        showToast("❌ Erro no cadastro: " + error.message, 4000);
      } else if (needsEmailConfirmation) {
        // Mostra lembrete e não loga automaticamente
        showToast(
          `✅ Cadastro realizado! Enviamos um link de verificação para ${email}. Acesse seu e-mail para ativar sua conta antes de fazer login.`,
          8000,
        );
        // Limpa o formulário e volta para a tela de login
        setEmail("");
        setPassword("");
        setName("");
        setIsLogin(true);
      } else {
        // Se o e-mail já estiver confirmado (caso raro), faz login automático
        showToast("✅ Cadastro realizado! Você já pode fazer login.");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  // Função para reenviar e-mail de verificação (opcional, mas recomendado)
  const resendVerificationEmail = async () => {
    if (!email) {
      showToast("Digite seu e-mail primeiro.", 3000);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      showToast("❌ Erro ao reenviar: " + error.message, 4000);
    } else {
      showToast(
        "📧 Novo e-mail de verificação enviado! Verifique sua caixa de entrada.",
        5000,
      );
    }
    setLoading(false);
  };

  return (
    <div className="page-login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              NEXUS<span>.</span>
            </div>
            <h2>{isLogin ? "Bem-vindo" : "Criar conta"}</h2>
            <p>
              {isLogin
                ? "Faça login para continuar"
                : "Preencha os dados para se cadastrar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label>Nome completo</label>
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "..." : isLogin ? "Entrar" : "Cadastrar"}
            </button>
          </form>

          {/* Botão para reenviar e-mail de verificação (aparece apenas se não estiver cadastrando) */}
          {isLogin && (
            <button
              type="button"
              className="resend-email-btn"
              onClick={resendVerificationEmail}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontSize: "0.75rem",
                marginTop: "0.5rem",
                textDecoration: "underline",
              }}
            >
              Reenviar e-mail de verificação
            </button>
          )}

          <div className="login-footer">
            <button
              type="button"
              className="switch-auth-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Criar uma conta" : "Já tenho conta"}
            </button>
          </div>

          <div className="login-demo">
            <p>🔐 Demo: demo@nexus.com / demo123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
