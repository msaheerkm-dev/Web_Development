const { MongoClient } = require('mongodb');

const url = '';
const client = new MongoClient(url);

let database;

const connectDB = async () => {
    try {
        await client.connect();
        database = client.db(''); // Replace with your DB name
        console.log('Connected to database');
    } catch (err) {
        console.error('Failed to connect to database:', err);
    }
};

const getDB = () => {
    if (!database) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return database;
};

module.exports = { connectDB, getDB };
