require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log(`Connected to Production MongoDB routing.`);
            return;
        }
        
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`Failed to find MONGODB_URI. MongoDB Memory Server connected locally at ${mongoUri}`);
    } catch (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
};

module.exports = { connectDB, disconnectDB };
