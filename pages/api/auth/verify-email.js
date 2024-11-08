// pages/api/auth/verify-email.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

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

   const { code } = req.body;
   const user = await User.findOne({ email: session.user.email });

   if (!user) {
     return res.status(404).json({ message: '用户不存在' });
   }

   if (user.emailVerified) {
     return res.status(400).json({ message: '邮箱已验证' });
   }

   // 验证码过期检查
   if (user.verificationExpires < new Date()) {
     user.isLocked = true;
     user.lockReason = '邮箱验证已过期';
     await user.save();
     return res.status(400).json({ message: '验证码已过期，账户已锁定' });
   }

   // 验证码匹配检查
   if (user.verificationCode !== code) {
     return res.status(400).json({ message: '验证码错误' });
   }

   // 验证成功，更新用户状态
   user.emailVerified = true;
   user.verificationCode = undefined;
   user.verificationExpires = undefined;
   await user.save();

   return res.status(200).json({ 
     success: true, 
     message: '邮箱验证成功' 
   });

 } catch (error) {
   console.error('邮箱验证错误:', error);
   return res.status(500).json({ message: '验证失败，请重试' });
 }
}