// pages/verify-email.js
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';  // 添加 signOut
import { useRouter } from 'next/router';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 在客户端进行重定向检查
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.emailVerified) {
      router.push('/');
    }
  }, [session, status, router]);

  // 等待 session 检查
  if (status === 'loading') {
    return <div>加载中...</div>;
  }

  // 如果未登录或已验证，不渲染内容
  if (!session || session.user.emailVerified) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        alert('邮箱验证成功！请重新登录以更新状态。');
        // 直接调用 signOut 并跳转到登录页
        signOut({ callbackUrl: '/login' });
      } else {
        setError(data.message || '验证失败，请重试');
      }
    } catch (error) {
      setError('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          邮箱验证
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                验证码
              </label>
              <input
                type="text"
                maxLength="4"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 4}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '验证中...' : '验证'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}