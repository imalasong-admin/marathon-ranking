import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useDeviceDetection } from '../lib/deviceDetection';

export default function Login() {
  const isMobile = useDeviceDetection();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

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
        if (result.error.includes('账号已被锁定')) {
          setError(result.error);
        } else if (result.error === '用户不存在') {
          setError('用户不存在');
        } else if (result.error === '密码错误') {
          setError('密码错误');
        } else {
          setError('登录失败：' + result.error);
        }
        setLoading(false);
      } else {
        router.replace('/rankings');
      }
    } catch (err) {
      setError('登录失败，请重试');
      setLoading(false);
    }
  };

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

  const containerClass = isMobile
    ? "min-h-screen bg-gray-50"
    : "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8";

  const formContainerClass = isMobile
    ? "w-full space-y-4 px-4"
    : "max-w-md w-full space-y-8";

  const inputClass = isMobile
    ? "appearance-none rounded-md block w-full px-3 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    : "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";

  const buttonClass = isMobile
    ? `w-full h-12 flex justify-center items-center border border-transparent text-base font-medium rounded-md text-white ${
      loading || sendingCode ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 active:bg-blue-700'
    }`
    : `group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
      loading || sendingCode ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
    }`;

  return (
    <div className={containerClass}>
     

      <div className={formContainerClass}>
        <div className="text-center pt-4">
          <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900`}>
            {isResetMode ? '找回密码' : '登录'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {!isResetMode ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="邮箱地址"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className={inputClass}
                placeholder="密码"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-blue-600 h-10 px-2"
              >
                忘记密码？
              </button>
              <Link
                href="/register"
                className="text-blue-600 h-10 px-2 flex items-center"
              >
                还没有账号？立即注册
              </Link>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={codeSent}
                className={inputClass}
              />
            </div>

            {!codeSent ? (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
                className={buttonClass}
              >
                {sendingCode ? '发送中...' : '发送验证码'}
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    验证码
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={4}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={buttonClass}
                >
                  {loading ? '验证中...' : '下一步'}
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setCodeSent(false);
                  setResetEmail('');
                  setResetCode('');
                  setError('');
                }}
                className="text-blue-600 h-10 px-2"
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