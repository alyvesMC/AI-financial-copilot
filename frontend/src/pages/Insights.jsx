import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';
import { Sparkles, TrendingUp, AlertTriangle, Clock, Target, Lightbulb } from 'lucide-react';
import PremiumBlurGate from '../components/PremiumBlurGate';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

function Insights() {
  const { user: authUser, hasPremiumAccess } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/ai/insights`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend unavailable, falling back to local data', err);
        setData({
          content: {
            short_term: { summary: "Spending is elevated based on recent activity. Immediate attention requested to avoid overdraw.", days_remaining: 14, risk_level: "high" },
            mid_term: { summary: "If habits continue, you will experience stress next month. Cash flow is negative.", trend: "declining", isLocked: true },
            long_term: { summary: "Future is unclear without proactive intervention.", outlook: "negative", isLocked: true },
            scenarios: [
              { title: "Current Behavior", outcome: "You will face severe liquidity issues within 4 weeks.", estimated_savings: 0, isLocked: true },
              { title: "Improved Behavior", outcome: "You can redirect cash to build an emergency buffer.", estimated_savings: 300, isLocked: true }
            ],
            strategy: [
              { step: "Analyze recurring subscriptions", impact: "Immediate release of liquid capital.", isLocked: true }
            ]
          }
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="animate-fade-in flex-center" style={{flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
      <Sparkles style={{ width: 48, height: 48, color: 'var(--accent-primary)', marginBottom: '1rem', animation: 'pulse-glow 2s infinite' }} />
      <h2 className="gradient-text">Nova AI is calculating your trajectory...</h2>
    </div>
  );

  if (!data) return <div className="text-danger">Failed to load AI Forecast.</div>;

  const aiPayload = data.content || data;
  const shortTerm = aiPayload.short_term || {};
  const midTerm = aiPayload.mid_term || {};
  const longTerm = aiPayload.long_term || {};
  const scenarios = aiPayload.scenarios || [];
  const strategy = aiPayload.strategy || [];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="mb-8 flex-between">
        <div>
          <h1 className="mb-2 flex-center" style={{fontSize: '2rem'}}><Target size={24} color="var(--accent-blue)"/> Financial Forecast</h1>
          <p className="text-muted">Predictive timeline and strategy mapping powered by AI.</p>
        </div>
      </div>

      {shortTerm.risk_level === 'high' && (
        <div className="mb-8 p-avoid" style={{ border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="text-danger flex-center" style={{margin: 0}}><AlertTriangle size={20} /> Critical Short-Term Risk</h3>
          <div>
            <span className="text-muted">{shortTerm.summary}</span>
          </div>
        </div>
      )}

      {/* TIMELINE SECTION */}
      <h3 className="mb-4 flex-center"><Clock size={20} color="var(--text-muted)"/> Trajectory Timeline</h3>
      <div className="grid-3 mb-8">
        <div className="glass-card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
          <h4 className="mb-4" style={{ color: 'var(--accent-blue)' }}>0-30 Days</h4>
          <p className="text-muted mb-4" style={{fontSize: '0.95rem', lineHeight: '1.6'}}>{shortTerm.summary}</p>
          {shortTerm.days_remaining > 0 && (
             <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                Runway: {shortTerm.days_remaining} days
             </div>
          )}
        </div>

        <div className="glass-card" style={{ borderTop: `4px solid ${midTerm.trend === 'declining' ? 'var(--danger)' : 'var(--text-muted)'}` }}>
          <h4 className="mb-4">1-3 Months</h4>
          <PremiumBlurGate isLocked={midTerm.isLocked} overlayText="Pro Only">
             <p className="text-muted mb-4" style={{fontSize: '0.95rem', lineHeight: '1.6'}}>{midTerm.summary}</p>
             <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                Trend: {midTerm.trend}
             </div>
          </PremiumBlurGate>
        </div>

        <div className="glass-card" style={{ borderTop: '4px solid var(--text-main)' }}>
          <h4 className="mb-4">3-12 Months</h4>
          <PremiumBlurGate isLocked={longTerm.isLocked} overlayText="Pro Only">
             <p className="text-muted mb-4" style={{fontSize: '0.95rem', lineHeight: '1.6'}}>{longTerm.summary}</p>
             <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                Outlook: {longTerm.outlook}
             </div>
          </PremiumBlurGate>
        </div>
      </div>

      {/* SCENARIOS SECTION */}
      <h3 className="mb-4 flex-center"><TrendingUp size={20} color="var(--text-muted)"/> Scenario Simulations</h3>
      <div className="grid-2 mb-8">
          {scenarios.map((scen, idx) => (
             <PremiumBlurGate key={idx} isLocked={scen.isLocked} overlayText="Pro Simulation Locked">
                 <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h4 className="mb-4" style={{borderBottom: '1px solid var(--border-light)', paddingBottom: '12px'}}>{scen.title}</h4>
                    <p className="text-muted mb-4" style={{flex: 1}}>{scen.outcome}</p>
                    {scen.estimated_savings > 0 && (
                        <div className="text-success" style={{ fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '4px', textAlign: 'center' }}>
                            Potential Value: {formatCurrency(scen.estimated_savings, authUser?.currency)}
                        </div>
                    )}
                 </div>
             </PremiumBlurGate>
          ))}
      </div>

      {/* STRATEGY SECTION */}
      <h3 className="mb-4 flex-center"><Lightbulb size={20} color="var(--text-muted)"/> Core Strategy</h3>
      <div className="glass-card mb-8">
           {strategy.length === 0 && <p className="text-muted">No strategies generated.</p>}
           {strategy.map((strat, idx) => (
              <PremiumBlurGate key={idx} isLocked={strat.isLocked} overlayText="Premium Strategy Mapping Locked">
                 <div style={{ display: 'flex', gap: '16px', borderBottom: idx !== strategy.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: idx !== strategy.length - 1 ? '16px' : '0', marginBottom: idx !== strategy.length - 1 ? '16px' : '0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{idx + 1}</div>
                    <div>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>{strat.step}</strong>
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>{strat.impact}</span>
                    </div>
                 </div>
              </PremiumBlurGate>
           ))}
      </div>

      {!hasPremiumAccess && (
          <div className="glass-card mt-8" style={{ border: '1px solid var(--accent-blue)', textAlign: 'center', padding: '48px 24px', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h2 className="mb-4 text-main">Unlock the Full Forecast Engine</h2>
            <p className="text-muted mb-6" style={{maxWidth: '600px', margin: '0 auto'}}>
               Upgrade to Nova Pro to process exact scenarios, long-term projections, and specific savings strategies securely generated from your personal ledger.
            </p>
            <button onClick={() => navigate('/dashboard/settings')} className="btn-primary" style={{margin: '0 auto', background: 'var(--accent-blue)'}}>Upgrade Now</button>
          </div>
      )}
    </div>
  );
}

export default Insights;
