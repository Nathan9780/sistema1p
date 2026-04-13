import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';

const Profile = ({ navigateTo }) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { showToast } = useToast();
  const { themes, changeWallpaper, removeWallpaper, customWallpaper } = useTheme();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', cpf: '', street: '', city: '', state: '', zip: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      cpf: profile.cpf || '',
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      zip: profile.address?.zip || ''
    });
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updates = { full_name: form.full_name, phone: form.phone };
    if (form.cpf.replace(/\D/g, '').length === 11) updates.cpf = form.cpf.replace(/\D/g, '');
    const addr = {};
    if (form.street) addr.street = form.street;
    if (form.city) addr.city = form.city;
    if (form.state) addr.state = form.state;
    if (form.zip) addr.zip = form.zip;
    if (Object.keys(addr).length) updates.address = addr;
    await updateProfile(updates);
    showToast('Perfil atualizado');
    setEditing(false);
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file);
    if (error) return showToast('Erro upload', 3000);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await updateProfile({ avatar_url: publicUrl });
    showToast('Foto atualizada');
    setUploading(false);
  };

  return (
    <div className="page-profile">
      <div className="page-header"><h1>Meu Perfil</h1></div>
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="avatar-img" /> : <div className="avatar-placeholder">👤</div>}
            <label className="avatar-upload-btn">{uploading ? '⏳' : '📷'}<input type="file" onChange={uploadAvatar} style={{display:'none'}} /></label>
          </div>
          <h3>{profile?.full_name || user.email}</h3>
          <button className="btn-outline" onClick={signOut}>Sair</button>
        </div>
        <div className="profile-content">
          {!editing ? (
            <><div className="info-header"><h3>Informações</h3><button className="btn-edit" onClick={() => setEditing(true)}>Editar</button></div>
            <div className="info-group"><label>Nome</label><p>{profile?.full_name || '-'}</p></div>
            <div className="info-group"><label>Email</label><p>{user.email}</p></div>
            <div className="info-group"><label>Telefone</label><p>{profile?.phone || '-'}</p></div>
            <div className="info-group"><label>CPF</label><p>{profile?.cpf || '-'}</p></div>
            <div className="info-group"><label>Endereço</label><p>{profile?.address?.street ? `${profile.address.street}, ${profile.address.city} - ${profile.address.state}` : '-'}</p></div>
            <div className="wallpaper-section"><h4>Wallpaper</h4><div className="themes-options">{Object.entries(themes).map(([k,t]) => <button key={k} className={`theme-btn ${customWallpaper === t.url ? 'active' : ''}`} onClick={() => changeWallpaper(t.url)}>{t.name}</button>)}</div><button className="wallpaper-upload-btn" onClick={() => removeWallpaper()}>Remover</button></div>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="profile-form">
              <input placeholder="Nome" value={form.full_name} onChange={e => setForm({...form, full_name:e.target.value})} />
              <input placeholder="Telefone" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
              <input placeholder="CPF" value={form.cpf} onChange={e => setForm({...form, cpf:e.target.value})} maxLength={14} />
              <input placeholder="Rua" value={form.street} onChange={e => setForm({...form, street:e.target.value})} />
              <div className="form-row"><input placeholder="Cidade" value={form.city} onChange={e => setForm({...form, city:e.target.value})} /><input placeholder="UF" value={form.state} onChange={e => setForm({...form, state:e.target.value})} maxLength={2} /><input placeholder="CEP" value={form.zip} onChange={e => setForm({...form, zip:e.target.value})} /></div>
              <div className="form-actions"><button type="button" className="btn-outline" onClick={() => setEditing(false)}>Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;