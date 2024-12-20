import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { states, getCitiesByState } from '../lib/us-cities-data';
import { useDeviceDetection } from '../lib/deviceDetection';
import { ArrowLeft } from 'lucide-react';

export default function RegisterStep2() {
  const isMobile = useDeviceDetection();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    chineseName: '',
    birthDate: '',
    gender: '',
    state: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    // 检查是否有第一步的数据
    const storedData = sessionStorage.getItem('registerData');
    if (!storedData) {
      router.push('/register-step1');
      return;
    }

    // 城市列表处理
    if (formData.state) {
      const cities = getCitiesByState(formData.state);
      setAvailableCities(cities);
      if (!cities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state, router]);

  const handleBack = () => {
    router.push('/register-step1');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 日期验证
    const birthYear = new Date(formData.birthDate).getFullYear();
    if (birthYear > 2010) {
      setError('必须年满14周岁才能注册');
      return;
    }
    if (birthYear < 1940) {
      setError('出生年份不能早于1940年');
      return;
    }

    try {
      const storedData = JSON.parse(sessionStorage.getItem('registerData'));
      const completeFormData = {
        ...formData,
        email: storedData.email,
        password: storedData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        chineseName: formData.chineseName || ''
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeFormData)
      });

      const data = await res.json();

      if (data.success) {
        // 清除临时存储的注册数据
        sessionStorage.removeItem('registerData');
        
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: completeFormData.email,
          password: completeFormData.password
        });

        if (signInResult?.ok) {
          router.push('/users/submit');
        } else {
          setError('自动登录失败，请手动登录');
          router.push('/login');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('注册错误:', error);
      setError('注册失败，请重试');
    }
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

  const selectClass = isMobile
    ? "mt-1 block w-full h-12 px-3 border border-gray-300 bg-white rounded text-base"
    : "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const maxDate = new Date();
  maxDate.setFullYear(2010);
  const minDate = new Date();
  minDate.setFullYear(1940);

  return (
    <div className={containerClass}>
      <div className={`${formContainerClass} max-w-lg`}>
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          返回上一步
        </button>

        <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
          基本信息
        </h2>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-xl text-gray-700 text-center">
            请确保信息与报名比赛时填写的一致
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              name="firstName"
              type="text"
              required
              className={inputClass}
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Last Name 
            </label>
            <input
              name="lastName"
              type="text"
              required
              className={inputClass}
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              中文名 或 朋友们熟悉的称呼 [选填]
            </label>
            <input
              name="chineseName"
              type="text"
              className={inputClass}
              value={formData.chineseName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              生日 
            </label>
            <input
              name="birthDate"
              type="date"
              required
              max={maxDate.toISOString().split('T')[0]}
              min={minDate.toISOString().split('T')[0]}
              className={inputClass}
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              性别
            </label>
            <select
              name="gender"
              required
              className={selectClass}
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">请选择性别</option>
              <option value="M">男</option>
              <option value="F">女</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              所在州
            </label>
            <select
              name="state"
              className={selectClass}
              value={formData.state}
              onChange={handleChange}
            >
              <option value="">请选择常住州</option>
              {states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              所在城市
            </label>
            <select
              name="city"
              className={selectClass}
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
            >
              <option value="">请选择常住城市</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              完成注册
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
