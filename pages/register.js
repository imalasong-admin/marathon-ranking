import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { states, getCitiesByState } from '../lib/us-cities-data';
import { useDeviceDetection } from '../lib/deviceDetection';

export default function Register() {
  const isMobile = useDeviceDetection();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
    state: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
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
  }, [formData.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate birth date
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password
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

    // Add max and min date constraints to the date input
  const maxDate = new Date();
  maxDate.setFullYear(2010);
  const minDate = new Date();
  minDate.setFullYear(1940);

  return (
    <div className={containerClass}>
      <div className={formContainerClass}>
        <h2 className="text-center text-2xl font-bold text-gray-900">
          注册账号
        </h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              name="name"
              type="text"
              required
              className={inputClass}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              邮箱
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

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              出生日期
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
              注册
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