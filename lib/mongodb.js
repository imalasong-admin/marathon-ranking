// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('请在环境变量中设置 MONGODB_URI');
}

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('使用现有数据库连接');
      return;
    }

    console.log('创建新的数据库连接...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[用户名]:[密码]@'));

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('数据库连接成功');

    // 监听连接事件
    mongoose.connection.on('error', err => {
      console.error('MongoDB 连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 连接断开');
    });

  } catch (error) {
    console.error('MongoDB 连接失败:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}