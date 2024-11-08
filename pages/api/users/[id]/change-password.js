
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // 先检查请求方法
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    // 修改 getServerSession 调用，添加 req 和 res 作为参数
    const session = await getServerSession(req, res, authOptions);
    // 增加控制台日志
    console.log('当前会话:', session);

    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    await connectDB();
    // 增加控制台日志
    console.log('数据库连接成功');

    const { newPassword } = req.body;
    // 增加控制台日志
    console.log('收到的新密码长度:', newPassword?.length);

    // 验证新密码
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少为6位' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 增加控制台日志
    console.log('正在更新用户ID:', session.user.id);

    // 更新密码，并等待操作完成
    const result = await User.findByIdAndUpdate(
      session.user.id,
      { password: hashedPassword },
      { new: true }  // 返回更新后的文档
    );

    // 增加控制台日志
    console.log('密码更新结果:', result);

    // 确保这个响应总是被发送
    return res.status(200).json({
      success: true,
      message: '密码修改成功，请重新登录'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    // 确保出错时也发送响应
    return res.status(500).json({ message: '修改失败，请重试' });
  }
}