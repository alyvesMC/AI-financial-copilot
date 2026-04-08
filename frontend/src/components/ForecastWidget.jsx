import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';
import { Target, Activity } from 'lucide-react';
import PremiumBlurGate from './PremiumBlurGate';
import { AuthContext } from '../context/AuthContext';

export default function ForecastWidget() {
  const { hasPremiumAccess } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/ai/widget/forecast`)
      .then(res => {
        setData(res.data.content);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend unavailable, falling back to local data', err);
        // Fallback for mock environment
        setData({
          summary: "Forecast engine inactive. Awaiting initial payload.",
          days_remaining: 14,
          risk_level: "medium"
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="glass-card flex-center" style={{ height: '320px', flexDirection: 'column', padding: '24px' }}>
       <h3 style={{fontSize: '1rem', width: '100%', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}><Target size={18} color="var(--accent-blue)"/> AI Forecast Summary</h3>
       <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>
          <Activity className="animate-spin" size={24} style={{ marginRight: '8px', animation: 'spin 2s linear infinite' }} /> Generating...
       </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
       <h3 style={{fontSize: '1rem', width: '100%', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Target size={18} color="var(--accent-blue)"/> AI Forecast Summary
       </h3>
       
       <PremiumBlurGate isLocked={data?.isLocked || (!hasPremiumAccess)} overlayText="Pro Forecast Locked">
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="text-main" style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
               "{data?.summary}"
            </p>
            {data?.days_remaining > 0 && (
               <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '12px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Estimated Runway:</span>
                  <span style={{ fontSize: '1.2rem' }}>{data.days_remaining} Days</span>
               </div>
            )}
            <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: data?.risk_level === 'high' ? 'var(--danger)' : 'var(--text-muted)' }}>
               Risk Profile: {data?.risk_level}
            </div>
         </div>
       </PremiumBlurGate>
    </div>
  );
}
