import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';
import { Target, Sparkles, Clock, ArrowRight, CheckCircle2, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import PremiumBlurGate from '../components/PremiumBlurGate';

function Goals() {
  const { user, hasPremiumAccess } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const fetchGoals = () => {
    setLoading(true);
    axios.get(`${API}/goals`, { headers: { 'x-auth-token': localStorage.getItem('token') } })
      .then(res => {
        setGoals(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend err', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setErrorDetails('');
    try {
      await axios.post(`${API}/ai/goals/generate`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      await fetchGoals();
    } catch (err) {
      setErrorDetails('AI Generation Failed. Please try again.');
    }
    setIsGenerating(false);
  };

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="dashboard-wrapper animate-fade-in">
      <div className="flex-between mobile-flex-col mb-6">
        <div>
          <h1 className="hero-headline gradient-text flex-center mb-2" style={{fontSize: '2.4rem'}}>
            <Target size={32} style={{marginRight: '12px'}} /> Financial Goals
          </h1>
          <p className="text-muted hero-subheadline">Track milestones or let AI build your perfect roadmap.</p>
        </div>
        <div>
          <button 
            className="btn-primary" 
            style={{background: 'var(--accent-blue)', gap: '8px'}} 
            onClick={handleGenerateAI}
            disabled={isGenerating}
          >
            {isGenerating ? 'AI is Analyzing Ledger...' : <><Sparkles size={18} /> Generate AI Roadmap</>}
          </button>
        </div>
      </div>

      {errorDetails && <div className="text-danger mb-4 p-4 glass-card" style={{borderColor: 'var(--danger)'}}>{errorDetails}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading && <p className="text-muted">Loading goals...</p>}
        {!loading && goals.length === 0 && (
          <div className="glass-card flex-center" style={{flexDirection: 'column', padding: '64px 24px', textAlign: 'center'}}>
             <Target size={48} color="var(--border-light)" style={{marginBottom: '16px'}} />
             <h3 style={{fontSize: '1.5rem', marginBottom: '8px'}}>No Active Goals</h3>
             <p className="text-muted" style={{maxWidth: '400px', marginBottom: '24px'}}>You haven't set any financial targets yet. Use our AI engine to calculate exactly what you can afford to aim for.</p>
             <button className="btn-primary" onClick={handleGenerateAI} disabled={isGenerating}>Build Roadmap Now</button>
          </div>
        )}

        {goals.map(g => {
          const percentage = calculateProgress(g.currentAmount, g.targetAmount);
          const difficultyColor = g.difficulty === 'hard' ? 'var(--danger)' : g.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)';
          
          return (
            <div key={g._id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Header Box */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
                 {g.isAIGenerated && (
                    <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600}}>
                       <Sparkles size={12} /> AI GENERATED
                    </div>
                 )}
                 <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', paddingRight: g.isAIGenerated ? '120px' : '0' }}>{g.title}</h2>
                 <p className="text-muted" style={{ fontSize: '0.95rem' }}>{g.description}</p>
              </div>

              {/* Core Metrics Grid */}
              <div className="grid-3" style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', gap: '24px' }}>
                 <div>
                    <span className="text-muted text-small" style={{display: 'block', marginBottom: '4px'}}>Target Amount</span>
                    <span style={{fontSize: '1.25rem', fontWeight: 600}}>{formatCurrency(g.targetAmount, user?.currency)}</span>
                 </div>
                 <div>
                    <span className="text-muted text-small" style={{display: 'block', marginBottom: '4px'}}>Recommended Monthly</span>
                    <span style={{fontSize: '1.25rem', fontWeight: 600}}>{formatCurrency(g.monthlyContribution, user?.currency)}</span>
                 </div>
                 <div>
                    <span className="text-muted text-small" style={{display: 'block', marginBottom: '4px'}}>Time Left</span>
                    <span style={{fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}><Clock size={16} color="var(--accent-blue)"/> {g.estimatedMonths ? `${g.estimatedMonths} Months` : 'N/A'}</span>
                 </div>
              </div>

              {/* Progress Tracker */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex-between mb-3">
                  <span style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)'}}>PROGRESS</span>
                  <span style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)'}}>{percentage}% Complete</span>
                </div>
                <div style={{width: '100%', height: '12px', background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)'}}>
                  <div style={{height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, var(--accent-blue), #60a5fa)', borderRadius: '12px', transition: 'width 1.5s ease-out'}}></div>
                </div>
                {g.difficulty && (
                   <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Priority: <strong style={{color: 'var(--text-main)', textTransform: 'capitalize'}}>{g.priority}</strong> • Difficulty: <strong style={{color: difficultyColor, textTransform: 'capitalize'}}>{g.difficulty}</strong>
                   </div>
                )}
              </div>

              {/* AI Steps & Pro Strategy Overlay */}
              <div className="grid-half" style={{ padding: '0', gap: 0, alignItems: 'stretch' }}>
                  
                  {/* Basic Steps - Always Free */}
                  <div style={{ padding: '24px', borderRight: '1px solid var(--border-light)' }}>
                     <h4 className="flex-center mb-4" style={{ fontSize: '1.1rem' }}><CheckCircle2 size={18} color="var(--success)" style={{marginRight: '8px'}}/> Actionable Steps</h4>
                     {g.steps && g.steps.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                           {g.steps.map((step, idx) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                 <div style={{ padding: '4px', background: 'var(--bg-dark)', borderRadius: '50%', color: 'var(--text-muted)' }}><ArrowRight size={14}/></div>
                                 <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step}</span>
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <p className="text-muted text-small">No steps provided.</p>
                     )}
                  </div>

                  {/* PRO ONLY Strategy Area */}
                  <div style={{ padding: '24px', position: 'relative' }}>
                     {!hasPremiumAccess ? (
                        <PremiumBlurGate featureName="Smart Strategies & Predictors">
                           <div style={{ opacity: 0.3 }}>
                             <h4 className="flex-center mb-4"><Zap size={18} style={{marginRight: '8px'}}/> Strategy & Probability</h4>
                             <p>Unlock AI predictive analysis to calculate mathematically faster routes to your target.</p>
                           </div>
                        </PremiumBlurGate>
                     ) : (
                       <div style={{ background: 'rgba(16, 185, 129, 0.05)', height: '100%', borderRadius: '12px', padding: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <h4 className="flex-center mb-4" style={{ color: 'var(--success)' }}><Zap size={18} style={{marginRight: '8px'}}/> AI Pro Optimization</h4>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '16px' }}>{g.optimizationStrategy || "AI optimizing daily balances..."}</p>
                          
                          <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                             <div style={{ flex: 1, background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
                                <span className="text-muted text-small">Success Prob.</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)' }}>{g.successProbability || 85}%</div>
                             </div>
                             <div style={{ flex: 1, background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
                                <span className="text-muted text-small">Est. Savings</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-blue)' }}>{formatCurrency(g.estimatedSavings || 0, user?.currency)}</div>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Goals;
