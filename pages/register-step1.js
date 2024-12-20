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

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入正确的邮箱格式');
      return;
    }

    // 密码验证
    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    // 使用 sessionStorage 替代 localStorage
    sessionStorage.setItem('registerData', JSON.stringify(formData));
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
          <div className={`${formContainerClass} max-w-lg`}>
            <h2 className="text-center text-3xl font-bold text-blue-600 mb-8">
              欢迎加入
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
                北美华人马拉松跑者
              </h3>
              
              <div className="space-y-3 text-gray-600">
                <p className="text-center">有多少人？跑了多少场比赛？</p>
                <p className="text-center">取得了怎样的成绩？</p>
                <p className="text-center">性别、年龄段、地区是如何分布的？</p>
                <div className="text-center space-y-1">
                  <p>谁跑得快？谁跑得强？</p>
                  <p>谁跑得长？谁跑得多？</p>
                </div>
                <p className="text-center font-medium mt-4">
                  这些都是有意义且有意思的数据
                </p>
              </div>
    
              <div className="text-center mt-6 text-gray-700">
                <p className="font-medium">欢迎长期居住在北美地区的华人跑者</p>
                <p className="font-medium">共同丰富这些数据</p>
              </div>
            </div>
    
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
    
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  常用邮箱
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="用于登录和接收重要通知"
                  className={`${inputClass} placeholder:text-gray-400`}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
    
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  设置密码
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="至少6位字符"
                  className={`${inputClass} placeholder:text-gray-400`}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
    
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  下一步
                </button>
              </div>
            </form>
    
            <div className="text-center mt-6">
              <Link 
                href="/login" 
                className="text-base text-blue-600 hover:text-blue-700 transition-colors"
              >
                已有账号？立即登录
              </Link>
            </div>
          </div>
        </div>
      );
    }