import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    // 检查会话
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    await connectDB();

    // 从请求中获取数据
    const { hours, minutes, seconds, gender, age, date, totalSeconds } = 
req.body;

    // 创建成绩记录
    const record = await Record.create({
      userId: session.user.id,
      finishTime: {
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds)
      },
      totalSeconds,
      gender,
      age: parseInt(age),
      date: new Date(date)
    });

    return res.status(201).json({
      success: true,
      message: '成绩提交成功',
      record
    });

  } catch (error) {
    console.error('提交成绩错误:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '提交失败，请重试'
    });
  }
}
