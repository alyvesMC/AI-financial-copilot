import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import FloatingSquares from '../components/FloatingSquares';

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const res = await register(formData.name, formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.msg);
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-dark)', position: 'relative'
    }}>
      <FloatingSquares />
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Nova Coach</h1>
          <p className="text-muted">Create your AI financial coach account.</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="form-input"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px' }}
            />
          </div>
          <div className="mb-4">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="form-input"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px' }}
            />
          </div>
          <div className="mb-6">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              required
              minLength="6"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="form-input"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-muted" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
