// pages/api/test/seed-data.js
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Record from '../../../models/Record';
import mongoose from 'mongoose';

// 创建用户 ID
const userId1 = new mongoose.Types.ObjectId();
const userId2 = new mongoose.Types.ObjectId();
const userId3 = new mongoose.Types.ObjectId();
const userId4 = new mongoose.Types.ObjectId();
const userId5 = new mongoose.Types.ObjectId();

const testUsers = [
  {
    _id: userId1,
    username: "zhang_san",
    email: "zhangsan@example.com",
    birthDate: new Date("1996-05-15"),  // 修改为 Date 对象
    gender: "男",
    name: "张三",
    password: "hashedpassword123"
  },
  {
    _id: userId2,
    username: "li_si",
    email: "lisi@example.com",
    birthDate: new Date("1989-03-20"),
    gender: "男",
    name: "李四",
    password: "hashedpassword123"
  },
  {
    _id: userId3,
    username: "wang_wu",
    email: "wangwu@example.com",
    birthDate: new Date("1982-08-10"),
    gender: "男",
    name: "王五",
    password: "hashedpassword123"
  },
  {
    _id: userId4,
    username: "zhao_meiling",
    email: "zhaomeiling@example.com",
    birthDate: new Date("1992-11-25"),
    gender: "女",
    name: "赵美玲",
    password: "hashedpassword123"
  },
  {
    _id: userId5,
    username: "sun_xiaomei",
    email: "sunxiaomei@example.com",
    birthDate: new Date("1995-07-30"),
    gender: "女",
    name: "孙小梅",
    password: "hashedpassword123"
  }
];

const testRecords = [
  {
    userId: userId1.toString(),
    finishTime: {      // 修改为对象格式
      hours: 2,
      minutes: 45,
      seconds: 30
    },
    raceDate: new Date("2024-03-15"),  // 修改为 Date 对象
    location: "北京马拉松",
    chipTime: {        // 修改为对象格式
      hours: 2,
      minutes: 45,
      seconds: 22
    },
    certificateUrl: "https://example.com/cert1",
    verificationStatus: "verified"
  },
  {
    userId: userId2.toString(),
    finishTime: {
      hours: 2,
      minutes: 38,
      seconds: 15
    },
    raceDate: new Date("2024-03-15"),
    location: "北京马拉松",
    chipTime: {
      hours: 2,
      minutes: 38,
      seconds: 10
    },
    certificateUrl: "https://example.com/cert2",
    verificationStatus: "verified"
  },
  {
    userId: userId3.toString(),
    finishTime: {
      hours: 3,
      minutes: 5,
      seconds: 45
    },
    raceDate: new Date("2024-02-28"),
    location: "厦门马拉松",
    chipTime: {
      hours: 3,
      minutes: 5,
      seconds: 40
    },
    certificateUrl: "https://example.com/cert3",
    verificationStatus: "verified"
  },
  {
    userId: userId4.toString(),
    finishTime: {
      hours: 3,
      minutes: 12,
      seconds: 20
    },
    raceDate: new Date("2024-03-15"),
    location: "北京马拉松",
    chipTime: {
      hours: 3,
      minutes: 12,
      seconds: 15
    },
    certificateUrl: "https://example.com/cert4",
    verificationStatus: "verified"
  },
  {
    userId: userId5.toString(),
    finishTime: {
      hours: 2,
      minutes: 58,
      seconds: 40
    },
    raceDate: new Date("2024-02-28"),
    location: "厦门马拉松",
    chipTime: {
      hours: 2,
      minutes: 58,
      seconds: 35
    },
    certificateUrl: "https://example.com/cert5",
    verificationStatus: "verified"
  },
  {
    userId: userId1.toString(),
    finishTime: {
      hours: 2,
      minutes: 47,
      seconds: 10
    },
    raceDate: new Date("2024-01-15"),
    location: "广州马拉松",
    chipTime: {
      hours: 2,
      minutes: 47,
      seconds: 5
    },
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