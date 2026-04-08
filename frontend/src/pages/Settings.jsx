import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Moon, Sun, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import EditProfileModal from '../components/EditProfileModal';

function Settings() {
  const { user, updateCurrency, isPro, isTrialActive } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const success = query.get('success');
    const sessionId = query.get('session_id');

    if (success && sessionId) {
      axios.post('/api/stripe/verify-session', { session_id: sessionId })
        .then(res => {
          if (res.data.success) {
             setSuccessMsg('Nova Pro Unlocked! Your algorithms are now active for the next month.');
             // Clean URL
             window.history.replaceState({}, document.title, window.location.pathname);
             setTimeout(() => {
                 window.location.reload(); // Reload to refresh contexts
             }, 3000);
          }
        }).catch(err => console.error("Session verification failed", err));
    }
  }, []);

  const handleCurrencyChange = async (e) => {
    setSavingSettings(true);
    await updateCurrency(e.target.value);
    setSavingSettings(false);
  };

  const handleStripeCheckout = async () => {
    try {
        const res = await axios.post('/api/stripe/create-checkout-session');
        if(res.data.url) {
            window.location.href = res.data.url;
        }
    } catch (err) {
        console.error(err);
        alert("Failed to connect to Stripe.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2 flex-center" style={{fontSize: '2rem'}}>
          <SettingsIcon size={28} /> Settings
        </h1>
        <p className="text-muted">Manage your account and preferences.</p>
      </div>
      
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '16px', borderRadius: '8px', border: '1px solid var(--success)', marginBottom: '24px', fontWeight: 600 }}>
           🎉 {successMsg}
        </div>
      )}

      <div className="glass-card mb-4 mt-8" style={{ border: isPro ? '1px solid var(--accent-primary)' : '1px solid var(--accent-blue)', background: isPro ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)' }}>
        <h3 className="flex-center" style={{gap: '8px'}}><ShieldCheck size={20} color={isPro ? "var(--accent-primary)" : "var(--accent-blue)"} /> Nova AI Subscription</h3>
        <p className="text-muted mt-2 mb-4">
           {isPro ? "Your Nova Pro subscription is active! All premium AI algorithms are unlocked." : (isTrialActive ? "You are on a Free Trial of Nova Pro. Enter your billing details to secure your rate." : "Upgrade to Pro to unlock advanced AI financial tracking, 6-Month forecasting, and specific savings strategies.")}
        </p>
        {!isPro && (
           <button onClick={handleStripeCheckout} className="btn-primary" style={{width: 'auto', display: 'inline-block', background: 'var(--accent-blue)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'}}>
             {isTrialActive ? "Secure Pro Plan ($9.99/mo)" : "Upgrade for $9.99/mo"}
           </button>
        )}
      </div>
      
      <div className="glass-card mb-4">
        <h3>Currency Preferences</h3>
        <p className="text-muted mt-2 mb-4">Choose the global display currency.</p>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <select 
            value={user?.currency || 'USD'} 
            onChange={handleCurrencyChange}
            disabled={savingSettings}
            className="form-input"
            style={{ width: '240px', cursor: 'pointer' }}
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="JPY">Japanese Yen (JPY)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="LYD">Libyan Dinar (LYD)</option>
          </select>
          {savingSettings && <span className="text-muted" style={{animation: 'pulse-glow 1.5s infinite'}}>Saving...</span>}
        </div>
      </div>

      <div className="glass-card mb-4 mt-8">
        <h3>Appearance</h3>
        <p className="text-muted mt-2 mb-4">Customize the interface theme.</p>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-dark)', padding: '6px', borderRadius: '8px', width: 'fit-content', border: '1px solid var(--border-light)'}}>
          <button 
            onClick={() => theme !== 'light' && toggleTheme()} 
            style={{padding: '8px 16px', borderRadius: '4px', border: 'none', background: theme === 'light' ? 'var(--bg-card)' : 'transparent', color: theme === 'light' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: theme === 'light' ? 'var(--card-shadow)' : 'none', transition: 'var(--transition)'}}
          >
            <Sun size={18} /> Light
          </button>
          <button 
            onClick={() => theme !== 'dark' && toggleTheme()} 
            style={{padding: '8px 16px', borderRadius: '4px', border: 'none', background: theme === 'dark' ? 'var(--bg-card)' : 'transparent', color: theme === 'dark' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: theme === 'dark' ? 'var(--card-shadow)' : 'none', transition: 'var(--transition)'}}
          >
            <Moon size={18} /> Dark
          </button>
        </div>
      </div>

      <div className="glass-card mb-4 mt-8">
        <h3>Account Preferences</h3>
        <p className="text-muted mt-2 mb-4">Update your profile or change notification settings.</p>
        <button onClick={() => setIsProfileModalOpen(true)} className="btn-secondary" style={{width: 'auto', display: 'inline-block'}}>Edit Profile</button>
      </div>
      
      <div className="glass-card">
        <h3>Data Integration</h3>
        <p className="text-muted mt-2 mb-4">Connect new bank accounts or refresh existing syncing status.</p>
        <button className="btn-secondary" style={{width: 'auto', display: 'inline-block'}}>Connect Bank</button>
      </div>

      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}

export default Settings;
