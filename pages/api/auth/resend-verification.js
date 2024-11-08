// pages/api/auth/resend-verification.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateVerificationCode, sendVerificationEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: '邮箱已验证' });
    }

    // 生成新的验证码和过期时间
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 更新用户验证信息
    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    if (user.isLocked && user.lockReason === '邮箱验证已过期') {
      user.isLocked = false;
      user.lockReason = '';
    }
    await user.save();

    // 发送新的验证邮件
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationCode);
    if (!emailResult.success) {
      return res.status(500).json({ message: '验证码发送失败，请重试' });
    }

    return res.status(200).json({
      success: true,
      message: '新的验证码已发送到您的邮箱'
    });

  } catch (error) {
    console.error('重新发送验证码错误:', error);
    return res.status(500).json({ message: '操作失败，请重试' });
  }
}