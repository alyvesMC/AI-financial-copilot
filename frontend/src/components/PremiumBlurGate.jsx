import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumBlurGate = ({ isLocked, overlayText, children }) => {
  if (!isLocked) return <>{children}</>;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}>
       <div style={{ filter: 'blur(5px)', opacity: 0.6, userSelect: 'none', pointerEvents: 'none' }}>
           {children}
       </div>
       <div className="flex-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column', padding: '16px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'inherit' }}>
           <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <Lock size={20} color="var(--accent-blue)" style={{marginBottom: '8px'}} />
               <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-main)' }}>{overlayText || "Unlock Pro to view"}</p>
               <Link to="/dashboard/settings" className="btn-primary" style={{textDecoration: 'none', fontSize: '0.8rem', padding: '6px 12px', width: '100%', display: 'flex', justifyContent: 'center'}}>Upgrade to Pro</Link>
           </div>
       </div>
    </div>
  );
};

export default PremiumBlurGate;
