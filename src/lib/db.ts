import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  try {
    console.log('Database connection state:', mongoose.connection.readyState);
    console.log('Attempting to connect to:', MONGODB_URI);
    
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to database');
      return mongoose;
    }
    
    const conn = await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to database successfully');
    console.log('Database name:', conn.connection.db?.databaseName);
    
    return conn;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.error('Connection string used:', MONGODB_URI);
    throw error;
  }
}
