import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).then(setProfile);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).then(setProfile);
      else setProfile(null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (!error && data.user) await supabase.from('user_profiles').insert([{ id: data.user.id, email, full_name: fullName }]);
    return { data, error };
  };
  const signIn = async (email, password) => await supabase.auth.signInWithPassword({ email, password });
  const signOut = async () => await supabase.auth.signOut();
  const updateProfile = async (updates) => {
    const { error } = await supabase.from('user_profiles').update(updates).eq('id', user.id);
    if (!error) setProfile(prev => ({ ...prev, ...updates }));
    return { error };
  };

  return <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>{children}</AuthContext.Provider>;
};