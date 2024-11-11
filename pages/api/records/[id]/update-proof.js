// pages/api/records/[id]/update-proof.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Record from '../../../../models/Record';
import User from '../../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: '只支持 PATCH 请求' });
  }

  try {
    // 检查会话
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    await connectDB();

    // 检查用户是否被锁定
    const user = await User.findById(session.user.id);
    if (user.isLocked) {
      return res.status(403).json({ 
        success: false,
        message: user.lockReason ? 
          `账号已被锁定: ${user.lockReason}` : 
          '账号已被锁定，无法更新成绩证明'
      });
    }

    const { id } = req.query;
    const { proofUrl } = req.body;

    // 查找记录并验证所有权
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该记录' 
      });
    }

    // 验证是否是记录的所有者
    if (record.userId.toString() !== session.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '无权更新此记录' 
      });
    }

    // 更新 proofUrl
    record.proofUrl = proofUrl || '';
    // 更新验证状态为待验证
    record.verificationStatus = 'pending';
    await record.save();

    return res.status(200).json({
      success: true,
      message: '成绩证明更新成功',
      proofUrl: record.proofUrl
    });

  } catch (error) {
    console.error('更新成绩证明错误:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '更新失败，请重试'
    });
  }
}