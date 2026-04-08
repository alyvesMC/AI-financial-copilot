import React from 'react';
import { createPortal } from 'react-dom';
import { X, LayoutTemplate, Plus, Check, Target, ShieldAlert, Activity, PieChart, BarChart2, TrendingUp, CreditCard } from 'lucide-react';

function AddWidgetModal({ isOpen, onClose, widgets, toggleWidget }) {
  if (!isOpen) return null;

  const availableWidgets = [
    { id: 'aiForecastSummary', title: 'Forecast Summary AI', desc: 'Securely generates a hyper-specific short-term financial runway and risk level projection.', Icon: Target },
    { id: 'aiWarningCard', title: 'Risk Scanner AI', desc: 'Performs a granular background threat analysis and alerts you to systemic monetary risks.', Icon: ShieldAlert },
    { id: 'thirtyDayVelocity', title: '30-Day Velocity', desc: 'A dual-area chart natively mapping your month-to-date trajectory.', Icon: Activity },
    { id: 'spendingCategories', title: 'Spending Strategies', desc: 'A categorical pie-chart breakdown allocating your top expenditure nodes.', Icon: PieChart },
    { id: 'multiMonthCashFlow', title: 'Cash Flow Timeline', desc: 'A bar chart tracking 6 months of absolute Income vs Expenses.', Icon: BarChart2 },
    { id: 'multiMonthBalance', title: 'Balance History', desc: 'A line graph tracking your total net-worth trajectory dynamically.', Icon: TrendingUp },
    { id: 'creditCards', title: 'Credit Cards Hub', desc: 'A visual manager for your connected physical or virtual credit cards.', Icon: CreditCard }
  ];

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
      <div className="glass-card animate-fade-in premium-modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <div className="flex-between" style={{ padding: '24px 24px 0 24px', marginBottom: '16px' }}>
          <div className="flex-center">
            <LayoutTemplate color="var(--accent-blue)" size={24} style={{ marginRight: '12px' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Widget Store</h2>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' }}>
            <X size={18} />
          </button>
        </div>

        <p className="text-muted" style={{ padding: '0 24px', marginBottom: '16px', fontSize: '0.95rem' }}>Customize your dashboard by adding or removing modular capability cards.</p>

        <div style={{ padding: '0 24px 24px 24px', overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {availableWidgets.map(widget => {
            const isActive = widgets[widget.id];
            const Icon = widget.Icon;
            
            return (
              <div key={widget.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: isActive ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-dark)', borderRadius: '12px', border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)', transition: 'var(--transition)', boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                   <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px', background: isActive ? 'var(--accent-blue)' : 'var(--bg-card)', border: isActive ? 'none' : '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : 'var(--text-muted)' }}>
                      <Icon size={20} />
                   </div>
                   <div>
                     <h4 style={{ fontSize: '1.05rem', marginBottom: '4px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--accent-blue)' : 'var(--text-main)' }}>{widget.title}</h4>
                     <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{widget.desc}</p>
                   </div>
                </div>
                
                <button 
                  onClick={() => toggleWidget(widget.id)}
                  style={{ 
                    flexShrink: 0, marginLeft: '16px', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'var(--transition)',
                    background: isActive ? 'var(--accent-blue)' : 'var(--bg-card)', 
                    border: isActive ? 'none' : '1px solid var(--border-light)',
                    color: isActive ? '#fff' : 'var(--text-main)',
                    boxShadow: isActive ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                >
                  {isActive ? <Check size={16} /> : <Plus size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AddWidgetModal;
