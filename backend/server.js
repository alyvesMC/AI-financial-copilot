require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Groq } = require('groq-sdk');
const groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const jwt = require('jsonwebtoken');
const { connectDB } = require('./db');
const seedDatabase = require('./seed');
const auth = require('./middleware/auth');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Fallback OPTIONS handler just in case cors() misses it on custom headers
app.options('*', cors());

// Webhook must be raw
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    if (!stripe) return res.status(400).send('Stripe unconfigured.');
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        await User.findOneAndUpdate({ stripeCustomerId: subscription.customer }, { tier: 'pro', stripeSubscriptionId: subscription.id });
    } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await User.findOneAndUpdate({ stripeCustomerId: subscription.customer }, { tier: 'free' });
    }
    res.json({ received: true });
});

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_nova';

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days logic
        let stripeCustomerId = null;
        if (stripe) {
            try {
                const customer = await stripe.customers.create({ email, name });
                stripeCustomerId = customer.id;
            } catch (stripeErr) {
                console.error("Stripe customer creation failed during register", stripeErr);
            }
        }

        user = new User({ name, email, password: hashedPassword, trialExpiresAt, stripeCustomerId });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.balance, currency: user.currency, tier: user.tier, trialExpiresAt: user.trialExpiresAt } });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.balance, currency: user.currency, tier: user.tier, trialExpiresAt: user.trialExpiresAt } });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Protected Routes ---

