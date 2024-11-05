// scripts/migrateRaces.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// 首先确认环境变量
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('错误：环境变量 MONGODB_URI 未设置');
    process.exit(1);
}

// Race Schema
const RaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入比赛名称'],
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: [true, '请输入比赛日期']
  },
  raceType: {
    type: String,
    required: [true, '请选择比赛类型']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Race = mongoose.models.Race || mongoose.model('Race', RaceSchema);

async function migrateRaces() {
  try {
    console.log('开始连接数据库...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('数据库连接成功');
    
    const result = await Race.updateMany(
      { raceType: { $exists: false } },
      { $set: { raceType: "全程马拉松" } }
    );
    
    console.log(`成功更新 ${result.modifiedCount} 条记录`);
    
    const total = await Race.countDocuments();
    const updated = await Race.countDocuments({ raceType: "全程马拉松" });
    console.log(`总记录数: ${total}, 已更新记录数: ${updated}`);
    
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('迁移出错:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

migrateRaces();