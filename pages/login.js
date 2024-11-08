// pages/login.js
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  // 处理普通登录
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (result.error) {
        // 处理特定的错误信息
        if (result.error.includes('账号已被锁定')) {
          setError(result.error);  // 显示完整的锁定原因
        } else if (result.error === '用户不存在') {
          setError('用户不存在');
        } else if (result.error === '密码错误') {
          setError('密码错误');
        } else {
          setError('登录失败：' + result.error);
        }
        setLoading(false);
      } else {
        // 登录成功后重定向到排行榜页面
        router.replace('/rankings');
      }
    } catch (err) {
      setError('登录失败，请重试');
      setLoading(false);
    }
  };

  // 处理发送重置验证码
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('请输入邮箱地址');
      return;
    }
    
    setSendingCode(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await res.json();

      if (data.success) {
        setCodeSent(true);
        alert('验证码已发送，请查收邮件');
      } else {
        setError(data.message || '发送验证码失败');
      }
    } catch (err) {
      setError('发送验证码失败，请重试');
    } finally {
      setSendingCode(false);
    }
  };

  // 处理验证码验证
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setError('请输入验证码');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode
        })
      });

      const data = await res.json();

      if (data.success) {
        // 验证成功，直接登录并跳转到修改密码页面
        router.push(`/reset-password?email=${resetEmail}&code=${resetCode}`);
      } else {
        setError(data.message || '验证码错误');
        setLoading(false);
      }
    } catch (err) {
      setError('验证失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-up justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isResetMode ? '找回密码' : '登录'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {!isResetMode ? (
          // 正常登录表单
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  邮箱
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="邮箱地址"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="密码"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                忘记密码？
              </button>
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                还没有账号？立即注册
              </Link>
            </div>
          </form>
        ) : (
          // 忘记密码表单
          <form className="mt-8 space-y-6" onSubmit={handleResetSubmit}>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={codeSent}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {!codeSent ? (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingCode ? '发送中...' : '发送验证码'}
              </button>
            ) : (
              <div>
                <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700">
                  验证码
                </label>
                <input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '验证中...' : '下一步'}
                </button>
              </div>
            )}

            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setCodeSent(false);
                  setResetEmail('');
                  setResetCode('');
                  setError('');
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                返回登录
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}