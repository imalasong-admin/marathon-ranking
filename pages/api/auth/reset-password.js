// pages/api/auth/reset-password.js
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
 if (req.method !== 'POST') {
   return res.status(405).json({ message: '只支持 POST 请求' });
 }

 try {
   await connectDB();
   const { email, code, newPassword } = req.body;

   // 验证参数
   if (!email || !code || !newPassword) {
     return res.status(400).json({ message: '所有字段都是必填的' });
   }

   // 验证密码长度
   if (newPassword.length < 6) {
     return res.status(400).json({ message: '密码长度至少为6位' });
   }

   // 查找用户
   const user = await User.findOne({ email });
   if (!user) {
     return res.status(404).json({ message: '用户不存在' });
   }

   // 验证码验证
   if (user.verificationCode !== code || user.verificationExpires < new Date()) {
     return res.status(400).json({ message: '验证码无效或已过期' });
   }

   // 更新密码
   const hashedPassword = await bcrypt.hash(newPassword, 12);
   user.password = hashedPassword;
   // 清除验证码
   user.verificationCode = undefined;
   user.verificationExpires = undefined;
   await user.save();

   return res.status(200).json({
     success: true,
     message: '密码重置成功，请登录'
   });

 } catch (error) {
   console.error('重置密码错误:', error);
   return res.status(500).json({ message: '重置失败，请重试' });
 }
}