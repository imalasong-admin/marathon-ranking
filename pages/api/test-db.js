// pages/api/test-db.js
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('尝试连接到数据库...');
    console.log('MongoDB URI 格式正确性检查:', MONGODB_URI.startsWith('mongodb+srv://'));

    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    res.status(200).json({ 
      success: true, 
      message: '数据库连接成功',
      database: conn.connection.db.databaseName
    });
  } catch (error) {
    console.error('数据库连接错误:', {
      name: error.name,
      message: error.message
    });
    
    res.status(500).json({ 
      success: false, 
      message: '数据库连接失败',
      error: error.message
    });
  }
}