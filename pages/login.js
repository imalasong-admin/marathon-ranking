import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password
    });

    if (result.error) {
      setError('邮箱或密码错误');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center 
py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold 
text-gray-900">
          登录账号
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md 
text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium 
text-gray-700">
                邮箱
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: 
e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border 
border-gray-300 rounded-md shadow-sm focus:outline-none 
focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm 
font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: 
e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border 
border-gray-300 rounded-md shadow-sm focus:outline-none 
focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border 
border-transparent rounded-md shadow-sm text-sm font-medium text-white 
bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
focus:ring-offset-2 focus:ring-blue-500"
              >
                登录
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-sm text-center">
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                还没有账号？立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
