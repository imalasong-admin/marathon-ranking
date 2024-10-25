// 文件: pages/api/test/seed-data.js

import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Record from '../../../models/Record';

const testUsers = [
  {
    _id: "user1",
    username: "zhang_san",
    email: "zhangsan@example.com",
    birthDate: "1996-05-15",
    gender: "男",
    name: "张三",
    password: "hashedpassword123" // 实际应用中需要加密
  },
  {
    _id: "user2",
    username: "li_si",
    email: "lisi@example.com",
    birthDate: "1989-03-20",
    gender: "男",
    name: "李四",
    password: "hashedpassword123"
  },
  {
    _id: "user3",
    username: "wang_wu",
    email: "wangwu@example.com",
    birthDate: "1982-08-10",
    gender: "男",
    name: "王五",
    password: "hashedpassword123"
  },
  {
    _id: "user4",
    username: "zhao_meiling",
    email: "zhaomeiling@example.com",
    birthDate: "1992-11-25",
    gender: "女",
    name: "赵美玲",
    password: "hashedpassword123"
  },
  {
    _id: "user5",
    username: "sun_xiaomei",
    email: "sunxiaomei@example.com",
    birthDate: "1995-07-30",
    gender: "女",
    name: "孙小梅",
    password: "hashedpassword123"
  }
];

const testRecords = [
  {
    userId: "user1",
    finishTime: "2:45:30",
    raceDate: "2024-03-15",
    location: "北京马拉松",
    chipTime: "2:45:22",
    certificateUrl: "https://example.com/cert1",
    verificationStatus: "verified"
  },
  {
    userId: "user2",
    finishTime: "2:38:15",
    raceDate: "2024-03-15",
    location: "北京马拉松",
    chipTime: "2:38:10",
    certificateUrl: "https://example.com/cert2",
    verificationStatus: "verified"
  },
  {
    userId: "user3",
    finishTime: "3:05:45",
    raceDate: "2024-02-28",
    location: "厦门马拉松",
    chipTime: "3:05:40",
    certificateUrl: "https://example.com/cert3",
    verificationStatus: "verified"
  },
  {
    userId: "user4",
    finishTime: "3:12:20",
    raceDate: "2024-03-15",
    location: "北京马拉松",
    chipTime: "3:12:15",
    certificateUrl: "https://example.com/cert4",
    verificationStatus: "verified"
  },
  {
    userId: "user5",
    finishTime: "2:58:40",
    raceDate: "2024-02-28",
    location: "厦门马拉松",
    chipTime: "2:58:35",
    certificateUrl: "https://example.com/cert5",
    verificationStatus: "verified"
  },
  {
    userId: "user1",
    finishTime: "2:47:10",
    raceDate: "2024-01-15",
    location: "广州马拉松",
    chipTime: "2:47:05",
    certificateUrl: "https://example.com/cert6",
    verificationStatus: "verified"
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // 清除现有数据
    await User.deleteMany({});
    await Record.deleteMany({});

    // 插入新数据
    await User.insertMany(testUsers);
    await Record.insertMany(testRecords);

    res.status(200).json({ message: 'Test data inserted successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
}