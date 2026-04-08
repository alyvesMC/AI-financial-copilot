import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ShieldAlert, Activity } from 'lucide-react';
import PremiumBlurGate from './PremiumBlurGate';
import { AuthContext } from '../context/AuthContext';

export default function WarningWidget() {
  const { hasPremiumAccess } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/ai/widget/warning')
      .then(res => {
        setData(res.data.content);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend unavailable, falling back to local data', err);
        setData({
          title: "System Scan Inactive",
          message: "Unable to run anomaly detection at this time.",
          severity: "low"
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="glass-card flex-center" style={{ height: '320px', flexDirection: 'column', padding: '24px' }}>
       <h3 style={{fontSize: '1rem', width: '100%', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}><ShieldAlert size={18} color="var(--danger)"/> Real-Time Risk Scanner</h3>
       <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>
          <Activity className="animate-spin" size={24} style={{ marginRight: '8px', animation: 'spin 2s linear infinite' }} /> Analyzing Activity...
       </div>
    </div>
  );

  const isHighRisk = data?.severity === 'high';

  return (
    <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column', padding: '24px', border: isHighRisk && hasPremiumAccess ? '1px solid var(--danger)' : '1px solid var(--border-light)', background: isHighRisk && hasPremiumAccess ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)' }}>
       <h3 style={{fontSize: '1rem', width: '100%', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <ShieldAlert size={18} color={isHighRisk ? "var(--danger)" : "var(--text-muted)"}/> Real-Time Risk Scanner
       </h3>
       
       <PremiumBlurGate isLocked={data?.isLocked || (!hasPremiumAccess)} overlayText="Pro Threat Detection Locked">
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '12px', color: isHighRisk ? 'var(--danger)' : 'var(--text-main)' }}>
                {data?.title}
            </h4>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
               {data?.message}
            </p>
            
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Detected Urgency</span>
               <span style={{ fontWeight: 600, textTransform: 'uppercase', color: isHighRisk ? 'var(--danger)' : (data?.severity === 'medium' ? 'var(--warning)' : 'var(--success)') }}>
                  {data?.severity}
               </span>
            </div>
         </div>
       </PremiumBlurGate>
    </div>
  );
}
