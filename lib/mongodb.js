// lib/mongodb.js

import mongoose from 'mongoose';
import '../models/Race';  // 添加这行
import '../models/Series';  // 添加这行，因为Race依赖Series模型
import '../models/User';  // 添加这行，因为Race引用了User

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// 打印出连接字符串（隐藏密码）
console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
    cached.conn = await cached.promise;
    
    console.log('Successfully connected to MongoDB');
    return cached.conn;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }
}

export default connectDB;
