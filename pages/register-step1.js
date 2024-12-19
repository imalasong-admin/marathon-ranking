import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useDeviceDetection } from '../lib/deviceDetection';

export default function RegisterStep1() {
  const isMobile = useDeviceDetection();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 简单的邮箱和密码验证
    if (!formData.email || !formData.password) {
      setError('邮箱和密码不能为空');
      return;
    }

    // 将数据存储在本地存储中，以便在第二步页面中使用
    localStorage.setItem('registerData', JSON.stringify(formData));

    // 导航到第二步页面
    router.push('/register-step2');
  };

  const containerClass = isMobile
    ? "min-h-screen bg-gray-50 px-4"
    : "min-h-screen flex items-center justify-center bg-gray-50";

  const formContainerClass = isMobile
    ? "bg-white rounded-lg shadow p-4 space-y-4"
    : "max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow";

  const inputClass = isMobile
    ? "appearance-none rounded block w-full px-3 h-12 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
    : "appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";

  return (
    <div className={containerClass}>
      <div className={formContainerClass}>
        <h2 className="text-center text-2xl font-bold text-gray-900">
          注册账号
        </h2>
<div>
<p className="block text-center font-medium text-gray-700 mb-1">北美华人马拉松跑者</p>
<p className="block text-center font-medium text-gray-700 mb-1">有多少人？</p>
<p className="block text-center font-medium text-gray-700 mb-1">跑了多少场比赛？</p>
<p className="block text-center font-medium text-gray-700 mb-1">取得了怎样的成绩？</p>
<p className="block text-center font-medium text-gray-700 mb-1">性别、年龄段、地区是如何分布的？</p>
<p className="block text-center font-medium text-gray-700 mb-1">谁跑得快？</p>
<p className="block text-center font-medium text-gray-700 mb-1">谁跑得强？</p>
<p className="block text-center font-medium text-gray-700 mb-1">谁跑得长？</p>
<p className="block text-center font-medium text-gray-700 mb-1">谁跑得多？</p>
<p className="block text-center font-medium text-gray-700 mb-1">这些都是有意义且有意思的数据</p>
<p className="block text-center font-medium text-gray-700 mb-1">欢迎长期居住在北美地区的华人跑者</p>
<p className="block text-center font-medium text-gray-700 mb-1">共同丰富这些数据</p>
</div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              注册邮箱
            </label>
            <input
              name="email"
              type="email"
              required
              className={inputClass}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              name="password"
              type="password"
              required
              className={inputClass}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              下一步
            </button>
          </div>
        </form>

        <div className="text-center pt-4">
          <Link href="/login" className="text-base text-blue-600">
            已有账号？立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}
