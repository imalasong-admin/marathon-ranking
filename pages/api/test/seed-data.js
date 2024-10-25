// pages/api/test/seed-data.js
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Record from '../../../models/Record';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ... (前面的 userId 定义保持不变)

async function createTestUsers() {
  const hashedPassword = await bcrypt.hash('123456', 12);  // 使用统一的测试密码

  return [
    {
      _id: userId1,
      username: "zhang_san",
      email: "zhangsan@example.com",
      birthDate: new Date("1996-05-15"),
      gender: "M",
      name: "张三",
      password: hashedPassword
    },
    {
      _id: userId2,
      username: "li_si",
      email: "lisi@example.com",
      birthDate: new Date("1989-03-20"),
      gender: "M",
      name: "李四",
      password: hashedPassword
    },
    {
      _id: userId3,
      username: "wang_wu",
      email: "wangwu@example.com",
      birthDate: new Date("1982-08-10"),
      gender: "M",
      name: "王五",
      password: hashedPassword
    },
    {
      _id: userId4,
      username: "zhao_meiling",
      email: "zhaomeiling@example.com",
      birthDate: new Date("1992-11-25"),
      gender: "F",
      name: "赵美玲",
      password: hashedPassword
    },
    {
      _id: userId5,
      username: "sun_xiaomei",
      email: "sunxiaomei@example.com",
      birthDate: new Date("1995-07-30"),
      gender: "F",
      name: "孙小梅",
      password: hashedPassword
    }
  ];
}

// ... (其他代码保持不变，包括 testRecords 的定义)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // 清除现有数据
    await User.deleteMany({});
    await Record.deleteMany({});

    // 创建测试用户（带加密密码）
    const testUsers = await createTestUsers();

    // 插入新数据
    await User.insertMany(testUsers);
    await Record.insertMany(testRecords);

    res.status(200).json({ message: 'Test data inserted successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
}