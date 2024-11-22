// pages/api/records/[id]/verify.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Record from '../../../../models/Record';
import User from '../../../../models/User';
import { calculateAdjustedSeconds } from '../../../../lib/ageFactors';

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

    // 检查用户是否被锁定
    const user = await User.findById(session.user.id);
    if (user.isLocked) {
      return res.status(403).json({ 
        success: false,
        message: user.lockReason ? 
          `账号已被锁定: ${user.lockReason}` : 
          '账号已被锁定，无法进行验证'
      });
    }

    const { id } = req.query;
    const { action, reason } = req.body;  // action: 'verify' 或 'report'

    // 获取记录
    const record = await Record.findById(id)
      .populate('userId', 'name gender birthDate')
      .populate('raceId', 'date');

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该记录' 
      });
    }

    // 不能验证自己的记录
    if (record.userId._id.toString() === session.user.id) {
      return res.status(403).json({
        success: false,
        message: '不能验证自己的记录'
      });
    }

    // 检查用户是否已经验证过
    const hasVerified = record.verifiedBy.some(v => 
      v.userId.toString() === session.user.id
    );
    if (hasVerified) {
      return res.status(400).json({
        success: false,
        message: '您已经验证过这条记录'
      });
    }

    // 检查用户是否已经举报过
    const hasReported = record.reportedBy.some(r => 
      r.userId.toString() === session.user.id
    );
    if (hasReported) {
      return res.status(400).json({
        success: false,
        message: '您已经举报过这条记录'
      });
    }

    if (action === 'verify') {
      // 添加验证记录
      record.verifiedBy.push({
        userId: session.user.id,
        verifiedAt: new Date()
      });
      record.verifiedCount = record.verifiedBy.length;
      record.verificationStatus = 'verified';
    } else if (action === 'report') {
      // 添加举报记录
      record.reportedBy.push({
        userId: session.user.id,
        reportedAt: new Date(),
        reason: reason || ''
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的操作'
      });
    }

    // 添加 adjustedSeconds 的计算和设置
    if (!record.adjustedSeconds) {
      record.adjustedSeconds = calculateAdjustedSeconds(
        record.totalSeconds,
        record.userId.gender,
        record.userId.birthDate,
        record.raceId.date
      );
    }

    await record.save();

    // 返回处理结果
    return res.status(200).json({
      success: true,
      message: action === 'verify' ? '验证成功' : '举报已提交',
      verifiedCount: record.verifiedCount,
      verificationStatus: record.verificationStatus,
      verifiedBy: record.verifiedBy,
      reportedBy: record.reportedBy
    });

  } catch (error) {
    console.error('验证记录错误:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '操作失败，请重试'
    });
  }
}