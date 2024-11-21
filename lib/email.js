// lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 生成4位数字验证码
export function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// 发送验证邮件
export async function sendVerificationEmail(to, username, code) {
  try {
    // 开发环境下固定发送到测试邮箱
    const recipient = process.env.NODE_ENV === 'development' 
      ? 'imalasong2024@gmail.com' 
      : to;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: recipient,
      subject: 'Marathon Ranking - 邮箱验证码',
      text: `亲爱的${username}，

您的验证码是：${code}

开发测试说明：
- 当前是开发测试环境
- 原始注册邮箱：${to}
- 统一发送到测试邮箱：${recipient}

该验证码在24小时内有效。请尽快完成验证以确保账号正常使用。

祝您跑步愉快！
Marathon Ranking 团队`
    });
    
    console.log('Resend API 返回结果:', result);
    return { success: true, result };
  } catch (error) {
    console.error('发送邮件失败:', error);
    return { success: false, error };
  }
}