import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = ({ navigateTo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) showToast('Erro no login', 3000);
      else { showToast('Login OK'); navigateTo('home'); }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) showToast('Erro no cadastro', 3000);
      else showToast('Cadastro realizado! Faça login', 4000);
      setIsLogin(true);
    }
    setLoading(false);
  };

  return (
    <div className="page-login"><div className="login-container"><div className="login-card">
      <div className="login-header"><div className="login-logo">NEXUS<span>.</span></div><h2>{isLogin ? 'Bem-vindo' : 'Criar conta'}</h2></div>
      <form onSubmit={handleSubmit}>
        {!isLogin && <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />}
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary login-btn" disabled={loading}>{loading ? '...' : (isLogin ? 'Entrar' : 'Cadastrar')}</button>
      </form>
      <div className="login-footer"><button className="switch-auth-btn" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Criar conta' : 'Já tenho conta'}</button></div>
      <div className="login-demo"><p>Demo: demo@nexus.com / demo123456</p></div>
    </div></div></div>
  );
};

export default Login;