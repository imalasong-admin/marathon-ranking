// pages/api/test/user-data.js
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    await dbConnect();
    
    // 获取所有用户数据
    const users = await User.find({}).select('+_id +name +gender +birthDate +bio');

    // 返回详细信息
    const usersDetails = users.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      birthDate: user.birthDate,
      bio: user.bio,
      // 添加一些元数据信息
      bioExists: user.hasOwnProperty('bio'),
      bioType: typeof user.bio,
      bioValue: user.bio,
      rawData: user.toObject()
    }));

    res.status(200).json({
      success: true,
      users: usersDetails,
      count: users.length,
      schemaFields: Object.keys(User.schema.paths)
    });

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}