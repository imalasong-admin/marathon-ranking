import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-up justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

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

          <div className="text-sm text-center">
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              还没有账号？立即注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}