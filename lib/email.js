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
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: 'Marathon Ranking - 验证码',
      text: `${username}，

您的验证码是：${code}

该验证码在24小时内有效。
如果这不是您的操作，请忽略此邮件。

祝您跑步愉快！
Marathon Ranking 团队`
    });
    
    return { success: true };
  } catch (error) {
    console.error('发送邮件失败:', error);
    return { success: false, error };
  }
}