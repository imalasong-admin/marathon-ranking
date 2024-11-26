import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 生成4位数字验证码
export function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendVerificationEmail(to, username, code) {
  try {
    // 配置发信邮箱
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? 'noreply@imalasong.com'  
      : 'onboarding@resend.dev';  

    // 配置收信邮箱
    const toEmail = process.env.NODE_ENV === 'production'
      ? to  
      : process.env.TEST_EMAIL || 'imalasong2024@gmail.com'; 

    // 配置邮件内容
    const emailContent = process.env.NODE_ENV === 'production'
      ? `亲爱的${username}，
         
您的验证码是：${code}

该验证码在24小时内有效。请尽快完成验证以确保账号正常使用。

祝您跑步愉快！
Marathon Ranking 团队`
      : `亲爱的${username}，

您的验证码是：${code}

测试环境信息：
- 原始注册邮箱：${to}
- 测试邮箱：${toEmail}

该验证码在24小时内有效。

Marathon Ranking 团队`;

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Marathon Ranking - 邮箱验证码',
      text: emailContent
    });
    
    console.log('Resend API 返回结果:', result);
    return { success: true, result };
  } catch (error) {
    console.error('发送邮件失败:', error);
    return { success: false, error };
  }
}