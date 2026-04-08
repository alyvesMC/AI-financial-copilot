import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertCircle, Target, ArrowRight, Lightbulb, Bell, Download, PlusCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddTransactionModal from '../components/AddTransactionModal';
import AddWidgetModal from '../components/AddWidgetModal';
import PremiumBlurGate from '../components/PremiumBlurGate';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import ForecastWidget from '../components/ForecastWidget';
import WarningWidget from '../components/WarningWidget';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import SortableWidget from '../components/SortableWidget';

function Dashboard() {
  const { user: authUser, hasPremiumAccess } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Widget State
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : { multiMonthCashFlow: true, multiMonthBalance: true, creditCards: true, thirtyDayVelocity: true, spendingCategories: true };
  });
  
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const DEFAULT_ORDER = ['aiForecastSummary', 'aiWarningCard', 'thirtyDayVelocity', 'spendingCategories', 'multiMonthCashFlow', 'multiMonthBalance', 'creditCards'];
    const saved = localStorage.getItem('dashboardWidgetOrder');
    if (saved) {
       let parsed = JSON.parse(saved);
       const missing = DEFAULT_ORDER.filter(id => !parsed.includes(id));
       if (missing.length > 0) {
           parsed = [...parsed, ...missing];
           localStorage.setItem('dashboardWidgetOrder', JSON.stringify(parsed));
       }
       return parsed;
    }
    return DEFAULT_ORDER;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleWidget = (id) => {
    const newWidgets = { ...widgets, [id]: !widgets[id] };
    setWidgets(newWidgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
  };

  const exportAsPDF = () => {
    window.print();
  };

  const fetchData = () => {
    Promise.all([
      axios.get(`${API}/dashboard`),
      axios.get(`${API}/ai/insights`).catch(() => ({ data: { insights: ["You're spending 15% more on food this month than average."], recommendations: ["Consider cutting entertainment expenses by $30 to save more effectively."] } }))
    ])
      .then(([dashRes, aiRes]) => {
        setData({ ...dashRes.data, ai: aiRes.data });
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend unavailable, falling back to local data', err);
        // Fallback robust mock multiMonth data
        const mockMulti = [
          { month: 'Oct', income: 3200, expense: 2800, balance: 3500 },
          { month: 'Nov', income: 4500, expense: 2100, balance: 5900 },
          { month: 'Dec', income: 4200, expense: 3900, balance: 6200 },
          { month: 'Jan', income: 5100, expense: 2000, balance: 9300 },
          { month: 'Feb', income: 4800, expense: 2400, balance: 11700 },
          { month: 'Mar', income: 4500, expense: 2800, balance: 13400 }
        ];

        setData({
          user: { name: 'Alex Johnson', balance: 5430.50 },
          stats: { 
            monthlyIncome: 4500, 
            monthlyExpenses: 2800,
            weeklyData: [
              { name: 'Week 1', expense: 800, income: 1000 },
              { name: 'Week 2', expense: 400, income: 1000 },
              { name: 'Week 3', expense: 700, income: 1000 },
              { name: 'Week 4', expense: 900, income: 1500 },
            ],
            categoryBreakdown: [
              { name: 'Housing', value: 1500 },
              { name: 'Food', value: 440 },
              { name: 'Transport', value: 45 }
            ],
            multiMonthData: mockMulti
          },
          goals: [
            { _id: '1', title: 'Emergency Fund', targetAmount: 10000, currentAmount: 4500, deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          recentTransactions: [
            { _id: '1', date: new Date().toISOString(), description: 'Salary', category: 'Income', amount: 4500, type: 'income' },
            { _id: '2', date: new Date(Date.now() - 86400000).toISOString(), description: 'Rent', category: 'Housing', amount: -1500, type: 'expense' },
          ],
          ai: {
            content: {
              short_term: { summary: "Spending is slightly elevated.", days_remaining: 14, risk_level: "medium" },
              strategy: [{ step: "Cut non-essential subs", impact: "Saves $40/mo" }]
            }
          }
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="animate-fade-in flex-center" style={{height: '100%', justifyContent: 'center'}}><h2 className="text-muted">Loading insights...</h2></div>;
  if (!data) return <div className="animate-fade-in text-danger">Failed to load data.</div>;

  const chartData = data.stats.weeklyData?.length ? data.stats.weeklyData : [];
  const multiChartData = data.stats.multiMonthData?.length ? data.stats.multiMonthData : [];
  
  const pieData = data.stats.categoryBreakdown?.length > 0 ? [...data.stats.categoryBreakdown].sort((a, b) => b.value - a.value).slice(0, 5) : [];
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const aiData = data.ai?.content;
  let warnings = [];
  
  let topAIInsight = 'Analyzing financial telemetry...';
  let smartActions = [];

  if (aiData && typeof aiData === 'object' && !Array.isArray(aiData)) {
     if (aiData.short_term) {
         topAIInsight = aiData.short_term.summary || topAIInsight;
         if (aiData.short_term.risk_level === 'high') {
             warnings.push({ title: 'CRITICAL RISK', message: aiData.short_term.summary });
         }
     }

     if (aiData.short_term?.days_remaining > 0) {
         smartActions.push({ type: 'Burn Rate', text: `Your balance is estimated to deplete in ${aiData.short_term.days_remaining} days if spending continues.` });
     }

     if (aiData.strategy && Array.isArray(aiData.strategy)) {
         aiData.strategy.forEach(s => {
             smartActions.push({ type: 'Strategy', text: `${s.step} - ${s.impact}`, isLocked: s.isLocked });
         });
     }

     if (aiData.scenarios && Array.isArray(aiData.scenarios)) {
         const opt = aiData.scenarios.find(s => s.title?.toLowerCase().includes('improve'));
         if (opt && opt.estimated_savings > 0) {
             smartActions.push({ type: 'Prediction', text: `If habits improve, you could save ${formatCurrency(opt.estimated_savings, authUser?.currency)}.`, isLocked: opt.isLocked });
         }
     }
     
     smartActions = smartActions.slice(0, 4);
  } else {
     topAIInsight = 'System ready.';
  }

  const initials = data.user.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();

  const activeWidgetsCount = Object.values(widgets).filter(Boolean).length;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       setWidgetOrder((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          const newOr = arrayMove(items, oldIndex, newIndex);
          localStorage.setItem('dashboardWidgetOrder', JSON.stringify(newOr));
          return newOr;
       });
    }
  };

  const WIDGET_COMPONENTS = {
    aiForecastSummary: <ForecastWidget />,
    aiWarningCard: <WarningWidget />,
    multiMonthCashFlow: (
          <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 className="mb-4" style={{fontSize: '1rem'}}>Historical Cash Flow (6 Months)</h3>
            <div style={{flex: 1, minHeight: 0}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={11} dy={10} />
                  <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={11} />
                  <RechartsTooltip cursor={{fill: 'var(--accent-soft)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} formatter={(v) => formatCurrency(v, authUser?.currency)} />
                  <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
    ),
    multiMonthBalance: (
          <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 className="mb-4" style={{fontSize: '1rem'}}>Net Worth Growth Curve</h3>
            <div style={{flex: 1, minHeight: 0}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} horizontal={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={11} dy={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} formatter={(v) => formatCurrency(v, authUser?.currency)} />
                  <Line type="monotone" dataKey="balance" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-blue)', strokeWidth: 2, stroke: 'var(--bg-card)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
    ),
    creditCards: (
          <div className="glass-card flex-between" style={{ height: '320px', flexDirection: 'column', padding: '24px' }}>
             <div style={{width: '100%'}}>
               <h3 style={{fontSize: '1rem'}}>Active Cards</h3>
               <p className="text-muted mb-4" style={{fontSize: '0.85rem'}}>Manage connected credit pipelines.</p>
             </div>
             {/* Virtual Credit Card Mockup */}
             <div style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
               <div style={{position: 'absolute', top: -30, right: -30, width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%'}}></div>
               <div className="flex-between mb-8">
                 <CreditCard color="#fff" size={24} />
                 <span style={{fontStyle: 'italic', fontWeight: 600, fontSize: '1.2rem', letterSpacing: '-1px'}}>Visa</span>
               </div>
               <p style={{fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '16px'}}>**** **** **** 4829</p>
               <div className="flex-between" style={{fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8}}>
                  <span>{data.user.name}</span>
                  <span>12/28</span>
               </div>
             </div>
             <button className="btn-secondary mt-4 no-print" style={{width: '100%'}}>+ Add New Card</button>
          </div>
    ),
    thirtyDayVelocity: (
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4" style={{fontSize: '1.1rem'}}>30-Day Velocity</h3>
          <div style={{flex: 1, minHeight: 0}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} dx={-10} fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }} 
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
    ),
    spendingCategories: (
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-2" style={{fontSize: '1.1rem'}}>Spending Categories</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    formatter={(value) => formatCurrency(value, authUser?.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted mt-4">No expenses this month yet.</p>
            )}
          </div>
          <div className="flex-center" style={{ flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: 'auto', paddingTop: '8px' }}>
            {pieData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex-center text-muted" style={{fontSize: '0.85rem'}}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
    )
  };

  return (
    <div className="animate-fade-in dashboard-wrapper">
      
      {/* GLOBAL TOP ACTION BAR */}
      <div className="flex-between mb-8 no-print" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <div>
          <h2 style={{fontSize: '1.2rem'}}>Financial Overview</h2>
          <p className="text-muted" style={{fontSize: '0.85rem'}}>Generated {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex-center" style={{ gap: '16px' }}>
          <button onClick={exportAsPDF} className="flex-center text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }} title="Export via PDF">
            <Download size={18} />
          </button>
          
          <button onClick={() => setIsWidgetModalOpen(true)} className="flex-center text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }} title="Add Cards">
            <PlusCircle size={20} />
          </button>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-light)', margin: '0 4px' }}></div>
          
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              {warnings.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>}
            </button>
            
            {showNotifications && (
              <div className="glass-card animate-fade-in" style={{ position: 'absolute', top: '100%', right: -10, marginTop: '16px', width: '320px', padding: '16px', zIndex: 110, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={16}/> Active Alerts</h4>
                {warnings.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Your financial ecosystem is stable. No new alerts.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {warnings.map((w, idx) => (
                      <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--danger)', padding: '8px 12px', borderRadius: '4px' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{w.title}</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{w.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-center flex-col" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', justifyContent: 'center', marginLeft: '8px' }}>
            {initials}
          </div>
        </div>
      </div>

      {/* 1. BALANCE (BIG NUMBER) */}
      <div className="flex-between mobile-flex-col mb-6">
        <div>
          <p className="text-muted" style={{marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em'}}>Total Balance</p>
          <h1 style={{fontSize: '3.5rem', lineHeight: 1, marginBottom: '12px'}}>{formatCurrency(data.user.balance, authUser?.currency)}</h1>
          <div className="flex-center" style={{gap: '24px'}}>
            <p className="text-muted flex-center"><span className="text-success" style={{fontWeight: 600}}>+{formatCurrency(data.stats.monthlyIncome, authUser?.currency)}</span> In</p>
            <p className="text-muted flex-center"><span className="text-danger" style={{fontWeight: 600}}>-{formatCurrency(data.stats.monthlyExpenses, authUser?.currency)}</span> Out</p>
          </div>
        </div>
        <button className="btn-primary no-print" onClick={() => setIsModalOpen(true)}>Add Transaction</button>
      </div>

      {/* 2. AI INSIGHT (ATTENTION GRABBER) */}
      <div className="mb-8 p-avoid" style={{ border: '1px solid var(--border-light)', background: 'var(--accent-soft)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle color="var(--accent-blue)" size={24} style={{flexShrink: 0}} />
        <span style={{ fontSize: '1rem', fontWeight: 500 }}>{topAIInsight}</span>
      </div>

      {/* 3. WIDGETS EXPANSION (CONDITIONAL) */}
      {activeWidgetsCount > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <SortableContext items={widgetOrder}>
            <div className="mb-8 p-avoid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {widgetOrder.filter(id => widgets[id]).map(id => (
                 <SortableWidget key={id} id={id}>
                    {WIDGET_COMPONENTS[id]}
                 </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 5. INSIGHTS (ACTIONS) & 6. TRANSACTIONS (DETAILS) */}
      <div className="grid-2 p-avoid">
        <div className="glass-card">
           <h3 className="mb-4 flex-center" style={{fontSize: '1.1rem'}}><Lightbulb size={20} color="var(--accent-blue)"/> Smart Actions</h3>
           {smartActions.map((act, i) => (
             <PremiumBlurGate key={i} isLocked={act.isLocked} overlayText="Pro Insight Locked">
               <div className="mb-4 flex-center" style={{paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', alignItems: 'flex-start'}}>
                 <div style={{minWidth: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', marginTop: '8px'}}></div>
                 <div>
                    <span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px'}}>{act.type}</span>
                    <p style={{fontSize: '0.95rem', lineHeight: '1.5'}}>{act.text}</p>
                 </div>
               </div>
             </PremiumBlurGate>
           ))}
           <Link to="/dashboard/insights" className="text-muted flex-center no-print" style={{fontSize: '0.9rem', textDecoration: 'none'}}>View all insights <ArrowRight size={16}/></Link>
        </div>

        <div className="glass-card">
           <h3 className="mb-4" style={{fontSize: '1.1rem'}}>Recent Transactions</h3>
           {data.recentTransactions?.length > 0 ? data.recentTransactions.slice(0, 4).map(t => (
             <div key={t._id} className="flex-between mb-4 pb-4" style={{borderBottom: '1px solid var(--border-light)'}}>
                <div>
                  <p style={{fontWeight: 500, fontSize: '0.95rem'}}>{t.description}</p>
                  <p className="text-muted" style={{fontSize: '0.8rem'}}>{new Date(t.date).toLocaleDateString()} &middot; {t.category}</p>
                </div>
                <p style={{fontWeight: 600, color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)'}}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(t.amount), authUser?.currency)}
                </p>
             </div>
           )) : <p className="text-muted mb-4">No recent activity.</p>}
           <Link to="/dashboard/transactions" className="text-muted flex-center no-print" style={{fontSize: '0.9rem', textDecoration: 'none'}}>View all transactions <ArrowRight size={16}/></Link>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
      
      <AddWidgetModal 
        isOpen={isWidgetModalOpen} 
        onClose={() => setIsWidgetModalOpen(false)}
        widgets={widgets}
        toggleWidget={toggleWidget}
      />
    </div>
  );
}

export default Dashboard;
