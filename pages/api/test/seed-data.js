// pages/api/test/seed-data.js
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Record from '../../../models/Record';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // 清除现有数据
    await User.deleteMany({});
    await Record.deleteMany({});

    // 创建用户 ID
    const userId1 = new mongoose.Types.ObjectId();
    const userId2 = new mongoose.Types.ObjectId();
    const userId3 = new mongoose.Types.ObjectId();
    const userId4 = new mongoose.Types.ObjectId();
    const userId5 = new mongoose.Types.ObjectId();

    // 创建加密密码
    const hashedPassword = await bcrypt.hash('123456', 12);

    // 创建测试用户数据
    const testUsers = [
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

    // 计算年龄的辅助函数
    function calculateAge(birthDate, raceDate) {
      const birth = new Date(birthDate);
      const race = new Date(raceDate);
      let age = race.getFullYear() - birth.getFullYear();
      const m = race.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && race.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }

    // 创建测试记录数据
    const testRecords = [
      {
        userId: userId1,
        finishTime: {
          hours: 2,
          minutes: 45,
          seconds: 30
        },
        totalSeconds: 2 * 3600 + 45 * 60 + 30,
        gender: "M",
        age: calculateAge(testUsers[0].birthDate, "2024-03-15"),
        date: new Date("2024-03-15")
      },
      {
        userId: userId2,
        finishTime: {
          hours: 2,
          minutes: 38,
          seconds: 15
        },
        totalSeconds: 2 * 3600 + 38 * 60 + 15,
        gender: "M",
        age: calculateAge(testUsers[1].birthDate, "2024-03-15"),
        date: new Date("2024-03-15")
      },
      {
        userId: userId3,
        finishTime: {
          hours: 3,
          minutes: 5,
          seconds: 45
        },
        totalSeconds: 3 * 3600 + 5 * 60 + 45,
        gender: "M",
        age: calculateAge(testUsers[2].birthDate, "2024-02-28"),
        date: new Date("2024-02-28")
      },
      {
        userId: userId4,
        finishTime: {
          hours: 3,
          minutes: 12,
          seconds: 20
        },
        totalSeconds: 3 * 3600 + 12 * 60 + 20,
        gender: "F",
        age: calculateAge(testUsers[3].birthDate, "2024-03-15"),
        date: new Date("2024-03-15")
      },
      {
        userId: userId5,
        finishTime: {
          hours: 2,
          minutes: 58,
          seconds: 40
        },
        totalSeconds: 2 * 3600 + 58 * 60 + 40,
        gender: "F",
        age: calculateAge(testUsers[4].birthDate, "2024-02-28"),
        date: new Date("2024-02-28")
      }
    ];

    // 插入数据
    await User.insertMany(testUsers);
    await Record.insertMany(testRecords);

    res.status(200).json({ message: 'Test data inserted successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
}