import React, { useState, useContext } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';
import { X, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function EditProfileModal({ isOpen, onClose }) {
  const { user, login } = useContext(AuthContext); // Can update token context if needed, but usually profile doesn't invalidate token
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password && formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/users/profile`, formData, {
        headers: { 'x-auth-token': token }
      });
      setSuccess('Profile successfully updated.');
      
      // Update local storage context simply by hard-refreshing or contextual dispatch
      setTimeout(() => {
         window.location.reload();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--bg-card)' }}>
        
        <div className="flex-between mb-6">
          <div className="flex-center">
            <UserIcon color="var(--accent-blue)" />
            <h2 style={{ fontSize: '1.25rem' }}>Edit Profile</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="text-danger mb-4" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {success && <div className="text-success mb-4" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px'}}>
              <h4 className="mb-4 text-muted">Change Password (Optional)</h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>New Password</label>
                    <input 
                      type="password" 
                      name="password"
                      className="form-input" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div>
                    <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      className="form-input" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                    />
                  </div>
              </div>
          </div>

          <button type="submit" className="btn-primary mt-4" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default EditProfileModal;
