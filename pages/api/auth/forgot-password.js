// pages/api/auth/forgot-password.js
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateVerificationCode, sendVerificationEmail } from '../../../lib/email';

export default async function handler(req, res) {
 if (req.method !== 'POST') {
   return res.status(405).json({ message: '只支持 POST 请求' });
 }

 try {
   await connectDB();
   const { email } = req.body;

   // 检查邮箱是否为空
   if (!email) {
     return res.status(400).json({ message: '请输入邮箱地址' });
   }

   // 查找用户
   const user = await User.findOne({ email });
   if (!user) {
     return res.status(404).json({ message: '该邮箱未注册' });
   }

   // 生成验证码
   const verificationCode = generateVerificationCode();
   const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时有效期

   // 更新用户的验证码信息
   user.verificationCode = verificationCode;
   user.verificationExpires = verificationExpires;
   await user.save();

   // 在开发环境下，统一发送到测试邮箱
   const emailTo = process.env.NODE_ENV === 'development' 
     ? 'imalasong2024@gmail.com' 
     : email;

   // 发送验证码邮件
   const emailResult = await sendVerificationEmail(
     emailTo,  // 使用处理后的邮箱地址
     user.name, 
     verificationCode
   );

   if (!emailResult.success) {
     console.error('发送邮件失败:', emailResult.error);
     return res.status(500).json({ message: '验证码发送失败，请重试' });
   }

   // 在开发环境下，添加提示信息
   if (process.env.NODE_ENV === 'development') {
     return res.status(200).json({
       success: true,
       message: '验证码已发送到测试邮箱(imalasong2024@gmail.com)'
     });
   }

   return res.status(200).json({
     success: true,
     message: '验证码已发送到您的邮箱'
   });

 } catch (error) {
   console.error('忘记密码处理错误:', error);
   return res.status(500).json({ message: '操作失败，请重试' });
 }
}