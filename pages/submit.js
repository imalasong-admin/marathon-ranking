import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SubmitRecord() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hours: '',
    minutes: '',
    seconds: '',
    gender: '',
    age: '',
    date: ''
  });

  // 处理登录状态
  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div>加载中...</div>
      </div>
    );
  }

  // 如果未登录，显示登录提示
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-8">提交马拉松成绩</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          请先登录
        </div>
        <Link 
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 
rounded-md hover:bg-blue-700"
        >
          去登录
        </Link>
      </div>
    );
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 计算总秒数
      const totalSeconds = 
        parseInt(formData.hours) * 3600 + 
        parseInt(formData.minutes) * 60 + 
        parseInt(formData.seconds);

      const res = await fetch('/api/records/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalSeconds
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('成绩提交成功！');
        router.push('/rankings');
      } else {
        setError(data.message || '提交失败，请重试');
      }
    } catch (err) {
      console.error('提交错误:', err);
      setError('提交失败，请重试');
    }
  };

  // 已登录用户看到的表单界面
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center 
mb-8">提交马拉松成绩</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-4">完赛时间</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium 
text-gray-700">时</label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: 
e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 
shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium 
text-gray-700">分</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({...formData, minutes: 
e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 
shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium 
text-gray-700">秒</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.seconds}
                onChange={(e) => setFormData({...formData, seconds: 
e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 
shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium 
text-gray-700">性别</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: 
e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 
shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">请选择</option>
            <option value="M">男</option>
            <option value="F">女</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium 
text-gray-700">年龄</label>
          <input
            type="number"
            min="18"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: 
e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 
shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium 
text-gray-700">完赛日期</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: 
e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 
shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border 
border-transparent rounded-md shadow-sm text-sm font-medium text-white 
bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
focus:ring-offset-2 focus:ring-blue-500"
        >
          提交成绩
        </button>
      </form>
    </div>
  );
}
