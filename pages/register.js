import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const data = await res.json();
        setError(data.message || '注册失败，请重试');
      }
    } catch (err) {
      setError('注册失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center 
py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold 
text-gray-900">
          注册新账号
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
              <label htmlFor="name" className="block text-sm font-medium 
text-gray-700">
                姓名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: 
e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border 
border-gray-300 rounded-md shadow-sm focus:outline-none 
focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

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
              <label htmlFor="confirmPassword" className="block text-sm 
font-medium text-gray-700">
                确认密码
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, 
confirmPassword: e.target.value})}
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
                注册
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-sm text-center">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                已有账号？立即登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
