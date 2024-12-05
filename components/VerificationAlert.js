// components/VerificationAlert.js
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

const VerificationAlert = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
  
 // 如果用户未登录或已验证，不显示通知栏
 if (!session || session.user.emailVerified) return null;
  
 // 如果是2024年11月7日（今天）之前注册的用户，不显示通知栏
 const registrationDate = new Date(session.user.createdAt);
 if (registrationDate < new Date('2024-11-07')) return null;
  
  // 如果已验证，不显示通知栏
  if (session.user.emailVerified) return null;

  // 重新发送验证码
  const handleResend = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        alert('验证码已发送到您的邮箱');
      } else {
        alert(data.message || '发送失败，请重试');
      }
    } catch (error) {
      alert('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto py-1 px-4 text-center text-sm">
        {session.user.isLocked ? (
          <p className="text-red-600">
            您的账户因未验证邮箱已锁定。
            <button 
              onClick={handleResend}
              disabled={loading}
              className="text-blue-600 underline ml-1 disabled:opacity-50"
            >
              {loading ? '发送中...' : '重新发送验证码'}
            </button>
          </p>
        ) : (
          <p className="text-blue-600">
            请验证您的邮箱以继续使用完整功能。
            <button
              onClick={() => window.location.href = '/verify-email'}
              className="text-blue-800 underline ml-1"
            >
              立即验证
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerificationAlert;