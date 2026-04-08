const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('Database already seeded');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = await User.create({
            name: 'Alex Johnson',
            email: 'user@example.com',
            password: hashedPassword,
            balance: 6280.50
        });

        // Generate transactions
        const transactions = [
            { userId: user._id, description: 'Salary', amount: 4500, category: 'Income', type: 'income', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Rent', amount: 1500, category: 'Housing', type: 'expense', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Groceries', amount: 320, category: 'Food', type: 'expense', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Electric Bill', amount: 95, category: 'Utilities', type: 'expense', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Netflix', amount: 15, category: 'Entertainment', type: 'expense', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Uber', amount: 45, category: 'Transport', type: 'expense', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Dinner out', amount: 120, category: 'Food', type: 'expense', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { userId: user._id, description: 'Salary', amount: 4500, category: 'Income', type: 'income', date: new Date() },
            { userId: user._id, description: 'Rent', amount: 1500, category: 'Housing', type: 'expense', date: new Date() },
        ];

        await Transaction.insertMany(transactions);

        await Goal.create([
            { userId: user._id, title: 'Emergency Fund', targetAmount: 10000, currentAmount: 4500, deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Europe Vacation', targetAmount: 2000, currentAmount: 500, deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
        ]);

        console.log('Seed data inserted successfully');
    } catch (err) {
        console.error('Error seeding data:', err);
    }
};

module.exports = seedDatabase;
