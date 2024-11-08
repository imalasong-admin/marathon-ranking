// pages/api/auth/verify-reset-code.js
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
 if (req.method !== 'POST') {
   return res.status(405).json({ message: '只支持 POST 请求' });
 }

 try {
   await connectDB();
   const { email, code } = req.body;

   // 验证参数
   if (!email || !code) {
     return res.status(400).json({ message: '邮箱和验证码不能为空' });
   }

   // 查找用户
   const user = await User.findOne({ email });
   if (!user) {
     return res.status(404).json({ message: '用户不存在' });
   }

   // 验证码是否正确
   if (user.verificationCode !== code) {
     return res.status(400).json({ message: '验证码错误' });
   }

   // 验证码是否过期
   if (user.verificationExpires < new Date()) {
     return res.status(400).json({ message: '验证码已过期，请重新获取' });
   }

   // 验证通过
   return res.status(200).json({
     success: true,
     message: '验证成功'
   });

 } catch (error) {
   console.error('验证码验证错误:', error);
   return res.status(500).json({ message: '验证失败，请重试' });
 }
}