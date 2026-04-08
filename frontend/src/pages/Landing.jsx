import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BrainCircuit, ShieldCheck, Zap, TrendingUp, Bell, Target, ArrowDownToLine, CheckCircle2, AlertTriangle } from 'lucide-react';
import FloatingSquares from '../components/FloatingSquares';

function Landing() {
  // Smooth scroll logic for anchors
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ----------------- NAVBAR ----------------- */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex-center">
            <div style={{width: '28px', height: '28px', background: 'var(--text-main)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
               <BrainCircuit size={18} color="var(--bg-dark)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Finance Autopilot</h2>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'var(--transition)' }}>Features</a>
            <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'var(--transition)' }}>Pricing</a>
            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', background: 'var(--text-main)', color: 'var(--bg-dark)' }}>Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* ----------------- HERO SECTION ----------------- */}
      <section style={{ position: 'relative', paddingTop: '160px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div className="animated-grid-bg"></div>
        <FloatingSquares />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', padding: '0 24px' }} className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
            <SparkleIcon /> Introducing predictive burn-rate AI
          </div>
          <h1 className="hero-headline" style={{ fontSize: '4.5rem', lineHeight: '1.1', letterSpacing: '-0.05em', marginBottom: '24px' }}>
             Stop bleeding cash. <br/>
             <span style={{ color: 'var(--danger)' }}>Take control today.</span>
          </h1>
          <p className="hero-subheadline" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Every day of blind spending puts you at financial risk. The first AI system that automatically tracks your cash flow, predicts exactly when you'll hit zero, and intervenes before it happens.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 24px', background: 'var(--text-main)', color: 'var(--bg-dark)' }}>Start Free Trial <ArrowRight size={18} style={{marginLeft: '8px'}} /></Link>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>See how it works</a>
          </div>
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span className="flex-center"><ShieldCheck size={16} /> Bank-level security</span>
            <span className="flex-center"><Zap size={16} /> Real-time sync</span>
            <span className="flex-center"><Target size={16} /> 14-day free trial</span>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: '80px', width: '100%', maxWidth: '1000px', padding: '0 24px' }}>
           <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden', padding: '8px' }}>
              <div style={{ width: '100%', height: '500px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
                 {/* Mini Mock Dashboard */}
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '100%', borderRight: '1px solid var(--border-light)', padding: '24px' }}>
                    <div style={{ width: '120px', height: '24px', background: 'var(--border-light)', borderRadius: '4px', marginBottom: '32px' }}></div>
                    <div style={{ width: '100%', height: '16px', background: 'var(--accent-soft)', borderRadius: '4px', marginBottom: '16px' }}></div>
                    <div style={{ width: '80%', height: '16px', background: 'var(--accent-soft)', borderRadius: '4px', marginBottom: '16px' }}></div>
                 </div>
                 <div style={{ position: 'absolute', top: 0, left: '200px', right: 0, height: '100%', padding: '40px' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                       <div style={{ flex: 1, height: '120px', background: 'var(--accent-soft)', borderRadius: '8px', border: '1px solid var(--border-light)' }}></div>
                       <div style={{ flex: 1, height: '120px', background: 'var(--accent-soft)', borderRadius: '8px', border: '1px solid var(--border-light)' }}></div>
                       <div style={{ flex: 1, height: '120px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <span style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.85rem' }}>AI Predicting...</span>
                       </div>
                    </div>
                    <div style={{ width: '100%', height: '240px', background: 'var(--accent-soft)', borderRadius: '8px', border: '1px solid var(--border-light)' }}></div>
                 </div>
                 
                 {/* AI Overlay Modal Graphic */}
                 <div className="glass-card" style={{ position: 'absolute', right: '40px', top: '140px', width: '320px', padding: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', border: '1px solid var(--accent-blue)', background: 'var(--bg-card)', zIndex: 10 }}>
                    <div className="flex-center mb-4"><Bell size={18} color="var(--accent-blue)" /> <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Smart Alert</span></div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Your dining expenses are 24% higher than usual. At this rate, your balance will hit $0 in 12 days.</p>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Save $140 by pausing subscriptions</div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ----------------- PROBLEM SECTION ----------------- */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-headline" style={{ fontSize: '2.5rem', marginBottom: '64px', letterSpacing: '-0.03em' }}>Every month you wait costs you money.</h2>
            <div className="grid-3" style={{ textAlign: 'left' }}>
               <div className="glass-card" style={{ background: 'transparent', boxShadow: 'none' }}>
                  <ArrowDownToLine size={24} color="var(--danger)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Bleeding Cash</h3>
                  <p className="text-muted">You're losing money to unwanted subscriptions, lifestyle creep, and creeping fees you've lost track of.</p>
               </div>
               <div className="glass-card" style={{ background: 'transparent', boxShadow: 'none' }}>
                  <AlertTriangle size={24} color="var(--accent-blue)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Too Late to Act</h3>
                  <p className="text-muted">Standard bank apps only tell you what happened yesterday. They never warn you before the payment actually declines.</p>
               </div>
               <div className="glass-card" style={{ background: 'transparent', boxShadow: 'none' }}>
                  <BrainCircuit size={24} color="var(--text-main)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Analysis Paralysis</h3>
                  <p className="text-muted">Delaying action only deepens the hole. You need an automated system that tells you exactly what to cut today.</p>
               </div>
            </div>
         </div>
      </section>

      {/* ----------------- FEATURES & SOLUTION SECTION ----------------- */}
      <section id="features" style={{ padding: '120px 24px', position: 'relative' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 className="section-headline" style={{ fontSize: '3rem', letterSpacing: '-0.04em', marginBottom: '16px' }}>Intelligence built in.</h2>
                <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>We replaced the spreadsheets with an AI designed to relentlessly optimize your net worth.</p>
            </div>

            <div className="grid-half" style={{ gap: '64px', alignItems: 'center', paddingBottom: '100px' }}>
               <div>
                  <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
                     <BrainCircuit size={24} color="var(--accent-blue)" />
                  </div>
                  <h3 style={{ fontSize: '2rem', letterSpacing: '-0.03em', marginBottom: '16px' }}>AI Insights.</h3>
                  <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px' }}>Stop guessing. Finance Autopilot analyzes every transaction in real-time and detects hidden patterns, unwanted subscriptions, and lifestyle creep before they drain your account.</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                     <li className="flex-center" style={{ color: 'var(--text-main)' }}><CheckCircle2 size={18} color="var(--success)" /> Smart category detection</li>
                     <li className="flex-center" style={{ color: 'var(--text-main)' }}><CheckCircle2 size={18} color="var(--success)" /> Lifestyle creep warnings</li>
                     <li className="flex-center" style={{ color: 'var(--text-main)' }}><CheckCircle2 size={18} color="var(--success)" /> Contextual saving strategies</li>
                  </ul>
               </div>
               <div style={{ background: 'var(--bg-card)', height: '400px', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                   {/* Mock UI */}
                   <div style={{ padding: '16px', borderLeft: '4px solid var(--danger)', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '4px', fontSize: '1rem', color: 'var(--danger)' }}>CRITICAL: Overdraft Risk</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>You've spent $140 on transport this week. At this burn rate, you will overdraft by Thursday.</p>
                   </div>
                   <div style={{ padding: '16px', borderLeft: '4px solid var(--success)', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '4px', fontSize: '1rem' }}>URGENT: Save $14.99/mo</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>Cancel the 'Premium Streaming' subscription immediately. You haven't used it in 45 days.</p>
                   </div>
               </div>
            </div>

            <div className="grid-half" style={{ gap: '64px', alignItems: 'center' }}>
               <div style={{ background: 'var(--bg-card)', height: '400px', borderRadius: '16px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                  <div style={{ position: 'absolute', bottom: '-20px', left: 0, width: '100%', height: '240px', borderTop: '2px dashed var(--danger)', opacity: 0.5 }}></div>
                  <div style={{ position: 'absolute', bottom: '40px', left: '10%', right: '10%', height: '120px', background: 'linear-gradient(90deg, var(--accent-blue), transparent)', opacity: 0.1, borderRadius: '8px' }}></div>
                  <div style={{ position: 'absolute', top: '40px', right: '40px', padding: '12px 24px', background: 'var(--danger)', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>Burn Zero: 14 Days</div>
               </div>
               <div>
                  <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
                     <TrendingUp size={24} color="var(--danger)" />
                  </div>
                  <h3 style={{ fontSize: '2rem', letterSpacing: '-0.03em', marginBottom: '16px' }}>6-Month Predictions.</h3>
                  <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px' }}>See the future. Our predictive engine simulates your exact cash flow trajectory. We warn you weeks in advance if you're going to overdraw, so you can change course today.</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                     <li className="flex-center" style={{ color: 'var(--text-main)' }}><CheckCircle2 size={18} color="var(--success)" /> Days-until-zero tracking</li>
                     <li className="flex-center" style={{ color: 'var(--text-main)' }}><CheckCircle2 size={18} color="var(--success)" /> Predictive balance curves</li>
                     <li className="flex-center" style={{ color: 'var(--text-main)' }}><CheckCircle2 size={18} color="var(--success)" /> Pre-emptive risk alerts</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* ----------------- HOW IT WORKS ----------------- */}
      <section id="how-it-works" style={{ padding: '120px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-headline" style={{ fontSize: '2.5rem', marginBottom: '80px', letterSpacing: '-0.03em' }}>Three steps to financial clarity.</h2>
            <div className="grid-3" style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '1px', background: 'var(--border-light)', zIndex: 0 }}></div>
               
               <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '24px' }}>1</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Add Data</h4>
                  <p className="text-muted">Connect your accounts or log transactions securely in seconds.</p>
               </div>
               <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', border: '1px solid var(--accent-blue)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '24px', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)' }}>2</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Get Insights</h4>
                  <p className="text-muted">The AI immediately analyzes the ledger and flags hidden risks.</p>
               </div>
               <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '24px' }}>3</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Grow Wealth</h4>
                  <p className="text-muted">Execute the AI's exact saving strategies to optimize cash flow.</p>
               </div>
            </div>
         </div>
      </section>

      {/* ----------------- PRICING SECTION ----------------- */}
      <section id="pricing" style={{ padding: '120px 24px' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h2 className="section-headline" style={{ fontSize: '3rem', letterSpacing: '-0.04em', marginBottom: '16px' }}>Simple, transparent pricing.</h2>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>No hidden fees. Free 14-day trial on the Pro plan.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
               {/* Free Tier */}
               <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Basic</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.05em' }}>$0<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo forever</span></div>
                  <p className="text-muted" style={{ marginBottom: '32px' }}>For individuals who just need clean tracking without intelligence.</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--text-muted)" /> Manual tracking</li>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--text-muted)" /> Basic Dashboards</li>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--text-muted)" /> 1 AI Insight / week</li>
                     <li className="flex-center" style={{ color: 'var(--text-muted)', opacity: 0.5 }}><XIcon /> No Predictions</li>
                     <li className="flex-center" style={{ color: 'var(--text-muted)', opacity: 0.5 }}><XIcon /> No Saving Strategies</li>
                  </ul>
                  <Link to="/register" className="btn-secondary" style={{ marginTop: '32px', padding: '12px', width: '100%', textDecoration: 'none' }}>Get Started Free</Link>
               </div>
               
               {/* Pro Tier */}
               <div className="glass-card" style={{ padding: '40px', position: 'relative', border: '1px solid var(--accent-blue)', boxShadow: '0 24px 48px rgba(59, 130, 246, 0.1)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-blue)', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Most Popular</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--accent-blue)' }}>Nova Pro</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.05em' }}>$9.99<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
                  <p className="text-muted" style={{ marginBottom: '32px' }}>Full autopilot. Let the intelligence system manage your risk constraints.</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--accent-blue)" /> Unlimited AI Insights</li>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--accent-blue)" /> 6-Month Predictions Active</li>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--accent-blue)" /> Dollar-saving action plans</li>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--accent-blue)" /> Priority Alerts</li>
                     <li className="flex-center"><CheckCircle2 size={16} color="var(--accent-blue)" /> PDF Exporting</li>
                  </ul>
                  <Link to="/register" className="btn-primary" style={{ marginTop: '32px', padding: '12px', width: '100%', background: 'var(--accent-blue)', textDecoration: 'none' }}>Start 14-Day Free Trial</Link>
               </div>
            </div>
         </div>
      </section>

      {/* ----------------- FINAL CTA SECTION ----------------- */}
      <section style={{ padding: '120px 24px', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
         <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--text-main)', color: 'var(--bg-dark)', padding: '64px 24px' }}>
             <h2 className="section-headline" style={{ fontSize: '3rem', letterSpacing: '-0.04em', marginBottom: '24px', color: 'var(--bg-dark)' }}>Take action before your next bill.</h2>
             <p style={{ fontSize: '1.1rem', marginBottom: '40px', opacity: 0.8, maxWidth: '500px', margin: '0 auto 40px auto' }}>Stop leaving your financial security to chance. Let the intelligence system lock down your baseline right now.</p>
             <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px', background: 'var(--bg-dark)', color: 'var(--text-main)', margin: '0 auto', display: 'inline-flex', textDecoration: 'none' }}>Take Control Now <ArrowRight size={18} style={{marginLeft: '8px'}} /></Link>
         </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer style={{ padding: '64px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex-center" style={{ color: 'var(--text-muted)' }}>
               <BrainCircuit size={20} />
               <span style={{ fontWeight: 600 }}>Nova Coach SaaS</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
               © 2026 Finance Autopilot. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
}

// Minimal Helper Icons
function SparkleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

function XIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}

export default Landing;
