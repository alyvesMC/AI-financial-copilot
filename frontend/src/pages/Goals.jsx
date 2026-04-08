import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Target } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

function Goals() {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    axios.get('/api/goals')
      .then(res => setGoals(res.data))
      .catch(err => {
        console.warn('Backend unavailable, falling back to local data', err);
        setGoals([
          { _id: '1', title: 'Emergency Fund', targetAmount: 10000, currentAmount: 4500, deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() },
          { _id: '2', title: 'Europe Vacation', targetAmount: 2000, currentAmount: 500, deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() }
        ]);
      });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="mb-2 flex-center" style={{fontSize: '2rem'}}>Goals</h1>
          <p className="text-muted">Track your financial milestones.</p>
        </div>
        <button className="btn-primary">Create New Goal</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {goals.map(g => {
          const percentage = Math.round((g.currentAmount / g.targetAmount) * 100);
          return (
            <div key={g._id} className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '50%' }}>
                <Target size={28} color="var(--text-muted)"/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between mb-3">
                  <div>
                    <span style={{fontWeight: 600, fontSize: '1.1rem', display: 'block'}}>{g.title}</span>
                    <span className="text-muted" style={{fontSize: '0.9rem'}}>{g.deadline ? `Target: ${new Date(g.deadline).toLocaleDateString()} · ` : ''}{formatCurrency(g.currentAmount, user?.currency)} of {formatCurrency(g.targetAmount, user?.currency)}</span>
                  </div>
                  <span style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)'}}>{percentage}%</span>
                </div>
                <div style={{width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '8px', overflow: 'hidden'}}>
                  <div style={{height: '100%', width: `${Math.min(percentage, 100)}%`, background: 'var(--text-main)', borderRadius: '8px', transition: 'width 1s ease'}}></div>
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