// --- Stripe Integrations ---
app.post('/api/stripe/create-checkout-session', auth, async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    try {
        const user = await User.findById(req.user.id);
        
        let customerIdStr = user.stripeCustomerId;
        if (!customerIdStr) {
            const customer = await stripe.customers.create({ email: user.email, name: user.name });
            customerIdStr = customer.id;
            user.stripeCustomerId = customerIdStr;
            await user.save();
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerIdStr,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Nova Pro Subscription' },
                    unit_amount: 999,
                    recurring: { interval: 'month' }
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'http://localhost:5173/dashboard/settings?success=true&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/dashboard/settings?canceled=true',
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stripe/verify-session', auth, async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    try {
        const { session_id } = req.body;
        if (!session_id) return res.status(400).json({ error: 'Missing session ID' });
        
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const user = await User.findById(req.user.id);
            if (user.tier !== 'pro') {
                user.tier = 'pro';
                user.trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Expiry handled manually just in case
                await user.save();
            }
            return res.json({ success: true, tier: 'pro' });
        }
        res.json({ success: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Profile
app.put('/api/users/profile', auth, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (password && password.length >= 6) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json({ msg: 'Profile updated successfully', user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Currency
app.put('/api/users/currency', auth, async (req, res) => {
    try {
        const { currency } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.currency = currency;
        await user.save();
        res.json({ msg: 'Currency updated successfully', currency });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Dashboard overview
app.get('/api/dashboard', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const transactions = await Transaction.find({ userId: user._id }).sort({ date: -1 }).limit(5);
        const goals = await Goal.find({ userId: user._id });
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 28); // 4 full weeks
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const recentTx = await Transaction.find({ userId: user._id, date: { $gte: thirtyDaysAgo }});
        
        const income = recentTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = recentTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        // Aggregate category breakdown
        const expensesTx = recentTx.filter(t => t.type === 'expense');
        const categoryMap = {};
        expensesTx.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + Math.abs(t.amount);
        });
        const categoryBreakdown = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] }));

        // Weekly Breakdown for chart (rolling 4 weeks, week 4 is current)
        const weeklyData = [
            { name: 'Week 1', income: 0, expense: 0 },
            { name: 'Week 2', income: 0, expense: 0 },
            { name: 'Week 3', income: 0, expense: 0 },
            { name: 'Week 4', income: 0, expense: 0 }
        ];

        recentTx.forEach(t => {
            const diffTime = Math.abs(new Date() - new Date(t.date));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let weekIndex = 3 - Math.floor(diffDays / 7);
            if (weekIndex < 0) weekIndex = 0;
            if (weekIndex > 3) weekIndex = 3;

            if (t.type === 'income') {
                weeklyData[weekIndex].income += t.amount;
            } else {
                weeklyData[weekIndex].expense += Math.abs(t.amount);
            }
        });

        // 6-month historical aggregate data for multi-month graphs (Real MongoDB querying)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const multiMonthData = [];
        
        const sixMonthsAgoDate = new Date();
        sixMonthsAgoDate.setMonth(sixMonthsAgoDate.getMonth() - 5);
        sixMonthsAgoDate.setDate(1);
        sixMonthsAgoDate.setHours(0,0,0,0);
        
        const allRelevantTx = await Transaction.find({ userId: user._id, date: { $gte: sixMonthsAgoDate } });
        let backwardsBalance = user.balance;

        for (let i = 0; i <= 5; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const targetMonth = d.getMonth();
            const targetYear = d.getFullYear();

            const monthTxs = allRelevantTx.filter(t => {
                const td = new Date(t.date);
                return td.getMonth() === targetMonth && td.getFullYear() === targetYear;
            });

            const mIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const mExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            multiMonthData.unshift({
                month: monthNames[targetMonth],
                income: mIncome,
                expense: mExpense,
                balance: backwardsBalance
            });
            
            const netCashFlowThisMonth = mIncome - mExpense;
            backwardsBalance = backwardsBalance - netCashFlowThisMonth;
        }

        res.json({
            user,
            recentTransactions: transactions,
            goals,
            stats: { monthlyIncome: income, monthlyExpenses: expenses, categoryBreakdown, weeklyData, multiMonthData }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch all transactions
app.get('/api/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new transaction
app.post('/api/transactions', auth, async (req, res) => {
    try {
        const { description, amount, category, type, date } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const newTransaction = new Transaction({
            userId: user._id,
            description,
            amount: parseFloat(amount),
            category,
            type,
            date: date ? new Date(date) : new Date()
        });
        
        await newTransaction.save();
        
        // Update user balance
        const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
        user.balance += balanceChange;
        await user.save();
        
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete transaction
app.delete('/api/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        if (transaction.userId.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        const user = await User.findById(req.user.id);
        
        // Reverse balance change
        const balanceChange = transaction.type === 'income' ? -parseFloat(transaction.amount) : parseFloat(transaction.amount);
        user.balance += balanceChange;
        await user.save();

        await transaction.deleteOne();

        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit transaction
app.put('/api/transactions/:id', auth, async (req, res) => {
    try {
        const { description, amount, category, type, date } = req.body;
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        const user = await User.findById(req.user.id);
        
        // 1. Reverse the old transaction impact mathematically
        const oldBalanceChange = transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount);
        user.balance -= oldBalanceChange;
        
        // 2. Apply new properties
        transaction.description = description || transaction.description;
        transaction.amount = amount !== undefined ? parseFloat(amount) : transaction.amount;
        transaction.category = category || transaction.category;
        transaction.type = type || transaction.type;
        transaction.date = date ? new Date(date) : transaction.date;

        // 3. Apply the incoming transaction impact mathematically
        const newBalanceChange = transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount);
        user.balance += newBalanceChange;
        
        await transaction.save();
        await user.save();

        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch all goals
app.get('/api/goals', auth, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Insights endpoint (Groq LLM Strict JSON format)
app.get('/api/ai/insights', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const isTrialActive = false; // Disabled system-wide
        const isPro = user.tier === 'pro';
        const hasPremiumAccess = isPro || isTrialActive;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTx = await Transaction.find({ userId: user._id, date: { $gte: thirtyDaysAgo } });

        const mIncome = recentTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const mExpense = recentTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const burnRate = (mExpense > 0 ? (mExpense / 30) : 0).toFixed(2);
        
        const catMap = {};
        recentTx.filter(t => t.type === 'expense').forEach(t => {
             catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
        });

        const promptStr = hasPremiumAccess ? `You are an advanced financial forecasting AI inside a premium fintech application.

Your job is to analyze the user's financial data and generate a detailed, forward-looking financial forecast.

USER DATA:
- Currency Context: ${user.currency || 'USD'}
- Monthly Income: ${user.currency || 'USD'} ${mIncome}
- Total Expenses: ${user.currency || 'USD'} ${mExpense}
- Current Balance: ${user.currency || 'USD'} ${user.balance}
- Category Breakdown: ${Object.keys(catMap).map(k => `${k}: ${user.currency || 'USD'} ${catMap[k]}`).join(', ')}
- Recent Transactions: ${recentTx.slice(0, 8).map(t => `${t.description} - ${user.currency || 'USD'} ${Math.abs(t.amount)}`).join(', ')}
- Daily Burn Rate: ${user.currency || 'USD'} ${burnRate}

TASK:

1. SHORT-TERM FORECAST (Next 7–30 days)
- Estimate how long the current balance will last
- Identify immediate risks (running out of money, overspending)
- Highlight urgent issues

2. MID-TERM FORECAST (Next 1–3 months)
- Predict financial trajectory based on current behavior
- Identify trends (increasing expenses, unstable balance)
- Highlight potential financial stress points

3. LONG-TERM OUTLOOK (3–12 months)
- Evaluate sustainability of current habits
- Predict savings potential or financial decline
- Identify long-term risks or opportunities

4. SCENARIO SIMULATION (VERY IMPORTANT)
Provide at least 2 scenarios:
- Scenario A: If user continues current behavior
- Scenario B: If user improves spending habits

Each scenario must include:
- Estimated savings or losses
- Financial outcome summary

5. ACTIONABLE STRATEGY
- Provide a clear plan to improve financial future
- Include specific numbers (how much to save, reduce, adjust)

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "short_term": {
    "summary": "string",
    "days_remaining": 0,
    "risk_level": "low | medium | high"
  },
  "mid_term": {
    "summary": "string",
    "trend": "improving | stable | declining"
  },
  "long_term": {
    "summary": "string",
    "outlook": "positive | neutral | negative"
  },
  "scenarios": [
    {
      "title": "Current Behavior",
      "outcome": "string",
      "estimated_savings": 0
    },
    {
      "title": "Improved Behavior",
      "outcome": "string",
      "estimated_savings": 0
    }
  ],
  "strategy": [
    {
      "step": "string",
      "impact": "string"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON
- Be specific with numbers
- Avoid generic advice
- Make insights realistic and practical
- Focus on decision-making value
- ALL currency values MUST use the native user currency symbol/acronym (${user.currency || 'USD'}). Do NOT default to $.` 
        : `You are a basic financial AI.
Analyze the user data and generate ONLY a short term risk summary over the next 30 days.

USER DATA:
- Total Expenses: ${user.currency || 'USD'} ${mExpense}
- Current Balance: ${user.currency || 'USD'} ${user.balance}

TASK:
1. SHORT-TERM FORECAST (Next 7–30 days)
- Highlight basic issues without specific strategies or numbers.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "short_term": {
    "summary": "string",
    "days_remaining": 0,
    "risk_level": "low | medium | high"
  }
}

IMPORTANT:
- Return ONLY valid JSON
- Keep messages short and clear`;

        if (!groqClient) {
             return res.json({ content: {
                warnings: [{title: "System Config", message: "GROQ API key not mounted to Env.", severity: "medium"}],
                insights: [{title: "Offline Mode", message: "AI is currently sidelined. Set key to generate metrics."}],
                advice: [{title: "Action Required", message: "Link LLM Key via .env configuration.", potential_savings: 0}],
                prediction: { days_remaining: 0, summary: "Update server logic." }
             } });
        }

        const chatCompletion = await groqClient.chat.completions.create({
            messages: [{ role: 'system', content: promptStr }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        let parsedContent = {};
        try {
            parsedContent = JSON.parse(chatCompletion.choices[0]?.message?.content);
            if (!hasPremiumAccess) {
                parsedContent.mid_term = { summary: "Mid-term forecasting requires Premium access.", trend: "stable", isLocked: true };
                parsedContent.long_term = { summary: "Long-term outlook requires Premium access.", outlook: "neutral", isLocked: true };
                parsedContent.scenarios = [
                    { title: "Current Behavior", outcome: "Unlock Premium to see exact outcome scenarios.", estimated_savings: 0, isLocked: true },
                    { title: "Improved Behavior", outcome: "Unlock Premium to calculate exact saving potentials.", estimated_savings: 0, isLocked: true }
                ];
                parsedContent.strategy = [
                    { step: "Detailed financial strategy", impact: "Unlock Premium mapping to discover your greatest leaks.", isLocked: true }
                ];
            }
        } catch (parseError) {
             console.error("Failed to parse Groq response to JSON:", chatCompletion.choices[0]?.message?.content);
             parsedContent = { short_term: { summary: "Insight generation failed.", risk_level: "low", days_remaining: 0 }};
        }
        res.json({ content: parsedContent });
    } catch (err) {
        console.error('Groq Error:', err);
        res.status(500).json({ error: 'Failed to generate AI insights' });
    }
});

// AI FORECAST WIDGET ENDPOINT
app.get('/api/ai/widget/forecast', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const hasPremiumAccess = user.tier === 'pro';

        if (!hasPremiumAccess) {
            return res.json({ content: { summary: "Detailed cash-flow forecasting locked.", days_remaining: 0, risk_level: "low", isLocked: true } });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTx = await Transaction.find({ userId: user._id, date: { $gte: thirtyDaysAgo } });

        const mExpense = recentTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const burnRate = (mExpense > 0 ? (mExpense / 30) : 0).toFixed(2);

        const promptStr = `You are a financial forecasting AI.

Analyze the user's financial situation and predict short-term outcomes.

USER DATA:
- Balance: ${user.currency || 'USD'} ${user.balance}
- Monthly expenses: ${user.currency || 'USD'} ${mExpense}
- Daily burn rate: ${user.currency || 'USD'} ${burnRate}

TASK:
1. Estimate how long the balance will last
2. Detect risk level
3. Provide a short future-focused message

OUTPUT (STRICT JSON):
{
  "summary": "string",
  "days_remaining": 0,
  "risk_level": "low | medium | high"
}

RULES:
- Be clear and impactful
- Include exact time (days)
- Focus on future consequences`;

        const chatCompletion = await groqClient.chat.completions.create({
            messages: [{ role: 'system', content: promptStr }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: "json_object" }
        });
        
        const parsedContent = JSON.parse(chatCompletion.choices[0]?.message?.content);
        res.json({ content: parsedContent });
    } catch (err) {
        console.error('Groq Widget Error:', err);
        res.status(500).json({ error: 'Failed to generate widget data' });
    }
});

// AI WARNING WIDGET ENDPOINT
app.get('/api/ai/widget/warning', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const hasPremiumAccess = user.tier === 'pro';

        if (!hasPremiumAccess) {
            return res.json({ content: { title: "Threat Scanner Locked", message: "Pro users receive real-time granular spending anomaly alerts.", severity: "low", isLocked: true } });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTx = await Transaction.find({ userId: user._id, date: { $gte: thirtyDaysAgo } });

        const mIncome = recentTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const mExpense = recentTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const burnRate = (mExpense > 0 ? (mExpense / 30) : 0).toFixed(2);
        const recentStrings = recentTx.slice(0, 5).map(t => `${t.description} - $${Math.abs(t.amount)}`).join(', ');

        const promptStr = `You are a financial risk detection AI inside a fintech application.

Analyze the user's financial data and detect urgent risks.

USER DATA:
- Income: ${user.currency || 'USD'} ${mIncome}
- Expenses: ${user.currency || 'USD'} ${mExpense}
- Balance: ${user.currency || 'USD'} ${user.balance}
- Daily Burn Rate: ${user.currency || 'USD'} ${burnRate}
- Recent Transactions: ${recentStrings}

TASK:
1. Detect financial risks such as:
- Overspending
- Rapid balance decrease
- Unusual spikes in spending

2. Identify urgency level:
- low, medium, or high

3. Generate a short, impactful warning message.

OUTPUT (STRICT JSON):
{
  "title": "string",
  "message": "string",
  "severity": "low | medium | high"
}

RULES:
- Keep message short and strong
- Focus on urgency
- Include numbers if possible`;

        const chatCompletion = await groqClient.chat.completions.create({
            messages: [{ role: 'system', content: promptStr }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: "json_object" }
        });
        
        const parsedContent = JSON.parse(chatCompletion.choices[0]?.message?.content);
        res.json({ content: parsedContent });
    } catch (err) {
        console.error('Groq Widget Error:', err);
        res.status(500).json({ error: 'Failed to generate widget data' });
    }
});

// AI SMART GOALS GENERATOR (PRO LEVEL FEATURE)
app.post('/api/ai/goals/generate', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const hasPremiumAccess = user.tier === 'pro';

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTx = await Transaction.find({ userId: user._id, date: { $gte: thirtyDaysAgo } });

        const mIncome = recentTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const mExpense = recentTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        // Spending Breakdown String
        const categories = {};
        recentTx.filter(t => t.type === 'expense').forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
        });
        const catString = Object.entries(categories).map(([k,v]) => `${k}: $${v}`).join(', ');

        const proInstructions = hasPremiumAccess ? `
OPTIONAL (PRO VERSION UPGRADE)
Make it even stronger: Also include optimization strategies to reach the goal faster and estimate how much money can be saved by following the plan.

EXTENDED OUTPUT SCHEMA FOR PRO:
{
  "goals": [
    {
      "title": "string",
      "description": "string",
      "targetAmount": number,
      "monthlyContribution": number,
      "estimatedMonths": number,
      "difficulty": "easy | medium | hard",
      "priority": "high | medium | low",
      "steps": ["string", "string"],
      "optimizationStrategy": "string",
      "successProbability": number (0-100),
      "estimatedSavings": number
    }
  ]
}` : `
OUTPUT (STRICT JSON):
{
  "goals": [
    {
      "title": "string",
      "description": "string",
      "targetAmount": number,
      "monthlyContribution": number,
      "estimatedMonths": number,
      "difficulty": "easy | medium | hard",
      "priority": "high | medium | low",
      "steps": ["string", "string"]
    }
  ]
}
`;

        const promptStr = `You are a professional financial planning AI inside a fintech application.

Your role is to create realistic, personalized financial goals based on the user's financial situation.

USER DATA:
- Monthly Income: ${mIncome}
- Total Expenses: ${mExpense}
- Current Balance: ${user.balance}
- Spending Breakdown: ${catString || 'None visible'}

TASK:
1. IDENTIFY POSSIBLE GOALS
Generate 2-3 realistic financial goals (e.g. Emergency fund, Saving for purchase, Reducing expenses).
2. PRIORITIZE GOALS based on urgency.
3. CREATE A PLAN FOR EACH GOAL
4. PROVIDE ACTIONABLE STEPS (2-3 clear steps)

IMPORTANT:
- Goals must be realistic based on income and expenses
- Avoid generic advice, use clear and practical numbers
- Use EXACT JSON Keys defined below. DO NOT DEVIATE.

${proInstructions}`;

        const chatCompletion = await groqClient.chat.completions.create({
            messages: [{ role: 'system', content: promptStr }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
            response_format: { type: "json_object" }
        });
        
        const parsedContent = JSON.parse(chatCompletion.choices[0]?.message?.content);
        
        // 1. Wipe previous AI generated goals to keep roadmap clean
        await Goal.deleteMany({ userId: user._id, isAIGenerated: true });
        
        // 2. Insert new goals mathematically derived.
        if (parsedContent && parsedContent.goals && Array.isArray(parsedContent.goals)) {
            const mappedGoals = parsedContent.goals.map(g => ({
                userId: user._id,
                title: g.title || 'Smart Goal',
                description: g.description,
                targetAmount: g.targetAmount || 0,
                currentAmount: 0,
                monthlyContribution: g.monthlyContribution || 0,
                estimatedMonths: g.estimatedMonths || 0,
                difficulty: g.difficulty || 'medium',
                priority: g.priority || 'medium',
                steps: g.steps || [],
                isAIGenerated: true,
                optimizationStrategy: g.optimizationStrategy,
                successProbability: g.successProbability,
                estimatedSavings: g.estimatedSavings
            }));
            
            await Goal.insertMany(mappedGoals);
        }
        
        res.json({ success: true, message: 'AI Goals generated and saved.' });
    } catch (err) {
        console.error('Groq Goals Generator Error:', err);
        res.status(500).json({ error: 'Failed to generate financial goals.' });
    }
});

// Frontend Deployment Pipeline
const path = require('path');
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
// API Fallback Guard
// Any requests to /api that didn't match a route above should return 404 JSON, not HTML.
app.all(/^\/api\/.*/, (req, res) => {
    // Rely on CORS middleware from top of file.
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
        return res.status(200).send();
    }
    res.status(404).json({ error: 'API Endpoint Not Found or wrong HTTP Method' });
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
});
}

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    await seedDatabase();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
});
